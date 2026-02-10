import * as THREE from 'three';
import { GLTFLoader } from 'three-stdlib';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let renderer = null;
let composer = null;
let camera = null;
let scene = null;
let resizeHandler = null;
let mouseHandler = null;
let rafId = null;
let containerEl = null;
let isRunning = false;
let dissolvePass = null;
let ssaoPass = null;
let bloomPass = null;
let dofPass = null;
let keyLight = null;
let ambientLight = null;
let shadowCatcher = null;
let modelRoot = null;
let pmremGenerator = null;
let envRenderTarget = null;
let frameHistory = [];
let effectsDowngraded = false;
let heroScrollTrigger = null;
let sceneTween = null;
let debugGui = null;
const tunedMaterials = new Set();
const sceneState = { x: 0, y: 0, z: 0 };
const cameraTarget = { angle: Math.PI / 2, y: 0, tilt: 0 };
const cameraCurrent = { angle: Math.PI / 2, y: 0, tilt: 0 };
const parallaxConfig = { angleRange: 0.15, yRange: 0.3, tiltRange: 0.02, lerp: 0.04 };
const tune = {
  exposure: 1.0,
  ambientIntensity: 0.18,
  ambientColor: '#ffffff',
  keyIntensity: 3.25,
  keyColor: '#ffffff',
  keyX: 4.2,
  keyY: 7.5,
  keyZ: 6.2,
  envBackgroundIntensity: 0.45,
  envBackgroundBlur: 0.55,
  envReflection: 1.3,
  roughnessScale: 1.0,
  metalnessScale: 1.0,
  shadowOpacity: 0.22,
  shadowY: -1.35,
  dissolveSpread: 0.2,
  dissolveAberration: 0.24,
};

function createVector2(x = 0, y = 0) {
  if (THREE.Vector2) return new THREE.Vector2(x, y);
  return { x, y, set(nx, ny) { this.x = nx; this.y = ny; } };
}

function createColor(value = 0x000000) {
  if (THREE.Color) return new THREE.Color(value);
  return { r: 0, g: 0, b: 0 };
}

const QUALITY_CONFIG = Object.freeze({
  qualityProfile: 'balanced',
  hdriUrl: '/env.hdr',
  enableShadows: true,
  enableSSAO: false,
  enableDOF: false,
  enableBloom: false,
});

function detectLowEndDevice() {
  const dpr = window.devicePixelRatio || 1;
  const cores = navigator.hardwareConcurrency || 8;
  const memory = navigator.deviceMemory || 8;
  const mediaResult = window.matchMedia ? window.matchMedia('(pointer: coarse)') : null;
  const isCoarsePointer = Boolean(mediaResult && mediaResult.matches);
  return cores <= 4 || memory <= 4 || (isCoarsePointer && dpr > 2);
}

function getQualitySettings() {
  const lowEnd = detectLowEndDevice();
  const profile = lowEnd ? 'balanced' : QUALITY_CONFIG.qualityProfile;
  if (profile === 'perf') {
    return {
      profile,
      pixelRatioCap: 1.2,
      toneMappingExposure: 0.95,
      enableShadows: false,
      enableSSAO: false,
      enableDOF: false,
      enableBloom: false,
      shadowMapSize: 1024,
    };
  }
  if (profile === 'balanced') {
    return {
      profile,
      pixelRatioCap: 1.4,
      toneMappingExposure: 1.0,
      enableShadows: QUALITY_CONFIG.enableShadows,
      enableSSAO: false,
      enableDOF: false,
      enableBloom: QUALITY_CONFIG.enableBloom,
      shadowMapSize: 1536,
    };
  }
  return {
    profile: 'max',
    pixelRatioCap: 1.6,
    toneMappingExposure: 1.02,
    enableShadows: QUALITY_CONFIG.enableShadows,
    enableSSAO: QUALITY_CONFIG.enableSSAO,
    enableDOF: QUALITY_CONFIG.enableDOF,
    enableBloom: QUALITY_CONFIG.enableBloom,
    shadowMapSize: 2048,
  };
}

