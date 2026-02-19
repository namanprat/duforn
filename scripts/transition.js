import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { captureCurrentFrame } from "./three.js";

gsap.registerPlugin(ScrollTrigger);

// ─── Vertex shader (fullscreen quad) ─────────────────────
const vertexShader = /* glsl */ `
void main() {
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

// ─── Fragment shader — Full-Color Ink Mask ────────────────
// The old page shows in full color where the mask is opaque.
// As the ink dissolves from the center outward, it becomes
// transparent, revealing the live new page underneath.

const fragmentShader = /* glsl */ `
precision highp float;

uniform sampler2D uOldPage;
uniform float uTime;
uniform float uProgress;    // 0 = fully opaque (old page), 1 = fully transparent (new page)
uniform vec2  uResolution;
uniform float uOpacity;

// ── Simplex Noise 2D ─────────────────────────────────────
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                      -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// ── FBM (Organic Texture) ────────────────────────────────
float fbm(vec2 p) {
  float total = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for (int i = 0; i < 4; i++) {
    total += snoise(p * frequency) * amplitude;
    amplitude *= 0.5;
    frequency *= 2.0;
  }
  return total;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float aspect = uResolution.x / uResolution.y;

  // Center coordinate system
  vec2 p = uv - 0.5;
  p.x *= aspect;
  float len = length(p);

  // Organic noise for irregular dissolve edge
  float noiseVal = fbm(p * 3.5 + uTime * 0.2);

  // Expansion radius — covers corners at progress=1
  float maxDist = length(vec2(aspect * 0.5, 0.5));
  float radius = uProgress * (maxDist * 2.5);

  // Ink mask: noise makes the edge organic
  float edgeRoughness = 0.3;
  float maskDist = len - (radius + noiseVal * edgeRoughness);

  // Mask alpha: opaque outside dissolve hole, transparent inside
  float alpha = smoothstep(-0.05, 0.05, maskDist);

  // Old page in full color
  vec4 oldTex = texture2D(uOldPage, uv);
  vec3 col = oldTex.rgb;

  // Subtle edge darkening at the dissolve boundary (adds depth)
  float edgeBand = 1.0 - smoothstep(0.0, 0.12, abs(maskDist));
  col *= 1.0 - edgeBand * 0.15;

  gl_FragColor = vec4(col, alpha * uOpacity);
}
`;

// ─── Module state ────────────────────────────────────────
let renderer, scene, camera, quad, material;
let containerEl;
let isInit = false;
let animFrame = null;
let startT = 0;
let oldPageTex = null;
let blackTex = null;

// ─── Init ────────────────────────────────────────────────
function init() {
  if (isInit) return;
  containerEl = document.querySelector(".transition");
  if (!containerEl) {
    console.warn("[transition] .transition element not found");
    return;
  }

  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      premultipliedAlpha: false,
    });
  } catch (err) {
    console.warn('[transition] Failed to create WebGL renderer:', err);
    return;
  }

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

  renderer.domElement.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    console.warn('[transition] Context lost');
    cleanup();
  }, false);

  containerEl.appendChild(renderer.domElement);

  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  scene = new THREE.Scene();

  // 1×1 black placeholder
  const d = new Uint8Array([0, 0, 0, 255]);
  blackTex = new THREE.DataTexture(d, 1, 1, THREE.RGBAFormat);
  blackTex.needsUpdate = true;

  const dpr = Math.min(window.devicePixelRatio, 2);

  material = new THREE.ShaderMaterial({
    uniforms: {
      uOldPage: { value: blackTex },
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uResolution: {
        value: new THREE.Vector2(
          window.innerWidth * dpr,
          window.innerHeight * dpr
        )
      },
      uOpacity: { value: 1 },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthTest: false,
  });

  quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  scene.add(quad);

  isInit = true;
  window.addEventListener("resize", onResize);
}

function onResize() {
  if (!renderer) return;
  renderer.setSize(window.innerWidth, window.innerHeight);
  const dpr = Math.min(window.devicePixelRatio, 2);
  material.uniforms.uResolution.value.set(
    window.innerWidth * dpr,
    window.innerHeight * dpr
  );
}

// ─── Render loop ─────────────────────────────────────────
function startLoop() {
  startT = performance.now();
  function tick() {
    if (!renderer) return;
    material.uniforms.uTime.value = (performance.now() - startT) / 1000;
    renderer.render(scene, camera);
    animFrame = requestAnimationFrame(tick);
  }
  tick();
}
function stopLoop() {
  if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
}

// ─── Page capture ────────────────────────────────────────
function captureOldPage() {
  try {
    const canvas = captureCurrentFrame();
    if (!canvas) return blackTex;
    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  } catch {
    return blackTex;
  }
}

// ─── Public API ──────────────────────────────────────────

/**
 * LEAVE — capture current WebGL frame, then show it as an opaque overlay.
 * The overlay covers the page instantly so the user never sees content flash.
 */
export async function animateTransition() {
  init();
  if (!containerEl) return;

  // Capture the current frame BEFORE showing the overlay
  // (the shared renderer's canvas still has the current content thanks to preserveDrawingBuffer)
  oldPageTex = captureOldPage();

  // Show overlay with the captured frame
  material.uniforms.uProgress.value = 0;    // fully opaque
  material.uniforms.uOpacity.value = 1;
  material.uniforms.uOldPage.value = oldPageTex;
  containerEl.style.display = "block";
  containerEl.style.pointerEvents = "auto";
  startLoop();

  // Render one frame immediately so the overlay is visible
  renderer.render(scene, camera);
}

/**
 * ENTER — ink dissolves from center outward, revealing the live new page beneath.
 */
export async function revealTransition() {
  if (!isInit || !containerEl || containerEl.style.display !== "block") return;

  return new Promise((resolve) => {
    const tl = gsap.timeline({
      onComplete: () => {
        stopLoop();
        containerEl.style.display = "none";
        containerEl.style.pointerEvents = "none";
        if (oldPageTex && oldPageTex !== blackTex) {
          oldPageTex.dispose();
          oldPageTex = null;
        }
        ScrollTrigger.refresh();
        resolve();
      },
    });

    tl.to(material.uniforms.uProgress, {
      value: 1,
      duration: 2.2,
      ease: "power3.inOut",
    });

    tl.to(material.uniforms.uOpacity, {
      value: 0,
      duration: 0.5,
      ease: "power2.out",
    }, "-=0.5");
  });
}

export function closeMenuIfOpen() {
  const btn = document.querySelector(".menu-toggle-btn");
  if (btn && btn.classList.contains("menu-open")) btn.click();
}

/**
 * Clean up transition resources
 */
function cleanup() {
  stopLoop();
  if (renderer) {
    renderer.dispose();
    if (renderer.domElement?.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
    renderer = null;
  }
  if (material) {
    material.dispose();
    material = null;
  }
  if (quad) {
    quad.geometry.dispose();
    quad = null;
  }
  if (blackTex) {
    blackTex.dispose();
    blackTex = null;
  }
  if (oldPageTex && oldPageTex !== blackTex) {
    oldPageTex.dispose();
    oldPageTex = null;
  }
  scene = null;
  camera = null;
  isInit = false;
  if (containerEl) {
    containerEl.innerHTML = '';
    containerEl = null;
  }
  window.removeEventListener('resize', onResize);
}

/**
 * Destroy transition module - exported for Barba lifecycle
 */
export function destroyTransition() {
  cleanup();
}

export default { animateTransition, revealTransition, closeMenuIfOpen, destroyTransition };
