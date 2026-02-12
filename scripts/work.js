import gsap from 'gsap';
import { Flip } from 'gsap/flip';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js';
import { Text as TroikaText } from 'troika-three-text';
import GUI from 'lil-gui';
import { workItems } from '../data/work-items.js';
import { CRTShader } from './CRTShader.js';

gsap.registerPlugin(Flip);

// Single-ring circle gallery with kokomi-style scroll, grain, and animated effects
const USE_DOM_WHEEL = false;
let isWorkInitialized = false;

const CONFIG = {
  RING_RADIUS: 332,
  IMAGE_WIDTH: 65,
  IMAGE_HEIGHT: 65,
  SCROLL_SPEED: 0.0012,
  SCROLL_LERP: 0.12,
  DRAG_MULTIPLIER: -1.2,
  EDGE_DISTORTION: 0.15,
  GRAIN_INTENSITY: 0.03,
  Z_DEPTH_INTENSITY: 80,
  VELOCITY_DECAY: 0.88,
  // Cascade animation config
  CASCADE_SPREAD_RADIUS: 250,
  CASCADE_PHASE_DURATION: 0.6,
  CASCADE_STAGGER: 0.06,
  CASCADE_FALL_DURATION: 0.5,
};

// CRT post-processing configuration (tunable for work page)
const CRT_CONFIG = {
  scanlineIntensity: 0.38,
  scanlineCount: 663.0,
  brightness: 1.48,
  contrast: 1.06,
  saturation: 1.20,
  bloomIntensity: 0.23,
  bloomThreshold: 0.35,
  rgbShift: 0.12,
  adaptiveIntensity: 1.0,
  vignetteStrength: 0.0,
  curvature: 0.65,
  flickerStrength: 0.0,
};

const ABERRATION_CONFIG = {
  motionSmoothing: 0.14,
  velocityToBoost: 0.42,
  maxBoost: 0.85,
  additiveBoost: 0.06,
  multiplicativeBoost: 1.8,
};

// Scroll distortion and grain shader (chromatic aberration handled by CRT post-processing)
const VERTEX_SHADER = `
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform float uEdgeDistortion;
  uniform float uGrainIntensity;
  uniform vec2 uScreenPos;
  uniform vec2 uResolution;
  
  varying vec2 vUv;
  
  highp float random(vec2 co) {
    highp float a = 12.9898;
    highp float b = 78.233;
    highp float c = 43758.5453;
    highp float dt = dot(co.xy, vec2(a, b));
    highp float sn = mod(dt, 3.14);
    return fract(sin(sn) * c);
  }
  
  vec3 grain(vec2 uv, vec3 col, float amount) {
    float noise = random(uv + uTime);
    col += (noise - 0.5) * amount;
    return col;
  }
  
  void main() {
    vec2 uv = vUv;
    
    // Calculate screen position for edge effects
    vec2 screenUV = uScreenPos / uResolution;
    vec2 screenCenter = vec2(0.5);
    vec2 toCenter = screenUV - screenCenter;
    float distFromCenter = length(toCenter);
    float edgeFactor = distFromCenter * distFromCenter;
    
    // Edge-based fisheye distortion
    float distortion = 1.0 + uEdgeDistortion * edgeFactor;
    vec2 centeredUV = uv - vec2(0.5);
    uv = vec2(0.5) + centeredUV * distortion;
    
    vec3 col = texture2D(uTexture, uv).rgb;

    // Add grain effect
    col = grain(uv, col, uGrainIntensity);

    gl_FragColor = vec4(col, 1.0);
  }
`;

const state = {
  // DOM
  container: null,
  titleEl: null,
  captionEl: null,
  thumbnailWheelEl: null,
  toggleBtn: null,

  // View mode
  viewMode: 'wheel', // 'wheel' | 'list'

  // Three.js
  renderer: null,
  scene: null,
  camera: null,
  raycaster: null,
  clock: null,

  // CRT post-processing
  renderTarget: null,
  crtScene: null,
  crtCamera: null,
  crtPass: null,
  crtUniforms: null,

  // Gallery
  meshes: [],
  domThumbnails: [],
  sharedGeometry: null,
  textureCache: new Map(),
  centerTitleMesh: null,
  centerTitleText: '',
  centerTitleMutationObserver: null,
  centerTitleResizeObserver: null,
  centerTitleSyncRaf: null,

  // 3D model (separate perspective scene)
  modelScene: null,
  modelCamera: null,
  model: null,
  modelMaterials: new Set(),
  pmremGenerator: null,
  envRenderTarget: null,
  shadowCatcher: null,
  lights: [],

  // Debug
  gui: null,
  materialResponse: {
    roughnessScale: 1,
    metalnessScale: 1,
    envMapIntensity: 1,
  },

  // Mouse parallax (orbital camera, matching home page)
  cameraTarget: { angle: Math.PI / 2, y: 0, tilt: 0 },
  cameraCurrent: { angle: Math.PI / 2, y: 0, tilt: 0 },
  lastMouseTime: 0,

  // Scroll tracking (kokomi-style)
  scrollTarget: 0,
  scrollCurrent: 0,
  scrollDelta: 0,

  // Parallax offsets for wheel meshes (applied on top of scroll rotation)
  wheelParallaxOffset: { x: 0, y: 0, z: 0, tilt: 0 },

  // Interaction
  rotation: 0,
  targetRotation: 0,
  scrollVelocity: 0,
  crtBaseRgbShift: CRT_CONFIG.rgbShift,
  crtMotionBoost: 0,
  isPointerDown: false,
  lastPointerY: 0,
  dragStartY: 0,

  // Animation
  animationFrame: null,

  // Event handlers
  handlers: {
    resize: null,
    pointerdown: null,
    pointermove: null,
    pointerup: null,
    wheel: null,
    mousemove: null,
    toggleView: null,
    listScroll: null,
  },
};

async function loadAllTextures() {
  const loader = new THREE.TextureLoader();

  const promises = workItems.map(item => {
    return new Promise((resolve) => {
      loader.load(
        item.image,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          state.textureCache.set(item.image, texture);
          resolve();
        },
        undefined,
        (error) => {
          console.warn(`Failed to load: ${item.image}`, error);
          resolve();
        }
      );
    });
  });

  await Promise.all(promises);
}

function tunePBRMaterial(material) {
  if (!material) return material;
  if (material.map) material.map.colorSpace = THREE.SRGBColorSpace;
  if (material.emissiveMap) material.emissiveMap.colorSpace = THREE.SRGBColorSpace;
  material.envMapIntensity = Math.max(material.envMapIntensity || 0.5, 0.9);
  if (material.roughness !== undefined) material.roughness = Math.min(material.roughness, 0.92);
  if (material.metalness !== undefined) material.metalness = Math.max(material.metalness, 0.02);
  material.needsUpdate = true;
  return material;
}

function applyMaterialResponse() {
  state.modelMaterials.forEach((material) => {
    if (!material) return;
    if (material.roughness !== undefined) {
      material.roughness = THREE.MathUtils.clamp(material.userData.baseRoughness * state.materialResponse.roughnessScale, 0.03, 1);
    }
    if (material.metalness !== undefined) {
      material.metalness = THREE.MathUtils.clamp(material.userData.baseMetalness * state.materialResponse.metalnessScale, 0, 1);
    }
    material.envMapIntensity = THREE.MathUtils.clamp(material.userData.baseEnvMapIntensity * state.materialResponse.envMapIntensity, 0.2, 4);
    material.needsUpdate = true;
  });
}