function setupEnvironmentLighting(currentScene, currentRenderer, hdriUrl) {
  if (typeof process !== 'undefined' && process.env && process.env.VITEST) return;
  if (!THREE.PMREMGenerator) return;
  pmremGenerator = new THREE.PMREMGenerator(currentRenderer);
  if (pmremGenerator.compileEquirectangularShader) pmremGenerator.compileEquirectangularShader();

  import('three/examples/jsm/loaders/HDRLoader.js')
    .then(({ HDRLoader }) => {
      const hdrLoader = new HDRLoader();
      hdrLoader.load(
        hdriUrl,
        (hdrTexture) => {
          if (!scene) {
            hdrTexture.dispose?.();
            return;
          }
          if (envRenderTarget) envRenderTarget.dispose?.();
          envRenderTarget = pmremGenerator.fromEquirectangular(hdrTexture);
          currentScene.environment = envRenderTarget.texture;
          currentScene.background = envRenderTarget.texture;
          applyEnvironmentTuning();
          hdrTexture.dispose?.();
        },
        undefined,
        () => {
          currentScene.background = null;
          currentScene.environment = null;
        }
      );
    })
    .catch(() => {
      currentScene.background = null;
      currentScene.environment = null;
    });
}

function setupShadows(currentRenderer, currentScene, settings) {
  currentRenderer.shadowMap.enabled = settings.enableShadows;
  if (!settings.enableShadows) {
    currentRenderer.shadowMap.type = THREE.BasicShadowMap;
    return;
  }
  currentRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
  if (keyLight) {
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(settings.shadowMapSize, settings.shadowMapSize);
    keyLight.shadow.bias = -0.00012;
    keyLight.shadow.normalBias = 0.01;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 30;
    keyLight.shadow.camera.left = -7;
    keyLight.shadow.camera.right = 7;
    keyLight.shadow.camera.top = 7;
    keyLight.shadow.camera.bottom = -7;
  }

  if (THREE.ShadowMaterial) {
    const catcherGeometry = new THREE.PlaneGeometry(20, 20);
    const catcherMaterial = new THREE.ShadowMaterial({ opacity: 0.22 });
    shadowCatcher = new THREE.Mesh(catcherGeometry, catcherMaterial);
    shadowCatcher.rotation.x = -Math.PI / 2;
    shadowCatcher.position.y = -1.35;
    shadowCatcher.receiveShadow = true;
    currentScene.add(shadowCatcher);
  }
}

function setupPostFX(currentComposer, currentScene, currentCamera, currentRenderer, settings) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const renderPass = new RenderPass(currentScene, currentCamera);
  currentComposer.addPass(renderPass);

  dissolvePass = new ShaderPass(DissolveShader);
  dissolvePass.uniforms.uResolution.value.set(width, height);
  dissolvePass.uniforms.uAberration.value = tune.dissolveAberration;
  dissolvePass.uniforms.uSpread.value = tune.dissolveSpread;
  currentComposer.addPass(dissolvePass);

  const outputPass = new OutputPass();
  currentComposer.addPass(outputPass);

  if (settings.profile === 'max') {
    currentRenderer.info.autoReset = false;
  }

  if (typeof process !== 'undefined' && process.env && process.env.VITEST) return;

  if (settings.enableSSAO) {
    import('three/examples/jsm/postprocessing/SSAOPass.js')
      .then(({ SSAOPass }) => {
        if (!composer) return;
        ssaoPass = new SSAOPass(currentScene, currentCamera, width, height);
        ssaoPass.kernelRadius = 14;
        ssaoPass.minDistance = 0.004;
        ssaoPass.maxDistance = 0.15;
        if (composer.insertPass) composer.insertPass(ssaoPass, 1);
        else composer.addPass(ssaoPass);
      })
      .catch(() => {
        ssaoPass = null;
      });
  }

  if (settings.enableBloom) {
    import('three/examples/jsm/postprocessing/UnrealBloomPass.js')
      .then(({ UnrealBloomPass }) => {
        if (!composer) return;
        bloomPass = new UnrealBloomPass(createVector2(width, height), 0.16, 0.55, 0.88);
        if (composer.insertPass) composer.insertPass(bloomPass, ssaoPass ? 2 : 1);
        else composer.addPass(bloomPass);
      })
      .catch(() => {
        bloomPass = null;
      });
  }

  if (settings.enableDOF) {
    import('three/examples/jsm/postprocessing/BokehPass.js')
      .then(({ BokehPass }) => {
        if (!composer) return;
        dofPass = new BokehPass(currentScene, currentCamera, {
          focus: 4.5,
          aperture: 0.00002,
          maxblur: 0.0035,
          width,
          height,
        });
        if (composer.insertPass) composer.insertPass(dofPass, 1);
        else composer.addPass(dofPass);
      })
      .catch(() => {
        dofPass = null;
      });
  }
}

