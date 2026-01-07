import * as THREE from "three";
import { GLTFLoader } from "three-stdlib";
import { EffectComposer, RenderPass, EffectPass } from "postprocessing";
import { ASCIIEffect } from "./ascii-effect.js";
import { projects } from "./data.js";
import { vertexShader, fragmentShader } from "./shaders.js";

const config = {
  cellSize: 0.78,
  zoomLevel: 1.25,
  lerpFactor: 0.075,
  borderColor: "rgba(255, 255, 255, 0.15)",
  backgroundColor: "rgba(0, 0, 0, 0)",
  textColor: "rgba(128, 128, 128, 1)",
  hoverColor: "rgba(255, 255, 255, 0)",
  // Playful layout controls
  jitterAmount: 0.12,       // 0..~0.3 position jitter per cell (in cell UV units)
  maxRotation: 0.10,        // radians (~5.7 degrees)
  scaleVariance: 0.85,      // 0..1 how much size varies per cell
  emptyProbability: 0.10    // 10% cells are empty for breathing space
};

let scene, camera, renderer, plane, logoModel, composer;
const clock = new THREE.Clock();
let isDragging = false,
  isClick = true,
  clickStartTime = 0;
let previousMouse = { x: 0, y: 0 };
let offset = { x: 0, y: 0 },
  targetOffset = { x: 0, y: 0 };
let parallaxOffset = { x: 0, y: 0 },
  targetParallaxOffset = { x: 0, y: 0 };
let mousePosition = { x: -1, y: -1 };
let zoomLevel = 1.0,
  targetZoom = 1.0;
let distortionStrength = 0.08,
  targetDistortion = 0.08;
let isRunning = false;
let animationId = null;
let listeners = [];
let disposables = [];

// Auto-rotation parameters
const autoRotate = {
  enabled: true,
  speed: 0.001
};



// Drag rotation momentum
const dragRotation = {
  velocityX: 0,
  targetVelocityX: 0,
  friction: 0.90,
  sensitivity: 0.002
};

const rgbaToArray = (rgba) => {
  const match = rgba.match(/rgba?\(([^)]+)\)/);
  if (!match) return [1, 1, 1, 1];
  return match[1]
    .split(",")
    .map((v, i) =>
      i < 3 ? parseFloat(v.trim()) / 255 : parseFloat(v.trim() || 1)
    );
};

const createTextureAtlas = (textures) => {
  const atlasSize = Math.ceil(Math.sqrt(textures.length));
  const textureSize = 512;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = atlasSize * textureSize;
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  textures.forEach((texture, index) => {
    const x = (index % atlasSize) * textureSize;
    const y = Math.floor(index / atlasSize) * textureSize;

    if (texture.image?.complete) {
      const img = texture.image;
      const aspect = img.width / img.height;
      let drawW = textureSize;
      let drawH = textureSize;
      let drawX = x;
      let drawY = y;

      if (aspect > 1) {
        drawH = textureSize / aspect;
        drawY = y + (textureSize - drawH) / 2;
      } else {
        drawW = textureSize * aspect;
        drawX = x + (textureSize - drawW) / 2;
      }
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
    }
  });

  const atlasTexture = new THREE.CanvasTexture(canvas);
  Object.assign(atlasTexture, {
    wrapS: THREE.ClampToEdgeWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    flipY: false,
  });

  return atlasTexture;
};

const loadTextures = () => {
  const textureLoader = new THREE.TextureLoader();
  const imageTextures = [];
  let loadedCount = 0;

  return new Promise((resolve) => {
    projects.forEach((project) => {
      const texture = textureLoader.load(project.image, () => {
        if (++loadedCount === projects.length) resolve(imageTextures);
      });

      Object.assign(texture, {
        wrapS: THREE.ClampToEdgeWrapping,
        wrapT: THREE.ClampToEdgeWrapping,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
      });

      imageTextures.push(texture);
      disposables.push(texture);
    });
  });
};