function setupModelEnvironment() {
  if (!state.renderer || !state.modelScene) return;
  state.pmremGenerator = new THREE.PMREMGenerator(state.renderer);
  state.pmremGenerator.compileEquirectangularShader();

  const loader = new HDRLoader();
  loader.load(
    '/env.hdr',
    (hdrTexture) => {
      if (!state.modelScene || !state.pmremGenerator) {
        hdrTexture.dispose();
        return;
      }
      if (state.envRenderTarget) state.envRenderTarget.dispose();
      state.envRenderTarget = state.pmremGenerator.fromEquirectangular(hdrTexture);
      state.modelScene.environment = state.envRenderTarget.texture;
      state.modelScene.background = state.envRenderTarget.texture;
      state.modelScene.backgroundBlurriness = 0.56;
      state.modelScene.backgroundIntensity = 0.45;
      hdrTexture.dispose();
      applyMaterialResponse();
    },
    undefined,
    () => {
      if (state.modelScene) {
        state.modelScene.environment = null;
        state.modelScene.background = new THREE.Color(0xf7f7f6);
      }
    }
  );
}

function setupModelScene() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  // Separate perspective scene matching home page (#background) settings
  state.modelScene = new THREE.Scene();
  state.modelScene.background = new THREE.Color(0xf7f7f6);

  state.modelCamera = new THREE.PerspectiveCamera(100, width / height, 0.1, 1000);
  const radius = Math.sqrt(50) / 2.5; // BASE_CAMERA_RADIUS from three.js
  state.modelCamera.position.set(0, 1, radius);
  state.modelCamera.lookAt(0, 0, 0);

  // Lighting matching home page
  const ambient = new THREE.AmbientLight(0xffffff, 0.18);
  const dirLight = new THREE.DirectionalLight(0xffffff, 3.25);
  dirLight.position.set(4.2, 7.5, 6.2);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.set(2048, 2048);
  dirLight.shadow.bias = -0.00012;
  dirLight.shadow.normalBias = 0.01;
  dirLight.shadow.camera.near = 1;
  dirLight.shadow.camera.far = 30;
  dirLight.shadow.camera.left = -8;
  dirLight.shadow.camera.right = 8;
  dirLight.shadow.camera.top = 8;
  dirLight.shadow.camera.bottom = -8;

  state.modelScene.add(ambient);
  state.modelScene.add(dirLight);
  state.lights = [ambient, dirLight];

  const catcherGeometry = new THREE.PlaneGeometry(24, 24);
  const catcherMaterial = new THREE.ShadowMaterial({ opacity: 0.22 });
  state.shadowCatcher = new THREE.Mesh(catcherGeometry, catcherMaterial);
  state.shadowCatcher.rotation.x = -Math.PI / 2;
  state.shadowCatcher.position.y = -1.35;
  state.shadowCatcher.receiveShadow = true;
  state.modelScene.add(state.shadowCatcher);
}

function loadModel() {
  const loader = new GLTFLoader();
  loader.load(
    '/brev.glb',
    (glb) => {
      const model = glb.scene;
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const minY = box.min.y;
      model.position.sub(center);
      model.position.y -= minY;

      model.traverse((child) => {
        if (!child.isMesh) return;
        child.castShadow = true;
        child.receiveShadow = true;

        if (Array.isArray(child.material)) {
          child.material = child.material.map((material) => {
            const tuned = tunePBRMaterial(material);
            tuned.userData.baseRoughness = tuned.roughness ?? 0.75;
            tuned.userData.baseMetalness = tuned.metalness ?? 0.05;
            tuned.userData.baseEnvMapIntensity = tuned.envMapIntensity ?? 1;
            state.modelMaterials.add(tuned);
            return tuned;
          });
        } else if (child.material) {
          child.material = tunePBRMaterial(child.material);
          child.material.userData.baseRoughness = child.material.roughness ?? 0.75;
          child.material.userData.baseMetalness = child.material.metalness ?? 0.05;
          child.material.userData.baseEnvMapIntensity = child.material.envMapIntensity ?? 1;
          state.modelMaterials.add(child.material);
        }
      });

      applyMaterialResponse();
      state.modelScene.add(model);
      state.model = model;
    },
    undefined,
    (err) => console.error('Work model load error:', err)
  );
}

function setupRenderer() {
  const container = document.getElementById('work-gallery')
    || document.querySelector("[data-barba-namespace='work'] .slider")
    || document.querySelector("[data-barba-namespace='work']");
  if (!container) return false;

  state.container = container;

  const width = window.innerWidth;
  const height = window.innerHeight;

  try {
    state.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
  } catch (err) {
    console.warn('[WebGL] Failed to create work page renderer:', err);
    return;
  }

  state.renderer.setSize(width, height);
  state.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  state.renderer.toneMapping = THREE.ACESFilmicToneMapping;
  state.renderer.toneMappingExposure = 1.15;
  state.renderer.outputColorSpace = THREE.SRGBColorSpace;
  state.renderer.setClearColor(0xf7f7f6, 1);
  state.renderer.shadowMap.enabled = true;
  state.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Add context loss handler
  state.renderer.domElement.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    console.warn('[WebGL] Work page context lost');
    destroyWork();
  }, false);

  container.appendChild(state.renderer.domElement);

  state.camera = new THREE.OrthographicCamera(
    -width / 2,
    width / 2,
    height / 2,
    -height / 2,
    -1000,
    1000
  );
  state.camera.position.z = 500;

  state.scene = new THREE.Scene();
  // No background — transparent so the model scene shows through

  state.raycaster = new THREE.Raycaster();
  state.clock = new THREE.Clock();

  setupModelEnvironment();

  // Setup CRT post-processing
  setupCRTPass(width, height);

  return true;
}

function setupCRTPass(width, height) {
  // Create render target for initial gallery render
  state.renderTarget = new THREE.WebGLRenderTarget(width, height, {
    format: THREE.RGBAFormat,
    type: THREE.UnsignedByteType,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
  });

  // Create scene and dedicated camera for CRT post-processing
  state.crtScene = new THREE.Scene();
  state.crtCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  // Create geometry for CRT pass
  const crtGeometry = new THREE.PlaneGeometry(2, 2);

  // Create material from CRTShader
  const crtMaterial = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.clone(CRTShader.uniforms),
    vertexShader: CRTShader.vertexShader,
    fragmentShader: CRTShader.fragmentShader,
  });

  // Set render target texture
  crtMaterial.uniforms.tDiffuse.value = state.renderTarget.texture;

  // Apply CRT config values
  Object.keys(CRT_CONFIG).forEach(key => {
    if (crtMaterial.uniforms[key]) {
      crtMaterial.uniforms[key].value = CRT_CONFIG[key];
    }
  });

  // Store uniforms for animation updates
  state.crtUniforms = crtMaterial.uniforms;

  // Create mesh and add to CRT scene
  state.crtPass = new THREE.Mesh(crtGeometry, crtMaterial);
  state.crtScene.add(state.crtPass);
}

function updateChromaticAberrationUniform() {
  if (!state.crtUniforms?.rgbShift) return;

  const baseShift = Math.max(0, state.crtBaseRgbShift);
  const motionBoost = Math.max(0, state.crtMotionBoost);
  const combinedShift = baseShift * (1 + motionBoost * ABERRATION_CONFIG.multiplicativeBoost)
    + motionBoost * ABERRATION_CONFIG.additiveBoost;

  state.crtUniforms.rgbShift.value = combinedShift;
}

