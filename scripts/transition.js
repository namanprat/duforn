import gsap from "gsap";
import * as THREE from "three";
import html2canvas from "html2canvas";

let renderer = null;
let scene = null;
let camera = null;
let mesh = null;
let uniforms = null;
let rafId = null;
const fragmentShader = `
  precision highp float;

  uniform float time;
  uniform float progress;
  uniform sampler2D texture1;
  uniform sampler2D texture2;
  uniform vec4 resolution;
  uniform vec4 iMouse;
  uniform float uOpacity;

  varying vec2 vUv;

  #define PI 3.14159265359

  mat2 r2d(float a) {
    return mat2(cos(a), sin(a), -sin(a), cos(a));
  }

  vec2 mouseRotZoom(vec2 uv) {
    vec2 mouse = (iMouse.xy == vec2(0.0)) ? vec2(1.0, 0.1) : iMouse.xy / resolution.xy;
    uv.xy *= r2d(-(mouse.x) * PI * 2.0);
    uv *= clamp((1.0 / (10.0 * mouse.y)), 0.2, 1.3);
    return uv;
  }

  void mainImage(out vec4 o, vec2 u) {
    vec2 v = resolution.xy, w, k = u = 0.2 * (u + u - v) / v.y;
    o = vec4(1.0, 2.0, 3.0, 0.0);
    float a = 0.5, t = time;

    u = mouseRotZoom(u);

    for (float i = 0.0; i < 25.0; i++) {
      t += 1.0;
      a += 0.03;

      float powVal = pow(a, i);
      v = cos(t - (8.0) * u * powVal) - 6.0 * u;

      vec4 rotVec = cos(i + t * 0.03 - vec4(0.0, 11.0, 33.0, 0.0));
      mat2 rot = mat2(rotVec.x, rotVec.y, rotVec.z, rotVec.w);
      u *= rot;

      u += 0.006 * tanh(50.0 * dot(u, u) * cos(1e2 * u.yx + t))
           + 0.3 * a * u
           + 0.004 * cos(t + 5.0 * exp(-0.02 * dot(o, o)));

      w = u / (1.0 - 3.0 * dot(u, u));
      o += (1.0 + cos(vec4(0.0, 1.0, 3.0, 0.0) + t)) / length((1.0 + i * dot(v, v)) * sin(w * 4.0 - 12.0 * u.yx + t));

      if (o.x + o.y + o.z > 113.01) break;
    }

    o = pow(o = 1.0 - sqrt(exp(-o * o * o / 400.0)), -0.3 * o / o) - dot(k -= u, k) / 10.0;

    o = vec4(sin(o.xyz + time * vec3(0.2, 0.3, 0.4)) * 0.5 + 0.5, 1.0);

    o = vec4(o.xyz - pow(o.xyz, vec3(4.75)), 1.0);

    float maxBeforeBlack = 0.3;
    if ((o.x > maxBeforeBlack) || (o.y > maxBeforeBlack) || (o.z > maxBeforeBlack)) {
      o.xyz = vec3(0.0);
    }

    o *= 2.0;
  }

  void main() {
    vec2 fragCoord = vUv * resolution.xy;
    vec4 portalColor;
    mainImage(portalColor, fragCoord);

    float mask = clamp((portalColor.r + portalColor.g + portalColor.b) / 3.0, 0.0, 1.0);
    mask = smoothstep(0.2, 0.8, mask * progress + progress * 0.1);

    vec4 color1 = texture2D(texture1, vUv);
    vec4 color2 = texture2D(texture2, vUv);
    vec4 mixed = mix(color1, color2, mask);
    gl_FragColor = vec4(mixed.rgb, mixed.a * uOpacity);
  }
`;