const updateMousePosition = (event) => {
  const rect = renderer.domElement.getBoundingClientRect();
  mousePosition.x = event.clientX - rect.left;
  mousePosition.y = event.clientY - rect.top;
  plane?.material.uniforms.uMousePos.value.set(
    mousePosition.x,
    mousePosition.y
  );

  // Parallax calculation for grid
  const ndcX = (mousePosition.x / rect.width) * 2 - 1;
  const ndcY = -(mousePosition.y / rect.height) * 2 + 1;
  const parallaxStrength = 0.05; // Adjust for more/less movement
  targetParallaxOffset.x = ndcX * parallaxStrength;
  targetParallaxOffset.y = ndcY * parallaxStrength;
};

const startDrag = (x, y) => {
  isDragging = true;
  isClick = true;
  clickStartTime = Date.now();
  document.body.classList.add("dragging");
  previousMouse.x = x;
  previousMouse.y = y;
  
  // Immediate zoom response
  targetZoom = config.zoomLevel;
  targetDistortion = 0.0; // Flatten view when dragging/zoomed out
};

const onPointerDown = (e) => startDrag(e.clientX, e.clientY);
const onTouchStart = (e) => {
  e.preventDefault();
  startDrag(e.touches[0].clientX, e.touches[0].clientY);
};

const handleMove = (currentX, currentY) => {
  if (!isDragging || currentX === undefined || currentY === undefined) return;

  const deltaX = currentX - previousMouse.x;
  const deltaY = currentY - previousMouse.y;

  if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
    isClick = false;
    if (targetZoom === 1.0) targetZoom = config.zoomLevel;
  }

  targetOffset.x -= deltaX * 0.003;
  targetOffset.y += deltaY * 0.003;
  
  // Calculate drag velocity for rotation
  // Negative deltaX means dragging left -> should spin right (positive rotation)?
  // Or dragging left moves content left -> spin left?
  // Usually dragging background left moves camera right -> object appears to rotate left.
  // Let's map drag speed to rotation velocity.
  dragRotation.targetVelocityX = -deltaX * dragRotation.sensitivity;

  previousMouse.x = currentX;
  previousMouse.y = currentY;
};

const onPointerMove = (e) => handleMove(e.clientX, e.clientY);
const onTouchMove = (e) => {
  e.preventDefault();
  handleMove(e.touches[0].clientX, e.touches[0].clientY);
};

const onPointerUp = (event) => {
  isDragging = false;
  document.body.classList.remove("dragging");
  targetZoom = 1.0;
  targetDistortion = 0.08; // Restore distortion
  
  // Reset target velocity on release so it slows down via friction
  dragRotation.targetVelocityX = 0;

  if (isClick && Date.now() - clickStartTime < 200) {
    const endX = event.clientX || event.changedTouches?.[0]?.clientX;
    const endY = event.clientY || event.changedTouches?.[0]?.clientY;

    if (endX !== undefined && endY !== undefined) {
      const rect = renderer.domElement.getBoundingClientRect();
      const screenX = ((endX - rect.left) / rect.width) * 2 - 1;
      const screenY = -(((endY - rect.top) / rect.height) * 2 - 1);

      const radius = Math.sqrt(screenX * screenX + screenY * screenY);
      const distortion = 1.0 - 0.08 * radius * radius;

      let worldX =
        screenX * distortion * (rect.width / rect.height) * zoomLevel +
        offset.x;
      let worldY = screenY * distortion * zoomLevel + offset.y;

      const cellX = Math.floor(worldX / config.cellSize);
      const cellY = Math.floor(worldY / config.cellSize);
      const texIndex = Math.floor((cellX + cellY * 3.0) % projects.length);
      const actualIndex = texIndex < 0 ? projects.length + texIndex : texIndex;

      if (projects[actualIndex]?.href) {
        window.location.href = projects[actualIndex].href;
      }
    }
  }
};

  const onWindowResize = () => {
    const container = document.getElementById("gallery");
    if (!container || !renderer) return;

    const width = Math.max(1, container.offsetWidth || window.innerWidth || 1);
    const height = Math.max(1, container.offsetHeight || window.innerHeight || 1);
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    if (composer) composer.setSize(width, height);
    plane?.material.uniforms.uResolution.value.set(width, height);
  };