async function setupCenterTitle() {
  if (!state.scene || !state.titleEl || !workItems.length) return;

  const title = new TroikaText();
  title.text = workItems[0].title || '';
  title.anchorX = 'center';
  title.anchorY = 'middle';
  title.position.set(0, 0, 190);
  title.maxWidth = window.innerWidth * 0.7;
  title.material.depthTest = false;
  title.material.depthWrite = false;
  title.frustumCulled = false;

  state.scene.add(title);
  state.centerTitleMesh = title;
  state.centerTitleText = title.text;

  const queueCenterTitleSync = () => {
    if (state.centerTitleSyncRaf !== null) return;
    state.centerTitleSyncRaf = requestAnimationFrame(() => {
      state.centerTitleSyncRaf = null;
      syncCenterTitleFromDom();
    });
  };

  state.centerTitleMutationObserver = new MutationObserver(queueCenterTitleSync);
  state.centerTitleMutationObserver.observe(state.titleEl, {
    attributes: true,
    attributeFilter: ['class', 'style'],
    childList: true,
    characterData: true,
    subtree: true,
  });

  if ('ResizeObserver' in window) {
    state.centerTitleResizeObserver = new ResizeObserver(queueCenterTitleSync);
    state.centerTitleResizeObserver.observe(state.titleEl);
  }

  state.titleEl.style.opacity = '0';
  state.titleEl.style.pointerEvents = 'none';
  syncCenterTitleFromDom();
}

function resolveTroikaFontPath(fontFamily) {
  const families = fontFamily
    .split(',')
    .map(part => part.trim().replace(/^['"]|['"]$/g, '').toLowerCase());

  for (const family of families) {
    if (family.includes('otjubilee')) return '/OTJubilee-Golden.otf';
    if (family.includes('neuemontreal') || family.includes('ppneuemontreal')) return '/PPNeueMontreal-Medium.otf';
  }
  return '/OTJubilee-Golden.otf';
}

function applyTextTransform(text, transform) {
  if (transform === 'uppercase') return text.toUpperCase();
  if (transform === 'lowercase') return text.toLowerCase();
  if (transform === 'capitalize') {
    return text.replace(/\b\p{L}/gu, m => m.toUpperCase());
  }
  return text;
}

function syncCenterTitleFromDom() {
  if (!state.centerTitleMesh || !state.titleEl) return;

  const style = window.getComputedStyle(state.titleEl);
  const fontSizePx = Number.parseFloat(style.fontSize) || 36;
  const letterSpacingPx = Number.parseFloat(style.letterSpacing);
  const lineHeightPx = Number.parseFloat(style.lineHeight);
  const textAlign = style.textAlign || 'center';
  const rawText = state.titleEl.textContent?.trim() || state.centerTitleText || '';
  const transformedText = applyTextTransform(rawText, style.textTransform);

  const mesh = state.centerTitleMesh;
  mesh.text = transformedText;
  mesh.font = resolveTroikaFontPath(style.fontFamily || '');
  mesh.fontSize = fontSizePx;
  mesh.fontStyle = style.fontStyle || 'normal';
  mesh.fontWeight = style.fontWeight || '400';
  mesh.textAlign = textAlign;
  mesh.letterSpacing = Number.isFinite(letterSpacingPx) ? (letterSpacingPx / fontSizePx) : 0;
  mesh.lineHeight = Number.isFinite(lineHeightPx) ? (lineHeightPx / fontSizePx) : 'normal';
  mesh.maxWidth = window.innerWidth * 0.7;

  const color = new THREE.Color();
  color.setStyle(style.color || '#111111');
  mesh.color = color.getHex();

  const rect = state.titleEl.getBoundingClientRect();
  mesh.position.set(
    rect.left + rect.width * 0.5 - window.innerWidth * 0.5,
    window.innerHeight * 0.5 - (rect.top + rect.height * 0.5),
    190
  );

  mesh.sync();
  state.centerTitleText = transformedText;
}

function setupGallery() {
  state.sharedGeometry = new THREE.PlaneGeometry(1, 1);

  const totalItems = workItems.length;
  const angleStep = (Math.PI * 2) / totalItems;

  workItems.forEach((item, index) => {
    const texture = state.textureCache.get(item.image);
    if (!texture) return;

    // Create shader material with chromatic aberration, grain, and time-based effects
    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms: {
        uTexture: { value: texture },
        uTime: { value: 0 },
        uEdgeDistortion: { value: CONFIG.EDGE_DISTORTION },
        uGrainIntensity: { value: CONFIG.GRAIN_INTENSITY },
        uScreenPos: { value: new THREE.Vector2(0, 0) },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      },
      transparent: false,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(state.sharedGeometry, material);

    // Position on single ring
    const angle = index * angleStep;
    mesh.position.x = Math.cos(angle) * CONFIG.RING_RADIUS;
    mesh.position.y = Math.sin(angle) * CONFIG.RING_RADIUS;
    mesh.position.z = 0;

    mesh.scale.set(CONFIG.IMAGE_WIDTH, CONFIG.IMAGE_HEIGHT, 1);

    mesh.userData = {
      workItem: item,
      baseAngle: angle,
      index,
    };

    state.scene.add(mesh);
    state.meshes.push(mesh);
  });
}

function setupDOMWheel() {
  if (!state.thumbnailWheelEl) return;
  state.thumbnailWheelEl.innerHTML = '';
  state.domThumbnails = [];

  const fragment = document.createDocumentFragment();
  workItems.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'thumbnail-item';
    card.dataset.index = String(index);
    card.dataset.href = item.href || '';
    card.dataset.title = item.title || '';

    const img = document.createElement('img');
    img.src = item.image;
    img.alt = item.title || `Work item ${index + 1}`;
    card.appendChild(img);

    fragment.appendChild(card);
    state.domThumbnails.push(card);
  });

  state.thumbnailWheelEl.appendChild(fragment);
}

function updateDOMWheel() {
  if (!state.domThumbnails.length) return;

  const angleStep = (Math.PI * 2) / state.domThumbnails.length;
  const activeIndex = getWheelActiveIndex();
  const centerX = window.innerWidth * 0.5;
  const centerY = window.innerHeight * 0.5;

  state.domThumbnails.forEach((el, index) => {
    const baseAngle = index * angleStep;
    const currentAngle = baseAngle + state.rotation;
    const x = Math.cos(currentAngle) * CONFIG.RING_RADIUS;
    const y = -Math.sin(currentAngle) * CONFIG.RING_RADIUS;
    const scale = 1;

    el.style.left = `${centerX}px`;
    el.style.top = `${centerY}px`;
    el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale})`;
    el.style.zIndex = String(Math.round(1000 + Math.cos(currentAngle) * 200));
    el.classList.toggle('is-active', index === activeIndex);
  });
}

function getWheelActiveIndex() {
  if (!workItems.length) return 0;
  const angleStep = (Math.PI * 2) / workItems.length;
  let activeIndex = 0;
  let minDiff = Infinity;
  for (let index = 0; index < workItems.length; index++) {
    const currentAngle = ((index * angleStep + state.rotation) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
    const diff = Math.abs(currentAngle - Math.PI / 2);
    if (diff < minDiff) {
      minDiff = diff;
      activeIndex = index;
    }
  }
  return activeIndex;
}

// Get list layout positions for vertical column
function getListPositions() {
  const centerX = window.innerWidth * 0.5;
  const gap = 60; // Space between items
  const startY = CONFIG.IMAGE_HEIGHT; // Start from top with padding

  return workItems.map((_, index) => ({
    x: centerX,
    y: startY + index * (CONFIG.IMAGE_HEIGHT + gap)
  }));
}

// Get active index in list mode (closest to viewport center)
function getListActiveIndex() {
  if (!state.domThumbnails.length) return 0;

  const viewportCenterY = window.innerHeight * 0.5;
  let activeIndex = 0;
  let minDist = Infinity;

  state.domThumbnails.forEach((el, index) => {
    const rect = el.getBoundingClientRect();
    const elCenterY = rect.top + rect.height / 2;
    const dist = Math.abs(elCenterY - viewportCenterY);

    if (dist < minDist) {
      minDist = dist;
      activeIndex = index;
    }
  });

  return activeIndex;
}

// Calculate spread positions for cascade animation (based on wheel angles)
function getCascadeSpreadPositions() {
  const angleStep = (Math.PI * 2) / state.domThumbnails.length;
  const centerX = window.innerWidth * 0.5;
  const centerY = window.innerHeight * 0.5;

  return state.domThumbnails.map((_, index) => {
    const baseAngle = index * angleStep;
    const currentAngle = baseAngle + state.rotation;

    // Spread outward from center using wheel angle
    const spreadX = Math.cos(currentAngle) * CONFIG.CASCADE_SPREAD_RADIUS;
    const spreadY = -Math.sin(currentAngle) * CONFIG.CASCADE_SPREAD_RADIUS;

    // Add upward offset for the fall animation
    const fallOffsetY = -150;

    return {
      x: centerX + spreadX,
      y: centerY + spreadY + fallOffsetY,
      spreadX,
      spreadY
    };
  });
}

// Get current visual positions of elements (from wheel layout)
function getCurrentWheelPositions() {
  const angleStep = (Math.PI * 2) / state.domThumbnails.length;
  const centerX = window.innerWidth * 0.5;
  const centerY = window.innerHeight * 0.5;

  return state.domThumbnails.map((_, index) => {
    const baseAngle = index * angleStep;
    const currentAngle = baseAngle + state.rotation;
    const x = Math.cos(currentAngle) * CONFIG.RING_RADIUS;
    const y = -Math.sin(currentAngle) * CONFIG.RING_RADIUS;

    return {
      x: centerX + x,
      y: centerY + y
    };
  });
}

// Animate cascade effect: spread from wheel, then fall into vertical list
function animateCascadeToList(flipState, finalPositions) {
  const currentPositions = getCurrentWheelPositions();
  const spreadPositions = getCascadeSpreadPositions();

  const cascadeTl = gsap.timeline();

  // Set initial left/top to current positions and clear transform
  state.domThumbnails.forEach((el, index) => {
    const pos = currentPositions[index];
    gsap.set(el, {
      left: pos.x,
      top: pos.y,
      transform: 'translate(-50%, -50%)',
      clearProps: 'zIndex'
    });
  });

  // Phase 1: Spread outward from center with stagger
  state.domThumbnails.forEach((el, index) => {
    const spread = spreadPositions[index];

    cascadeTl.to(el, {
      left: spread.x,
      top: spread.y,
      opacity: 0.8,
      clearProps: 'transform',
      duration: CONFIG.CASCADE_PHASE_DURATION,
      ease: 'power1.out'
    }, index * CONFIG.CASCADE_STAGGER);
  });

  // Phase 2: Fall down to final list positions with opacity in
  state.domThumbnails.forEach((el, index) => {
    const finalPos = finalPositions[index];

    cascadeTl.to(el, {
      left: finalPos.x,
      top: finalPos.y,
      opacity: 1,
      duration: CONFIG.CASCADE_FALL_DURATION,
      ease: 'power1.in'
    }, CONFIG.CASCADE_PHASE_DURATION + index * CONFIG.CASCADE_STAGGER * 0.5);
  });

  return cascadeTl;
}

// Animate reverse cascade effect: rise up from list, converge back to wheel
function animateCascadeToWheel(flipState) {
  const angleStep = (Math.PI * 2) / state.domThumbnails.length;
  const centerX = window.innerWidth * 0.5;
  const centerY = window.innerHeight * 0.5;
  const spreadPositions = getCascadeSpreadPositions();

  const cascadeTl = gsap.timeline();

  // Phase 1: Rise upward with spread
  state.domThumbnails.forEach((el, index) => {
    const spread = spreadPositions[index];

    cascadeTl.to(el, {
      left: spread.x,
      top: spread.y,
      opacity: 0.8,
      duration: CONFIG.CASCADE_FALL_DURATION,
      ease: 'power1.out'
    }, index * CONFIG.CASCADE_STAGGER * 0.5);
  });

  // Phase 2: Converge back to wheel positions with transform
  state.domThumbnails.forEach((el, index) => {
    const baseAngle = index * angleStep;
    const currentAngle = baseAngle + state.rotation;
    const x = Math.cos(currentAngle) * CONFIG.RING_RADIUS;
    const y = -Math.sin(currentAngle) * CONFIG.RING_RADIUS;

    cascadeTl.to(el, {
      left: centerX,
      top: centerY,
      opacity: 1,
      transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(1)`,
      duration: CONFIG.CASCADE_PHASE_DURATION,
      ease: 'power1.in'
    }, CONFIG.CASCADE_FALL_DURATION + index * CONFIG.CASCADE_STAGGER * 0.5);
  });

  return cascadeTl;
}

