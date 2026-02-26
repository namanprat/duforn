import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

import { archiveItems } from '../data/archive-items.js';
import { GLTFLoader } from 'three-stdlib';
import { VignetteShader, GrainShader, EdgeDistortionShader, createPostFXUniforms, CRTShader } from './shaders/post-fx.js';
import { getPerformanceProfile } from './perf.js';

// ─────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────

const perf = getPerformanceProfile();

const CONFIG = Object.freeze({
  pixelRatioMax: perf.pixelRatioCap,

  tube: Object.freeze({
    scrollDeltaPerWheel: 0.002,
    spinVelocityPerWheel: 0.004,
  }),

  postFX: Object.freeze({
    grain: perf.grainStrength,
    vignette: 0.15,
    vignetteOffset: 1.0,
    bloomStrength: perf.enableBloom ? 0.1 : 0.0,
    bloomRadius: 0.35,
    bloomThreshold: 0.8,
    edgeShift: perf.enableEdgeDistortion ? 0.008 : 0.0,
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

let isTabVisible = true;
let visibilityHandler = null;
let archiveResizeTimeout = null;

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
  logoModel: null,
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
    hoveredProject: null,
    mouseNdc: null,
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
  if (CONFIG.postFX.bloomStrength > 0) {
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(w, h),
      CONFIG.postFX.bloomStrength,
      CONFIG.postFX.bloomRadius,
      CONFIG.postFX.bloomThreshold
    );
    state.composer.addPass(bloomPass);
  }

  // Vignette
  const vignettePass = new ShaderPass(VignetteShader({ darkness: CONFIG.postFX.vignette, offset: CONFIG.postFX.vignetteOffset }));
  state.composer.addPass(vignettePass);

  // Grain
  const grainPass = new ShaderPass(GrainShader({ grain: CONFIG.postFX.grain }));
  grainPass.uniforms.uTime = state.postFXUniforms.uTime;
  state.composer.addPass(grainPass);

  // Edge distortion (chromatic aberration)
  if (CONFIG.postFX.edgeShift > 0) {
    const edgePass = new ShaderPass(EdgeDistortionShader({ shift: CONFIG.postFX.edgeShift }));
    state.composer.addPass(edgePass);
  }

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
  state.shared.hoveredProject = null;
  state.shared.mouseNdc = null;

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

  // Load Logo
  const gltfLoader = new GLTFLoader();
  try {
    const gltf = await gltfLoader.loadAsync('/models/logo.glb');
    if (state.initToken !== token) { destroyArchive(); return; }

    state.logoModel = gltf.scene;

    // Center the logo geometry so it matches the particle system centering
    const box = new THREE.Box3().setFromObject(state.logoModel);
    const center = box.getCenter(new THREE.Vector3());
    state.logoModel.traverse((child) => {
      if (child.isMesh && child.geometry) {
        child.geometry.translate(-center.x, -center.y, -center.z);
        if (child.material) {
          child.material.envMap = state.scene.environment;
          child.material.needsUpdate = true;
          // Ensure it's somewhat visible if particles are white
          child.material.transparent = true;
          child.material.opacity = 0.9;
        }
      }
    });

    state.logoModel.scale.set(70, 70, 70);
    state.logoModel.position.set(0, 0, 0);
    state.scene.add(state.logoModel);
  } catch (error) {
    console.warn('Archive: Failed to load logo.glb', error);
  }

  state.tube = await createArchiveTube(state.scene);
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
      const ny = (e.clientY - rect.top) / rect.height;
      const strength = 0.4;

      const cx = 0.5 + (Math.min(1, Math.max(0, nx)) - 0.5) * strength;
      const cy = 0.5 + (Math.min(1, Math.max(0, ny)) - 0.5) * strength;
      state.shared.targetCenterUv.x = cx;
      state.shared.targetCenterUv.y = cy;

      state.shared.mouseNdc = new THREE.Vector2(
        nx * 2 - 1,
        - (ny * 2 - 1)
      );
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
    if (archiveResizeTimeout) clearTimeout(archiveResizeTimeout);
    archiveResizeTimeout = setTimeout(() => {
      const w = state.renderHost.clientWidth || window.innerWidth;
      const h = state.renderHost.clientHeight || window.innerHeight;
      state.camera.aspect = w / h;
      state.camera.updateProjectionMatrix();
      state.renderer.setSize(w, h);
      state.composer.setSize(w, h);
    }, 100);
  };

  window.addEventListener('mousemove', state.handlers.onMouseMove);
  window.addEventListener('wheel', state.handlers.onWheel, { passive: false });
  window.addEventListener('resize', state.handlers.onResize);

  state.running = true;

  visibilityHandler = () => { isTabVisible = !document.hidden; };
  document.addEventListener('visibilitychange', visibilityHandler);

  // Animation loop
  function animate() {
    if (state.initToken !== token) return;
    state.rafId = requestAnimationFrame(animate);

    if (!isTabVisible) return;

    state.clock.update();
    const dt = Math.min(state.clock.getDelta(), 0.05); // cap at 50ms
    const fpsFactor = Math.min(dt / 0.01666, 3.0);
    const elapsed = state.clock.getElapsed();
    state.shared.time = elapsed;

    // Update components
    updateArchiveTube(state.tube, dt, state.shared);
    checkArchiveTubeIntersections(state.tube, state.camera, state.shared);

    // Rotate Logo based on tube spinning/time
    if (state.logoModel) {
      state.logoModel.rotation.y = elapsed * 0.2 + (state.shared.tubeAngle * 0.5);

      const targetLookX = (state.shared.targetCenterUv.x - 0.5) * 2;
      const targetLookY = (state.shared.targetCenterUv.y - 0.5) * 2;
      const lerpFactor = Math.min(0.05 * fpsFactor, 1.0);
      state.logoModel.rotation.x += (targetLookY * 0.5 - state.logoModel.rotation.x) * lerpFactor;
      state.logoModel.rotation.z += (-targetLookX * 0.5 - state.logoModel.rotation.z) * lerpFactor;
    }
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
  if (visibilityHandler) {
    document.removeEventListener('visibilitychange', visibilityHandler);
    visibilityHandler = null;
  }
  isTabVisible = true;

  if (archiveResizeTimeout) {
    clearTimeout(archiveResizeTimeout);
    archiveResizeTimeout = null;
  }

  window.removeEventListener('mousemove', state.handlers.onMouseMove);
  window.removeEventListener('wheel', state.handlers.onWheel);
  window.removeEventListener('resize', state.handlers.onResize);

  // Destroy components
  destroyArchiveTube(state.tube);
  destroyArchiveGrid(state.grid);
  destroyArchiveUI(state.ui);

  if (state.logoModel) {
    state.scene.remove(state.logoModel);
    state.logoModel = null;
  }

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
  state.logoModel = null;
  state.grid = null;
  state.ui = null;
  state.container = null;
  state.renderHost = null;
  state.handlers = {};
}

export { initArchive, destroyArchive };

// ─────────────────────────────────────────────────────────────
// ARCHIVE-GRID.JS
// ─────────────────────────────────────────────────────────────


/**
 * Archive Grid - Animated grid plane background
 * Ported from brev/js/GridPlane.js to project conventions
 */

function createArchiveGrid(scene, sharedState) {
  const gridState = {
    mesh: null,
    material: null,
    uniforms: {
      uGridScale: { value: 26.0 },
      uLineWidth: { value: 0.5 },
      uEdgeWidth: { value: 0.14 },
      uEdgeAmp: { value: 1.3 },
      uCenterRadius: { value: 0.22 },
      uCenterAmp: { value: 0.85 },
      uCenter: { value: new THREE.Vector2(0.5, 0.5) },
      uTime: { value: 0.0 },
      uScrollSpeed: { value: 0.012 },
      uResolution: { value: new THREE.Vector2(1, 1) },
    },
  };

  const material = new THREE.ShaderMaterial({
    uniforms: gridState.uniforms,
    vertexShader: `
      varying vec2 vUv;

      uniform float uEdgeWidth;
      uniform float uEdgeAmp;
      uniform float uCenterRadius;
      uniform float uCenterAmp;
      uniform vec2 uCenter;

      void main() {
        vUv = uv;

        vec3 p = position;

        float dEdge = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
        float edgeMask = 1.0 - smoothstep(0.0, uEdgeWidth, dEdge);

        float dCenter = distance(vUv, uCenter);
        float centerMask = 1.0 - smoothstep(0.0, uCenterRadius, dCenter);

        float zOffset = edgeMask * uEdgeAmp + centerMask * uCenterAmp;
        p.z += zOffset;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;

      uniform float uGridScale;
      uniform float uLineWidth;
      uniform float uTime;
      uniform float uScrollSpeed;
      uniform vec2 uResolution;

      float gridLine(float coord, float width) {
        float fw = fwidth(coord);
        float p = abs(fract(coord - 0.5) - 0.5);
        return 1.0 - smoothstep(width * fw, (width + 1.0) * fw, p);
      }

      void main() {
        vec2 uv = (vUv + vec2(uTime * uScrollSpeed, 0.0)) * uGridScale;
        float gx = gridLine(uv.x, uLineWidth);
        float gy = gridLine(uv.y, uLineWidth);
        float g = max(gx, gy);

        vec3 base = vec3(0.);
        vec3 line = vec3(0.09);
        vec3 col = mix(base, line, g);
        gl_FragColor = vec4(col, 1.);
      }
    `,
    side: THREE.DoubleSide,
  });

  const geometry = new THREE.PlaneGeometry(18, 18, 512, 512);
  gridState.mesh = new THREE.Mesh(geometry, material);
  gridState.mesh.position.set(0, 0, -5.0);

  scene.add(gridState.mesh);
  gridState.material = material;

  // Store reference to sharedState for updates
  gridState.sharedState = sharedState;

  return gridState;
}

function updateArchiveGrid(gridState, time) {
  if (!gridState || !gridState.material) return;

  gridState.material.uniforms.uTime.value = time;

  // Smoothly lerp center based on shared state
  if (gridState.sharedState && gridState.sharedState.targetCenterUv) {
    gridState.material.uniforms.uCenter.value.lerp(gridState.sharedState.targetCenterUv, 0.08);
  }
}

function destroyArchiveGrid(gridState) {
  if (!gridState) return;

  if (gridState.mesh) {
    if (gridState.mesh.geometry) gridState.mesh.geometry.dispose();
    if (gridState.material) gridState.material.dispose();
    if (gridState.mesh.parent) {
      gridState.mesh.parent.remove(gridState.mesh);
    }
  }

  gridState.mesh = null;
  gridState.material = null;
}


// ─────────────────────────────────────────────────────────────
// ARCHIVE-TUBE.JS
// ─────────────────────────────────────────────────────────────


/**
 * Archive Tube - Cylindrical carousel of images
 * Ported from brev/js/ImageTube.js
 */



async function createArchiveTube(scene) {
  const tubeState = {
    rows: 5,
    cols: 12,
    ySpacing: 2.7,
    radius: 4,
    tileW: 0.72,
    tileH: 1.1,

    scrollCurrent: 0,
    angle: 0,
    rotationSpeedScale: 1,

    raycaster: new THREE.Raycaster(),
    mouse: new THREE.Vector2(),
    intersected: null,

    group: new THREE.Group(),
    rowGroups: [],
    rowSpeeds: [],
    textures: [],
    loopHeight: 0,
  };

  // Pre-compute row speeds
  for (let r = 0; r < tubeState.rows; r++) {
    tubeState.rowSpeeds.push(1.0);
  }

  // Load textures
  const loader = new THREE.TextureLoader();
  tubeState.textures = await Promise.all(
    archiveItems.map(item =>
      new Promise(resolve => {
        loader.load(item.image, resolve, undefined, () => {
          const canvas = document.createElement('canvas');
          canvas.width = 512;
          canvas.height = 512;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#333';
          ctx.fillRect(0, 0, 512, 512);
          ctx.fillStyle = '#666';
          ctx.font = '24px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(item.title, 256, 256);
          resolve(new THREE.CanvasTexture(canvas));
        });
      })
    )
  );

  const aspects = tubeState.textures.map(tex => {
    if (tex.image) {
      return tex.image.width / tex.image.height;
    }
    return 1;
  });

  const projectNames = archiveItems.map(item => item.title);

  // Build geometry
  const repeatCount = 3;
  const totalRows = tubeState.rows * repeatCount;
  tubeState.loopHeight = tubeState.rows * tubeState.ySpacing;

  for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
    const rowGroup = new THREE.Group();
    const y = (rowIndex - (totalRows - 1) / 2) * tubeState.ySpacing;
    rowGroup.position.y = y;

    tubeState.group.add(rowGroup);
    tubeState.rowGroups[rowIndex] = rowGroup;

    const baseRow = rowIndex % tubeState.rows;
    const rowOffset = baseRow % 2 === 0 ? 0 : 0.5;

    for (let col = 0; col < tubeState.cols; col++) {
      const theta = ((col + rowOffset) / tubeState.cols) * Math.PI * 2;
      const x = Math.cos(theta) * tubeState.radius;
      const z = Math.sin(theta) * tubeState.radius;
      const ry = -(theta - Math.PI / 2);

      const texIndex = (baseRow * tubeState.cols + col) % archiveItems.length;
      const aspect = aspects[texIndex];
      const planeGeometry = new THREE.PlaneGeometry(tubeState.tileH * aspect, tubeState.tileH);

      const material = new THREE.MeshBasicMaterial({
        map: tubeState.textures[texIndex],
        side: THREE.DoubleSide,
        toneMapped: false,
      });

      const mesh = new THREE.Mesh(planeGeometry, material);
      mesh.position.set(x, 0, z);
      mesh.rotation.y = ry;

      mesh.userData = {
        projectName: projectNames[texIndex],
      };

      rowGroup.add(mesh);
    }
  }

  scene.add(tubeState.group);
  return tubeState;
}

function updateArchiveTube(tubeState, dt, sharedState) {
  if (!tubeState) return;

  // Scroll Logic
  tubeState.scrollCurrent += (sharedState.tubeScrollTarget - tubeState.scrollCurrent) * 0.12;

  if (tubeState.scrollCurrent > tubeState.loopHeight / 2) {
    tubeState.scrollCurrent -= tubeState.loopHeight;
    sharedState.tubeScrollTarget -= tubeState.loopHeight;
  } else if (tubeState.scrollCurrent < -tubeState.loopHeight / 2) {
    tubeState.scrollCurrent += tubeState.loopHeight;
    sharedState.tubeScrollTarget += tubeState.loopHeight;
  }

  tubeState.group.position.y = -tubeState.scrollCurrent;

  // Rotation Logic
  const damping = 0.92;
  sharedState.tubeSpinVelocity *= Math.pow(damping, dt * 60);
  sharedState.tubeSpinVelocity = Math.max(-2.0, Math.min(2.0, sharedState.tubeSpinVelocity));

  tubeState.rotationSpeedScale += (sharedState.rotationSpeedScaleTarget - tubeState.rotationSpeedScale) * sharedState.rotationSpeedScaleLerp;
  const scaledDt = dt * tubeState.rotationSpeedScale;

  const baseSpeed = sharedState.tubeNaturalDir * sharedState.baseSpeed;
  tubeState.angle += (baseSpeed + sharedState.tubeSpinVelocity) * scaledDt;

  sharedState.tubeAngle = tubeState.angle;

  // Apply Rotation to Rows
  const totalRows = tubeState.rowGroups.length;
  for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
    const rowObj = tubeState.rowGroups[rowIndex];
    if (!rowObj) continue;
    const baseRow = rowIndex % tubeState.rows;
    rowObj.rotation.y = tubeState.angle * tubeState.rowSpeeds[baseRow];
  }
}

