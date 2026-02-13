import * as THREE from 'three';
import { GLTFLoader } from 'three-stdlib';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import gsap from 'gsap';
import { Text } from 'troika-three-text';


let renderer = null;
let composer = null;
let camera = null;
let scene = null;
let resizeHandler = null;
let mouseHandler = null;
let rafId = null;
let containerEl = null;
let isRunning = false;
let keyLight = null;
let ambientLight = null;
let shadowCatcher = null;
let modelRoot = null;
let pmremGenerator = null;
let envRenderTarget = null;
let sceneTween = null;
const tunedMaterials = new Set();

// ── Text overlay state ──
let overlayScene = null;
let overlayCamera = null;
let textEntries = []; // { mesh, sourceEl, key }
const cameraTarget = { angle: Math.PI / 2, y: 0, tilt: 0 };
const cameraCurrent = { angle: Math.PI / 2, y: 0, tilt: 0 };
const cameraOrbitOffset = { x: 0, y: 0, z: 0 };
const parallaxConfig = { angleRange: 0.15, yRange: 0.3, tiltRange: 0.035, lerp: 0.02, orbitRadius: 5 };
const tune = {
  exposure: 1.0,
  ambientIntensity: 0.18,
  ambientColor: '#fff5ff', // Slight magenta to counteract green tint
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
  modelX: 0,
  modelY: -1,
  modelZ: -5,
};

const QUALITY_CONFIG = Object.freeze({
  qualityProfile: 'balanced',
  hdriUrl: '/env.hdr',
  enableShadows: true,
});

function getQualitySettings() {
  return {
    profile: 'balanced',
    pixelRatioCap: 1.5,
    toneMappingExposure: 1.0,
    enableShadows: QUALITY_CONFIG.enableShadows,
    shadowMapSize: 512,
  };
}

function setupEnvironmentLighting(currentScene, currentRenderer, hdriUrl) {
  if (typeof process !== 'undefined' && process.env && process.env.VITEST) return;
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
    keyLight.shadow.bias = -0.0001;
    keyLight.shadow.normalBias = 0.02;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 30;
    keyLight.shadow.camera.left = -7;
    keyLight.shadow.camera.right = 7;
    keyLight.shadow.camera.top = 7;
    keyLight.shadow.camera.bottom = -7;
  }

  const catcherGeometry = new THREE.PlaneGeometry(20, 20);
  const catcherMaterial = new THREE.ShadowMaterial({ opacity: 0.22 });
  shadowCatcher = new THREE.Mesh(catcherGeometry, catcherMaterial);
  shadowCatcher.rotation.x = -Math.PI / 2;
  shadowCatcher.position.y = -1.35;
  shadowCatcher.receiveShadow = true;
  currentScene.add(shadowCatcher);
}

function setupPostFX(currentComposer, currentScene, currentCamera) {
  const renderPass = new RenderPass(currentScene, currentCamera);
  currentComposer.addPass(renderPass);

  const outputPass = new OutputPass();
  currentComposer.addPass(outputPass);
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
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const minY = box.min.y;
  model.position.sub(center);
  model.position.y -= minY;

  model.traverse((child) => {
    if (!child.isMesh) return;
    child.castShadow = true;
    child.receiveShadow = true;
    tuneMeshMaterial(child);
  });
}

// ── Text overlay helpers ──────────────────────────────────────────

