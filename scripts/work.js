import gsap from 'gsap';
import * as THREE from 'three';
import barba from '@barba/core';
import { workItems } from '../data/work-items.js';
import { GLTFLoader } from 'three-stdlib';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {
  registerGalleryOverlay,
  unregisterGalleryOverlay,
  getRenderer,
  createFakeVolumeGlow,
  setBaseSceneOpacity,
} from './three.js';
import { preloader } from './preloader.js';

import { applyWorkSignaturePostFX } from './postfx-work-signature.js';
import { createPostFXUniforms } from './shaders/post-fx.js';


// Cinematic 3D strip carousel — one continuous curved mesh wrapping an arc,
// with UV-scrolled image segments, wave displacement, and parallax.
// Composited by the shared renderer via registerGalleryOverlay().

let isWorkInitialized = false;


function getActiveWorkContainer() {
  const containers = document.querySelectorAll('[data-barba="container"][data-barba-namespace="work"]');
  if (!containers.length) return null;
  return containers[containers.length - 1];
}

const CONFIG = {
  // Strip geometry
  ARC_RADIUS: 14,            // cylinder radius
  ARC_SPAN: 3.5,             // Wider arc (~200 degrees)
  STRIP_HEIGHT: 5.5,         // Taller strip for 5:4 aspect ratio
  STRIP_Y_OFFSET: -1.2,      // vertical center of strip (pushes below title)
  WIDTH_SEGMENTS: 96,
  HEIGHT_SEGMENTS: 24,

  // How many image slots are visible across the strip
  ITEMS_ON_STRIP: 11,         // Increased to maintain density with wider arc/taller items
  GAP_SIZE: 0.03,             // normalized gap between images
  NUM_UNIQUE: 6,              // unique textures

  // Camera
  CAMERA_FOV: 50,
  CAMERA_Z: 12,

  // Scroll / drag (scroll is in "item units" — 1.0 = one image width)
  SCROLL_SPEED: 0.004,
  SCROLL_LERP: 0.08,
  DRAG_MULTIPLIER: 0.008,

  // Parallax
  PARALLAX_ROTATION_X: 0.018,
  PARALLAX_ROTATION_Y: 0.03,
  PARALLAX_CAMERA_X: 0.09,
  PARALLAX_CAMERA_Y: 0.05,
  PARALLAX_LERP: 0.06,

  // Use same parallax config as three.js
  PARALLAX_ANGLE_RANGE: 0.2,
  PARALLAX_Y_RANGE: 0.3,
  PARALLAX_TILT_RANGE: 0.04,
  PARALLAX_CONFIG_LERP: 0.05,
  PARALLAX_ORBIT_RADIUS: 5,

  // Wave shader (Simplex Noise)
  WAVE_AMPLITUDE: 0.6,
  WAVE_FREQUENCY: 0.5,
  WAVE_SPEED: 0.2,
  WAVE_FLOW_X: 0.9,
  WAVE_FLOW_Y: 0.05,
  WAVE_FLOW_TURBULENCE: 0.08,
  WAVE_LAYER_FLOW_1: 0.45,
  WAVE_LAYER_FLOW_2: 0.9,
  WAVE_LAYER_FLOW_3: 1.35,
  WIND_BASE_STRENGTH: 0.16,
  WIND_GUST_SCALE: 0.22,
  WIND_GUST_FREQ_1: 0.7,
  WIND_GUST_FREQ_2: 2.3,
  WIND_PIN_POWER: 1.8,
  REVEAL_DURATION: 0.95,
  REVEAL_SOFTNESS: 0.06,
  REVEAL_EASE: 'power2.out',

  // Lighting
  POINT_LIGHT_INTENSITY: 3.5,
  POINT_LIGHT_Z: 10,
  AMBIENT_INTENSITY: 1.2,
  DIRECTIONAL_LIGHT_INTENSITY: 2.0,

  // Particles
  PARTICLE_COUNT: 200,
  PARTICLE_BOUNDS: { xHalf: 8, yMin: -3, yMax: 5, zMin: -16, zMax: 2 },

  // Scroll tilt
  SCROLL_TILT_AMOUNT: 0.08,
  SCROLL_TILT_LERP: 0.04,
  SCROLL_TILT_MAX: 0.15,
};

// ─── SHADERS ────────────────────────────────────────────────────────────────────

const STRIP_VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uWaveAmp;
  uniform float uWaveFreq;
  uniform float uWaveSpeed;
  uniform vec2 uWaveFlow;
  uniform float uWaveFlowTurbulence;
  uniform vec3 uWaveLayerFlow;
  uniform float uWindStrength;
  uniform float uWindPinPower;
  uniform float uFlatten;
  uniform float uArcRadius;
  uniform float uArcSpan;

  varying vec2 vUv;
  varying vec3 vViewPosition;
  varying vec3 vNormal;

  // ─── SIMPLEX NOISE 3D (Ashima/McEwan) ───
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    // First corner
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    // Other corners
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
    vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

    // Permutations
    i = mod289(i);
    vec4 p = permute( permute( permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

    // Gradients: 7x7 points over a square, mapped onto an octahedron.
    // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
    float n_ = 0.142857142857; // 1.0/7.0
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);

    // Normalise gradients
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    // Mix final noise value
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                  dot(p2,x2), dot(p3,x3) ) );
  }

  void main() {
    vUv = uv;
    vec3 pos = position;
    float flatten = clamp(uFlatten, 0.0, 1.0);

    // Arc -> flat unwrapping.
    float angle = (vUv.x - 0.5) * uArcSpan;
    float xFlat = angle * uArcRadius;
    pos.x = mix(pos.x, xFlat, flatten);
    pos.z = mix(pos.z, 0.0, flatten);

    float t = uTime * uWaveSpeed;

    // ─── CLOTH SIMULATION ───
    // Pin top edge and increase motion toward loose edge.
    float looseFactor = 1.0 - vUv.y;
    float pinInfluence = pow(looseFactor, uWindPinPower);
    
    // Scale UVs for noise space
    // x is long (ribbon length), y is short (ribbon height)
    vec2 noiseUV = vUv * vec2(2.0, 1.0) * uWaveFreq; 
    vec2 flow = uWaveFlow * t;

    // Layer 1: Large folds with subtle left->right advection.
    float n1 = snoise(vec3(
      noiseUV.x - flow.x * uWaveLayerFlow.x,
      noiseUV.y - flow.y * uWaveLayerFlow.x,
      t * uWaveFlowTurbulence
    ));

    // Layer 2: Smaller details/wrinkles
    float n2 = snoise(vec3(
      noiseUV.x * 2.5 - flow.x * uWaveLayerFlow.y,
      noiseUV.y * 2.5 - flow.y * uWaveLayerFlow.y,
      t * (uWaveFlowTurbulence * 1.8)
    ));

    // Layer 3: Fine flutter (mostly at edges)
    float n3 = snoise(vec3(
      noiseUV.x * 6.0 - flow.x * uWaveLayerFlow.z,
      noiseUV.y * 6.0 - flow.y * uWaveLayerFlow.z,
      t * (uWaveFlowTurbulence * 3.0)
    ));

    // Edge constraint: center is more constrained, edges flutter more
    float edgeDist = abs(vUv.y - 0.5) * 2.0; // 0 at center, 1 at edge
    float flutter = smoothstep(0.2, 1.0, edgeDist); 

    // Wind-driven gust logic (ported from cloth prototype)
    float wave1 = sin(vUv.x * 5.0 + t * 2.0);
    float wave2 = sin(vUv.x * 12.0 + t * 4.0 + vUv.y * 5.0);
    float wave3 = sin(t * 1.5);
    float ripples = wave1 * 0.5 + wave2 * 0.2 + wave3 * 0.3;

    float noiseDisplacement = (n1 * 1.0 + n2 * 0.4 + n3 * 0.15 * flutter) * uWaveAmp;
    float windDisplacement = (uWindStrength * 2.0 + ripples * uWaveFreq) * pinInfluence;

    // Combine layers:
    // Keep the existing look, but drive motion with cloth pin/gust behavior.
    float displacement = mix(noiseDisplacement, windDisplacement, 0.42) * (1.0 - flatten);

    // Apply displacement along normal
    pos += normal * displacement;



    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Pass view position for recomputing normal in fragment shader
    vViewPosition = -mvPosition.xyz;
    vNormal = normalize(normalMatrix * normal);
  }