function checkArchiveTubeIntersections(tubeState, camera, sharedState) {
  if (!tubeState) return;

  tubeState.raycaster.setFromCamera(tubeState.mouse, camera);

  const meshes = [];
  tubeState.group.traverse(child => {
    if (child.isMesh) meshes.push(child);
  });

  const intersects = tubeState.raycaster.intersectObjects(meshes);

  if (intersects.length > 0) {
    const object = intersects[0].object;
    if (tubeState.intersected !== object) {
      tubeState.intersected = object;
      sharedState.hoveredProject = object.userData.projectName;
    }
  } else {
    if (tubeState.intersected) {
      tubeState.intersected = null;
      sharedState.hoveredProject = null;
    }
  }
}

function updateArchiveTubeMouseMove(tubeState, event) {
  if (!tubeState) return;
  tubeState.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  tubeState.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function destroyArchiveTube(tubeState) {
  if (!tubeState) return;

  tubeState.group.traverse(child => {
    if (child.isMesh) {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    }
  });

  tubeState.textures.forEach(tex => tex.dispose());

  if (tubeState.group.parent) {
    tubeState.group.parent.remove(tubeState.group);
  }

  tubeState.rowGroups = [];
  tubeState.textures = [];
  tubeState.intersected = null;
}


// ─────────────────────────────────────────────────────────────
// ARCHIVE-UI.JS
// ─────────────────────────────────────────────────────────────


/**
 * Archive UI - Grid center UV control only
 */

function createArchiveUI(sharedState) {
  const uiState = {
    container: document.querySelector('.archive-container') || document.querySelector('main[data-barba-namespace="archive"]'),
    sharedState: sharedState,
    handlers: {},
  };

  if (!uiState.container) {
    console.warn('Archive UI: container not found');
  }

  // Mouse move handler
  uiState.handlers.onMouseMove = (e) => {
    if (!uiState.container) return;

    const rect = uiState.container.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;

    // Control grid center UV
    if (rect.width > 0 && rect.height > 0) {
      const nx = (clientX - rect.left) / rect.width;
      const ny = (clientY - rect.top) / rect.height;
      const clampedX = Math.min(1, Math.max(0, nx));
      const clampedY = Math.min(1, Math.max(0, ny));

      const strength = 0.4;
      const cx = 0.5 + (clampedX - 0.5) * strength;
      const cy = 0.5 + ((1 - clampedY) - 0.5) * strength;

      if (uiState.sharedState && uiState.sharedState.targetCenterUv) {
        uiState.sharedState.targetCenterUv.set(
          Math.min(1, Math.max(0, cx)),
          Math.min(1, Math.max(0, cy))
        );
      }
    }
  };

  // Mouse leave handler
  uiState.handlers.onMouseLeave = () => {
    if (uiState.sharedState && uiState.sharedState.targetCenterUv) {
      uiState.sharedState.targetCenterUv.set(0.5, 0.5);
    }
  };

  // Attach event listeners
  if (uiState.container) {
    uiState.container.addEventListener('mousemove', uiState.handlers.onMouseMove);
    uiState.container.addEventListener('mouseleave', uiState.handlers.onMouseLeave);
  }

  return uiState;
}

function updateArchiveUI(uiState) {
  // No-op: minimal UI
}

function destroyArchiveUI(uiState) {
  if (!uiState) return;

  // Remove event listeners
  if (uiState.container) {
    uiState.container.removeEventListener('mousemove', uiState.handlers.onMouseMove);
    uiState.container.removeEventListener('mouseleave', uiState.handlers.onMouseLeave);
  }

  uiState.container = null;
}