function ensureWebglOverlay() {
  if (renderer) return;

  containerEl = document.querySelector(".transition-overlay");
  if (!containerEl) {
    containerEl = document.createElement("div");
    containerEl.className = "transition-overlay";
    document.body.appendChild(containerEl);
  }

  const width = window.innerWidth;
  const height = window.innerHeight;

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.domElement.style.position = "absolute";
  renderer.domElement.style.top = "0";
  renderer.domElement.style.left = "0";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.style.pointerEvents = "none";

  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  uniforms = {
    time: { value: 0 },
    progress: { value: 0 },
    texture1: { value: null },
    texture2: { value: null },
    resolution: { value: new THREE.Vector4(width, height, width / height, 1) },
    iMouse: { value: new THREE.Vector4(0, 0, 0, 0) },
    uOpacity: { value: 0 }
  };

  const geometry = new THREE.PlaneGeometry(2, 2);
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    depthTest: false,
    depthWrite: false
  });

  mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  scene.add(mesh);

  containerEl.appendChild(renderer.domElement);

  resizeHandler = () => {
    if (!renderer || !uniforms) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h);
    uniforms.resolution.value.set(w, h, w / h, 1);
  };
  window.addEventListener("resize", resizeHandler);
}

function renderLoop() {
  if (!renderer || !scene || !camera || !uniforms) return;
  const now = performance.now();
  if (!startTime) startTime = now;
  uniforms.time.value = (now - startTime) / 1000;
  renderer.render(scene, camera);
  rafId = requestAnimationFrame(renderLoop);
}

function ensureRunning() {
  ensureWebglOverlay();
  if (running) return;
  running = true;
  startTime = performance.now();
  renderLoop();
}

function fadeInOverlay() {
  ensureRunning();
  if (containerEl) {
    containerEl.style.display = "block";
  }
  return gsap.to(uniforms.uOpacity, {
    value: 1,
    duration: 0.25,
    ease: "power2.out"
  });
}

function fadeOutOverlay() {
  return new Promise((resolve) => {
    if (!uniforms || !containerEl) {
      resolve();
      return;
    }
    gsap.to(uniforms.uOpacity, {
      value: 0,
      duration: 0.45,
      ease: "power2.inOut",
      delay: 0.05,
      onComplete: () => {
        running = false;
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        containerEl.style.display = "none";
        resolve();
      }
    });
  });
}

async function captureTexture() {
  const canvas = await html2canvas(document.body, {
    backgroundColor: null,
    useCORS: true,
    logging: false,
    scale: 1
  });
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.flipY = true;
  return texture;
}

function disposeTexture(tex) {
  if (tex && tex.dispose) tex.dispose();
}

// animation functions
export async function animateTransition() {
  ensureRunning();
  await fadeInOverlay();
  uniforms.progress.value = 0;
  // capture current view as texture1
  const currentTexture = await captureTexture();
  disposeTexture(prevTexture);
  prevTexture = currentTexture;
  uniforms.texture1.value = currentTexture;
  uniforms.texture2.value = currentTexture;
  return new Promise((resolve) => {
    gsap.to(uniforms.progress, {
      value: 1,
      duration: 0.6,
      ease: "power2.inOut",
      onComplete: resolve
    });
  });
}

export async function revealTransition() {
  ensureRunning();
  if (containerEl) {
    containerEl.style.display = "block";
  }
  gsap.set(uniforms?.uOpacity, { value: 1 });
  uniforms.progress.value = 0;
  // capture new view as texture2 and blend from previous capture
  const nextTexture = await captureTexture();
  uniforms.texture1.value = prevTexture || nextTexture;
  uniforms.texture2.value = nextTexture;
  await new Promise((resolve) => {
    gsap.to(uniforms.progress, {
      value: 1,
      duration: 0.7,
      ease: "power2.inOut",
      onComplete: resolve
    });
  });
  await fadeOutOverlay();
  disposeTexture(prevTexture);
  prevTexture = uniforms.texture2.value;
}

// utility functions
export function closeMenuIfOpen() {
  const menuToggleBtn = document.querySelector(".menu-toggle-btn");
  if (menuToggleBtn && menuToggleBtn.classList.contains("menu-open")) {
    menuToggleBtn.click();
  }
}

export default { revealTransition, animateTransition, closeMenuIfOpen };
