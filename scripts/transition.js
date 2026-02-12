import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import html2canvas from "html2canvas";

gsap.registerPlugin(ScrollTrigger);

// ─── Vertex shader (fullscreen quad) ─────────────────────
const vertexShader = /* glsl */ `
void main() {
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

// ─── Fragment shader — Ink Reveal Mask ───────────────────
// Concept: Ink expanding on paper.
// - Starts opaque (black ink covering screen).
// - "Water" drops in center, ink dissolves/burns away.
// - Reveals the page underneath (alpha 0).
// - Edge is sharp but organic, like wet paper tearing.

const fragmentShader = /* glsl */ `
precision highp float;

uniform sampler2D uOldPage;
uniform float uTime;
uniform float uProgress;    // 0 = fully opaque (black), 1 = fully transparent
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
  for (int i = 0; i < 6; i++) {
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

  // 1. Base organic noise layer (flowing/liquid)
  float noiseVal = fbm(p * 3.5 + uTime * 0.2); 
  
  // 2. Distortion for the ink edge (turbulence)
  float distort = snoise(p * 10.0 - uTime * 0.5) * 0.05;

  // 3. Expansion radius logic
  // Map progress 0->1 to a radius that covers the corners
  float maxDist = length(vec2(aspect * 0.5, 0.5));
  float radius = uProgress * (maxDist * 2.5); // *2.5 ensures clearing corners

  // 4. The Mask
  // We compare distance (len) to radius, modulated by noise.
  // "noiseVal" adds organic irregularity to the radius.
  float edgeRoughness = 0.3; 
  float maskDist = len - (radius + noiseVal * edgeRoughness);
  
  // Sharp but smooth edge (ink-like)
  // Inside the ink hole (mask < 0) -> transparent (alpha 0)
  // Outside (mask > 0) -> opaque (alpha 1)
  
  // Smoothstep for anti-aliasing the edge
  float alpha = smoothstep(-0.05, 0.05, maskDist);
  
  // ── Visuals ────────────────────────────────────────────
  
  // Old Page Texture (Greyscale / Darkened)
  vec4 oldTex = texture2D(uOldPage, uv);
  float oldLum = dot(oldTex.rgb, vec3(0.299, 0.587, 0.114));
  vec3 oldGrey = vec3(oldLum * 0.2); // Very dark grey, almost black
  
  // Ink Edge Glow (Subtle White/Grey burn line)
  // Only visible at the transition boundary
  float edgeGlow = (1.0 - abs(maskDist * 8.0)) * 0.5;
  edgeGlow = clamp(edgeGlow, 0.0, 1.0);
  edgeGlow *= (1.0 - alpha); // Only adds to the dark part, not the transparent part purely
  
  // Combine:
  // Base colour is the old page (darkened).
  // Add a subtle white edge line where the ink disrupts.
  vec3 col = oldGrey + vec3(edgeGlow * 0.1); 

  // Final Alpha
  // If alpha is 0 (transparent), we see the new page.
  // If alpha is 1 (opaque), we see 'col'.
  // Also fade out globally at the end (uOpacity).
  
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
      antialias: true, // Enable AA for smoother edges
    });
  } catch (err) {
    console.warn('[transition] Failed to create WebGL renderer:', err);
    return;
  }

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Add context loss handler
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
async function captureOldPage() {
  try {
    const el = document.querySelector('[data-barba="container"]');
    if (!el) return blackTex;
    const canvas = await html2canvas(el, {
      backgroundColor: "#000000",
      scale: 0.25, // Reduced from 0.5 for faster capture - shader distortion hides quality loss
      logging: false,
      useCORS: true,
    });
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
 * LEAVE — show overlay IMMEDIATELY, then capture old page behind it.
 * The overlay is fully opaque from frame 1 so the user never sees a
 * content flash when Barba swaps pages.
 */
export async function animateTransition() {
  init();
  if (!containerEl) return;

  // ── INSTANT cover: fully opaque dark, hide any content swap ──
  material.uniforms.uProgress.value = 0;    // no portal = fully opaque
  material.uniforms.uOpacity.value = 1;
  material.uniforms.uOldPage.value = blackTex; // solid black until capture done
  containerEl.style.display = "block";
  containerEl.style.pointerEvents = "auto";
  startLoop();

  // render one frame immediately so the canvas draws the dark overlay
  renderer.render(scene, camera);

  // ── now capture old page in the background ──
  // The overlay is already covering everything, so this is safe
  oldPageTex = await captureOldPage();
  material.uniforms.uOldPage.value = oldPageTex;
}

/**
 * ENTER — portal opens from center, revealing the live new page beneath.
 * Skips on initial page load (once hook).
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

    // Ink Reveal Animation
    // We ease it slightly slower to make it feel premium
    tl.to(material.uniforms.uProgress, {
      value: 1,
      duration: 1.4,
      ease: "power2.inOut",
    });

    // Fade out overlay at the very end to ensure clean cleanup
    tl.to(material.uniforms.uOpacity, {
      value: 0,
      duration: 0.3,
      ease: "power1.out",
    }, "-=0.3"); // Overlap slightly with end of progress
  });
}

export function closeMenuIfOpen() {
  const btn = document.querySelector(".menu-toggle-btn");
  if (btn && btn.classList.contains("menu-open")) btn.click();
}

export default { animateTransition, revealTransition, closeMenuIfOpen };