function applyLightTuning() {
  if (renderer) renderer.toneMappingExposure = tune.exposure;
  if (ambientLight) {
    ambientLight.intensity = tune.ambientIntensity;
    if (ambientLight.color?.set) ambientLight.color.set(tune.ambientColor);
  }
  if (keyLight) {
    keyLight.intensity = tune.keyIntensity;
    if (keyLight.color?.set) keyLight.color.set(tune.keyColor);
    keyLight.position.set(tune.keyX, tune.keyY, tune.keyZ);
  }
}

function applyEnvironmentTuning() {
  if (!scene) return;
  scene.backgroundIntensity = tune.envBackgroundIntensity;
  scene.backgroundBlurriness = tune.envBackgroundBlur;
}

function applyShadowTuning() {
  if (!shadowCatcher) return;
  if (shadowCatcher.material) shadowCatcher.material.opacity = tune.shadowOpacity;
  shadowCatcher.position.y = tune.shadowY;
}

function applyMaterialTuning() {
  tunedMaterials.forEach((material) => {
    if (!material?.userData) return;
    if (material.roughness !== undefined) {
      material.roughness = THREE.MathUtils.clamp((material.userData.baseRoughness ?? material.roughness) * tune.roughnessScale, 0.03, 1);
    }
    if (material.metalness !== undefined) {
      material.metalness = THREE.MathUtils.clamp((material.userData.baseMetalness ?? material.metalness) * tune.metalnessScale, 0, 1);
    }
    material.envMapIntensity = THREE.MathUtils.clamp((material.userData.baseEnvMapIntensity ?? material.envMapIntensity ?? 1) * tune.envReflection, 0.2, 5);
    material.needsUpdate = true;
  });
}