const addListener = (target, type, handler, opts) => {
  target.addEventListener(type, handler, opts);
  listeners.push({ target, type, handler, opts });
};

const setupEventListeners = () => {
  addListener(document, "mousedown", onPointerDown);
  addListener(document, "mousemove", onPointerMove);
  addListener(document, "mouseup", onPointerUp);
  addListener(document, "mouseleave", onPointerUp);

  const passiveOpts = { passive: false };
  addListener(document, "touchstart", onTouchStart, passiveOpts);
  addListener(document, "touchmove", onTouchMove, passiveOpts);
  addListener(document, "touchend", onPointerUp, passiveOpts);

  addListener(window, "resize", onWindowResize);
  addListener(document, "contextmenu", (e) => e.preventDefault());

  addListener(renderer.domElement, "mousemove", updateMousePosition);
  addListener(renderer.domElement, "mouseleave", () => {
    mousePosition.x = mousePosition.y = -1;
    plane?.material.uniforms.uMousePos.value.set(-1, -1);
    targetParallaxOffset.x = 0;
    targetParallaxOffset.y = 0;
  });

  addListener(window, "wheel", (e) => {
    e.preventDefault();
    const sensitivity = 0.002;
    targetOffset.x += e.deltaX * sensitivity;
    targetOffset.y -= e.deltaY * sensitivity;
  }, { passive: false });
};

const animate = () => {
  if (!isRunning) return;
  animationId = requestAnimationFrame(animate);

  offset.x += (targetOffset.x - offset.x) * config.lerpFactor;
  offset.y += (targetOffset.y - offset.y) * config.lerpFactor;
  
  // Easing for parallax
  parallaxOffset.x += (targetParallaxOffset.x - parallaxOffset.x) * 0.05;
  parallaxOffset.y += (targetParallaxOffset.y - parallaxOffset.y) * 0.05;
  
  // Faster zoom transition
  zoomLevel += (targetZoom - zoomLevel) * 0.15;
  distortionStrength += (targetDistortion - distortionStrength) * config.lerpFactor;

  // Update logo rotation and parallax
  if (logoModel) {
    // 2. Drag Rotation (Spin)
    // Apply friction to velocity
    if (isDragging) {
       // While dragging, velocity is set by mouse movement in handleMove
       // We lerp to the target velocity to smooth out jitter
       dragRotation.velocityX += (dragRotation.targetVelocityX - dragRotation.velocityX) * 0.2;
    } else {
       // When released, apply friction to slow down
       dragRotation.velocityX *= dragRotation.friction;
    }
    
    // Apply the rotation speed
    // Add auto-rotate speed if enabled, plus the drag momentum
    const baseSpeed = autoRotate.enabled ? autoRotate.speed : 0;
    logoModel.rotation.y += baseSpeed + dragRotation.velocityX;
  }

  if (plane?.material.uniforms) {
    plane.material.uniforms.uOffset.value.set(
      offset.x + parallaxOffset.x,
      offset.y + parallaxOffset.y
    );
    plane.material.uniforms.uZoom.value = zoomLevel;
    plane.material.uniforms.uDistortion.value = distortionStrength;
    plane.material.uniforms.uTime.value = performance.now() * 0.001;
  }

  // Render the logo with ASCII effect first
  if (logoModel && composer) {
    // Hide the grid plane temporarily
    if (plane) plane.visible = false;
    
    // Render the logo scene through the composer (which has the ASCII effect)
    composer.render(clock.getDelta());
    
    // Show the grid plane again
    if (plane) plane.visible = true;
    
    // Hide the logo so it doesn't get rendered again in the normal pass
    logoModel.visible = false;
  }

  // Render the grid on top (without ASCII effect)
  // We need to clear depth but not color so the logo shows through
  renderer.autoClear = false;
  renderer.clearDepth();
  renderer.render(scene, camera);
  renderer.autoClear = true;
  
  // Restore logo visibility for next frame
  if (logoModel) logoModel.visible = true;
};