`;


const STRIP_FRAGMENT_SHADER = /* glsl */ `
  uniform sampler2D uTex0;
  uniform sampler2D uTex1;
  uniform sampler2D uTex2;
  uniform sampler2D uTex3;
  uniform sampler2D uTex4;
  uniform sampler2D uTex5;
  uniform float uScrollOffset;
  uniform float uItemsOnStrip;
  uniform float uNumUnique;
  uniform float uGapSize;
  uniform float uTime;
  uniform float uSelectedIndex;
  uniform float uNonSelectedFade;
  uniform float uFocusSlot;
  uniform float uIsolateSlot;
  uniform float uTransitionOpacity;
  uniform float uRevealProgress;
  uniform float uRevealSoftness;
  uniform float uArcSpan;

  varying vec2 vUv;
  varying vec3 vViewPosition;
  varying vec3 vNormal;

  // Film grain hash
  float hash(vec2 p) {
    p = fract(p * vec2(443.897, 441.423));
    p += dot(p, p + 19.19);
    return fract(p.x * p.y);
  }

  void main() {
    // ─── RECOMPUTE NORMAL ───
    // Fallback to standard normal for now to debug
    vec3 normal = normalize(vNormal);

    // ─── TEXTURE MAPPING ───
    float totalU = vUv.x * uItemsOnStrip + uScrollOffset;
    float itemFract = fract(totalU);
    float itemIndex = floor(totalU);

    float wrappedIndex = mod(itemIndex, uNumUnique);
    if (wrappedIndex < 0.0) wrappedIndex += uNumUnique;

    float halfGap = uGapSize * 0.5;
    if (itemFract < halfGap || itemFract > 1.0 - halfGap) discard;

    float texU = (itemFract - halfGap) / (1.0 - uGapSize);
    vec2 texCoord = vec2(texU, vUv.y);

    vec3 col;
    int idx = int(wrappedIndex);
    if (idx == 0) col = texture2D(uTex0, texCoord).rgb;
    else if (idx == 1) col = texture2D(uTex1, texCoord).rgb;
    else if (idx == 2) col = texture2D(uTex2, texCoord).rgb;
    else if (idx == 3) col = texture2D(uTex3, texCoord).rgb;
    else if (idx == 4) col = texture2D(uTex4, texCoord).rgb;
    else col = texture2D(uTex5, texCoord).rgb;

    // ─── CLOTH LIGHTING (SHEEN) ───
    
    // View vector is simply opposite of view position (camera at 0,0,0 in view space)
    vec3 viewDir = normalize(vViewPosition); 
    
    // Fresnel / Sheen
    // Cloth looks brighter at glancing angles (sheen)
    float NdotV = abs(dot(normal, viewDir));
    float sheen = pow(1.0 - NdotV, 2.0); // Broad falloff for softness
    
    // Iridescence / Specular
    // Mix a warm golden tone into the sheen
    vec3 sheenColor = mix(vec3(0.5), vec3(1.0, 0.9, 0.7), 0.5);
    col = mix(col, col + sheenColor * 0.4, sheen);

    // Highlight wrinkles
    // Direct lighting simulation (assuming light from top-front)
    vec3 lightDir = normalize(vec3(0.2, 0.8, 1.0));
    float NdotL = max(0.0, dot(normal, lightDir));
    col *= (0.7 + 0.3 * NdotL); // Ambient + Diffuse



    // Film grain
    float grain = (hash(vUv * 1000.0 + uTime * 100.0) - 0.5) * 0.05;
    col += grain;

    float slotFloor = floor(totalU);
    float isSelectedSlot = 1.0 - step(0.5, abs(slotFloor - uFocusSlot));

    if (uIsolateSlot > 0.5 && isSelectedSlot < 0.5) discard;

    float nonSelectedFade = clamp(uNonSelectedFade, 0.0, 1.0);
    float alpha = 1.0;
    if (uFocusSlot > -0.5) {
      alpha -= (1.0 - isSelectedSlot) * nonSelectedFade;
    }

    // Sweep in arc-angle space (right -> left) so reveal starts on the visible edge.
    float progress = clamp(uRevealProgress, 0.0, 1.0);
    float angle = (vUv.x - 0.5) * uArcSpan;
    float startAngle = uArcSpan * 0.52;
    float endAngle = -uArcSpan * 0.52;
    float revealHead = mix(startAngle, endAngle, progress);
    float revealSoft = max(0.0001, uRevealSoftness * uArcSpan);
    float revealMask = smoothstep(revealHead, revealHead + revealSoft, angle);
    if (revealMask <= 0.001) discard;

    gl_FragColor = vec4(col, alpha * uTransitionOpacity * revealMask);
  }