// Transition from wheel to list view
function transitionToList() {
  if (state.viewMode === 'list' || !state.domThumbnails.length) return;

  // Capture current state for Flip
  const flipState = Flip.getState(state.domThumbnails);

  // Calculate list positions
  const positions = getListPositions();
  const centerX = window.innerWidth * 0.5;
  const centerY = window.innerHeight * 0.5;

  // Calculate total height needed for scrolling
  const lastPosition = positions[positions.length - 1];
  const totalHeight = lastPosition.y + CONFIG.IMAGE_HEIGHT + 60; // Add padding at bottom

  // Prepare DOM for list layout (will be positioned by cascade animation)
  state.domThumbnails.forEach((el) => {
    el.classList.add('list-mode');
    el.style.position = 'absolute';
  });

  // Run cascade animation to final list positions
  const cascadeTl = animateCascadeToList(flipState, positions);

  // After cascade completes, lock in the positions and enable scrolling
  cascadeTl.add(() => {
    state.viewMode = 'list';

    // Lock positions for list mode
    state.domThumbnails.forEach((el, index) => {
      const pos = positions[index];
      el.style.left = `${centerX}px`;
      el.style.top = `${pos.y}px`;
      el.style.transform = `translate(-50%, 0) scale(1)`;
    });

    // Enable scroll on thumbnail container for list mode
    if (state.thumbnailWheelEl) {
      state.thumbnailWheelEl.classList.add('list-mode');
      state.thumbnailWheelEl.style.overflowY = 'auto';
      state.thumbnailWheelEl.style.pointerEvents = 'auto';
      state.thumbnailWheelEl.style.minHeight = `${totalHeight}px`; // Force scrollable height

      // Add scroll listener for title updates
      state.handlers.listScroll = onListScroll;
      state.thumbnailWheelEl.addEventListener('scroll', state.handlers.listScroll, { passive: true });
    }
  });
}

// Transition from list to wheel view
function transitionToWheel() {
  if (state.viewMode === 'wheel' || !state.domThumbnails.length) return;

  // Capture current state for Flip
  const flipState = Flip.getState(state.domThumbnails);

  // Remove list mode classes
  state.domThumbnails.forEach(el => {
    el.classList.remove('list-mode');
  });

  // Restore wheel layout
  updateDOMWheel();

  // Run cascade animation back to wheel positions
  const cascadeTl = animateCascadeToWheel(flipState);

  // After cascade completes, lock in the wheel positions
  cascadeTl.add(() => {
    state.viewMode = 'wheel';

    // Disable scroll on thumbnail container
    if (state.thumbnailWheelEl) {
      state.thumbnailWheelEl.classList.remove('list-mode');
      state.thumbnailWheelEl.style.overflowY = 'hidden';
      state.thumbnailWheelEl.style.pointerEvents = 'none';
      state.thumbnailWheelEl.style.minHeight = ''; // Reset height

      // Remove scroll listener
      if (state.handlers.listScroll) {
        state.thumbnailWheelEl.removeEventListener('scroll', state.handlers.listScroll);
        state.handlers.listScroll = null;
      }
    }
  });
}

