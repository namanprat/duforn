import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

import { createArchiveTube, updateArchiveTube, checkArchiveTubeIntersections, updateArchiveTubeMouseMove, destroyArchiveTube } from './archive-tube.js';
import { createArchiveHelmet, updateArchiveHelmet, destroyArchiveHelmet } from './archive-helmet.js';
import { createArchiveGrid, updateArchiveGrid, destroyArchiveGrid } from './archive-grid.js';
import { createArchiveUI, updateArchiveUI, destroyArchiveUI } from './archive-ui.js';
import { VignetteShader, GrainShader, EdgeDistortionShader, createPostFXUniforms } from './shaders/post-fx.js';
import { CRTShader } from './CRTShader.js';

// ─────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────

const CONFIG = Object.freeze({
  pixelRatioMax: 1.5,

  tube: Object.freeze({
    scrollDeltaPerWheel: 0.002,
    spinVelocityPerWheel: 0.004,
  }),

  postFX: Object.freeze({
    grain: 0.012,
    vignette: 0.15,
    vignetteOffset: 1.0,
    bloomStrength: 0.1,
    bloomRadius: 0.35,
    bloomThreshold: 0.8,
    edgeShift: 0.008,
  }),

  crt: Object.freeze({
    scanlineIntensity: 0.5,
    scanlineCount: 280,
    curvature: 0.5,
    chromatic: 0.002,
    flicker: 0.0,
    brightness: 1.0,
    contrast: 1.05,
    saturation: 1.05,
    bloomIntensity: 0.1,
  }),
});

// ─────────────────────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────────────────────

const state = {
  running: false,
  initToken: 0,
  rafId: null,

  container: null,
  renderHost: null,

  renderer: null,
  composer: null,
  crtPass: null,

  scene: null,
  camera: null,
  clock: null,

  // Components
  tube: null,
  helmet: null,
  grid: null,
  ui: null,

  // HDRI resources
  pmremGenerator: null,
  envRenderTarget: null,

  // Shared reactive state (brev-compatible)
  shared: {
    time: 0,
    tubeScrollTarget: 0,
    tubeSpinVelocity: 0,
    tubeNaturalDir: 1,
    tubeAngle: 0,
    targetCenterUv: new THREE.Vector2(0.5, 0.5),
    rotationSpeedScaleTarget: 1,
    rotationSpeedScaleLerp: 0.12,
    baseSpeed: 0.25,
    hoverSlowdownEnabled: true,
    hoverSlowdownScale: 0.35,
    hoveredProject: null,
  },

  // Post-FX uniforms
  postFXUniforms: createPostFXUniforms(),

  // Event handlers
  handlers: {},
};

// ─────────────────────────────────────────────────────────────
// INIT / DESTROY
// ─────────────────────────────────────────────────────────────