`;

// ─── STATE ──────────────────────────────────────────────────────────────────────

const state = {
  container: null,
  titleEl: null,
  scene: null,
  camera: null,
  clock: null,

  // Strip mesh
  stripGroup: null,     // parent group for parallax
  stripMesh: null,      // the single curved mesh
  stripGeometry: null,
  stripMaterial: null,
  textureCache: new Map(),
  textures: [],         // ordered array [tex0, tex1, tex2, tex3]

  // Particles
  particleSystem: null,

  // Post-processing
  composer: null,
  workGlowHandle: null,

  // 3D model
  workModel: null,
  workModelMaterials: [],
  tunedMaterials: new Set(),

  // Lighting
  pointLight: null,
  ambientLight: null,
  directionalLight: null,
  shadowPlane: null,

  // Scroll state (in item units — 1.0 = one image slot)
  scrollTarget: 0,
  scrollCurrent: 0,
  scrollVelocity: 0,
  lastDragTime: 0,
  activeIndex: 0,
  lastActiveTitle: '',

  // Mouse parallax
  mouseX: 0,
  mouseY: 0,
  parallaxCurrent: { rx: 0, ry: 0, cx: 0, cy: 0 },

  // Scroll tilt
  scrollTilt: 0,

  // Hover ripple
  raycaster: new THREE.Raycaster(),
  rayMouse: new THREE.Vector2(),
  hoverUV: null,
  hoverActive: false,
  rippleStrength: 0,

  // Animation
  animationFrame: null,

  // Debug UI


  // Intro reveal
  revealProgress: { value: 1 },
  introTimeline: null,
  introComplete: false,

  // Interaction
  isPointerDown: false,
  lastPointerX: 0,
  dragStartX: 0,
  dragStartY: 0,
  transitionLocked: false,
  transitionProgress: 0,
  selectedItemIndex: -1,
  selectedSlotIndex: 0,
  selectedItem: null,
  clickNdc: new THREE.Vector2(0, 0),
  transitionTimeline: null,
  cinematicExitTimeline: null,
  cinematicExitSnapshot: null,
  transitionTargetRect: null,
  stripStart: {
    position: new THREE.Vector3(0, 0, -1.5),
    scale: new THREE.Vector3(0.35, 0.35, 0.35),
    rotationZ: 0,
  },
  transitionEnd: {
    position: new THREE.Vector3(),
    scale: new THREE.Vector3(),
    rotationZ: 0,
  },
  transitionEndComputed: false,

  // Cover plane for same-canvas morph
  coverPlane: null,
  coverPlaneMaterial: null,
  coverPlaneTexture: null,

  // Event handlers
  handlers: {
    resize: null,
    wheel: null,
    pointermove: null,
    pointerdown: null,
    pointerup: null,
  },
};

// ─── TEXTURE LOADING ────────────────────────────────────────────────────────────

function loadAllTextures() {
  const loader = new THREE.TextureLoader();
  const uniqueImages = [...new Set(workItems.map(item => item.image).filter(Boolean))];

  const promises = uniqueImages.map(src => {
    if (state.textureCache.has(src)) return Promise.resolve();
    return new Promise((resolve) => {
      loader.load(
        src,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.minFilter = THREE.LinearMipmapLinearFilter;
          texture.magFilter = THREE.LinearFilter;
          texture.generateMipmaps = true;
          state.textureCache.set(src, texture);
          resolve();
        },
        undefined,
        () => {
          console.warn(`[work] Failed to load texture: ${src}`);
          resolve();
        }
      );
    });
  });

  return Promise.all(promises);
}

// ─── CURVED STRIP GEOMETRY ──────────────────────────────────────────────────────

function buildStripGeometry() {
  const R = CONFIG.ARC_RADIUS;
  const span = CONFIG.ARC_SPAN;
  const h = CONFIG.STRIP_HEIGHT;
  const wSeg = CONFIG.WIDTH_SEGMENTS;
  const hSeg = CONFIG.HEIGHT_SEGMENTS;

  const vertCount = (wSeg + 1) * (hSeg + 1);
  const positions = new Float32Array(vertCount * 3);
  const normals = new Float32Array(vertCount * 3);
  const uvs = new Float32Array(vertCount * 2);

  let vi = 0;
  let ni = 0;
  let ui = 0;

  for (let j = 0; j <= hSeg; j++) {
    const v = j / hSeg;
    const y = (v - 0.5) * h + CONFIG.STRIP_Y_OFFSET;

    for (let i = 0; i <= wSeg; i++) {
      const u = i / wSeg;
      // Angle from -span/2 to +span/2 (centered on camera)
      const angle = (u - 0.5) * span;

      // Position on cylinder surface, shifted so center is at z=0
      const x = Math.sin(angle) * R;
      const z = (Math.cos(angle) - 1) * R;

      positions[vi++] = x;
      positions[vi++] = y;
      positions[vi++] = z;

      // Normal points outward from cylinder (away from center at 0,y,-R)
      const nx = Math.sin(angle);
      const nz = Math.cos(angle);
      normals[ni++] = nx;
      normals[ni++] = 0;
      normals[ni++] = nz;

      uvs[ui++] = u;
      uvs[ui++] = v;
    }
  }

  // Build index buffer
  const indices = [];
  for (let j = 0; j < hSeg; j++) {
    for (let i = 0; i < wSeg; i++) {
      const a = j * (wSeg + 1) + i;
      const b = a + 1;
      const c = a + (wSeg + 1);
      const d = c + 1;
      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(indices);

  return geometry;
}

// ─── 3D MODEL LOADING ───────────────────────────────────────────────────────────

function tuneMaterialMaps(material) {
  if (material.map) material.map.colorSpace = THREE.SRGBColorSpace;
  if (material.emissiveMap) material.emissiveMap.colorSpace = THREE.SRGBColorSpace;
  material.needsUpdate = true;
}

function getFallbackPhysicalMaterial(sourceMaterial) {
  return new THREE.MeshPhysicalMaterial({
    color: sourceMaterial?.color?.clone ? sourceMaterial.color.clone() : new THREE.Color(0xffffff),
    map: sourceMaterial?.map || null,
    normalMap: sourceMaterial?.normalMap || null,
    roughnessMap: sourceMaterial?.roughnessMap || null,
    metalnessMap: sourceMaterial?.metalnessMap || null,
    aoMap: sourceMaterial?.aoMap || null,
    roughness: sourceMaterial?.roughness ?? 0.65,
    metalness: sourceMaterial?.metalness ?? 0.2,
    clearcoat: 0.12,
    clearcoatRoughness: 0.16,
    envMapIntensity: 1.35,
  });
}

function tuneMeshMaterial(mesh) {
  const apply = (sourceMaterial) => {
    if (!sourceMaterial) return sourceMaterial;
    let material = sourceMaterial;

    if (!material.isMeshStandardMaterial && !material.isMeshPhysicalMaterial) {
      material = getFallbackPhysicalMaterial(sourceMaterial);
    }

    tuneMaterialMaps(material);
    material.userData.baseRoughness = material.roughness ?? 0.8;
    material.userData.baseMetalness = material.metalness ?? 0.0;
    material.userData.baseEnvMapIntensity = material.envMapIntensity ?? 1;
    state.tunedMaterials.add(material);
    return material;
  };

  if (Array.isArray(mesh.material)) {
    mesh.material = mesh.material.map(apply);
  } else {
    mesh.material = apply(mesh.material);
  }
}

function normalizeModelBounds(model) {
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());

  model.children.forEach(child => {
    child.position.x -= center.x;
    child.position.y -= box.min.y;
    child.position.z -= center.z;
  });

  return size;
}

function finalizeModel(model) {
  const size = normalizeModelBounds(model);

  // Scale model to fit in scene (10x larger)
  const maxDim = Math.max(size.x, size.y, size.z);
  if (maxDim > 0) {
    const targetSize = 40;
    const s = targetSize / maxDim;
    model.scale.set(s, s, s);
  }

  state.workModelMaterials = [];
  model.traverse((child) => {
    if (!child.isMesh) return;
    child.castShadow = true;
    child.receiveShadow = true;
    tuneMeshMaterial(child);
    const mats = Array.isArray(child.material) ? child.material : [child.material];
    mats.forEach((mat) => {
      if (!mat) return;
      if (mat.userData.__baseOpacity === undefined) {
        mat.userData.__baseOpacity = mat.opacity ?? 1;
      }
      state.workModelMaterials.push(mat);
    });
  });
}

async function loadWorkModel() {
  const workUrl = '/work.glb';

  // Run concurrently — init() only resolves when animation AND assets are both
  // done, so load() must be in-flight at the same time or init() hangs.
  await Promise.all([preloader.init(), preloader.load([workUrl])]);

  preloader.hold();

  return new Promise((resolve, reject) => {
    // Fetch cached model
    const loader = new GLTFLoader();
    loader.load(
      workUrl,
      (glb) => {
        state.workModel = glb.scene;
        finalizeModel(state.workModel);

        // Position model behind the ribbon
        state.workModel.position.set(0, -5.6, -17.3);
        state.workModel.scale.set(1, 1, 1);

        state.scene.add(state.workModel);

        // Apply Fresnel fake-volume glow to the designated volume mesh
        state.workModel.traverse(child => {
          if (!child.isMesh) return;
          const n = child.name.toLowerCase();
          if (n.includes('volume') || n.includes('glow') || n.includes('light')) {
            state.workGlowHandle = createFakeVolumeGlow(child, state.camera, {
              c: 1.5, p: 2.1, glowColor: '#fff8de', op: 0.2,
            });
          }
        });

        setTimeout(() => {
          preloader.release();
        }, 200);

        resolve();
      },
      undefined,
      (err) => {
        console.error('[work] Model load error:', err);
        preloader.release();
        reject(err);
      }
    );
  });
}

// ─── SCENE SETUP ────────────────────────────────────────────────────────────────

function setupGalleryScene() {
  const w = window.innerWidth;
  const h = window.innerHeight;

  state.camera = new THREE.PerspectiveCamera(
    CONFIG.CAMERA_FOV,
    w / h,
    0.1,
    100
  );
  state.camera.position.set(0, 0, CONFIG.PARALLAX_ORBIT_RADIUS);

  state.scene = new THREE.Scene();

  // Fog - Deep, dreamy atmospheric fog
  state.scene.fog = new THREE.FogExp2(0xe6e4dc, 0.055); // Slightly denser, warmer/softer

  // ── Cinematic 3-Point Lighting ──

  // 1. KEY LIGHT: Warm, creating main shadows and form
  // Using Spotlight for focused, dramatic illumination
  const keyLight = new THREE.SpotLight(0xfff5e6, 1260); // 10% reduction (1400 -> 1260)
  keyLight.position.set(10, 15, 12);
  keyLight.angle = Math.PI / 5;
  keyLight.penumbra = 0.5; // Softer edges
  keyLight.decay = 1.6;
  keyLight.distance = 3;
  keyLight.castShadow = true;
  keyLight.shadow.bias = -0.0001;
  keyLight.shadow.mapSize.width = 2048;
  keyLight.shadow.mapSize.height = 2048;
  // Increase shadow softness
  keyLight.shadow.radius = 4;
  state.scene.add(keyLight);
  state.pointLight = keyLight; // Keep reference for potential updates

  // 2. FILL LIGHT: Neutral white to lift shadows without tint
  const fillLight = new THREE.PointLight(0xffffff, 0.9); // 10% reduction (1 -> 0.9)
  fillLight.position.set(-15, 0, 10);
  fillLight.decay = 2;
  fillLight.distance = 30;
  state.scene.add(fillLight);

  // 3. RIM LIGHT: Sharp, bright backlight to separate ribbon from background
  const rimLight = new THREE.SpotLight(0xffffff, 1080); // 10% reduction (1200 -> 1080)
  rimLight.position.set(0, 10, -15);
  rimLight.target.position.set(0, 0, -5);
  rimLight.angle = Math.PI / 4;
  rimLight.penumbra = 0.6; // Softer rim
  rimLight.decay = 1.5;
  rimLight.distance = 40;
  state.scene.add(rimLight);
  state.scene.add(rimLight.target);

  // Ambient: Low base level
  state.ambientLight = new THREE.AmbientLight(0xffffff, 0.54); // 10% reduction (0.6 -> 0.54)
  state.scene.add(state.ambientLight);

  // Enable shadows on the shared renderer
  const renderer = getRenderer();
  if (renderer) {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
  }

  // Strip group for collective parallax rotation
  state.stripGroup = new THREE.Group();
  state.stripGroup.position.set(0, 0, -1.5);
  state.stripGroup.scale.set(0.35, 0.35, 0.35);
  state.scene.add(state.stripGroup);
  captureStripStartTransform();

  // Shadow catcher — Invisible plane to receive shadows
  const planeGeo = new THREE.PlaneGeometry(60, 60);
  const planeMat = new THREE.ShadowMaterial({
    opacity: 0.15, // Subtle shadow
    color: 0x000000,
  });
  state.shadowPlane = new THREE.Mesh(planeGeo, planeMat);
  state.shadowPlane.rotation.x = -Math.PI / 2;
  state.shadowPlane.position.set(0, -6, 0); // Positioned below strip (-5.6 model y, so -6 is good)
  state.shadowPlane.receiveShadow = true;
  state.shadowPlane.castShadow = false;
  state.scene.add(state.shadowPlane);

  // Create floating background particles in the work scene
  createParticles();

  state.clock = new THREE.Timer();

  // Setup post-processing composer
  setupPostProcessing();

  registerGalleryOverlay(state.scene, state.camera);
}

// ─── STRIP MESH CREATION ────────────────────────────────────────────────────────

function setupStrip() {
  // Build ordered texture array from unique images
  const uniqueImages = [...new Set(workItems.map(item => item.image))];
  state.textures = uniqueImages.map(src => state.textureCache.get(src)).filter(Boolean);

  // Pad to 6 if needed (shader expects exactly 6)
  while (state.textures.length < 6) {
    state.textures.push(state.textures[0] || new THREE.Texture());
  }

  state.stripGeometry = buildStripGeometry();

  state.stripMaterial = new THREE.ShaderMaterial({
    vertexShader: STRIP_VERTEX_SHADER,
    fragmentShader: STRIP_FRAGMENT_SHADER,
    uniforms: {
      uTex0: { value: state.textures[0] },
      uTex1: { value: state.textures[1] },
      uTex2: { value: state.textures[2] },
      uTex3: { value: state.textures[3] },
      uTex4: { value: state.textures[4] },
      uTex5: { value: state.textures[5] },
      uScrollOffset: { value: 0 },
      uItemsOnStrip: { value: CONFIG.ITEMS_ON_STRIP },
      uNumUnique: { value: CONFIG.NUM_UNIQUE },
      uGapSize: { value: CONFIG.GAP_SIZE },
      uTime: { value: 0 },
      uWaveAmp: { value: CONFIG.WAVE_AMPLITUDE },
      uWaveFreq: { value: CONFIG.WAVE_FREQUENCY },
      uWaveSpeed: { value: CONFIG.WAVE_SPEED },
      uWaveFlow: { value: new THREE.Vector2(CONFIG.WAVE_FLOW_X, CONFIG.WAVE_FLOW_Y) },
      uWaveFlowTurbulence: { value: CONFIG.WAVE_FLOW_TURBULENCE },
      uWaveLayerFlow: { value: new THREE.Vector3(CONFIG.WAVE_LAYER_FLOW_1, CONFIG.WAVE_LAYER_FLOW_2, CONFIG.WAVE_LAYER_FLOW_3) },
      uWindStrength: { value: CONFIG.WIND_BASE_STRENGTH },
      uWindPinPower: { value: CONFIG.WIND_PIN_POWER },
      uHoverUV: { value: new THREE.Vector2(-1, -1) },
      uFlatten: { value: 0 },
      uSelectedIndex: { value: -1 },
      uNonSelectedFade: { value: 0 },
      uFocusSlot: { value: -1 },
      uIsolateSlot: { value: 0 },
      uTransitionOpacity: { value: 1.0 },
      uRevealProgress: { value: 1.0 },
      uRevealSoftness: { value: CONFIG.REVEAL_SOFTNESS },
      uArcRadius: { value: CONFIG.ARC_RADIUS },
      uArcSpan: { value: CONFIG.ARC_SPAN },
    },
    extensions: {
      derivatives: true,
    },
    transparent: true,
    side: THREE.FrontSide,
    depthWrite: true,
  });

  state.stripMesh = new THREE.Mesh(state.stripGeometry, state.stripMaterial);
  state.stripMesh.frustumCulled = false;
  state.stripMesh.castShadow = true;
  state.stripMesh.receiveShadow = false;

  state.stripGroup.add(state.stripMesh);
}

// ─── PARTICLES ON RIBBON ─────────────────────────────────────────────────────────

// ─── PARTICLES ON RIBBON (REMOVED - using three.js shared particles) ─────────────────────────────────────

// Removed in favor of shared three.js particles

// ─── TITLE (DOM) ────────────────────────────────────────────────────────────────

function updateTitle() {
  if (!state.titleEl || !state.titleEl.isConnected) {
    const activeContainer = getActiveWorkContainer();
    if (activeContainer) {
      state.container = activeContainer;
      state.titleEl = activeContainer.querySelector('.slide-title');
    }
  }
  if (!state.titleEl) return;

  const centerItem = 0.5 * CONFIG.ITEMS_ON_STRIP + state.scrollCurrent;
  const idx = ((Math.floor(centerItem) % CONFIG.NUM_UNIQUE) + CONFIG.NUM_UNIQUE) % CONFIG.NUM_UNIQUE;
  state.activeIndex = idx;

  const item = workItems[idx];
  if (!item) return;

  if (state.lastActiveTitle !== item.title) {
    state.lastActiveTitle = item.title;
    state.titleEl.textContent = item.title;
  }
}

function setStripRevealProgress(progress) {
  const clamped = clamp01(progress);
  state.revealProgress.value = clamped;
  if (state.stripMaterial?.uniforms?.uRevealProgress) {
    state.stripMaterial.uniforms.uRevealProgress.value = clamped;
  }
}

function resetStripRevealState({ progress = 1 } = {}) {
  if (state.introTimeline) {
    state.introTimeline.kill();
    state.introTimeline = null;
  }
  setStripRevealProgress(progress);
}

function startStripSweepReveal() {
  if (!state.stripMaterial) {
    state.introComplete = true;
    state.transitionLocked = false;
    return;
  }

  resetStripRevealState({ progress: 0 });
  state.transitionLocked = true;
  state.introComplete = false;

  const revealState = state.revealProgress;
  const finalizeReveal = () => {
    setStripRevealProgress(1);
    state.introComplete = true;
    state.transitionLocked = false;
    state.introTimeline = null;
  };
  state.introTimeline = gsap.timeline({
    onComplete: finalizeReveal,
    onInterrupt: finalizeReveal,
  });

  state.introTimeline.to(revealState, {
    value: 1,
    duration: CONFIG.REVEAL_DURATION,
    ease: CONFIG.REVEAL_EASE,
    onUpdate: () => {
      setStripRevealProgress(revealState.value);
    },
  });
}

// ─── UPDATE STRIP ───────────────────────────────────────────────────────────────

function updateStrip(time) {
  if (!state.stripMaterial) return;

  const u = state.stripMaterial.uniforms;
  const gust =
    (Math.sin(time * CONFIG.WIND_GUST_FREQ_1) +
      Math.sin(time * CONFIG.WIND_GUST_FREQ_2) * 0.5) +
    0.5;
  const clampedGust = Math.max(0, gust);
  u.uScrollOffset.value = state.scrollCurrent;
  u.uTime.value = time;
  u.uWindStrength.value = CONFIG.WIND_BASE_STRENGTH + clampedGust * CONFIG.WIND_GUST_SCALE;
}

// ─── FLOATING PARTICLES ─────────────────────────────────────────────────────────

// ─── FLOATING PARTICLES (REMOVED - using three.js shared particles) ──────────────────────────────────

// Removed in favor of shared three.js particles

// ─── POST-PROCESSING ────────────────────────────────────────────────────────────

const postFXUniforms = createPostFXUniforms();
postFXUniforms.uResolution = { value: new THREE.Vector2(window.innerWidth, window.innerHeight) };

function setupPostProcessing() {
  const renderer = getRenderer();
  if (!renderer) return;

  state.composer = new EffectComposer(renderer);
  applyWorkSignaturePostFX(state.composer, state.scene, state.camera, postFXUniforms, {
    includeBloom: true,
    bloomStrength: 0.05,
    bloomRadius: 0.3,
    bloomThreshold: 0.7,
    includeVignette: false,
  });

  // Attach composer to scene userData for three.js render integration
  state.scene.userData.composer = state.composer;
}

// ─── PARALLAX ───────────────────────────────────────────────────────────────────

// Orbital parallax state (mirrors three.js home page pattern)
const orbitTarget = { angle: Math.PI / 2, y: 0, tilt: 0 };
const orbitCurrent = { angle: Math.PI / 2, y: 0, tilt: 0 };

function updateParallax() {
  // Freeze camera orbit during transition to prevent positional drift
  if (state.transitionLocked) return;

  const driftTime = state.clock ? state.clock.getElapsed() : 0;

  // Set orbital targets from mouse position (same approach as three.js)
  orbitTarget.angle = Math.PI / 2 + state.mouseX * CONFIG.PARALLAX_ANGLE_RANGE;
  orbitTarget.y = -state.mouseY * CONFIG.PARALLAX_Y_RANGE;
  orbitTarget.tilt = state.mouseX * CONFIG.PARALLAX_TILT_RANGE;

  // Lerp toward targets
  const l = CONFIG.PARALLAX_CONFIG_LERP;
  orbitCurrent.angle += (orbitTarget.angle - orbitCurrent.angle) * l;
  orbitCurrent.y += (orbitTarget.y - orbitCurrent.y) * l;
  orbitCurrent.tilt += (orbitTarget.tilt - orbitCurrent.tilt) * l;

  if (state.camera) {
    // Orbit center = ribbon position (match home parallax feel)
    const center = state.stripGroup
      ? state.stripGroup.position
      : { x: 0, y: -0.7, z: -13.4 };
    const cx = center.x;
    const cy = center.y;
    const cz = center.z;
    const radius = CONFIG.PARALLAX_ORBIT_RADIUS;

    state.camera.position.x = cx + Math.cos(orbitCurrent.angle) * radius;
    state.camera.position.z = cz + Math.sin(orbitCurrent.angle) * radius;
    state.camera.position.y = cy + orbitCurrent.y + 1;

    // Handheld micro-drift — subtle oscillations keep scene alive when idle
    const driftX = Math.sin(driftTime * 0.7) * 0.012 + Math.sin(driftTime * 1.3) * 0.008;
    const driftY = Math.sin(driftTime * 0.5) * 0.012 + Math.cos(driftTime * 1.1) * 0.008;
    const driftZ = Math.cos(driftTime * 0.6) * 0.008;
    state.camera.position.x += driftX;
    state.camera.position.y += driftY;
    state.camera.position.z += driftZ;

    // Look at the strip center
    state.camera.lookAt(cx, cy, cz);

    // Handheld tilt from mouse
    state.camera.rotation.z += orbitCurrent.tilt;

    // Point light loosely follows camera — reinforces 3D curvature
    if (state.pointLight) {
      state.pointLight.position.x = state.camera.position.x * 0.5;
      state.pointLight.position.y = 0.5 + state.camera.position.y * 0.3;
    }
  }
}

// ─── SCROLL TILT ────────────────────────────────────────────────────────────────

function updateScrollTilt() {
  if (!state.stripGroup) return;
  const targetTilt = Math.max(-CONFIG.SCROLL_TILT_MAX,
    Math.min(CONFIG.SCROLL_TILT_MAX, state.scrollVelocity * CONFIG.SCROLL_TILT_AMOUNT));
  state.scrollTilt += (targetTilt - state.scrollTilt) * CONFIG.SCROLL_TILT_LERP;
  state.stripGroup.rotation.z = state.scrollTilt;
}

// ─── PARTICLES ──────────────────────────────────────────────────────────────────

function createParticles() {
  const { PARTICLE_COUNT, PARTICLE_BOUNDS } = CONFIG;
  const { xHalf, yMin, yMax, zMin, zMax } = PARTICLE_BOUNDS;
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const sizes = new Float32Array(PARTICLE_COUNT);
  const opacities = new Float32Array(PARTICLE_COUNT);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 2 * xHalf;
    positions[i * 3 + 1] = yMin + Math.random() * (yMax - yMin);
    positions[i * 3 + 2] = zMin + Math.random() * (zMax - zMin);
    sizes[i] = 0.012 + Math.random() * 0.02;
    opacities[i] = 0.5 + Math.random() * 0.4;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geo.setAttribute('aOpacity', new THREE.BufferAttribute(opacities, 1));

  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    uniforms: { uPixelRatio: { value: dpr } },
    vertexShader: /* glsl */ `
      attribute float aSize;
      attribute float aOpacity;
      varying float vOpacity;
      uniform float uPixelRatio;
      void main() {
        vOpacity = aOpacity;
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aSize * uPixelRatio * (420.0 / -mvPos.z);
        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: /* glsl */ `
      varying float vOpacity;
      void main() {
        float d = length(gl_PointCoord - 0.5) * 2.0;
        if (d > 1.0) discard;
        float alpha = smoothstep(1.0, 0.3, d) * vOpacity;
        gl_FragColor = vec4(vec3(0.85), alpha);
      }
    `,
  });

  state.particleSystem = new THREE.Points(geo, mat);
  state.particleSystem.frustumCulled = false;
  state.particleSystem.renderOrder = 10;
  state.scene.add(state.particleSystem);
}