function updateScroll() {
  // Smooth lerp scroll (kokomi-style but slower)
  const prev = state.scrollCurrent;
  state.scrollCurrent += (state.scrollTarget - state.scrollCurrent) * CONFIG.SCROLL_LERP;
  state.scrollDelta = state.scrollCurrent - prev;

  // Update rotation from scroll
  state.targetRotation = state.scrollCurrent * CONFIG.SCROLL_SPEED;
}

function updateRotation() {
  // Smooth lerp towards target
  const prevRotation = state.rotation;
  state.rotation += (state.targetRotation - state.rotation) * CONFIG.SCROLL_LERP;

  // Calculate velocity for shader effects
  state.scrollVelocity = Math.abs(state.scrollDelta * 0.5);
  state.scrollVelocity *= CONFIG.VELOCITY_DECAY;

  // Update time for animated effects
  const time = state.clock ? state.clock.getElapsedTime() : 0;

  // Smooth parallax offsets based on camera target (orbital parallax)
  const parallaxParams = state.guiParallax || { angleRange: 0.15, yRange: 0.3, tiltRange: 0.02 };
  state.wheelParallaxOffset.x += (state.cameraTarget.angle * parallaxParams.angleRange * 100 - state.wheelParallaxOffset.x) * CONFIG.SCROLL_LERP;
  state.wheelParallaxOffset.y += (state.cameraTarget.y * parallaxParams.yRange * 100 - state.wheelParallaxOffset.y) * CONFIG.SCROLL_LERP;
  state.wheelParallaxOffset.tilt += (state.cameraTarget.tilt - state.wheelParallaxOffset.tilt) * CONFIG.SCROLL_LERP;
  state.wheelParallaxOffset.z += (-state.cameraTarget.angle * 50 - state.wheelParallaxOffset.z) * CONFIG.SCROLL_LERP;

  if (USE_DOM_WHEEL) {
    updateDOMWheel();
    return;
  }

  // Update all mesh positions and shader uniforms
  state.meshes.forEach(mesh => {
    const { baseAngle } = mesh.userData;
    const currentAngle = baseAngle + state.rotation;

    // Base ring position
    mesh.position.x = Math.cos(currentAngle) * CONFIG.RING_RADIUS;
    mesh.position.y = Math.sin(currentAngle) * CONFIG.RING_RADIUS;

    // Z-depth motion based on scroll velocity (like kokomi)
    const zDepth = -Math.min(Math.abs(state.scrollDelta) * CONFIG.Z_DEPTH_INTENSITY, 100);
    mesh.position.z = zDepth + Math.sin(currentAngle * 2) * 15;

    // Apply parallax offsets (mouse-based depth and tilt as if part of 3D scene)
    mesh.position.x += state.wheelParallaxOffset.x * 0.15;
    mesh.position.y += state.wheelParallaxOffset.y * 0.1;
    mesh.position.z += state.wheelParallaxOffset.z * 0.05;

    // Apply tilt rotation to individual mesh based on parallax (pitch and roll)
    mesh.rotation.z = state.wheelParallaxOffset.tilt * 0.5;
    mesh.rotation.x = state.cameraTarget.y * 0.1;
    mesh.rotation.y = state.cameraTarget.angle * 0.08;

    // Calculate screen position for edge effects
    const projected = mesh.position.clone().project(state.camera);
    const screenX = (projected.x + 1) * 0.5 * window.innerWidth;
    const screenY = (1 - projected.y) * 0.5 * window.innerHeight;

    // Update shader uniforms
    if (mesh.material && mesh.material.uniforms) {
      mesh.material.uniforms.uTime.value = time;
      mesh.material.uniforms.uScreenPos.value.set(screenX, screenY);
    }
  });
}

function updateTitle() {
  if (!state.titleEl) return;

  if (USE_DOM_WHEEL) {
    if (!workItems.length) return;

    // Use appropriate active index function based on view mode
    const activeIndex = state.viewMode === 'list'
      ? getListActiveIndex()
      : getWheelActiveIndex();

    const newTitle = workItems[activeIndex]?.title || '';
    if (state.titleEl.textContent !== newTitle) {
      state.titleEl.textContent = newTitle;
    }
    return;
  }

  // Find closest mesh to top (90 degrees / PI/2)
  let closestMesh = null;
  let minDiff = Infinity;

  state.meshes.forEach(mesh => {
    const { baseAngle } = mesh.userData;
    const currentAngle = (baseAngle + state.rotation) % (Math.PI * 2);
    const normalized = currentAngle < 0 ? currentAngle + Math.PI * 2 : currentAngle;
    const diff = Math.abs(normalized - Math.PI / 2);

    if (diff < minDiff) {
      minDiff = diff;
      closestMesh = mesh;
    }
  });

  if (closestMesh) {
    const newTitle = closestMesh.userData.workItem.title;
    if (state.titleEl.textContent !== newTitle) {
      state.titleEl.textContent = newTitle;
      syncCenterTitleFromDom();
    }
  }
}

function animate() {
  updateScroll();
  updateRotation();
  updateTitle();

  // Update CRT shader time uniform
  const time = state.clock ? state.clock.getElapsedTime() : 0;
  if (state.crtUniforms && state.crtUniforms.time) {
    state.crtUniforms.time.value = time;
  }
  const targetBoost = Math.min(state.scrollVelocity * ABERRATION_CONFIG.velocityToBoost, ABERRATION_CONFIG.maxBoost);
  state.crtMotionBoost += (targetBoost - state.crtMotionBoost) * ABERRATION_CONFIG.motionSmoothing;
  updateChromaticAberrationUniform();

  // Orbital camera parallax for 3D model (matching home page three.js)
  const lerpFactor = state.guiParallax ? state.guiParallax.lerp : 0.04;
  state.cameraCurrent.angle += (state.cameraTarget.angle - state.cameraCurrent.angle) * lerpFactor;
  state.cameraCurrent.y += (state.cameraTarget.y - state.cameraCurrent.y) * lerpFactor;
  state.cameraCurrent.tilt += (state.cameraTarget.tilt - state.cameraCurrent.tilt) * lerpFactor;

  if (state.modelCamera) {
    const radius = Math.sqrt(50) / 2.5;
    state.modelCamera.position.x = Math.cos(state.cameraCurrent.angle) * radius;
    state.modelCamera.position.z = Math.sin(state.cameraCurrent.angle) * radius;
    state.modelCamera.position.y += (state.cameraCurrent.y + 1 - state.modelCamera.position.y);

    // Handheld camera drift
    const driftTime = performance.now() * 0.001;
    state.modelCamera.position.x += Math.sin(driftTime * 0.7) * 0.012 + Math.sin(driftTime * 1.3) * 0.008;
    state.modelCamera.position.y += Math.sin(driftTime * 0.5) * 0.012 + Math.cos(driftTime * 1.1) * 0.008;
    state.modelCamera.position.z += Math.cos(driftTime * 0.6) * 0.008;

    state.modelCamera.lookAt(0, 0, 0);
    state.modelCamera.rotation.z += state.cameraCurrent.tilt;
  }

  // Three-pass rendering:
  // 1. Render 3D model scene to render target (background)
  if (state.renderer && state.modelScene && state.modelCamera && state.renderTarget) {
    state.renderer.setRenderTarget(state.renderTarget);
    state.renderer.render(state.modelScene, state.modelCamera);
  }

  // 2. Render gallery overlay on top (no clear, transparent backgrounds blend)
  if (state.renderer && state.scene && state.camera && state.renderTarget) {
    state.renderer.autoClear = false;
    state.renderer.render(state.scene, state.camera);
    state.renderer.autoClear = true;
  }

  // 2. Render CRT post-processing to screen
  if (state.renderer && state.crtScene) {
    state.renderer.setRenderTarget(null);
    state.renderer.render(state.crtScene, state.crtCamera);
  }

  if (state.animationFrame !== null) {
    state.animationFrame = requestAnimationFrame(animate);
  }
}

