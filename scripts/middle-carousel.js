import * as THREE from 'three';
import { lenis } from './lenis-scroll.js';

// Shared resources for performance
let sharedGeometry = null;
const textureCache = new Map();
let lastScrollTime = 0;
const SCROLL_THROTTLE_MS = 16; // ~60fps throttle for scroll updates

const vertexShader = `
uniform float uScrollSpeed;
uniform float uCurveStrength;
uniform float uCurveFrequency;

varying vec2 vUv;

#define PI 3.141592653

void main() {
  vec3 pos = position;
  vec3 worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;

  // X Displacement depending on the world position Y
  float xDisplacement = uCurveStrength * cos(worldPosition.y * uCurveFrequency);
  pos.x += xDisplacement;
  pos.x -= uCurveStrength;

  // Y Displacement according to the scroll speed
  float yDisplacement = -sin(uv.x * PI) * uScrollSpeed;
  pos.y += yDisplacement;

  gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );

  vUv = uv;
}
`;

const fragmentShader = `
precision highp float;

uniform sampler2D uTexture;
uniform vec2 uPlaneSizes;
uniform vec2 uImageSizes;

varying vec2 vUv;

void main() {
  vec2 ratio = vec2(
    min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
    min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
  );

  vec2 uv = vec2(
    vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
    vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
  );

  vec4 finalColor = texture2D(uTexture, uv);
  
  gl_FragColor = finalColor;
}
`;

const IMAGE_LIST = Array.from({ length: 20 }, (_, i) => `/middle-carousel/spotlight-${i + 1}.jpg`);

let renderer = null;
let scene = null;
let camera = null;
let containerEl = null;
let rafId = null;
let isRunning = false;
let resizeHandler = null;
let carousels = [];
let lenisUnsubscribe = null;

function mod(n, m) {
  return ((n % m) + m) % m;
}

class Carousel {
  constructor({ position, rotation, imageSize, gap, wheelFactor, wheelDirection, curveStrength, curveFrequency }) {
    this.group = new THREE.Group();
    this.meshes = [];
    this.imageSize = imageSize;
    this.gap = gap;
    this.wheelFactor = wheelFactor || 1;
    this.wheelDirection = wheelDirection || 1;
    this.curveStrength = curveStrength || 0;
    this.curveFrequency = curveFrequency || 0;
    
    this.group.position.set(...(position || [0, 0, 0]));
    this.group.rotation.set(...(rotation || [0, 0, 0]));
    
    this.totalHeight = IMAGE_LIST.length * gap + IMAGE_LIST.length * imageSize[1];
    
    this.createImages();
  }

  createImages() {
    // Reuse shared geometry across all meshes (8x8 segments is sufficient)
    if (!sharedGeometry) {
      sharedGeometry = new THREE.PlaneGeometry(1, 1, 8, 8);
    }
    const loader = new THREE.TextureLoader();

    IMAGE_LIST.forEach((url, index) => {
      // Cache textures to avoid reloading the same image across carousels
      let texture;
      if (textureCache.has(url)) {
        texture = textureCache.get(url);
      } else {
        texture = loader.load(url);
        texture.colorSpace = THREE.SRGBColorSpace;
        textureCache.set(url, texture);
      }

      const uniforms = {
        uTexture: { value: texture },
        uScrollSpeed: { value: 0.0 },
        uPlaneSizes: { value: new THREE.Vector2(this.imageSize[0], this.imageSize[1]) },
        uImageSizes: { value: new THREE.Vector2(1, 1) },
        uCurveStrength: { value: this.curveStrength },
        uCurveFrequency: { value: this.curveFrequency }
      };

      const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader
      });

      const mesh = new THREE.Mesh(sharedGeometry, material);
      mesh.scale.set(this.imageSize[0], this.imageSize[1], 1);
      mesh.position.set(0, index * (this.imageSize[1] + this.gap), 0);

      // Update image sizes after texture loads
      texture.onload = () => {
        uniforms.uImageSizes.value.set(texture.image.width, texture.image.height);
      };

      this.group.add(mesh);
      this.meshes.push(mesh);
    });
  }

  update() {
    const meshes = this.meshes;
    const len = meshes.length;
    const halfHeight = this.totalHeight / 2;
    const totalHeight = this.totalHeight;
    for (let i = 0; i < len; i++) {
      const mesh = meshes[i];
      mesh.position.y = mod(mesh.position.y + halfHeight, totalHeight) - halfHeight;
    }
  }

  onScroll(velocity) {
    // Pre-calculate scroll delta to avoid redundant math in loop
    const scrollDelta = velocity * 0.005 * this.wheelFactor * this.wheelDirection;
    const meshes = this.meshes;
    const len = meshes.length;
    for (let i = 0; i < len; i++) {
      const mesh = meshes[i];
      mesh.position.y -= scrollDelta;
      mesh.material.uniforms.uScrollSpeed.value = scrollDelta;
    }
  }

  addToScene(scene) {
    scene.add(this.group);
  }

  dispose() {
    this.meshes.forEach((mesh) => {
      // Don't dispose shared geometry - handled in destroyMiddleCarousel
      mesh.material.dispose();
    });
    this.meshes = [];
  }
}