function animateParticles(time) {
  if (!state.particleSystem) return;
  const positions = state.particleSystem.geometry.attributes.position.array;
  const { xHalf, yMin, yMax, zMin, zMax } = CONFIG.PARTICLE_BOUNDS;

  for (let i = 0; i < CONFIG.PARTICLE_COUNT; i++) {
    const i3 = i * 3;
    positions[i3 + 1] += 0.001;
    positions[i3] += Math.sin(time * 0.3 + i * 0.5) * 0.0004;
    positions[i3 + 2] += Math.cos(time * 0.25 + i * 0.7) * 0.0003;
    if (positions[i3 + 1] > yMax) {
      positions[i3 + 1] = yMin;
      positions[i3] = (Math.random() - 0.5) * 2 * xHalf;
      positions[i3 + 2] = zMin + Math.random() * (zMax - zMin);
    }
  }
  state.particleSystem.geometry.attributes.position.needsUpdate = true;
}

// ─── SCROLL ─────────────────────────────────────────────────────────────────────

function updateScroll() {
  if (state.transitionLocked) {
    state.scrollVelocity = 0;
    state.scrollTarget = state.scrollCurrent;
    return;
  }

  // Apply momentum friction when not dragging
  if (!state.isPointerDown && Math.abs(state.scrollVelocity) > 0.0001) {
    state.scrollTarget += state.scrollVelocity;
    state.scrollVelocity *= 0.95;
  } else if (!state.isPointerDown) {
    state.scrollVelocity = 0;
  }

  state.scrollCurrent += (state.scrollTarget - state.scrollCurrent) * CONFIG.SCROLL_LERP;
}