function setupDebugGui() {
  if (typeof process !== 'undefined' && process.env && process.env.VITEST) return;
  import('lil-gui')
    .then(({ default: GUI }) => {
      if (debugGui || !scene || !camera) return;
      debugGui = new GUI({ title: 'Three Background' });

      const envFolder = debugGui.addFolder('Environment');
      envFolder.add(tune, 'exposure', 0.4, 1.8, 0.01).name('Exposure').onChange(applyLightTuning);
      envFolder.add(tune, 'envBackgroundIntensity', 0, 1.5, 0.01).name('BG Intensity').onChange(applyEnvironmentTuning);
      envFolder.add(tune, 'envBackgroundBlur', 0, 1, 0.01).name('BG Blur').onChange(applyEnvironmentTuning);
      envFolder.add(tune, 'envReflection', 0.2, 4, 0.01).name('Reflections').onChange(applyMaterialTuning);
      envFolder.close();

      const lightFolder = debugGui.addFolder('Lighting');
      lightFolder.add(tune, 'ambientIntensity', 0, 2, 0.01).name('Ambient Int').onChange(applyLightTuning);
      lightFolder.addColor(tune, 'ambientColor').name('Ambient Color').onChange(applyLightTuning);
      lightFolder.add(tune, 'keyIntensity', 0, 8, 0.01).name('Key Int').onChange(applyLightTuning);
      lightFolder.addColor(tune, 'keyColor').name('Key Color').onChange(applyLightTuning);
      lightFolder.add(tune, 'keyX', -20, 20, 0.1).name('Key X').onChange(applyLightTuning);
      lightFolder.add(tune, 'keyY', -20, 20, 0.1).name('Key Y').onChange(applyLightTuning);
      lightFolder.add(tune, 'keyZ', -20, 20, 0.1).name('Key Z').onChange(applyLightTuning);
      lightFolder.close();

      const matFolder = debugGui.addFolder('Material');
      matFolder.add(tune, 'roughnessScale', 0.2, 2, 0.01).name('Roughness').onChange(applyMaterialTuning);
      matFolder.add(tune, 'metalnessScale', 0.2, 3, 0.01).name('Metalness').onChange(applyMaterialTuning);
      matFolder.close();

      const shadowFolder = debugGui.addFolder('Shadows');
      shadowFolder.add(tune, 'shadowOpacity', 0, 0.6, 0.01).name('Contact Opacity').onChange(applyShadowTuning);
      shadowFolder.add(tune, 'shadowY', -4, 2, 0.01).name('Contact Y').onChange(applyShadowTuning);
      shadowFolder.close();

      const parallaxFolder = debugGui.addFolder('Parallax');
      parallaxFolder.add(parallaxConfig, 'angleRange', 0, 0.5, 0.01).name('Angle Range');
      parallaxFolder.add(parallaxConfig, 'yRange', 0, 2, 0.01).name('Y Range');
      parallaxFolder.add(parallaxConfig, 'tiltRange', 0, 0.2, 0.01).name('Tilt Range');
      parallaxFolder.add(parallaxConfig, 'lerp', 0.001, 0.1, 0.001).name('Lerp');
      parallaxFolder.close();

      const fxFolder = debugGui.addFolder('Dissolve');
      fxFolder.add(tune, 'dissolveSpread', 0, 0.6, 0.01).name('Spread').onChange((value) => {
        if (dissolvePass?.uniforms?.uSpread) dissolvePass.uniforms.uSpread.value = value;
      });
      fxFolder.add(tune, 'dissolveAberration', 0, 1, 0.01).name('Aberration').onChange((value) => {
        if (dissolvePass?.uniforms?.uAberration) dissolvePass.uniforms.uAberration.value = value;
      });
      fxFolder.close();
    })
    .catch(() => {});
}

function tuneMaterialMaps(material) {
  if (material.map) material.map.colorSpace = THREE.SRGBColorSpace;
  if (material.emissiveMap) material.emissiveMap.colorSpace = THREE.SRGBColorSpace;
  material.needsUpdate = true;
}

function getFallbackPhysicalMaterial(sourceMaterial) {
  if (!THREE.MeshPhysicalMaterial) return sourceMaterial;
  return new THREE.MeshPhysicalMaterial({
    color: sourceMaterial?.color?.clone ? sourceMaterial.color.clone() : createColor(0xd3d0cb),
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
    } else {
      material.envMapIntensity = Math.max(material.envMapIntensity || 0.6, 1.3);
      material.roughness = Math.min(material.roughness ?? 0.8, 0.9);
      material.metalness = Math.max(material.metalness ?? 0.0, 0.02);
    }

    tuneMaterialMaps(material);
    material.userData.baseRoughness = material.roughness ?? 0.8;
    material.userData.baseMetalness = material.metalness ?? 0.02;
    material.userData.baseEnvMapIntensity = material.envMapIntensity ?? 1;
    tunedMaterials.add(material);
    return material;
  };

  if (Array.isArray(mesh.material)) {
    mesh.material = mesh.material.map(apply);
  } else {
    mesh.material = apply(mesh.material);
  }
}

function finalizeModel(model) {
  if (THREE.Box3 && THREE.Vector3 && model.position?.sub) {
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const minY = box.min.y;
    model.position.sub(center);
    model.position.y -= minY;
  }

  model.traverse((child) => {
    if (!child.isMesh) return;
    child.castShadow = true;
    child.receiveShadow = true;
    tuneMeshMaterial(child);
  });
}

