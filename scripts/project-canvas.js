import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { GrainShader, EdgeDistortionShader, createPostFXUniforms } from './shaders/post-fx.js';
import GUI from 'lil-gui';

let renderer = null;
let scene = null;
let camera = null;
let composer = null;
let backgroundMesh = null;
let imagePlanes = [];
let rafId = null;
let container = null;
let resizeTimeout = null;
let isRunning = false;
let gui = null;
const imageTextureCache = new Map();

const postFXUniforms = createPostFXUniforms();

// --- GUI-controlled parameters ---
const params = {
  speed: 0.1, // User requested 0.2
  red: '#f5f5f5',
  green: '#ffffff',
  blue: '#f2f2f2',
  orange: '#ebebeb',
  cyan: '#ebebebff',
  white: '#ffffff',
  yellow: '#e3e3e3',
};



// ─── FBM Warp Background Shader ──────────────────────────────

const FBMWarpShader = /* glsl */ `
  uniform float iTime;
  uniform vec2  iResolution;
  uniform vec3  uRed;
  uniform vec3  uGreen;
  uniform vec3  uBlue;
  uniform vec3  uOrange;
  uniform vec3  uCyan;
  uniform vec3  uWhite;
  uniform vec3  uYellow;
  uniform float uGrain;

  float random(in vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  float noise(in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
           (c - a) * u.y * (1.0 - u.x) +
           (d - b) * u.x * u.y;
  }

  #define OCTAVES 6
  float fbm(in vec2 st) {
    float value = 0.0;
    float amp = 0.55;
    for (int i = 0; i < OCTAVES; i++) {
      value += amp * noise(st);
      st *= 2.1;
      amp *= 0.35;
    }
    return value;
  }

  float pattern(in vec2 p) {
    vec2 q = vec2(
      fbm(p + vec2(iTime * 0.2) + vec2(0.0)),
      fbm(p + vec2(iTime * 0.3) + vec2(2.4, 4.8))
    );
    vec2 r = vec2(
      fbm(q + vec2(iTime * 0.3) + 4.0 * q + vec2(3.0, 9.0)),
      fbm(q + vec2(iTime * 0.2) + 8.0 * q + vec2(2.4, 8.4))
    );
    return fbm(p + r * 2.0 + vec2(iTime * 0.09));
  }

  vec3 gradient(float v) {
    float steps = 7.0;
    float step = 1.0 / steps;

    vec3 col = uGreen;
    if (v >= 0.0 && v < step) {
      col = mix(uYellow, uOrange, v * steps);
    } else if (v >= step && v < step * 2.0) {
      col = mix(uOrange, uRed, (v - step) * steps);
    } else if (v >= step * 2.0 && v < step * 3.0) {
      col = mix(uRed, uWhite, (v - step * 2.0) * steps);
    } else if (v >= step * 3.0 && v < step * 4.0) {
      col = mix(uWhite, uCyan, (v - step * 3.0) * steps);
    } else if (v >= step * 4.0 && v < step * 5.0) {
      col = mix(uCyan, uBlue, (v - step * 4.0) * steps);
    } else if (v >= step * 5.0 && v < step * 6.0) {
      col = mix(uBlue, uGreen, (v - step * 5.0) * steps);
    }
    return col;
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution.xy);
    uv = 2.0 * uv / iResolution.y;

    vec3 color = gradient(pattern(uv));

    // Add grain
    float noiseVal = (random(uv + vec2(iTime)) - 0.5) * uGrain;
    color += noiseVal;

    gl_FragColor = vec4(color, 1.0);
  }
`;

// ─── Helpers ──────────────────────────────────────────────────

function getFilmContainer(containerArg) {
  if (containerArg && containerArg.querySelector) return containerArg;
  const containers = document.querySelectorAll('[data-barba="container"][data-barba-namespace="film"]');
  if (containers.length) return containers[containers.length - 1];
  return document;
}

function ensureBackgroundElement() {
  let bg = document.getElementById('background');
  if (bg) return bg;
  bg = document.createElement('div');
  bg.id = 'background';
  document.body.insertBefore(bg, document.body.firstChild);
  return bg;
}

function debouncedResize() {
  if (resizeTimeout) clearTimeout(resizeTimeout);
  resizeTimeout = window.setTimeout(onResizeHandler, 150);
}