const init = async () => {
  const container = document.getElementById("gallery");
  if (!container) return;

  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  camera.position.z = 1;

  const initWidth = Math.max(1, container.offsetWidth || window.innerWidth || 1);
  const initHeight = Math.max(1, container.offsetHeight || window.innerHeight || 1);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(initWidth, initHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;

  const bgColor = rgbaToArray(config.backgroundColor);
  renderer.setClearColor(
    new THREE.Color(bgColor[0], bgColor[1], bgColor[2]),
    bgColor[3]
  );
  container.appendChild(renderer.domElement);

  // Add lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 800);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 3900);
  directionalLight.position.set(2, 2, 2);
  scene.add(directionalLight);

  const pointLight = new THREE.PointLight(0xffffff, 2, 100);
  pointLight.position.set(0, 0, 2);
  scene.add(pointLight);

  // Load the 3D logo model
  const gltfLoader = new GLTFLoader();
  gltfLoader.load(
    '/home/scene.glb',
    (gltf) => {
    logoModel = gltf.scene;
    
    // Position the logo behind the image plane (using reference settings)
    logoModel.position.set(0, 0, -2);
    
    // Scale it appropriately
    logoModel.scale.set(25, 40, 40);
    
    scene.add(logoModel);

    // Setup Post-Processing for ASCII effect
    composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const asciiEffect = new ASCIIEffect({
      fontSize: 54,
      cellSize: 16,
      color: "#ffffff"
    });
    
    // Combine effects into a single pass to ensure they process sequentially on the same buffer
    const effectPass = new EffectPass(camera, asciiEffect);
    composer.addPass(effectPass);
  },
  undefined,
  (error) => {
    console.error('Failed to load /newlogo.glb. ASCII/GUI skipped.', error);
  }
  );

  const imageTextures = await loadTextures();
  const imageAtlas = createTextureAtlas(imageTextures);
  disposables.push(imageAtlas);

  const uniforms = {
    uOffset: { value: new THREE.Vector2(0, 0) },
    uResolution: {
      value: new THREE.Vector2(container.offsetWidth, container.offsetHeight),
    },
    uBorderColor: {
      value: new THREE.Vector4(...rgbaToArray(config.borderColor)),
    },
    uHoverColor: {
      value: new THREE.Vector4(...rgbaToArray(config.hoverColor)),
    },
    uMousePos: { value: new THREE.Vector2(-1, -1) },
    uZoom: { value: 1.0 },
    uDistortion: { value: 0.08 },
    uTime: { value: 0 },
    uCellSize: { value: config.cellSize },
    uTextureCount: { value: projects.length },
    uImageAtlas: { value: imageAtlas },
    // Playful layout uniforms
    uJitterAmount: { value: config.jitterAmount },
    uMaxRotation: { value: config.maxRotation },
    uScaleVariance: { value: config.scaleVariance },
    uEmptyProbability: { value: config.emptyProbability },
  };

  const geometry = new THREE.PlaneGeometry(2, 2);
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    transparent: true,
  });

  plane = new THREE.Mesh(geometry, material);
  scene.add(plane);

  setupEventListeners();
  isRunning = true;
  animate();
};

export async function initInfiniteGrid() {
  if (isRunning) return;
  await init();
}

export function destroyInfiniteGrid() {
  if (!isRunning) return;
  isRunning = false;
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }

  listeners.forEach(({ target, type, handler, opts }) => target.removeEventListener(type, handler, opts));
  listeners = [];

  if (renderer) {
    renderer.dispose();
    if (renderer.domElement?.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
  }
  if (composer) composer.dispose();
  if (plane?.material) plane.material.dispose();
  if (plane?.geometry) plane.geometry.dispose();
  plane = null;
  scene = null;
  camera = null;
  if (logoModel) logoModel = null;

  disposables.forEach((tex) => tex?.dispose?.());
  disposables = [];
}