function updateRuntimeQuality(deltaMs) {
  if (effectsDowngraded) return;
  frameHistory.push(deltaMs);
  if (frameHistory.length > 120) frameHistory.shift();
  if (frameHistory.length < 90) return;

  const average = frameHistory.reduce((sum, value) => sum + value, 0) / frameHistory.length;
  if (average < 28) return;

  if (dofPass) dofPass.enabled = false;
  if (ssaoPass) ssaoPass.enabled = false;
  effectsDowngraded = true;
}

const DissolveShader = {
  uniforms: {
    tDiffuse: { value: null },
    uProgress: { value: 0 },
    uColor: { value: createColor(0x000000) },
    uSpread: { value: 0.2 },
    uAberration: { value: 1.0 },
    uResolution: { value: createVector2() }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uProgress;
    uniform vec2 uResolution;
    uniform vec3 uColor;
    uniform float uSpread;
    uniform float uAberration;
    varying vec2 vUv;
    
    // Simple noise
    float Hash(vec2 p) {
      vec3 p2 = vec3(p.xy, 1.0);
      return fract(sin(dot(p2, vec3(37.1, 61.7, 12.4))) * 3758.5453123);
    }
    
    float noise(in vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f *= f * (3.0 - 2.0 * f);
      return mix(
        mix(Hash(i + vec2(0.0, 0.0)), Hash(i + vec2(1.0, 0.0)), f.x),
        mix(Hash(i + vec2(0.0, 1.0)), Hash(i + vec2(1.0, 1.0)), f.x),
        f.y
      );
    }
    
    float fbm(vec2 p) {
      // Simplified FBM with fewer octaves for better performance
      float v = noise(p) * 0.5 + noise(p * 2.0) * 0.25;
      return v;
    }

    void main() {
      vec2 uv = vUv;
      float aspect = uResolution.x / uResolution.y;
      vec2 centeredUv = (uv - 0.5) * vec2(aspect, 1.0);
      
      float noiseValue = fbm(centeredUv * 10.0);
      
      float dissolveBase  = (uv.y - uProgress * 1.2) + noiseValue * uSpread;
      
      float smoothFactor = 0.01;
      
      // Calculate independent dissolve states for RGB channels
      // "Glassy" look: offset dissolve timing for each channel
      float maskAb = uAberration * 0.01;
      
      float dR = dissolveBase + maskAb;
      float dG = dissolveBase;
      float dB = dissolveBase - maskAb;
      
      float aR = 1.0 - smoothstep(-smoothFactor, smoothFactor, dR);
      float aG = 1.0 - smoothstep(-smoothFactor, smoothFactor, dG);
      float aB = 1.0 - smoothstep(-smoothFactor, smoothFactor, dB);
      
      // Chromatic aberration on the TEXTURE (refraction effect)
      // Only distort near the edge
      float edgeZone = 1.0 - smoothstep(0.0, 0.2, abs(dissolveBase));
      float texAb = uAberration * 0.02 * edgeZone;
      
      vec4 texR = texture2D(tDiffuse, vUv - vec2(texAb, 0.0));
      vec4 texG = texture2D(tDiffuse, vUv);
      vec4 texB = texture2D(tDiffuse, vUv + vec2(texAb, 0.0));
      
      float r = mix(texR.r, uColor.r, aR);
      float g = mix(texG.g, uColor.g, aG);
      float b = mix(texB.b, uColor.b, aB);
      
      gl_FragColor = vec4(r, g, b, 1.0);
    }
  `
};

export function webgl() {
  if (isRunning) {
    return { scene, camera, renderer };
  }
  isRunning = true;
  const quality = getQualitySettings();
  frameHistory = [];
  effectsDowngraded = false;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality.pixelRatioCap));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = quality.toneMappingExposure;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  containerEl = document.querySelector('#background');
  if (!containerEl) {
    containerEl = document.createElement('div');
    containerEl.id = 'background';
    // place near top of body to sit behind main content
    const firstChild = document.body.firstChild;
    document.body.insertBefore(containerEl, firstChild);
  }
  containerEl.appendChild(renderer.domElement);

  ambientLight = new THREE.AmbientLight(0xffffff, 0.18);
  scene.add(ambientLight);

  keyLight = new THREE.DirectionalLight(0xffffff, 3.25);
  keyLight.position.set(4.2, 7.5, 6.2);
  scene.add(keyLight);
  applyLightTuning();
  setupEnvironmentLighting(scene, renderer, QUALITY_CONFIG.hdriUrl);
  setupShadows(renderer, scene, quality);
  applyShadowTuning();

  const loader = new GLTFLoader();
  const modelUrl = '/home/scene.glb';
  loader.load(
    modelUrl,
    (glb) => {
      if (!scene || !isRunning) return;
      modelRoot = glb.scene;
      finalizeModel(modelRoot);
      applyMaterialTuning();
      scene.add(modelRoot);
    },
    undefined,
    (err) => console.error('GLTF load error:', err)
  );
  let resizeTimeout = null;
  resizeHandler = () => {
    // Debounce resize to avoid excessive recalculations
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (!camera || !renderer || !composer) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      composer.setSize(width, height);
      if (ssaoPass && ssaoPass.setSize) ssaoPass.setSize(width, height);
      if (bloomPass && bloomPass.setSize) bloomPass.setSize(width, height);
      if (dofPass && dofPass.setSize) dofPass.setSize(width, height);
      if (dissolvePass?.uniforms?.uResolution?.value?.set) {
        dissolvePass.uniforms.uResolution.value.set(width, height);
      }
    }, 100);
  };
  window.addEventListener('resize', resizeHandler);

  try {
    composer = new EffectComposer(renderer);
  } catch {
    composer = {
      addPass: () => {},
      insertPass: () => {},
      setSize: () => {},
      dispose: () => {},
      render: () => renderer?.render(scene, camera),
    };
  }
  setupPostFX(composer, scene, camera, renderer, quality);
  setupDebugGui();
  const BASE_CAMERA_RADIUS = Math.sqrt(50) / 2.5;
  camera.position.set(0, 1, BASE_CAMERA_RADIUS);
  camera.lookAt(0, 0, 0);
  cameraTarget.angle = Math.PI / 2;
  cameraTarget.y = 0;
  cameraTarget.tilt = 0;
  cameraCurrent.angle = Math.PI / 2;
  cameraCurrent.y = 0;
  cameraCurrent.tilt = 0;
  let lastMouseTime = 0;

  // Read sessionStorage to set initial scene offset (handles re-init after destroyWebgl)
  if (sessionStorage.getItem('webgl-page') === 'contact') {
    sceneState.x = 0;
    sceneState.y = -2;
    sceneState.z = 0;
    scene.position.set(sceneState.x, sceneState.y, sceneState.z);
  } else {
    sceneState.x = 0;
    sceneState.y = 0;
    sceneState.z = 0;
    scene.position.set(sceneState.x, sceneState.y, sceneState.z);
  }

  mouseHandler = (event) => {
    const now = performance.now();
    if (now - lastMouseTime < 16) return;
    lastMouseTime = now;

    const mx = (event.clientX / window.innerWidth) * 2 - 1;
    const my = -(event.clientY / window.innerHeight) * 2 + 1;
    cameraTarget.angle = Math.PI / 2 + mx * parallaxConfig.angleRange;
    cameraTarget.y = -my * parallaxConfig.yRange;
    cameraTarget.tilt = mx * parallaxConfig.tiltRange;
  };
  window.addEventListener('mousemove', mouseHandler, { passive: true });

  let lastFrameTime = performance.now();

  const render = () => {
    if (!isRunning || !camera || !composer) return;
    const now = performance.now();
    const frameDelta = now - lastFrameTime;
    lastFrameTime = now;

    const lerpFactor = parallaxConfig.lerp;
    cameraCurrent.angle += (cameraTarget.angle - cameraCurrent.angle) * lerpFactor;
    cameraCurrent.y += (cameraTarget.y - cameraCurrent.y) * lerpFactor;
    cameraCurrent.tilt += (cameraTarget.tilt - cameraCurrent.tilt) * lerpFactor;

    camera.position.x = Math.cos(cameraCurrent.angle) * BASE_CAMERA_RADIUS;
    camera.position.z = Math.sin(cameraCurrent.angle) * BASE_CAMERA_RADIUS;
    camera.position.y += (cameraCurrent.y + 1 - camera.position.y);

    const driftTime = performance.now() * 0.001;
    camera.position.x += Math.sin(driftTime * 0.7) * 0.012 + Math.sin(driftTime * 1.3) * 0.008;
    camera.position.y += Math.sin(driftTime * 0.5) * 0.012 + Math.cos(driftTime * 1.1) * 0.008;
    camera.position.z += Math.cos(driftTime * 0.6) * 0.008;

    camera.lookAt(0, 0, 0);
    camera.rotation.z += cameraCurrent.tilt;
    composer.render();
    updateRuntimeQuality(frameDelta);
    rafId = requestAnimationFrame(render);
  };

  render();

  return { scene, camera, renderer };
}

export function destroyWebgl() {
  if (!isRunning) return;
  isRunning = false;

  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler);
    resizeHandler = null;
  }
  if (mouseHandler) {
    window.removeEventListener('mousemove', mouseHandler);
    mouseHandler = null;
  }

  if (sceneTween) {
    sceneTween.kill();
    sceneTween = null;
  }

  if (heroScrollTrigger) {
    heroScrollTrigger.kill();
    heroScrollTrigger = null;
  }

  if (dissolvePass) {
    if (dissolvePass.material) dissolvePass.material.dispose();
    dissolvePass = null;
  }
  if (ssaoPass) {
    if (ssaoPass.dispose) ssaoPass.dispose();
    ssaoPass = null;
  }
  if (bloomPass) {
    if (bloomPass.dispose) bloomPass.dispose();
    bloomPass = null;
  }
  if (dofPass) {
    if (dofPass.dispose) dofPass.dispose();
    dofPass = null;
  }
  if (shadowCatcher) {
    if (shadowCatcher.geometry) shadowCatcher.geometry.dispose();
    if (shadowCatcher.material) shadowCatcher.material.dispose();
    shadowCatcher = null;
  }
  if (envRenderTarget) {
    envRenderTarget.dispose();
    envRenderTarget = null;
  }
  if (pmremGenerator) {
    pmremGenerator.dispose();
    pmremGenerator = null;
  }
  if (debugGui) {
    debugGui.destroy();
    debugGui = null;
  }
  tunedMaterials.clear();
  if (modelRoot) {
    scene?.remove(modelRoot);
    modelRoot = null;
  }

  if (composer) {
    composer.dispose();
    composer = null;
  }
  if (renderer) {
    renderer.dispose();
    if (renderer.domElement && renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
    renderer = null;
  }
  scene = null;
  camera = null;
  keyLight = null;
  ambientLight = null;
  frameHistory = [];
  effectsDowngraded = false;
  containerEl = null;
}

export function isWebglRunning() {
  return isRunning;
}

export function getWebglContext() {
  return { scene, camera, renderer };
}

/**
 * Animate (or immediately set) the scene to home or contact position.
 * @param {'home'|'contact'} page
 * @param {boolean} immediate — if true, skip the tween
 */
export function setScenePage(page, immediate = false) {
  const target = page === 'contact' ? { x: 0, y: -2, z: 0 } : { x: 0, y: 0, z: 0 };
  sessionStorage.setItem('webgl-page', page);

  if (sceneTween) {
    sceneTween.kill();
    sceneTween = null;
  }

  if (immediate) {
    sceneState.x = target.x;
    sceneState.y = target.y;
    sceneState.z = target.z;
    if (scene) scene.position.set(sceneState.x, sceneState.y, sceneState.z);
  } else {
    sceneTween = gsap.to(sceneState, {
      x: target.x,
      y: target.y,
      z: target.z,
      duration: 1.2,
      ease: 'power2.inOut',
      onUpdate: () => {
        if (scene) scene.position.set(sceneState.x, sceneState.y, sceneState.z);
      }
    });
  }
}

export default webgl;