function resolveFontPath(fontFamily) {
  const families = (fontFamily || '').split(',')
    .map(s => s.trim().replace(/^['"]|['"]$/g, '').toLowerCase());
  for (const f of families) {
    if (f.includes('otjubilee')) return '/OTJubilee-Golden.otf';
    if (f.includes('neuemontreal') || f.includes('ppneuemontreal')) return '/PPNeueMontreal-Medium.otf';
    if (f.includes('geist')) return '/GeistMono.woff2';
  }
  return '/OTJubilee-Golden.otf';
}

function applyTextTransform(text, transform) {
  if (transform === 'uppercase') return text.toUpperCase();
  if (transform === 'lowercase') return text.toLowerCase();
  return text;
}

function initOverlay() {
  if (overlayScene) return;
  overlayScene = new THREE.Scene();
  overlayCamera = new THREE.OrthographicCamera(
    -window.innerWidth / 2, window.innerWidth / 2,
    window.innerHeight / 2, -window.innerHeight / 2,
    -1000, 1000
  );
  overlayCamera.position.z = 500;
}

function destroyOverlay() {
  unmountSceneText();
  overlayScene = null;
  overlayCamera = null;
}

function createTextEntry(sourceEl, opts = {}) {
  const style = window.getComputedStyle(sourceEl);
  const rect = sourceEl.getBoundingClientRect();
  const rawText = sourceEl.textContent?.trim() || '';
  const text = applyTextTransform(rawText, style.textTransform);
  if (!text) return null;

  const fontSizePx = parseFloat(style.fontSize) || 16;
  const letterSpacingPx = parseFloat(style.letterSpacing);
  const lineHeightPx = parseFloat(style.lineHeight);

  // Content width = element width minus padding (getBoundingClientRect includes padding)
  const paddingLeft = parseFloat(style.paddingLeft) || 0;
  const paddingRight = parseFloat(style.paddingRight) || 0;
  const contentWidth = rect.width - paddingLeft - paddingRight;

  const mesh = new Text();
  mesh.text = text;
  mesh.font = resolveFontPath(style.fontFamily);
  mesh.fontSize = fontSizePx;
  mesh.fontSize = fontSizePx;
  const textAlign = style.textAlign || 'center';
  mesh.textAlign = textAlign;
  mesh.anchorX = textAlign === 'start' ? 'left' : textAlign === 'end' ? 'right' : textAlign;
  mesh.anchorY = 'middle';
  mesh.letterSpacing = Number.isFinite(letterSpacingPx) ? letterSpacingPx / fontSizePx : 0;
  mesh.lineHeight = Number.isFinite(lineHeightPx) ? lineHeightPx / fontSizePx : 'normal';

  // Mirror CSS white-space / text-wrap to control Troika wrapping
  const ws = style.whiteSpace;
  const tw = style.textWrap;

  // Determine if this element should not wrap:
  //  1. CSS white-space: nowrap / pre
  //  2. CSS text-wrap: nowrap
  //  3. Element is inside a horizontal flex row (e.g. contact social links)
  //     — each child is a short label that must stay on one line
  const parentStyle = sourceEl.parentElement ? window.getComputedStyle(sourceEl.parentElement) : null;
  const inHorizontalFlex = parentStyle
    && (parentStyle.display === 'flex' || parentStyle.display === 'inline-flex')
    && (parentStyle.flexDirection === 'row' || parentStyle.flexDirection === '' || parentStyle.flexDirection === 'row-reverse');

  const shouldNowrap = ws === 'nowrap' || ws === 'pre' || tw === 'nowrap' || inHorizontalFlex;

  if (shouldNowrap) {
    mesh.whiteSpace = 'nowrap';
  } else {
    mesh.maxWidth = Math.max(contentWidth, fontSizePx);
  }
  mesh.color = new THREE.Color().setStyle(style.color || '#e2e2e2').getHex();
  // Modify Troika's built-in material properties instead of replacing it
  // (replacing breaks the SDF shader pipeline)
  mesh.material.transparent = true;
  mesh.material.depthWrite = false;
  mesh.material.depthTest = false;
  mesh.material.toneMapped = false;
  mesh.frustumCulled = false;
  mesh.renderOrder = 20;

  // Position in overlay-pixel space (origin = screen center)
  // Calculate X based on alignment
  let x = 0;
  if (textAlign === 'left' || textAlign === 'start') {
    x = rect.left - window.innerWidth * 0.5;
  } else if (textAlign === 'right' || textAlign === 'end') {
    x = rect.right - window.innerWidth * 0.5;
  } else {
    // center
    x = rect.left + rect.width * 0.5 - window.innerWidth * 0.5;
  }

  const y = window.innerHeight * 0.5 - (rect.top + rect.height * 0.5);
  mesh.position.set(x, y, 190);
  mesh.sync(() => {
    console.log('[troika] text synced:', mesh.text.slice(0, 30), mesh.textRenderInfo ? 'OK' : 'EMPTY');
    // Only hide DOM text once Troika has finished rendering the replacement
    if (sourceEl) sourceEl.classList.add('troika-hidden');
  });
  overlayScene.add(mesh);

  return { mesh, sourceEl, key: opts.key || '' };
}

export function webgl() {
  if (isRunning) {
    return { scene, camera, renderer };
  }
  isRunning = true;
  const quality = getQualitySettings();

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

  const needsAA = (window.devicePixelRatio || 1) < 1.5;
  renderer = new THREE.WebGLRenderer({ antialias: needsAA, alpha: true, powerPreference: 'high-performance' });
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
      // Position model at its fixed scene location (camera moves for page changes, not the model)
      modelRoot.position.set(tune.modelX, tune.modelY, tune.modelZ);
      // Set initial camera offset for current page
      const page = sessionStorage.getItem('webgl-page') || 'home';
      const offset = getCameraOffset(page);
      cameraOrbitOffset.x = offset.x;
      cameraOrbitOffset.y = offset.y;
      cameraOrbitOffset.z = offset.z;
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
      if (overlayCamera) {
        overlayCamera.left = -width / 2;
        overlayCamera.right = width / 2;
        overlayCamera.top = height / 2;
        overlayCamera.bottom = -height / 2;
        overlayCamera.updateProjectionMatrix();
      }
    }, 100);
  };
  window.addEventListener('resize', resizeHandler);

  try {
    composer = new EffectComposer(renderer);
  } catch {
    composer = {
      addPass: () => { },
      insertPass: () => { },
      setSize: () => { },
      dispose: () => { },
      render: () => renderer?.render(scene, camera),
    };
  }
  setupPostFX(composer, scene, camera);

  // Orbital camera setup — orbit around model center
  cameraTarget.angle = Math.PI / 2;
  cameraTarget.y = 0;
  cameraTarget.tilt = 0;
  cameraCurrent.angle = Math.PI / 2;
  cameraCurrent.y = 0;
  cameraCurrent.tilt = 0;

  let lastMouseTime = 0;

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

    // Orbit center = model position + page offset (camera moves, model stays)
    const cx = (modelRoot ? modelRoot.position.x : tune.modelX) + cameraOrbitOffset.x;
    const cy = (modelRoot ? modelRoot.position.y : tune.modelY) + cameraOrbitOffset.y;
    const cz = (modelRoot ? modelRoot.position.z : tune.modelZ) + cameraOrbitOffset.z;
    const radius = parallaxConfig.orbitRadius;

    camera.position.x = cx + Math.cos(cameraCurrent.angle) * radius;
    camera.position.z = cz + Math.sin(cameraCurrent.angle) * radius;
    camera.position.y = cy + cameraCurrent.y + 1;

    // Handheld camera drift
    const driftTime = now * 0.001;
    camera.position.x += Math.sin(driftTime * 0.7) * 0.012 + Math.sin(driftTime * 1.3) * 0.008;
    camera.position.y += Math.sin(driftTime * 0.5) * 0.012 + Math.cos(driftTime * 1.1) * 0.008;
    camera.position.z += Math.cos(driftTime * 0.6) * 0.008;

    camera.lookAt(cx, cy, cz);
    camera.rotation.z += cameraCurrent.tilt;

    composer.render();

    // Render text overlay on top of the 3D scene
    if (overlayScene && overlayCamera && textEntries.length > 0) {
      renderer.setRenderTarget(null); // Ensure EffectComposer didn't leave an FBO bound
      const prevAutoClear = renderer.autoClear;
      renderer.autoClear = false;
      renderer.clearDepth();
      renderer.render(overlayScene, overlayCamera);
      renderer.autoClear = prevAutoClear;
    }

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

  destroyOverlay();

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
  tunedMaterials.forEach(mat => {
    if (mat && typeof mat.dispose === 'function') mat.dispose();
  });
  tunedMaterials.clear();
  if (modelRoot) {
    modelRoot.traverse(child => {
      if (child.isMesh) {
        if (child.geometry) child.geometry.dispose();
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        for (const mat of mats) {
          if (!mat) continue;
          for (const key of Object.keys(mat)) {
            const val = mat[key];
            if (val && typeof val.dispose === 'function') val.dispose();
          }
          mat.dispose();
        }
      }
    });
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
  containerEl = null;
}

export function isWebglRunning() {
  return isRunning;
}

function getCameraOffset(page) {
  if (page === 'contact') return { x: -2, y: 0, z: 0 };
  return { x: 0, y: 0, z: 0 };
}

/**
 * Animate (or immediately set) the camera orbit center for the given page.
 * Model and lighting stay completely static.
 * @param {'home'|'contact'} page
 * @param {boolean} immediate — if true, skip the tween
 */
export function setScenePage(page, immediate = false) {
  const target = getCameraOffset(page);
  sessionStorage.setItem('webgl-page', page);

  if (sceneTween) {
    sceneTween.kill();
    sceneTween = null;
  }

  if (immediate) {
    cameraOrbitOffset.x = target.x;
    cameraOrbitOffset.y = target.y;
    cameraOrbitOffset.z = target.z;
  } else {
    sceneTween = gsap.to(cameraOrbitOffset, {
      x: target.x,
      y: target.y,
      z: target.z,
      duration: 1.2,
      ease: 'power2.inOut',
    });
  }
}

// ── Scene text API ────────────────────────────────────────────────

/**
 * Create Troika text meshes for the given page namespace, reading
 * content and styles from the DOM and rendering via the overlay layer.
 * @param {'home'|'contact'} namespace
 */
export function mountSceneText(namespace) {
  if (!overlayScene) initOverlay();
  unmountSceneText();

  const selectors =
    namespace === 'home'
      ? [
        { sel: '.hero-logo-top h1', opts: { stagger: 0.012, direction: 1, key: 'home-logo' } },
        { sel: '.hero-text-reveal', opts: { stagger: 0.008, direction: 1, key: 'home-text' }, all: true },
      ]
      : namespace === 'contact'
        ? [
          { sel: '.contact-header', opts: { stagger: 0.02, direction: -1, key: 'contact-header' } },
          { sel: '.text-reveal-header:not(.contact-header)', opts: { stagger: 0.01, direction: -1, key: 'contact-text' }, all: true },
        ]
        : [];

  selectors.forEach(({ sel, opts, all }) => {
    const els = all ? document.querySelectorAll(sel) : [document.querySelector(sel)];
    els.forEach((el, i) => {
      if (!el) return;
      const entry = createTextEntry(el, { ...opts, key: `${opts.key}-${i}` });
      if (entry) textEntries.push(entry);
    });
  });
}

/** Remove all overlay text meshes and restore DOM visibility. */
export function unmountSceneText() {
  textEntries.forEach(({ mesh, sourceEl }) => {
    if (mesh.parent) mesh.parent.remove(mesh);
    if (mesh.material && typeof mesh.material.dispose === 'function') mesh.material.dispose();
    if (typeof mesh.dispose === 'function') mesh.dispose();
    if (sourceEl) sourceEl.classList.remove('troika-hidden');
  });
  textEntries = [];
}

export default webgl;