async function initArchive() {
  if (state.running) return;
  state.initToken++;
  const token = state.initToken;

  // Find or create container
  state.container = document.querySelector('main[data-barba-namespace="archive"]');
  if (!state.container) {
    console.error('Archive: container not found');
    return;
  }

  // Create render host
  state.renderHost = state.container.querySelector('.archive-webgl-host');
  if (!state.renderHost) {
    state.renderHost = document.createElement('div');
    state.renderHost.className = 'archive-webgl-host';
    state.renderHost.style.cssText = `
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
    `;
    state.container.insertBefore(state.renderHost, state.container.firstChild);
  }

  const w = state.renderHost.clientWidth || window.innerWidth;
  const h = state.renderHost.clientHeight || window.innerHeight;

  // Scene
  state.scene = new THREE.Scene();
  state.scene.background = new THREE.Color(0x000000);

  // Camera (z=6.5 matching brev)
  state.camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
  state.camera.position.set(0, 0, 6.5);

  // Renderer
  const pr = Math.min(window.devicePixelRatio || 1, CONFIG.pixelRatioMax);
  state.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  state.renderer.setPixelRatio(pr);
  state.renderer.setSize(w, h);
  state.renderer.outputColorSpace = THREE.SRGBColorSpace;
  state.renderer.toneMapping = THREE.ACESFilmicToneMapping;
  state.renderer.toneMappingExposure = 1;
  state.renderHost.appendChild(state.renderer.domElement);

  // Composer & passes
  state.composer = new EffectComposer(state.renderer);
  state.composer.addPass(new RenderPass(state.scene, state.camera));

  // Bloom
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(w, h),
    CONFIG.postFX.bloomStrength,
    CONFIG.postFX.bloomRadius,
    CONFIG.postFX.bloomThreshold
  );
  state.composer.addPass(bloomPass);

  // Vignette
  const vignettePass = new ShaderPass(VignetteShader({ darkness: CONFIG.postFX.vignette, offset: CONFIG.postFX.vignetteOffset }));
  state.composer.addPass(vignettePass);

  // Grain
  const grainPass = new ShaderPass(GrainShader({ grain: CONFIG.postFX.grain }));
  grainPass.uniforms.uTime = state.postFXUniforms.uTime;
  state.composer.addPass(grainPass);

  // Edge distortion (chromatic aberration)
  const edgePass = new ShaderPass(EdgeDistortionShader({ shift: CONFIG.postFX.edgeShift }));
  state.composer.addPass(edgePass);

  // CRT shader
  state.crtPass = new ShaderPass(CRTShader);
  state.crtPass.uniforms.scanlineIntensity.value = CONFIG.crt.scanlineIntensity;
  state.crtPass.uniforms.scanlineCount.value = CONFIG.crt.scanlineCount;
  state.crtPass.uniforms.curvature.value = CONFIG.crt.curvature;
  state.crtPass.uniforms.rgbShift.value = CONFIG.crt.chromatic;
  state.crtPass.uniforms.flickerStrength.value = CONFIG.crt.flicker;
  state.crtPass.uniforms.brightness.value = CONFIG.crt.brightness;
  state.crtPass.uniforms.contrast.value = CONFIG.crt.contrast;
  state.crtPass.uniforms.saturation.value = CONFIG.crt.saturation;
  state.crtPass.uniforms.bloomIntensity.value = CONFIG.crt.bloomIntensity;
  state.composer.addPass(state.crtPass);

  // Output
  state.composer.addPass(new OutputPass());

  // Lighting (matching brev)
  state.scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(5, 5, 5);
  state.scene.add(dirLight);

  // Clock
  state.clock = new THREE.Timer();

  // Reset shared state
  state.shared.time = 0;
  state.shared.tubeScrollTarget = 0;
  state.shared.tubeSpinVelocity = 0;
  state.shared.tubeNaturalDir = 1;
  state.shared.tubeAngle = 0;
  state.shared.targetCenterUv.set(0.5, 0.5);
  state.shared.rotationSpeedScaleTarget = 1;
  state.shared.rotationSpeedScaleLerp = 0.12;
  state.shared.baseSpeed = 0.25;
  state.shared.hoverSlowdownEnabled = true;
  state.shared.hoverSlowdownScale = 0.35;
  state.shared.hoveredProject = null;

  // HDRI environment for glass helmet
  state.pmremGenerator = new THREE.PMREMGenerator(state.renderer);
  if (state.pmremGenerator.compileEquirectangularShader) {
    state.pmremGenerator.compileEquirectangularShader();
  }

  import('three-stdlib')
    .then(({ RGBELoader }) => {
      if (state.initToken !== token || !state.scene) return;
      const hdrLoader = new RGBELoader();
      hdrLoader.load(
        'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_09_1k.hdr',
        (hdrTexture) => {
          if (state.initToken !== token || !state.scene) {
            hdrTexture.dispose();
            return;
          }
          hdrTexture.mapping = THREE.EquirectangularReflectionMapping;
          state.envRenderTarget = state.pmremGenerator.fromEquirectangular(hdrTexture);
          state.scene.environment = state.envRenderTarget.texture;
          hdrTexture.dispose();
        }
      );
    })
    .catch(err => {
      console.warn('Archive: Failed to load HDRI environment', err);
    });

  // Initialize components
  state.tube = await createArchiveTube(state.scene);
  if (state.initToken !== token) { destroyArchive(); return; }

  state.helmet = await createArchiveHelmet(state.scene);
  if (state.initToken !== token) { destroyArchive(); return; }

  state.grid = createArchiveGrid(state.scene, state.shared);
  state.ui = createArchiveUI(state.shared);

  // Event handlers
  state.handlers.onMouseMove = (e) => {
    updateArchiveTubeMouseMove(state.tube, e);

    // Update grid center from mouse
    const rect = state.container.getBoundingClientRect();
    if (rect.width > 0) {
      const nx = (e.clientX - rect.left) / rect.width;
      const strength = 0.4;
      const cx = 0.5 + (Math.min(1, Math.max(0, nx)) - 0.5) * strength;
      state.shared.targetCenterUv.x = cx;
    }
  };

  state.handlers.onWheel = (e) => {
    e.preventDefault();
    state.shared.tubeScrollTarget += e.deltaY * CONFIG.tube.scrollDeltaPerWheel;
    state.shared.tubeSpinVelocity += e.deltaY * CONFIG.tube.spinVelocityPerWheel;

    if (e.deltaY < 0) state.shared.tubeNaturalDir = -1;
    else if (e.deltaY > 0) state.shared.tubeNaturalDir = 1;
  };

  state.handlers.onResize = () => {
    const w = state.renderHost.clientWidth || window.innerWidth;
    const h = state.renderHost.clientHeight || window.innerHeight;
    state.camera.aspect = w / h;
    state.camera.updateProjectionMatrix();
    state.renderer.setSize(w, h);
    state.composer.setSize(w, h);
  };

  window.addEventListener('mousemove', state.handlers.onMouseMove);
  window.addEventListener('wheel', state.handlers.onWheel, { passive: false });
  window.addEventListener('resize', state.handlers.onResize);

  state.running = true;

  // Animation loop
  function animate() {
    if (state.initToken !== token) return;
    state.rafId = requestAnimationFrame(animate);

    state.clock.update();
    const dt = Math.min(state.clock.getDelta(), 0.05);
    const elapsed = state.clock.getElapsed();
    state.shared.time = elapsed;

    // Update components
    updateArchiveTube(state.tube, dt, state.shared);
    checkArchiveTubeIntersections(state.tube, state.camera, state.shared);
    updateArchiveHelmet(state.helmet, state.shared);
    updateArchiveGrid(state.grid, elapsed);
    updateArchiveUI(state.ui);

    // Update post-FX
    state.postFXUniforms.uTime.value = elapsed * 0.001;
    if (state.crtPass) {
      state.crtPass.uniforms.time.value = elapsed;
    }

    // Render
    state.composer.render();
  }

  animate();
}

