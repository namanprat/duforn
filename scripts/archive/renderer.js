// Archive WebGL renderer
import * as THREE from "three";
import { CONFIG } from "./config.js";
import { state } from "./state.js";
import { vertexShader, gridFragmentShader, createImageFragmentShader } from "./shaders.js";
import { loadTextures, createTextureAtlas } from "./atlas.js";
import { CRTShader } from "../CRTShader.js";
import { archiveItems as projects } from "../../data/archive-items.js";

// Module-level references for cleanup
let container = null;
let renderer = null;
let scene = null;
let crtScene = null;
let camera = null;
let plane = null;
let gridPlane = null;
let renderTarget = null;
let crtPass = null;
let animationId = null;

// Get plane reference for external use (click detection)
export function getPlane() {
  return plane;
}

// Get renderer reference for external use
export function getRenderer() {
  return renderer;
}

// Get container reference
export function getContainer() {
  return container;
}

// Setup the WebGL renderer and scene
export async function setupRenderer() {
  container = document.getElementById("gallery");
  if (!container) return;

  const width = container.offsetWidth;
  const height = container.offsetHeight;

  // Create renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  // Create scenes and camera
  scene = new THREE.Scene();
  crtScene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  camera.position.z = 1;

  // Load textures and create atlas
  const { imageTextures, aspectRatios } = await loadTextures(projects);
  const imageAtlas = createTextureAtlas(imageTextures);

  // Create geometry (shared)
  const geometry = new THREE.PlaneGeometry(2, 2);

  // Create grid plane (renders behind images)
  const gridMaterial = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader: gridFragmentShader,
    uniforms: {
      uResolution: { value: new THREE.Vector2(width, height) },
      uGridSize: { value: CONFIG.gridSize },
      uTime: { value: 0 },
      uMousePressed: { value: 0 },
      uZoom: { value: 1 },
      uDistortion: { value: CONFIG.distortion },
      uOffset: { value: new THREE.Vector2(0, 0) },
      uLineThickness: { value: CONFIG.lineThickness },
      uFocusState: { value: 0 },
      uMouseParallax: { value: new THREE.Vector2(0, 0) },
    },
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });

  gridPlane = new THREE.Mesh(geometry, gridMaterial);
  gridPlane.position.z = -0.5;
  scene.add(gridPlane);

  // Create image plane (renders on top of grid)
  const imageMaterial = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader: createImageFragmentShader(projects.length),
    uniforms: {
      uResolution: { value: new THREE.Vector2(width, height) },
      uDistortion: { value: CONFIG.distortion },
      uTime: { value: 0 },
      uImageAtlas: { value: imageAtlas },
      uTextureCount: { value: projects.length },
      uOffset: { value: new THREE.Vector2(0, 0) },
      uCellSize: { value: CONFIG.cellSize },
      uCellSpacing: { value: CONFIG.cellSpacing },
      uFocusIndex: { value: -1 },
      uFocusCell: { value: new THREE.Vector2(-9999, -9999) },
      uFocusState: { value: 0 },
      uMousePressed: { value: 0 },
      uZoom: { value: 1 },
      uMouseParallax: { value: new THREE.Vector2(0, 0) },
      uAspectRatios: { value: aspectRatios },
    },
    transparent: true,
  });

  plane = new THREE.Mesh(geometry, imageMaterial);
  scene.add(plane);

  // Setup render target for post-processing
  const pixelRatio = Math.min(window.devicePixelRatio, 2);
  renderTarget = new THREE.WebGLRenderTarget(width * pixelRatio, height * pixelRatio, {
    format: THREE.RGBAFormat,
    type: THREE.UnsignedByteType,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
  });

  // Create CRT post-processing material with locked artistic values
  const crtUniforms = {
    tDiffuse: { value: renderTarget.texture },
    scanlineIntensity: { value: CONFIG.crt.scanlineIntensity },
    scanlineCount: { value: CONFIG.crt.scanlineCount },
    time: { value: 0.0 },
    yOffset: { value: 0.0 },
    brightness: { value: CONFIG.crt.brightness },
    contrast: { value: CONFIG.crt.contrast },
    saturation: { value: CONFIG.crt.saturation },
    bloomIntensity: { value: CONFIG.crt.bloomIntensity },
    bloomThreshold: { value: CONFIG.crt.bloomThreshold },
    rgbShift: { value: CONFIG.crt.rgbShift },
    adaptiveIntensity: { value: CONFIG.crt.adaptiveIntensity },
    vignetteStrength: { value: CONFIG.crt.vignetteStrength },
    curvature: { value: CONFIG.crt.curvature },
    flickerStrength: { value: CONFIG.crt.flickerStrength },
  };

  const crtMaterial = new THREE.ShaderMaterial({
    vertexShader: CRTShader.vertexShader,
    fragmentShader: CRTShader.fragmentShader,
    uniforms: crtUniforms,
    transparent: false,
    depthWrite: false,
    depthTest: false,
  });

  // CRT pass plane
  const crtGeometry = new THREE.PlaneGeometry(2, 2);
  crtPass = new THREE.Mesh(crtGeometry, crtMaterial);
  crtScene.add(crtPass);
}