// ─── WORK -> FILM TRANSITION HELPERS ───────────────────────────────────────────

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function normalizeRect(rect) {
  const vw = window.innerWidth || 1;
  const vh = window.innerHeight || 1;
  if (!rect) {
    const width = Math.min(vw * 0.35, 420);
    const height = width * 1.25;
    return {
      x: (vw - width) * 0.5,
      y: (vh - height) * 0.5,
      width,
      height,
    };
  }
  return {
    x: rect.left ?? rect.x ?? 0,
    y: rect.top ?? rect.y ?? 0,
    width: Math.max(1, rect.width ?? 1),
    height: Math.max(1, rect.height ?? 1),
  };
}

function captureStripStartTransform() {
  if (!state.stripGroup) return;
  state.stripStart.position.copy(state.stripGroup.position);
  state.stripStart.scale.copy(state.stripGroup.scale);
  state.stripStart.rotationZ = state.stripGroup.rotation.z;
}

function restoreStripStartTransform() {
  if (!state.stripGroup) return;
  state.stripGroup.position.copy(state.stripStart.position);
  state.stripGroup.scale.copy(state.stripStart.scale);
  state.stripGroup.rotation.z = state.stripStart.rotationZ;
}

function getSlotCenterWorld(slotIndex, flatten) {
  const u = (slotIndex + 0.5 - state.scrollCurrent) / CONFIG.ITEMS_ON_STRIP;
  return getStripPointForUv(u, 0.5, flatten);
}