function handleClick(event) {
  if (USE_DOM_WHEEL) {
    let bestEl = null;
    let bestDist = Infinity;
    state.domThumbnails.forEach(el => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width * 0.5;
      const cy = rect.top + rect.height * 0.5;
      const dist = Math.hypot(event.clientX - cx, event.clientY - cy);
      if (dist < bestDist) {
        bestDist = dist;
        bestEl = el;
      }
    });
    if (bestEl && bestDist < 180) {
      const href = bestEl.dataset.href;
      if (href) window.location.href = href;
    }
    return;
  }

  if (!state.renderer || !state.camera) return;

  const rect = state.renderer.domElement.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  const pointer = new THREE.Vector2(x, y);
  state.raycaster.setFromCamera(pointer, state.camera);

  const intersects = state.raycaster.intersectObjects(state.meshes);

  if (intersects.length > 0) {
    const mesh = intersects[0].object;
    const { workItem } = mesh.userData;

    if (workItem && workItem.href) {
      window.location.href = workItem.href;
    }
  }
}

function onWheel(event) {
  // In list mode, don't interfere with natural scrolling
  if (state.viewMode === 'list') {
    // Let browser handle scroll naturally - don't prevent default
    return;
  }

  // In wheel mode, prevent default page scroll and update rotation
  event.preventDefault();
  state.scrollTarget += event.deltaY;
}

// Toggle button handler
function onToggleView() {
  if (state.viewMode === 'wheel') {
    transitionToList();
    if (state.toggleBtn) {
      state.toggleBtn.querySelector('.view-toggle-text').textContent = 'Wheel View';
    }
  } else {
    transitionToWheel();
    if (state.toggleBtn) {
      state.toggleBtn.querySelector('.view-toggle-text').textContent = 'List View';
    }
  }
}

// List scroll handler for updating title
function onListScroll() {
  if (state.viewMode === 'list') {
    updateTitle();
  }
}

function onResize() {
  if (!state.renderer || !state.camera) return;

  const width = window.innerWidth;
  const height = window.innerHeight;

  state.renderer.setSize(width, height);
  state.camera.left = -width / 2;
  state.camera.right = width / 2;
  state.camera.top = height / 2;
  state.camera.bottom = -height / 2;
  state.camera.updateProjectionMatrix();

  // Update model camera aspect
  if (state.modelCamera) {
    state.modelCamera.aspect = width / height;
    state.modelCamera.updateProjectionMatrix();
  }

  // Update render target size
  if (state.renderTarget) {
    state.renderTarget.setSize(width, height);
  }

  // Update resolution uniform for all materials
  state.meshes.forEach(mesh => {
    if (mesh.material && mesh.material.uniforms && mesh.material.uniforms.uResolution) {
      mesh.material.uniforms.uResolution.value.set(width, height);
    }
  });

  if (USE_DOM_WHEEL) {
    updateDOMWheel();
  }

  if (state.centerTitleMesh) {
    syncCenterTitleFromDom();
  }
}

function onMouseMove(event) {
  const now = performance.now();
  if (now - state.lastMouseTime < 16) return;
  state.lastMouseTime = now;

  const mx = (event.clientX / window.innerWidth) * 2 - 1;
  const my = -(event.clientY / window.innerHeight) * 2 + 1;

  // Orbital camera targeting (matching home page three.js)
  const p = state.guiParallax || { angleRange: 0.15, yRange: 0.3, tiltRange: 0.02 };
  state.cameraTarget.angle = Math.PI / 2 + mx * p.angleRange;
  state.cameraTarget.y = -my * p.yRange;
  state.cameraTarget.tilt = mx * p.tiltRange;
}

function onPointerDown(event) {
  state.isPointerDown = true;
  state.lastPointerY = event.clientY;
  state.dragStartY = event.clientY;
}

function onPointerMove(event) {
  if (!state.isPointerDown) return;

  const deltaY = event.clientY - state.lastPointerY;
  // Update scroll target on drag (like kokomi)
  state.scrollTarget -= deltaY * 2;
  state.lastPointerY = event.clientY;
}

function onPointerUp(event) {
  if (!state.isPointerDown) return;
  state.isPointerDown = false;

  const dragDistance = Math.abs(event.clientY - state.dragStartY);

  if (dragDistance < 5) {
    handleClick(event);
  }
}

function playIntro() {
  const tl = gsap.timeline();

  // Rotate in from offset
  tl.fromTo(
    state,
    { rotation: -Math.PI * 0.3 },
    {
      rotation: 0,
      duration: 1.8,
      ease: 'power2.out'
    }
  );

  // Scale in DOM thumbnails with stagger
  if (USE_DOM_WHEEL && state.domThumbnails.length > 0) {
    gsap.set(state.domThumbnails, { scale: 0, opacity: 0 });
    tl.to(
      state.domThumbnails,
      {
        scale: 1,
        opacity: 1,
        duration: 0.9,
        ease: 'power2.out',
        stagger: 0.04,
      },
      0.2
    );
    if (state.titleEl) {
      tl.fromTo(
        state.titleEl,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
        0.15
      );
    }
  }

  // Scale in meshes with stagger
  if (!USE_DOM_WHEEL && state.meshes.length > 0) {
    state.meshes.forEach(mesh => {
      gsap.set(mesh.scale, { x: 0, y: 0 });
    });

    state.meshes.forEach((mesh, index) => {
      tl.to(
        mesh.scale,
        {
          x: CONFIG.IMAGE_WIDTH,
          y: CONFIG.IMAGE_HEIGHT,
          duration: 1.2,
          ease: 'back.out(1.4)'
        },
        0.3 + index * 0.08
      );
    });
  }

  return tl;
}