// Render a single frame
export function render() {
  if (!renderer || !state.isRunning) return;

  // Smooth offset interpolation
  state.offset.x += (state.targetOffset.x - state.offset.x) * CONFIG.lerpFactor;
  state.offset.y += (state.targetOffset.y - state.offset.y) * CONFIG.lerpFactor;

  // Smooth mouse parallax
  state.mouseParallax.x += (state.mouse.x - state.mouseParallax.x) * 0.1;
  state.mouseParallax.y += (state.mouse.y - state.mouseParallax.y) * 0.1;

  const time = performance.now() * 0.001;

  // Update image plane uniforms
  if (plane?.material?.uniforms) {
    const u = plane.material.uniforms;
    u.uOffset.value.set(state.offset.x, state.offset.y);
    u.uTime.value = time;
    u.uMousePressed.value = state.mousePressed.value;
    u.uZoom.value = state.dragZoom.value;
    u.uMouseParallax.value.set(state.mouseParallax.x, state.mouseParallax.y);
    u.uFocusState.value = state.focusState.value;
  }

  // Update grid plane uniforms
  if (gridPlane?.material?.uniforms) {
    const u = gridPlane.material.uniforms;
    u.uGridSize.value = CONFIG.gridSize;
    u.uTime.value = time;
    u.uMousePressed.value = state.mousePressed.value;
    u.uZoom.value = state.dragZoom.value;
    u.uOffset.value.set(state.offset.x, state.offset.y);
    u.uLineThickness.value = CONFIG.lineThickness;
    u.uFocusState.value = state.focusState.value;
    u.uMouseParallax.value.set(state.mouseParallax.x, state.mouseParallax.y);
  }

  // Render archive scene to render target
  renderer.setRenderTarget(renderTarget);
  renderer.clear();
  renderer.render(scene, camera);

  // Render CRT post-processing to screen
  renderer.setRenderTarget(null);
  renderer.clear();

  if (crtPass?.material?.uniforms?.time) {
    crtPass.material.uniforms.time.value = time;
  }

  renderer.render(crtScene, camera);
}

// Handle window resize
export function onResize() {
  if (!container || !renderer) return;

  const width = container.offsetWidth;
  const height = container.offsetHeight;

  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  if (plane?.material?.uniforms) {
    plane.material.uniforms.uResolution.value.set(width, height);
  }

  if (gridPlane?.material?.uniforms) {
    gridPlane.material.uniforms.uResolution.value.set(width, height);
  }

  // Update render target
  if (renderTarget) {
    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    renderTarget.setSize(width * pixelRatio, height * pixelRatio);
  }

  // Update CRT shader resolution
  if (crtPass?.material?.uniforms) {
    crtPass.material.uniforms.uResolution = { value: new THREE.Vector2(width, height) };
  }
}

// Start animation loop
export function startLoop() {
  function animate() {
    if (!state.isRunning) return;
    animationId = requestAnimationFrame(animate);
    render();
  }
  animate();
}

// Stop animation loop
export function stopLoop() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
}

// Cleanup all WebGL resources
export function destroyRenderer() {
  stopLoop();

  // Remove event listeners from canvas
  if (renderer?.domElement) {
    renderer.domElement.removeEventListener("pointerdown", () => {});
    renderer.domElement.removeEventListener("wheel", () => {});
  }

  // Dispose renderer
  if (renderer) {
    renderer.dispose();
    if (renderer.domElement?.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
  }

  // Dispose materials and geometries
  if (plane?.material) plane.material.dispose();
  if (plane?.geometry) plane.geometry.dispose();

  if (gridPlane?.material) gridPlane.material.dispose();
  if (gridPlane?.geometry) gridPlane.geometry.dispose();

  if (crtPass?.material) crtPass.material.dispose();
  if (crtPass?.geometry) crtPass.geometry.dispose();

  if (renderTarget) {
    renderTarget.dispose();
  }

  // Clear references
  container = null;
  renderer = null;
  scene = null;
  crtScene = null;
  camera = null;
  plane = null;
  gridPlane = null;
  crtPass = null;
  renderTarget = null;
}

// Update focus cell in shader uniforms
export function updateFocusCell(cellX, cellY) {
  if (plane?.material?.uniforms) {
    plane.material.uniforms.uFocusCell.value.set(cellX, cellY);
  }
}

// Update focus index in shader uniforms
export function updateFocusIndex(index) {
  if (plane?.material?.uniforms) {
    plane.material.uniforms.uFocusIndex.value = index;
  }
}