function computeTransitionEndTransform(targetRect) {
  if (!state.stripGroup || !state.camera || !targetRect) return;

  // Save current transform, temporarily set to start transform
  const savedPos = state.stripGroup.position.clone();
  const savedScale = state.stripGroup.scale.clone();
  const savedRotZ = state.stripGroup.rotation.z;

  state.stripGroup.position.copy(state.stripStart.position);
  state.stripGroup.scale.copy(state.stripStart.scale);
  state.stripGroup.rotation.z = 0; // Target has no tilt

  // Get where the slot would appear on screen when fully flattened with start transform
  const flatRect = getSlotScreenRect(state.selectedSlotIndex, 1);

  // Restore
  state.stripGroup.position.copy(savedPos);
  state.stripGroup.scale.copy(savedScale);
  state.stripGroup.rotation.z = savedRotZ;

  if (!flatRect) return;

  // Compute scale ratio needed
  const sx = targetRect.width / Math.max(flatRect.width, 1);
  const sy = targetRect.height / Math.max(flatRect.height, 1);
  const s = Math.max(sx, sy); // uniform scale — cover the target rect

  state.transitionEnd.scale.set(
    state.stripStart.scale.x * s,
    state.stripStart.scale.y * s,
    state.stripStart.scale.z * s
  );

  // Now compute the position offset needed to center the slot on targetRect
  // Apply the end scale temporarily to measure the slot position
  state.stripGroup.position.copy(state.stripStart.position);
  state.stripGroup.scale.copy(state.transitionEnd.scale);
  state.stripGroup.rotation.z = 0;

  const scaledRect = getSlotScreenRect(state.selectedSlotIndex, 1);
  state.stripGroup.position.copy(savedPos);
  state.stripGroup.scale.copy(savedScale);
  state.stripGroup.rotation.z = savedRotZ;

  if (!scaledRect) return;

  const targetCenterX = targetRect.x + targetRect.width * 0.5;
  const targetCenterY = targetRect.y + targetRect.height * 0.5;
  const scaledCenterX = scaledRect.x + scaledRect.width * 0.5;
  const scaledCenterY = scaledRect.y + scaledRect.height * 0.5;

  // Convert pixel offset to world units
  const centerWorld = getSlotCenterWorld(state.selectedSlotIndex, 1);
  const depth = Math.max(0.1, state.camera.position.distanceTo(centerWorld));
  const fovRad = THREE.MathUtils.degToRad(state.camera.fov);
  const worldPerPixelY = (2 * Math.tan(fovRad * 0.5) * depth) / Math.max(window.innerHeight, 1);
  const worldPerPixelX = worldPerPixelY * state.camera.aspect;

  const dxPixels = targetCenterX - scaledCenterX;
  const dyPixels = targetCenterY - scaledCenterY;

  state.transitionEnd.position.set(
    state.stripStart.position.x + dxPixels * worldPerPixelX,
    state.stripStart.position.y - dyPixels * worldPerPixelY,
    state.stripStart.position.z
  );
  state.transitionEnd.rotationZ = 0;
  state.transitionEndComputed = true;
}

function applyTransitionTransform(progress) {
  if (!state.stripGroup || !state.transitionEndComputed) return;
  const p = progress;

  // Ease for position/scale uses a slightly leading curve so it settles early
  const posP = p;

  state.stripGroup.position.lerpVectors(
    state.stripStart.position,
    state.transitionEnd.position,
    posP
  );
  state.stripGroup.scale.lerpVectors(
    state.stripStart.scale,
    state.transitionEnd.scale,
    posP
  );
  state.stripGroup.rotation.z = THREE.MathUtils.lerp(
    state.stripStart.rotationZ,
    state.transitionEnd.rotationZ,
    posP
  );
}

function getStripPointForUv(u, v, flatten) {
  const angle = (u - 0.5) * CONFIG.ARC_SPAN;
  const xCurve = Math.sin(angle) * CONFIG.ARC_RADIUS;
  const zCurve = (Math.cos(angle) - 1) * CONFIG.ARC_RADIUS;
  const xFlat = angle * CONFIG.ARC_RADIUS;
  const y = (v - 0.5) * CONFIG.STRIP_HEIGHT + CONFIG.STRIP_Y_OFFSET;

  const local = new THREE.Vector3(
    THREE.MathUtils.lerp(xCurve, xFlat, flatten),
    y,
    THREE.MathUtils.lerp(zCurve, 0, flatten)
  );

  if (!state.stripGroup) return local;
  state.stripGroup.updateMatrixWorld(true);
  return local.applyMatrix4(state.stripGroup.matrixWorld);
}

function projectWorldPointToScreen(point) {
  const projected = point.clone().project(state.camera);
  return {
    x: (projected.x * 0.5 + 0.5) * window.innerWidth,
    y: (-projected.y * 0.5 + 0.5) * window.innerHeight,
  };
}

function getSlotScreenRect(slotIndex, flatten = state.transitionProgress) {
  if (!state.camera || !Number.isFinite(slotIndex)) return null;

  const gapInset = (CONFIG.GAP_SIZE * 0.5) / CONFIG.ITEMS_ON_STRIP;
  const uStart = (slotIndex - state.scrollCurrent) / CONFIG.ITEMS_ON_STRIP + gapInset;
  const uEnd = (slotIndex + 1 - state.scrollCurrent) / CONFIG.ITEMS_ON_STRIP - gapInset;
  const corners = [
    getStripPointForUv(uStart, 0, flatten),
    getStripPointForUv(uEnd, 0, flatten),
    getStripPointForUv(uStart, 1, flatten),
    getStripPointForUv(uEnd, 1, flatten),
  ];

  const projected = corners.map(projectWorldPointToScreen);
  const xs = projected.map((p) => p.x);
  const ys = projected.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) {
    return null;
  }

  return {
    x: minX,
    y: minY,
    width: Math.max(1, maxX - minX),
    height: Math.max(1, maxY - minY),
  };
}

export function setWorkTransitionVisualState(progress) {
  const p = clamp01(progress);
  state.transitionProgress = p;

  if (state.stripMaterial?.uniforms) {
    state.stripMaterial.uniforms.uFlatten.value = p;
    state.stripMaterial.uniforms.uSelectedIndex.value = state.selectedItemIndex;
    state.stripMaterial.uniforms.uNonSelectedFade.value = clamp01((p - 0.18) / 0.55);
    state.stripMaterial.uniforms.uFocusSlot.value = state.selectedSlotIndex;
    state.stripMaterial.uniforms.uIsolateSlot.value = 0;
  }

  if (state.titleEl) {
    state.titleEl.style.opacity = `${1 - clamp01(p * 1.5)}`;
  }

  if (state.workModel) {
    const alpha = 1 - clamp01((p - 0.05) / 0.45);
    setWorkModelOpacity(alpha);
  }

  setWorkParticlesOpacity(1 - clamp01(p * 1.4));

  // Cover plane cross-dissolve: fade in cover at 65-95%, fade out strip at 75-100%
  if (state.coverPlane) {
    const coverFadeIn = clamp01((p - 0.65) / 0.30);
    state.coverPlaneMaterial.opacity = coverFadeIn;
    state.coverPlane.visible = coverFadeIn > 0.01;
  }
  if (state.stripMaterial?.uniforms && p > 0.75) {
    // Fade out the strip mesh itself as cover takes over
    const stripFadeOut = 1 - clamp01((p - 0.75) / 0.25);
    state.stripMaterial.uniforms.uTransitionOpacity.value = stripFadeOut;
  }

  if (state.transitionTargetRect && state.transitionEndComputed) {
    applyTransitionTransform(p);
  }
}

// ─── COVER PLANE (same-canvas morph target) ─────────────────────────────────

function createCoverPlane(targetRect) {
  if (!state.scene || !state.camera || !state.selectedItem) return;
  removeCoverPlane();

  // Use the already-cached texture for the selected item
  const tex = state.textureCache.get(state.selectedItem.image);
  if (tex) {
    state.coverPlaneTexture = tex; // reference only, don't clone — don't dispose on remove
  }

  const mat = new THREE.MeshBasicMaterial({
    map: state.coverPlaneTexture || null,
    transparent: true,
    opacity: 0,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
  });
  state.coverPlaneMaterial = mat;

  const geo = new THREE.PlaneGeometry(1, 1);
  state.coverPlane = new THREE.Mesh(geo, mat);
  state.coverPlane.frustumCulled = false;
  state.coverPlane.visible = false;
  state.coverPlane.renderOrder = 999;

  // Position the cover plane so it appears at targetRect on screen.
  // Convert screen-space rect to world-space position & scale
  // using the perspective camera.
  const fovRad = THREE.MathUtils.degToRad(state.camera.fov);
  // Place it at a z in front of the strip so it floors over it
  const planeZ = state.camera.position.z - 2; // 2 units in front of camera
  const depth = Math.abs(state.camera.position.z - planeZ);
  const halfH = Math.tan(fovRad * 0.5) * depth;
  const halfW = halfH * state.camera.aspect;
  const vw = window.innerWidth || 1;
  const vh = window.innerHeight || 1;

  const ndcX = ((targetRect.x + targetRect.width * 0.5) / vw) * 2 - 1;
  const ndcY = -(((targetRect.y + targetRect.height * 0.5) / vh) * 2 - 1);
  const worldX = ndcX * halfW;
  const worldY = ndcY * halfH;

  const worldW = (targetRect.width / vw) * halfW * 2;
  const worldH = (targetRect.height / vh) * halfH * 2;

  state.coverPlane.position.set(worldX, worldY, planeZ);
  state.coverPlane.scale.set(worldW, worldH, 1);

  state.scene.add(state.coverPlane);
}