function setupGui() {
  if (state.gui) { state.gui.destroy(); state.gui = null; }

  const gui = new GUI({ title: 'Work Page Debug' });
  state.gui = gui;

  // --- Model Transform ---
  const modelFolder = gui.addFolder('Model Transform');
  const pos = { x: 0, y: 0, z: -200 };
  const rot = { x: 0, y: 0, z: 0 };
  const scaleVal = { scale: 80 };

  modelFolder.add(pos, 'x', -500, 500, 1).name('Position X').onChange(v => { if (state.model) state.model.position.x = v; });
  modelFolder.add(pos, 'y', -500, 500, 1).name('Position Y').onChange(v => { if (state.model) state.model.position.y = v; });
  modelFolder.add(pos, 'z', -500, 100, 1).name('Position Z').onChange(v => { if (state.model) state.model.position.z = v; });
  modelFolder.add(rot, 'x', -Math.PI, Math.PI, 0.01).name('Rotation X').onChange(v => { if (state.model) state.model.rotation.x = v; });
  modelFolder.add(rot, 'y', -Math.PI, Math.PI, 0.01).name('Rotation Y').onChange(v => { if (state.model) state.model.rotation.y = v; });
  modelFolder.add(rot, 'z', -Math.PI, Math.PI, 0.01).name('Rotation Z').onChange(v => { if (state.model) state.model.rotation.z = v; });
  modelFolder.add(scaleVal, 'scale', 1, 300, 1).name('Scale').onChange(v => { if (state.model) state.model.scale.setScalar(v); });
  modelFolder.close();

  // --- Material ---
  const matFolder = gui.addFolder('PBR Response');
  const matParams = {
    roughnessScale: state.materialResponse.roughnessScale,
    metalnessScale: state.materialResponse.metalnessScale,
    envMapIntensity: state.materialResponse.envMapIntensity,
  };

  matFolder.add(matParams, 'roughnessScale', 0.4, 1.6, 0.01).name('Roughness Scale').onChange(v => {
    state.materialResponse.roughnessScale = v;
    applyMaterialResponse();
  });
  matFolder.add(matParams, 'metalnessScale', 0.25, 2.5, 0.01).name('Metalness Scale').onChange(v => {
    state.materialResponse.metalnessScale = v;
    applyMaterialResponse();
  });
  matFolder.add(matParams, 'envMapIntensity', 0.2, 3, 0.01).name('IBL Intensity').onChange(v => {
    state.materialResponse.envMapIntensity = v;
    applyMaterialResponse();
  });
  matFolder.close();

  // --- Lighting ---
  const lightFolder = gui.addFolder('Lighting');
  const lightParams = {
    ambientIntensity: 0.6,
    ambientColor: '#ffffff',
    dirIntensity: 0.8,
    dirColor: '#ffffff',
    dirX: 100, dirY: 200, dirZ: 300,
  };

  lightFolder.add(lightParams, 'ambientIntensity', 0, 2, 0.01).name('Ambient Intensity').onChange(v => { if (state.lights[0]) state.lights[0].intensity = v; });
  lightFolder.addColor(lightParams, 'ambientColor').name('Ambient Color').onChange(v => { if (state.lights[0]) state.lights[0].color.set(v); });
  lightFolder.add(lightParams, 'dirIntensity', 0, 3, 0.01).name('Dir Intensity').onChange(v => { if (state.lights[1]) state.lights[1].intensity = v; });
  lightFolder.addColor(lightParams, 'dirColor').name('Dir Color').onChange(v => { if (state.lights[1]) state.lights[1].color.set(v); });
  lightFolder.add(lightParams, 'dirX', -500, 500, 1).name('Dir X').onChange(v => { if (state.lights[1]) state.lights[1].position.x = v; });
  lightFolder.add(lightParams, 'dirY', -500, 500, 1).name('Dir Y').onChange(v => { if (state.lights[1]) state.lights[1].position.y = v; });
  lightFolder.add(lightParams, 'dirZ', -500, 500, 1).name('Dir Z').onChange(v => { if (state.lights[1]) state.lights[1].position.z = v; });
  lightFolder.close();

  // --- Parallax (orbital camera) ---
  const parallaxFolder = gui.addFolder('Parallax');
  const parallaxParams = { angleRange: 0.15, yRange: 0.3, tiltRange: 0.02, lerp: 0.04 };

  parallaxFolder.add(parallaxParams, 'angleRange', 0, 0.5, 0.01).name('Angle Range');
  parallaxFolder.add(parallaxParams, 'yRange', 0, 2, 0.01).name('Y Range');
  parallaxFolder.add(parallaxParams, 'tiltRange', 0, 0.2, 0.01).name('Tilt Range');
  parallaxFolder.add(parallaxParams, 'lerp', 0.001, 0.1, 0.001).name('Lerp');
  parallaxFolder.close();

  // Store params so mouse handler + animate() can read them
  state.guiParallax = parallaxParams;

  // --- CRT ---
  const crtFolder = gui.addFolder('CRT Post-Processing');
  const crt = { ...CRT_CONFIG };

  crtFolder.add(crt, 'scanlineIntensity', 0, 1, 0.01).name('Scanlines').onChange(v => { if (state.crtUniforms?.scanlineIntensity) state.crtUniforms.scanlineIntensity.value = v; });
  crtFolder.add(crt, 'scanlineCount', 100, 1500, 1).name('Scanline Count').onChange(v => { if (state.crtUniforms?.scanlineCount) state.crtUniforms.scanlineCount.value = v; });
  crtFolder.add(crt, 'brightness', 0.5, 2, 0.01).name('Brightness').onChange(v => { if (state.crtUniforms?.brightness) state.crtUniforms.brightness.value = v; });
  crtFolder.add(crt, 'contrast', 0.5, 2, 0.01).name('Contrast').onChange(v => { if (state.crtUniforms?.contrast) state.crtUniforms.contrast.value = v; });
  crtFolder.add(crt, 'saturation', 0, 2, 0.01).name('Saturation').onChange(v => { if (state.crtUniforms?.saturation) state.crtUniforms.saturation.value = v; });
  crtFolder.add(crt, 'bloomIntensity', 0, 1, 0.01).name('Bloom').onChange(v => { if (state.crtUniforms?.bloomIntensity) state.crtUniforms.bloomIntensity.value = v; });
  crtFolder.add(crt, 'bloomThreshold', 0, 1, 0.01).name('Bloom Threshold').onChange(v => { if (state.crtUniforms?.bloomThreshold) state.crtUniforms.bloomThreshold.value = v; });
  crtFolder.add(crt, 'rgbShift', 0, 1.2, 0.01).name('Chromatic Aberration').onChange(v => {
    state.crtBaseRgbShift = v;
    updateChromaticAberrationUniform();
  });
  crtFolder.add(crt, 'curvature', 0, 2, 0.01).name('Curvature').onChange(v => { if (state.crtUniforms?.curvature) state.crtUniforms.curvature.value = v; });
  crtFolder.add(crt, 'vignetteStrength', 0, 1, 0.01).name('Vignette').onChange(v => { if (state.crtUniforms?.vignetteStrength) state.crtUniforms.vignetteStrength.value = v; });
  crtFolder.add(crt, 'flickerStrength', 0, 0.1, 0.001).name('Flicker').onChange(v => { if (state.crtUniforms?.flickerStrength) state.crtUniforms.flickerStrength.value = v; });
  crtFolder.close();

  // --- Scene ---
  const sceneFolder = gui.addFolder('Scene');
  const sceneParams = { background: '#f7f7f6' };
  sceneFolder.addColor(sceneParams, 'background').name('Background').onChange(v => {
    if (state.modelScene) state.modelScene.background = new THREE.Color(v);
    if (state.renderer) state.renderer.setClearColor(new THREE.Color(v), 1);
  });
  sceneFolder.close();
}

function attachEventListeners() {
  state.handlers.resize = onResize;
  state.handlers.pointerdown = onPointerDown;
  state.handlers.pointermove = onPointerMove;
  state.handlers.pointerup = onPointerUp;
  state.handlers.wheel = onWheel;
  state.handlers.mousemove = onMouseMove;
  state.handlers.toggleView = onToggleView;

  window.addEventListener('resize', state.handlers.resize);
  document.addEventListener('mousemove', state.handlers.mousemove, { passive: true });

  if (state.container) {
    state.container.addEventListener('pointerdown', state.handlers.pointerdown);
    state.container.addEventListener('wheel', state.handlers.wheel, { passive: false });
    window.addEventListener('pointermove', state.handlers.pointermove);
    window.addEventListener('pointerup', state.handlers.pointerup);
  }

  if (state.toggleBtn) {
    state.toggleBtn.addEventListener('click', state.handlers.toggleView);
  }
}