function createCarousels() {
  // Left group (rotated PI/4)
  const leftGroup = new THREE.Group();
  leftGroup.rotation.z = Math.PI / 4;

  const leftCarousels = [
    new Carousel({
      position: [-1.3, 0, 0],
      imageSize: [2, 1.1],
      gap: 0.05,
      curveFrequency: 0.4,
      curveStrength: 1.2,
      wheelFactor: 0.1,
      wheelDirection: 1
    }),
    new Carousel({
      position: [-2.3, 0, 0],
      imageSize: [0.3, 0.4],
      gap: 0,
      wheelFactor: 0.2,
      curveFrequency: 0.4,
      curveStrength: 7.5,
      wheelDirection: -1
    }),
    new Carousel({
      position: [-0.4, 0, 0],
      imageSize: [0.3, 0.4],
      gap: 0,
      wheelFactor: 0.2,
      curveFrequency: 0.4,
      curveStrength: 7.5,
      wheelDirection: -1
    })
  ];

  leftCarousels.forEach(carousel => {
    leftGroup.add(carousel.group);
    carousels.push(carousel);
  });

  scene.add(leftGroup);

  // Right group (rotated PI/4)
  const rightGroup = new THREE.Group();
  rightGroup.rotation.z = Math.PI / 4;

  const rightCarousels = [
    new Carousel({
      position: [1.3, 0, 0],
      imageSize: [2, 1.1],
      gap: 0.05,
      curveFrequency: 0.4,
      curveStrength: -1.2,
      wheelFactor: 0.1,
      wheelDirection: -1
    }),
    new Carousel({
      position: [2.3, 0, 0],
      imageSize: [0.3, 0.4],
      gap: 0,
      wheelFactor: 0.2,
      curveFrequency: 0.4,
      curveStrength: -7.5,
      wheelDirection: 1
    }),
    new Carousel({
      position: [0.4, 0, 0],
      imageSize: [0.3, 0.4],
      gap: 0,
      wheelFactor: 0.2,
      curveFrequency: 0.4,
      curveStrength: -7.5,
      wheelDirection: 1
    })
  ];

  rightCarousels.forEach(carousel => {
    rightGroup.add(carousel.group);
    carousels.push(carousel);
  });

  scene.add(rightGroup);
}

function animate() {
  if (!isRunning) return;

  const len = carousels.length;
  for (let i = 0; i < len; i++) {
    carousels[i].update();
  }

  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }

  rafId = requestAnimationFrame(animate);
}

export function initMiddleCarousel() {
  if (isRunning) return;

  containerEl = document.querySelector('.middle-img');
  if (!containerEl) return;

  const bounds = containerEl.getBoundingClientRect();
  const width = bounds.width;
  const height = bounds.height;

  isRunning = true;

  // Create scene
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.set(0, 0, 3);

  // Create renderer with optimized settings
  renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' });
  renderer.setSize(width, height);
  // Cap pixel ratio at 1.5 to reduce GPU work on high-DPI screens
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x000000, 0);

  // Style the canvas
  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.top = '0';
  renderer.domElement.style.left = '0';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';

  // Clear container and add canvas
  containerEl.innerHTML = '';
  containerEl.appendChild(renderer.domElement);

  // Create carousels
  createCarousels();

  // Handle resize
  resizeHandler = () => {
    if (!containerEl || !renderer || !camera) return;
    const bounds = containerEl.getBoundingClientRect();
    camera.aspect = bounds.width / bounds.height;
    camera.updateProjectionMatrix();
    renderer.setSize(bounds.width, bounds.height);
  };
  window.addEventListener('resize', resizeHandler);

  // Connect to Lenis scroll with throttling
  if (lenis) {
    lenisUnsubscribe = lenis.on('scroll', ({ velocity }) => {
      const now = performance.now();
      // Throttle scroll updates to prevent excessive GPU work
      if (now - lastScrollTime < SCROLL_THROTTLE_MS) return;
      lastScrollTime = now;

      // Batch update all carousels
      for (let i = 0; i < carousels.length; i++) {
        carousels[i].onScroll(velocity);
      }
    });
  }

  // Start animation loop
  animate();
}

export function destroyMiddleCarousel() {
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

  if (lenisUnsubscribe) {
    lenisUnsubscribe();
    lenisUnsubscribe = null;
  }

  carousels.forEach(carousel => carousel.dispose());
  carousels = [];

  // Clean up shared geometry
  if (sharedGeometry) {
    sharedGeometry.dispose();
    sharedGeometry = null;
  }

  // Clean up texture cache
  textureCache.forEach(texture => texture.dispose());
  textureCache.clear();

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
