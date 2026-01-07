import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

let renderer = null;
let composer = null;
let camera = null;
let scene = null;
let resizeHandler = null;
let mouseHandler = null;
let rafId = null;
let containerEl = null;
let isRunning = false;

export function webgl() {
  if (isRunning) return;
  isRunning = true;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  containerEl = document.querySelector('#background');
  if (!containerEl) {
    containerEl = document.createElement('div');
    containerEl.id = 'background';
    // place near top of body to sit behind main content
    const firstChild = document.body.firstChild;
    document.body.insertBefore(containerEl, firstChild);
  }
  containerEl.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  const loader = new GLTFLoader();
  const modelUrl = '/home/scene.glb';
  loader.load(
    modelUrl,
    (glb) => {
      scene.add(glb.scene);
    },
    undefined,
    (err) => console.error('GLTF load error:', err)
  );

  resizeHandler = () => {
    if (!camera || !renderer || !composer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener('resize', resizeHandler);

  composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);
  const outputPass = new OutputPass();
  composer.addPass(outputPass);

  let mousePos = { x: 0, y: 0 };
  let cameraTarget = { angle: Math.PI / 2, y: 0 };
  let cameraCurrent = { angle: Math.PI / 2, y: 0 };
  const BASE_CAMERA_RADIUS = Math.sqrt(50) / 2.5;

  mouseHandler = (event) => {
    mousePos.x = (event.clientX / window.innerWidth) * 2 - 1;
    mousePos.y = -(event.clientY / window.innerHeight) * 2 + 1;
    cameraTarget.angle = Math.PI / 2 - mousePos.x * 0.1;
    cameraTarget.y = mousePos.y * 0.4;
  };
  document.addEventListener('mousemove', mouseHandler);

  const render = () => {
    cameraCurrent.angle += (cameraTarget.angle - cameraCurrent.angle) * 0.025;
    cameraCurrent.y += (cameraTarget.y - cameraCurrent.y) * 0.025;

    const scrollY = window.scrollY;
    const zoomSpeed = 0.001;
    const currentRadius = Math.max(0.5, BASE_CAMERA_RADIUS - (scrollY * zoomSpeed));

    camera.position.x = Math.cos(cameraCurrent.angle) * currentRadius;
    camera.position.z = Math.sin(cameraCurrent.angle) * currentRadius;
    camera.position.y += (cameraCurrent.y + 1 - camera.position.y);

    camera.lookAt(0, 0, 0);
    composer.render();
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
    document.removeEventListener('mousemove', mouseHandler);
    mouseHandler = null;
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
  containerEl = null;
}

export default webgl;