function removeEventListeners() {
  if (state.handlers.resize) {
    window.removeEventListener('resize', state.handlers.resize);
  }
  if (state.handlers.pointerdown && state.container) {
    state.container.removeEventListener('pointerdown', state.handlers.pointerdown);
  }
  if (state.handlers.wheel && state.container) {
    state.container.removeEventListener('wheel', state.handlers.wheel);
  }
  if (state.handlers.pointermove) {
    window.removeEventListener('pointermove', state.handlers.pointermove);
  }
  if (state.handlers.pointerup) {
    window.removeEventListener('pointerup', state.handlers.pointerup);
  }
  if (state.handlers.mousemove) {
    document.removeEventListener('mousemove', state.handlers.mousemove);
  }
  if (state.handlers.toggleView && state.toggleBtn) {
    state.toggleBtn.removeEventListener('click', state.handlers.toggleView);
  }
  if (state.handlers.listScroll && state.thumbnailWheelEl) {
    state.thumbnailWheelEl.removeEventListener('scroll', state.handlers.listScroll);
  }

  Object.keys(state.handlers).forEach(key => {
    state.handlers[key] = null;
  });
}

async function initWork() {
  if (isWorkInitialized) {
    if (import.meta.env.DEV) console.log('[work] Already initialized, skipping');
    return;
  }
  isWorkInitialized = true;

  const mainContainer = document.querySelector("[data-barba-namespace='work']");
  if (!mainContainer) {
    console.warn('Work page container not found');
    return;
  }

  state.container = mainContainer;
  state.titleEl = document.querySelector('.work-title') || document.querySelector('.slide-title');
  state.captionEl = document.querySelector('.work-caption');
  state.thumbnailWheelEl = document.querySelector('.thumbnail-wheel');
  state.toggleBtn = document.querySelector('.view-toggle-btn');

  if (!setupRenderer()) {
    console.error('Failed to setup renderer');
    return;
  }

  await loadAllTextures();
  if (USE_DOM_WHEEL) {
    // DOM wheel mode: keep circle images + title in DOM for now.
    setupDOMWheel();
    if (state.titleEl) {
      state.titleEl.style.opacity = '1';
      state.titleEl.style.pointerEvents = 'auto';
      state.titleEl.textContent = workItems[0]?.title || state.titleEl.textContent;
    }
    updateDOMWheel();
  } else {
    // Canvas wheel mode (temporarily disabled by USE_DOM_WHEEL):
    // setupGallery();
    // await setupCenterTitle();
    setupGallery();
    await setupCenterTitle();
  }
  setupModelScene();
  loadModel();
  setupGui();
  attachEventListeners();

  // Initialize scroll tracking (kokomi-style)
  state.scrollTarget = 0;
  state.scrollCurrent = 0;
  state.scrollDelta = 0;
  state.crtBaseRgbShift = CRT_CONFIG.rgbShift;
  state.crtMotionBoost = 0;
  updateChromaticAberrationUniform();

  state.animationFrame = null;
  state.animationFrame = requestAnimationFrame(animate);
  playIntro();
}

function destroyWork() {
  if (!isWorkInitialized) return;
  isWorkInitialized = false;

  if (state.animationFrame !== null) {
    cancelAnimationFrame(state.animationFrame);
    state.animationFrame = null;
  }

  removeEventListeners();

  // Dispose meshes
  state.meshes.forEach(mesh => {
    if (mesh.material) {
      if (mesh.material.uniforms && mesh.material.uniforms.uTexture) {
        // Texture is disposed separately from cache
        mesh.material.uniforms.uTexture.value = null;
      }
      mesh.material.dispose();
    }
    if (state.scene) {
      state.scene.remove(mesh);
    }
  });
  state.meshes = [];
  state.domThumbnails = [];
  if (state.thumbnailWheelEl) {
    state.thumbnailWheelEl.innerHTML = '';
  }

  if (state.centerTitleMutationObserver) {
    state.centerTitleMutationObserver.disconnect();
    state.centerTitleMutationObserver = null;
  }
  if (state.centerTitleResizeObserver) {
    state.centerTitleResizeObserver.disconnect();
    state.centerTitleResizeObserver = null;
  }
  if (state.centerTitleSyncRaf !== null) {
    cancelAnimationFrame(state.centerTitleSyncRaf);
    state.centerTitleSyncRaf = null;
  }

  if (state.centerTitleMesh) {
    if (state.scene) {
      state.scene.remove(state.centerTitleMesh);
    }
    state.centerTitleMesh.dispose();
    state.centerTitleMesh = null;
    state.centerTitleText = '';
  }

  if (state.sharedGeometry) {
    state.sharedGeometry.dispose();
    state.sharedGeometry = null;
  }

  state.textureCache.forEach(texture => texture.dispose());
  state.textureCache.clear();

  // Destroy GUI
  if (state.gui) {
    state.gui.destroy();
    state.gui = null;
  }
  state.guiParallax = null;
  state.modelMaterials.clear();

  // Dispose 3D model
  if (state.model) {
    state.model.traverse((child) => {
      if (child.isMesh) {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      }
    });
    if (state.modelScene) state.modelScene.remove(state.model);
    state.model = null;
  }

  // Dispose lights
  state.lights.forEach(light => {
    if (state.modelScene) state.modelScene.remove(light);
  });
  state.lights = [];

  if (state.shadowCatcher) {
    if (state.modelScene) state.modelScene.remove(state.shadowCatcher);
    if (state.shadowCatcher.geometry) state.shadowCatcher.geometry.dispose();
    if (state.shadowCatcher.material) state.shadowCatcher.material.dispose();
    state.shadowCatcher = null;
  }
  if (state.envRenderTarget) {
    state.envRenderTarget.dispose();
    state.envRenderTarget = null;
  }
  if (state.pmremGenerator) {
    state.pmremGenerator.dispose();
    state.pmremGenerator = null;
  }

  state.modelScene = null;
  state.modelCamera = null;

  // Dispose CRT pass
  if (state.crtPass) {
    if (state.crtPass.geometry) {
      state.crtPass.geometry.dispose();
    }
    if (state.crtPass.material) {
      state.crtPass.material.dispose();
    }
    if (state.crtScene) {
      state.crtScene.remove(state.crtPass);
    }
    state.crtPass = null;
  }

  // Dispose render target
  if (state.renderTarget) {
    state.renderTarget.dispose();
    state.renderTarget = null;
  }

  state.crtScene = null;
  state.crtCamera = null;
  state.crtUniforms = null;

  if (state.renderer) {
    state.renderer.dispose();
    if (state.renderer.domElement && state.renderer.domElement.parentNode) {
      state.renderer.domElement.parentNode.removeChild(state.renderer.domElement);
    }
    state.renderer = null;
  }

  state.scene = null;
  state.camera = null;
  state.raycaster = null;
  state.clock = null;
  state.container = null;
  state.thumbnailWheelEl = null;
  if (state.titleEl) {
    state.titleEl.style.opacity = '';
    state.titleEl.style.pointerEvents = '';
  }
  state.titleEl = null;
  state.captionEl = null;
  state.rotation = 0;
  state.targetRotation = 0;
  state.scrollVelocity = 0;
  state.scrollTarget = 0;
  state.scrollCurrent = 0;
  state.scrollDelta = 0;
  state.crtBaseRgbShift = CRT_CONFIG.rgbShift;
  state.crtMotionBoost = 0;
  state.isPointerDown = false;
  state.cameraTarget.angle = Math.PI / 2;
  state.cameraTarget.y = 0;
  state.cameraTarget.tilt = 0;
  state.cameraCurrent.angle = Math.PI / 2;
  state.cameraCurrent.y = 0;
  state.cameraCurrent.tilt = 0;
  state.lastMouseTime = 0;
  state.wheelParallaxOffset.x = 0;
  state.wheelParallaxOffset.y = 0;
  state.wheelParallaxOffset.z = 0;
  state.wheelParallaxOffset.tilt = 0;

  // Reset view mode
  state.viewMode = 'wheel';
  state.toggleBtn = null;
}

export { initWork, destroyWork };