export function removeCoverPlane() {
  if (state.coverPlane) {
    if (state.coverPlane.parent) state.coverPlane.parent.remove(state.coverPlane);
    if (state.coverPlane.geometry) state.coverPlane.geometry.dispose();
    state.coverPlane = null;
  }
  if (state.coverPlaneMaterial) {
    state.coverPlaneMaterial.dispose();
    state.coverPlaneMaterial = null;
  }
  // Don't dispose coverPlaneTexture — it's a reference to the texture cache
  state.coverPlaneTexture = null;
}

// ─── EXPORTS FOR TRANSITION ─────────────────────────────────────────────────

export function prepareWorkToProjectTransition(item, { selectedIndex, slotIndex, clickNdc } = {}) {
  if (!item) return false;

  state.transitionLocked = true;
  state.isPointerDown = false;
  state.scrollVelocity = 0;
  state.scrollTarget = state.scrollCurrent;
  state.selectedItem = item;
  state.selectedItemIndex = Number.isFinite(selectedIndex)
    ? selectedIndex
    : Math.max(0, workItems.findIndex((entry) => entry?.id === item.id));
  state.selectedSlotIndex = Number.isFinite(slotIndex)
    ? slotIndex
    : Math.floor(state.scrollCurrent + CONFIG.ITEMS_ON_STRIP * 0.5);

  if (clickNdc && Number.isFinite(clickNdc.x) && Number.isFinite(clickNdc.y)) {
    state.clickNdc.set(clickNdc.x, clickNdc.y);
  }

  if (state.transitionTimeline) {
    state.transitionTimeline.kill();
    state.transitionTimeline = null;
  }

  captureStripStartTransform();
  state.transitionTargetRect = null;
  state.transitionEndComputed = false;

  if (state.stripMaterial?.uniforms) {
    state.stripMaterial.uniforms.uSelectedIndex.value = state.selectedItemIndex;
    state.stripMaterial.uniforms.uNonSelectedFade.value = 0;
    state.stripMaterial.uniforms.uFocusSlot.value = state.selectedSlotIndex;
    state.stripMaterial.uniforms.uIsolateSlot.value = 0;
  }

  setWorkTransitionVisualState(0);
  return true;
}

export function clearWorkTransitionOverlay() {
  // Legacy no-op: geometry-only transition no longer uses DOM overlay.
}

export function getSelectedStripSegmentHandle() {
  if (!state.stripMesh || !state.selectedItem) return null;
  const sourceRect = getSlotScreenRect(state.selectedSlotIndex, state.transitionProgress);
  const texture = state.textureCache.get(state.selectedItem.image) || null;
  return {
    mesh: state.stripMesh,
    material: state.stripMaterial,
    selectedSlotIndex: state.selectedSlotIndex,
    selectedItemIndex: state.selectedItemIndex,
    sourceRect: sourceRect ? { ...sourceRect } : null,
    imageSrc: state.selectedItem.image,
    title: state.selectedItem.title,
    texture,
    item: state.selectedItem,
  };
}

export function runStripUnwrapToRect(targetRect) {
  return new Promise((resolve) => {
    if (!state.stripMaterial || !state.selectedItem) {
      resolve(false);
      return;
    }

    restoreStripStartTransform();
    state.transitionTargetRect = normalizeRect(targetRect);

    // Compute the deterministic end transform once, up-front
    computeTransitionEndTransform(state.transitionTargetRect);

    // Create the cover plane in the same scene for cross-dissolve
    createCoverPlane(state.transitionTargetRect);

    if (state.transitionTimeline) {
      state.transitionTimeline.kill();
      state.transitionTimeline = null;
    }

    // Reset strip material opacity (may have been faded by previous transition)
    if (state.stripMaterial) {
      state.stripMaterial.opacity = 1;
      if (state.stripMaterial.uniforms?.uTransitionOpacity) {
        state.stripMaterial.uniforms.uTransitionOpacity.value = 1;
      }
    }

    const animState = { progress: 0 };

    const focusTargets = state.container
      ? state.container.querySelectorAll('.slide-title, .slider, .u-section-spacer-large')
      : [];

    state.transitionTimeline = gsap.timeline({
      onComplete: () => {
        setWorkTransitionVisualState(1);
        if (state.stripMaterial?.uniforms) {
          state.stripMaterial.uniforms.uIsolateSlot.value = 1;
        }
        state.transitionTimeline = null;
        resolve(true);
      },
    });

    state.transitionTimeline.to(animState, {
      progress: 1,
      duration: 1.2,
      ease: 'power2.inOut',
      onUpdate: () => {
        setWorkTransitionVisualState(animState.progress);
      },
    }, 0);

    if (focusTargets.length) {
      state.transitionTimeline.to(focusTargets, {
        opacity: 0,
        duration: 0.45,
        ease: 'power2.out',
        stagger: 0.04,
      }, 0);
    }
  });
}

function setWorkModelOpacity(alpha) {
  if (!state.workModel) return;
  const clamped = clamp01(alpha);
  state.workModel.visible = clamped > 0.01;
  const mats = state.workModelMaterials?.length
    ? state.workModelMaterials
    : null;
  if (!mats) return;
  mats.forEach((mat) => {
    if (!mat) return;
    if (mat.userData.__baseOpacity === undefined) {
      mat.userData.__baseOpacity = mat.opacity ?? 1;
    }
    mat.transparent = true;
    mat.opacity = mat.userData.__baseOpacity * clamped;
  });
}

function setWorkParticlesOpacity(alpha) {
  if (!state.particleSystem?.material || !('opacity' in state.particleSystem.material)) return;
  const clamped = clamp01(alpha);
  state.particleSystem.material.transparent = true;
  state.particleSystem.material.opacity = clamped;
  state.particleSystem.visible = clamped > 0.01;
}

// runWorkCinematicExit and resetWorkCinematicExit removed — no transition animation between work/film

// ─── EVENT HANDLERS ─────────────────────────────────────────────────────────────

function onWheel(event) {
  if (state.transitionLocked || !state.introComplete) return;
  event.preventDefault();
  const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY)
    ? event.deltaX
    : event.deltaY;
  state.scrollTarget += delta * CONFIG.SCROLL_SPEED;
}

function onPointerDown(event) {
  if (state.transitionLocked || !state.introComplete) return;
  state.isPointerDown = true;
  state.lastPointerX = event.clientX;
  state.dragStartX = event.clientX;
  state.dragStartY = event.clientY;
  state.scrollVelocity = 0;
  state.lastDragTime = performance.now();
}

let lastPointerMoveTime = 0;

function onPointerMove(event) {
  if (state.transitionLocked) return;

  // Drag always updates (unthrottled for smooth scrolling)
  if (state.isPointerDown) {
    const now = performance.now();
    const deltaX = event.clientX - state.lastPointerX;
    const dt = now - state.lastDragTime;
    state.scrollTarget -= deltaX * CONFIG.DRAG_MULTIPLIER;
    // Track instantaneous velocity for momentum on release
    if (dt > 0) state.scrollVelocity = -deltaX * CONFIG.DRAG_MULTIPLIER / (dt / 16);
    state.lastPointerX = event.clientX;
    state.lastDragTime = now;
  }

  const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

  // Update parallax tracking
  state.mouseX = mouseX;
  state.mouseY = mouseY;
}

function onPointerUp(event) {
  if (state.transitionLocked) return;
  if (!state.isPointerDown) return;
  state.isPointerDown = false;

  const dx = Math.abs(event.clientX - state.dragStartX);
  const dy = Math.abs(event.clientY - state.dragStartY);
  if (dx < 5 && dy < 5) {
    handleClick(event);
  }
}

function handleClick(event) {
  if (state.transitionLocked || !state.camera || !state.stripMesh) return;

  state.rayMouse.set(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );
  state.raycaster.setFromCamera(state.rayMouse, state.camera);
  const intersects = state.raycaster.intersectObject(state.stripMesh, false);

  if (intersects.length > 0) {
    const uv = intersects[0].uv;
    if (uv) {
      // Determine which item was clicked from UV.x + scroll
      const totalU = uv.x * CONFIG.ITEMS_ON_STRIP + state.scrollCurrent;
      const itemIdx = ((Math.floor(totalU) % CONFIG.NUM_UNIQUE) + CONFIG.NUM_UNIQUE) % CONFIG.NUM_UNIQUE;
      const item = workItems[itemIdx];
      if (item?.href) {
        if (barba?.go) {
          barba.go(item.href);
        } else {
          window.location.href = item.href;
        }
      }
    }
  }
}