function onResizeHandler() {
  if (!renderer || !isRunning || !camera || !composer) return;

  const w = window.innerWidth;
  const h = window.innerHeight;

  renderer.setSize(w, h);
  composer.setSize(w, h);

  camera.left = -w / 2;
  camera.right = w / 2;
  camera.top = h / 2;
  camera.bottom = -h / 2;
  camera.updateProjectionMatrix();

  if (backgroundMesh) {
    backgroundMesh.material.uniforms.iResolution.value.set(w, h);
  }

  imagePlanes.forEach(({ material }) => {
    material.uniforms.uResolution.value.set(w, h);
  });

  updateImages();
}

function onScrollHandler() {
  if (!isRunning) return;
  updateImages();
}

// ─── Image planes (overlay on top of shader) ─────────────────

function createImagePlane(imgElement) {
  if (!scene) return;

  const source = imgElement.currentSrc || imgElement.src;
  if (!source) return;

  const loader = new THREE.TextureLoader();
  const texture = loader.load(
    source,
    () => {
      imgElement.style.opacity = '0';
    },
    undefined,
    () => {
      imgElement.style.opacity = '';
    }
  );

  imageTextureCache.set(imgElement, texture);

  const width = window.innerWidth;
  const height = window.innerHeight;

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTexture: { value: texture },
      uResolution: { value: new THREE.Vector2(width, height) },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uTexture;
      varying vec2 vUv;

      void main() {
        vec4 color = texture2D(uTexture, vUv);
        gl_FragColor = color;
      }
    `,
    transparent: true,
  });

  const geometry = new THREE.PlaneGeometry(1, 1);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.renderOrder = 1;
  scene.add(mesh);

  imagePlanes.push({ mesh, img: imgElement, material });
}

function updateImages() {
  if (!isRunning || !camera) return;

  const width = window.innerWidth;
  const height = window.innerHeight;

  imagePlanes.forEach(({ mesh, img }) => {
    const rect = img.getBoundingClientRect();
    const isVisible = rect.width > 0 && rect.height > 0;
    mesh.visible = isVisible;
    if (!isVisible) return;

    const x = rect.left - width / 2 + rect.width / 2;
    const y = -rect.top + height / 2 - rect.height / 2;

    mesh.position.set(x, y, 0);
    mesh.scale.set(rect.width, rect.height, 1);
  });
}

// ─── FBM Background ──────────────────────────────────────────

function createBackground() {
  if (!scene) return;

  const w = window.innerWidth;
  const h = window.innerHeight;

  const material = new THREE.ShaderMaterial({
    uniforms: {
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector2(w, h) },
      uRed: { value: new THREE.Color(params.red) },
      uGreen: { value: new THREE.Color(params.green) },
      uBlue: { value: new THREE.Color(params.blue) },
      uOrange: { value: new THREE.Color(params.orange) },
      uCyan: { value: new THREE.Color(params.cyan) },
      uWhite: { value: new THREE.Color(params.white) },
      uYellow: { value: new THREE.Color(params.yellow) },
      uGrain: postFXUniforms.uGrain,
    },
    vertexShader: /* glsl */ `
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `,
    fragmentShader: FBMWarpShader,
    depthWrite: false,
    depthTest: false,
  });

  const geometry = new THREE.PlaneGeometry(2, 2);
  backgroundMesh = new THREE.Mesh(geometry, material);
  backgroundMesh.renderOrder = -1;
  scene.add(backgroundMesh);
}

// ─── GUI ──────────────────────────────────────────────────────

function createGUI() {
  gui = new GUI({ title: 'Shader Controls' });

  gui.add(params, 'speed', 0.0, 2.0, 0.01).name('Speed');

  const colorsFolder = gui.addFolder('Colors');
  const colorNames = ['red', 'green', 'blue', 'orange', 'cyan', 'white', 'yellow'];
  const uniformKeys = ['uRed', 'uGreen', 'uBlue', 'uOrange', 'uCyan', 'uWhite', 'uYellow'];

  colorNames.forEach((name, i) => {
    colorsFolder.addColor(params, name).name(name.charAt(0).toUpperCase() + name.slice(1))
      .onChange((val) => {
        if (backgroundMesh) {
          backgroundMesh.material.uniforms[uniformKeys[i]].value.set(val);
        }
      });
  });
}

// ─── Animation loop ──────────────────────────────────────────

function animate() {
  if (!isRunning || !renderer || !composer || !camera) return;

  rafId = requestAnimationFrame(animate);

  const now = performance.now();

  // Update FBM shader time (scaled by speed)
  if (backgroundMesh) {
    backgroundMesh.material.uniforms.iTime.value = now * 0.001 * params.speed;
  }

  postFXUniforms.uTime.value = now * 0.001;

  updateImages();

  composer.render();
}

// ─── Init / Destroy ──────────────────────────────────────────

async function initProjectCanvas(containerArg) {
  if (isRunning) return;

  const activeContainer = getFilmContainer(containerArg);

  container = ensureBackgroundElement();

  isRunning = true;

  const width = window.innerWidth;
  const height = window.innerHeight;

  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(
    width / -2,
    width / 2,
    height / 2,
    height / -2,
    1,
    1000
  );
  camera.position.z = 10;

  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: false,
    powerPreference: 'high-performance',
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.style.pointerEvents = 'none';
  // Position absolutely so the canvas overlays correctly within the fixed #background container
  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.top = '0';
  renderer.domElement.style.left = '0';
  container.appendChild(renderer.domElement);

  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const grainPass = new ShaderPass(GrainShader());
  grainPass.uniforms.uTime = postFXUniforms.uTime;
  grainPass.uniforms.uGrain = postFXUniforms.uGrain;
  composer.addPass(grainPass);

  composer.addPass(new ShaderPass(EdgeDistortionShader({ preserveAlpha: true })));
  composer.addPass(new OutputPass());

  // Create FBM warp background (renders behind everything)
  createBackground();

  // Create image planes on top of the shader
  const targets = activeContainer.querySelectorAll('.coverimg img, .project-img img');
  targets.forEach((img) => {
    createImagePlane(img);
  });

  // Create lil-gui controls
  // createGUI();

  window.addEventListener('resize', debouncedResize);
  window.addEventListener('scroll', onScrollHandler, { passive: true });

  updateImages();
  animate();

  // Wait for the first frame to render so the transition handoff is seamless
  await new Promise((resolve) => requestAnimationFrame(resolve));
}

export async function initFilm(containerArg, _options = {}) {
  await initProjectCanvas(containerArg);
}

export async function initProjectSceneShared(containerArg, _options = {}) {
  await initProjectCanvas(containerArg);
}

export function destroyFilm() {
  if (!isRunning) return;

  isRunning = false;

  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  window.removeEventListener('resize', debouncedResize);
  window.removeEventListener('scroll', onScrollHandler);

  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
    resizeTimeout = null;
  }

  // Destroy GUI
  if (gui) {
    gui.destroy();
    gui = null;
  }

  // Destroy image planes
  imagePlanes.forEach((plane) => {
    if (plane.mesh?.geometry) plane.mesh.geometry.dispose();
    if (plane.mesh?.material) plane.mesh.material.dispose();
    const texture = imageTextureCache.get(plane.img);
    if (texture) texture.dispose();
    plane.img.style.opacity = '';
    if (plane.mesh?.parent) plane.mesh.parent.remove(plane.mesh);
  });
  imagePlanes = [];
  imageTextureCache.clear();

  // Destroy background
  if (backgroundMesh) {
    if (backgroundMesh.geometry) backgroundMesh.geometry.dispose();
    if (backgroundMesh.material) backgroundMesh.material.dispose();
    if (backgroundMesh.parent) backgroundMesh.parent.remove(backgroundMesh);
    backgroundMesh = null;
  }

  if (composer) {
    composer.dispose();
    composer = null;
  }

  if (renderer) {
    renderer.dispose();
    const parent = renderer.domElement?.parentNode;
    if (parent) parent.removeChild(renderer.domElement);
    renderer = null;
  }

  if (scene) {
    scene.clear();
    scene = null;
  }

  camera = null;
  container = null;
  postFXUniforms.uTime.value = 0;
}

export function destroyProjectSceneShared() {
  destroyFilm();
}

export const init = initFilm;
export const destroy = destroyFilm;