function destroyArchive() {
  if (!state.running) return;
  state.initToken++;
  state.running = false;

  // Cancel RAF
  if (state.rafId) {
    cancelAnimationFrame(state.rafId);
    state.rafId = null;
  }

  // Remove event listeners
  window.removeEventListener('mousemove', state.handlers.onMouseMove);
  window.removeEventListener('wheel', state.handlers.onWheel);
  window.removeEventListener('resize', state.handlers.onResize);

  // Destroy components
  destroyArchiveTube(state.tube);
  destroyArchiveHelmet(state.helmet);
  destroyArchiveGrid(state.grid);
  destroyArchiveUI(state.ui);

  // Dispose HDRI resources
  if (state.envRenderTarget) {
    state.envRenderTarget.dispose();
    state.envRenderTarget = null;
  }
  if (state.pmremGenerator) {
    state.pmremGenerator.dispose();
    state.pmremGenerator = null;
  }

  // Dispose composer
  if (state.composer) {
    state.composer.dispose();
  }

  // Dispose renderer
  if (state.renderer) {
    state.renderer.dispose();
    if (state.renderHost && state.renderer.domElement.parentNode === state.renderHost) {
      state.renderHost.removeChild(state.renderer.domElement);
    }
  }

  // Dispose scene
  if (state.scene) {
    state.scene.environment = null;
    state.scene.traverse(obj => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        (Array.isArray(obj.material) ? obj.material : [obj.material]).forEach(m => m.dispose());
      }
    });
  }

  // Clear references
  state.scene = null;
  state.camera = null;
  state.renderer = null;
  state.composer = null;
  state.crtPass = null;
  state.clock = null;
  state.tube = null;
  state.helmet = null;
  state.grid = null;
  state.ui = null;
  state.container = null;
  state.renderHost = null;
  state.handlers = {};
}

export { initArchive, destroyArchive };