let resizeTimeout = null;

function onResize() {
  if (resizeTimeout) clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    if (!state.camera) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    state.camera.aspect = w / h;
    state.camera.updateProjectionMatrix();

    // Update composer and post-FX resolution
    if (state.composer) {
      state.composer.setSize(w, h);
    }
    postFXUniforms.uResolution.value.set(w, h);
  }, 100);
}

function addEventListeners() {
  state.handlers.wheel = onWheel;
  state.handlers.pointerdown = onPointerDown;
  state.handlers.pointermove = onPointerMove;
  state.handlers.pointerup = onPointerUp;
  state.handlers.resize = onResize;

  window.addEventListener('wheel', state.handlers.wheel, { passive: false });
  window.addEventListener('pointerdown', state.handlers.pointerdown);
  window.addEventListener('pointermove', state.handlers.pointermove);
  window.addEventListener('pointerup', state.handlers.pointerup);
  window.addEventListener('resize', state.handlers.resize);
}

function removeEventListeners() {
  if (state.handlers.wheel) window.removeEventListener('wheel', state.handlers.wheel);
  if (state.handlers.pointerdown) window.removeEventListener('pointerdown', state.handlers.pointerdown);
  if (state.handlers.pointermove) window.removeEventListener('pointermove', state.handlers.pointermove);
  if (state.handlers.pointerup) window.removeEventListener('pointerup', state.handlers.pointerup);
  if (state.handlers.resize) window.removeEventListener('resize', state.handlers.resize);
}

// ─── ANIMATION LOOP ─────────────────────────────────────────────────────────────

function updateRipple() {
  if (!state.stripMaterial) return;
  // removed
}

function updateReveal() {}

function animate() {
  if (state.clock) state.clock.update();
  const time = state.clock ? state.clock.getElapsed() : 0;

  updateScroll();
  updateStrip(time);
  updateParallax();
  updateScrollTilt();
  animateParticles(time);
  updateRipple();
  updateReveal();
  if (state.workGlowHandle) state.workGlowHandle.update(state.camera);
  updateTitle();

  // Update post-processing uniforms
  postFXUniforms.uTime.value = time;

  state.animationFrame = requestAnimationFrame(animate);
}



// ─── INIT / DESTROY ─────────────────────────────────────────────────────────────

export async function initWork() {
  if (isWorkInitialized) return;
  isWorkInitialized = true;


  const mainContainer = getActiveWorkContainer();
  if (!mainContainer) {
    console.warn('[work] no active work container found');
    isWorkInitialized = false;
    return;
  }

  state.container = mainContainer;
  state.titleEl = mainContainer.querySelector('.slide-title');
  state.transitionLocked = false;
  state.transitionProgress = 0;
  state.selectedItem = null;
  state.selectedItemIndex = -1;
  state.selectedSlotIndex = 0;
  state.transitionTargetRect = null;
  if (state.transitionTimeline) {
    state.transitionTimeline.kill();
    state.transitionTimeline = null;
  }
  clearWorkTransitionOverlay();
  setBaseSceneOpacity(1);

  setupGalleryScene();

  // Load 3D model
  try {
    await loadWorkModel();
  } catch (err) {
    console.error('[work] Failed to load 3D model:', err);
  }

  await loadAllTextures();
  setupStrip();
  addEventListeners();


  state.introComplete = false;
  state.transitionLocked = true;
  state.scrollVelocity = 0;
  state.scrollTarget = 0;
  state.scrollCurrent = 0;

  if (state.titleEl) {
    gsap.set(state.titleEl, { opacity: 1, y: 0 });
  }
  restoreStripStartTransform();
  setWorkTransitionVisualState(0);
  setStripRevealProgress(0);
  startStripSweepReveal();
  // (cinematic exit removed)

  state.animationFrame = requestAnimationFrame(animate);
}

export function destroyWork({ keepCoverPlane = false, preserveTexture = null } = {}) {
  if (!isWorkInitialized) return;
  isWorkInitialized = false;
  const preserveOverlay = state.transitionLocked;
  // (cinematic exit removed)


  if (state.animationFrame !== null) {
    cancelAnimationFrame(state.animationFrame);
    state.animationFrame = null;
  }

  removeEventListeners();
  unregisterGalleryOverlay();

  // Clean up cover plane (unless transition wants to keep it)
  if (!keepCoverPlane) {
    removeCoverPlane();
  }

  // Kill intro animation and restore reveal state
  resetStripRevealState({ progress: 1 });
  if (state.titleEl) {
    gsap.killTweensOf(state.titleEl);
    state.titleEl.style.opacity = '';
  }

  if (state.transitionTimeline) {
    state.transitionTimeline.kill();
    state.transitionTimeline = null;
  }
  if (!preserveOverlay) {
    clearWorkTransitionOverlay();
  }



  // Dispose strip
  if (state.stripMesh) {
    state.stripGroup?.remove(state.stripMesh);
  }
  if (state.stripMaterial) {
    state.stripMaterial.dispose();
    state.stripMaterial = null;
  }
  if (state.stripGeometry) {
    state.stripGeometry.dispose();
    state.stripGeometry = null;
  }
  state.stripMesh = null;
  state.textures = [];

  // Dispose particles
  if (state.particleSystem) {
    if (state.particleSystem.geometry) state.particleSystem.geometry.dispose();
    if (state.particleSystem.material) state.particleSystem.material.dispose();
    if (state.particleSystem.parent) state.particleSystem.parent.remove(state.particleSystem);
    state.particleSystem = null;
  }

  // Dispose 3D model
  if (state.workModel) {
    state.scene?.remove(state.workModel);
    state.workModel.traverse((child) => {
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
    state.workModel = null;
    state.workModelMaterials = [];
  }

  // Clear tuned materials
  state.tunedMaterials.clear();

  // Dispose composer
  if (state.composer) {
    state.composer = null;
  }
  // Fresnel glow handle
  state.workGlowHandle = null;

  // Shadow plane
  if (state.shadowPlane) {
    state.shadowPlane.geometry.dispose();
    state.shadowPlane.material.dispose();
    if (state.shadowPlane.parent) state.shadowPlane.parent.remove(state.shadowPlane);
    state.shadowPlane = null;
  }

  // Dispose lights
  if (state.pointLight) {
    state.scene?.remove(state.pointLight);
    state.pointLight = null;
  }
  if (state.ambientLight) {
    state.scene?.remove(state.ambientLight);
    state.ambientLight = null;
  }
  if (state.directionalLight) {
    state.scene?.remove(state.directionalLight);
    state.directionalLight.dispose();
    state.directionalLight = null;
  }

  // Dispose strip group
  if (state.stripGroup) {
    state.scene?.remove(state.stripGroup);
    state.stripGroup = null;
  }

  // Dispose textures
  state.textureCache.forEach((texture) => {
    if (!texture || texture === preserveTexture) return;
    texture.dispose();
  });
  state.textureCache.clear();

  // Clear debounce timers
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
    resizeTimeout = null;
  }

  // Reset cursor
  document.body.style.cursor = '';

  // Null out
  state.scene = null;
  state.camera = null;
  state.clock = null;
  state.container = null;
  state.titleEl = null;
  state.scrollTarget = 0;
  state.scrollCurrent = 0;
  state.scrollVelocity = 0;
  state.lastDragTime = 0;
  state.activeIndex = 0;
  state.lastActiveTitle = '';
  state.mouseX = 0;
  state.mouseY = 0;
  state.parallaxCurrent = { rx: 0, ry: 0, cx: 0, cy: 0 };
  state.scrollTilt = 0;
  state.hoverUV = null;
  state.hoverActive = false;
  state.rippleStrength = 0;
  state.isPointerDown = false;
  state.transitionLocked = false;
  state.transitionProgress = 0;
  state.selectedItemIndex = -1;
  state.selectedSlotIndex = 0;
  state.selectedItem = null;
  state.transitionTargetRect = null;
  state.transitionEndComputed = false;
  state.transitionTimeline = null;
  state.cinematicExitTimeline = null;
  state.cinematicExitSnapshot = null;
  state.clickNdc.set(0, 0);
  if (!preserveOverlay) {
    setBaseSceneOpacity(1);
  }
  state.revealProgress = { value: 1 };
  state.introTimeline = null;
  state.introComplete = false;
  state.handlers = {
    resize: null,
    wheel: null,
    pointermove: null,
    pointerdown: null,
    pointerup: null,
  };
}
