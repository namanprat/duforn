import * as THREE from "three";
import { GLTFLoader } from "three-stdlib";
import { EffectComposer, RenderPass, EffectPass } from "postprocessing";
import { ASCIIEffect } from "./ascii-effect.js";
import { projects } from "./data.js";
import { vertexShader, fragmentShader } from "./shaders.js";
import gsap from "gsap";

// --- Configuration ---
const config = {
  cellSize: 0.75,
  zoomLevel: 1.25,
  lerpFactor: 0.05, // Slowed down by ~30%
  borderColor: "rgba(255, 255, 255, 0.15)",
  backgroundColor: "rgba(0, 0, 0, 0)",
  textColor: "rgba(128, 128, 128, 1)",
  hoverColor: "rgba(255, 255, 255, 0)",
};

// --- State Variables ---
let renderer, composer;
let isRunning = false;
let animationId = null;
let listeners = [];
let disposables = [];

// Background Scene (3D Model + ASCII)
let sceneBackground, cameraBackground, model, asciiEffect;
let mousePos = { x: 0, y: 0 };
let cameraTarget = { angle: Math.PI / 2, y: 0 };
let cameraCurrent = { angle: Math.PI / 2, y: 0 };
const BASE_CAMERA_RADIUS = Math.sqrt(50) / 2.5;

// Grid Scene (Infinite Grid)
let sceneGrid, cameraGrid, plane;
let isDragging = false, isClick = true, clickStartTime = 0;
let previousMouse = { x: 0, y: 0 };
let offset = { x: 0, y: 0 }, targetOffset = { x: 0, y: 0 };
let parallaxOffset = { x: 0, y: 0 }, targetParallaxOffset = { x: 0, y: 0 };
let gridMousePosition = { x: -1, y: -1 };
let zoomLevel = 1.0, targetZoom = 1.0;
let distortionStrength = 0.08, targetDistortion = 0.08;

// Focus Mode State
let focusedIndex = -1;
let focusState = { value: 0 };
let asciiOpacity = { value: 1 };
let currentFocusCell = { x: 0, y: 0 }; // Track the specific cell we focused on

// --- Helper Functions ---
const rgbaToArray = (rgba) => {
  const match = rgba.match(/rgba?\(([^)]+)\)/);
  if (!match) return [1, 1, 1, 1];
  return match[1].split(",").map((v, i) => i < 3 ? parseFloat(v.trim()) / 255 : parseFloat(v.trim() || 1));
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
      let drawW = textureSize, drawH = textureSize, drawX = x, drawY = y;
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

// Find the nearest cell to (centerX, centerY) that maps to targetIndex
const findNearestCellForIndex = (targetIndex, centerX, centerY) => {
  let bestCell = { x: 0, y: 0 };
  let minDist = Infinity;
  const radius = 20; // Increased search radius

  const cx = Math.round(centerX);
  const cy = Math.round(centerY);

  for (let x = cx - radius; x <= cx + radius; x++) {
    for (let y = cy - radius; y <= cy + radius; y++) {
      // Calculate index for this cell
      // Formula from shader: mod(cellId.x + cellId.y * 3.0, uTextureCount)
      let idx = (x + y * 3) % projects.length;
      if (idx < 0) idx += projects.length;
      
      if (idx === targetIndex) {
        const dist = (x - centerX) ** 2 + (y - centerY) ** 2;
        if (dist < minDist) {
          minDist = dist;
          bestCell = { x, y };
        }
      }
    }
  }
  
  if (minDist === Infinity) {
      console.warn("Could not find nearest cell for index", targetIndex);
      return { x: cx, y: cy }; // Fallback
  }
  
  return bestCell;
};

const wrapChars = (text) => text.split('').map(c => `<span style="display:inline-block; will-change: transform;">${c === ' ' ? '&nbsp;' : c}</span>`).join('');

const animateTitle = (element, newText) => {
    // If current text is not wrapped, wrap it
    if (!element.querySelector('span')) {
        element.innerHTML = wrapChars(element.textContent);
    }
    
    const oldChars = element.querySelectorAll('span');
    
    gsap.to(oldChars, {
        y: "100%",
        opacity: 0,
        stagger: 0.02,
        duration: 0.4,
        ease: "power2.in",
        onComplete: () => {
            element.innerHTML = wrapChars(newText);
            const newChars = element.querySelectorAll('span');
            gsap.fromTo(newChars, 
                { y: "100%", opacity: 0 },
                { y: "0%", opacity: 1, stagger: 0.02, duration: 0.4, ease: "power2.out" }
            );
        }
    });
};

// --- Focus Mode Logic ---
const updateDOMOverlay = (index) => {
  const overlay = document.getElementById("archive-overlay");
  const title = document.getElementById("archive-title");
  const year = document.getElementById("archive-year");
  
  if (index !== -1) {
    const newTitleText = projects[index].title;
    const newYearText = projects[index].year;

    if (title) {
        // Check if overlay is already visible (navigation mode)
        if (overlay.style.opacity === "1" && title.textContent.replace(/\u00a0/g, ' ') !== newTitleText) {
             animateTitle(title, newTitleText);
        } else {
             // Initial open or same title
             title.innerHTML = wrapChars(newTitleText);
             gsap.set(title.querySelectorAll('span'), { y: "0%", opacity: 1 });
        }
    }
    
    if (year) year.textContent = newYearText;
    
    if (overlay) {
      overlay.style.opacity = "1";
      overlay.style.pointerEvents = "auto";
    }
  } else {
    if (overlay) {
      overlay.style.opacity = "0";
      overlay.style.pointerEvents = "none";
    }
  }
};

const enterFocusMode = (index, cellX, cellY) => {
  if (focusedIndex === index && currentFocusCell.x === cellX && currentFocusCell.y === cellY) return;
  
  focusedIndex = index;
  currentFocusCell = { x: cellX, y: cellY };
  
  // Update Shader Uniforms
  if (plane?.material?.uniforms) {
    plane.material.uniforms.uFocusIndex.value = index;
  }

  // Animate Values
  gsap.to(focusState, {
    value: 1,
    duration: 0.8,
    ease: "power3.out",
    onUpdate: () => {
      if (plane?.material?.uniforms) {
        plane.material.uniforms.uFocusState.value = focusState.value;
      }
    }
  });

  gsap.to(asciiOpacity, {
    value: 0.05,
    duration: 0.8,
    ease: "power3.out",
    onUpdate: () => {
      if (asciiEffect?.uniforms.get('uOpacity')) {
        asciiEffect.uniforms.get('uOpacity').value = asciiOpacity.value;
      }
    }
  });

  // Center Camera on Cell
  const targetX = (cellX + 0.5) * config.cellSize;
  const targetY = (cellY + 0.5) * config.cellSize;
  
  targetOffset.x = targetX;
  targetOffset.y = targetY;

  updateDOMOverlay(index);
};

const exitFocusMode = () => {
  if (focusedIndex === -1) return;
  
  focusedIndex = -1;
  
  gsap.to(focusState, {
    value: 0,
    duration: 0.6,
    ease: "power3.out",
    onUpdate: () => {
      if (plane?.material?.uniforms) {
        plane.material.uniforms.uFocusState.value = focusState.value;
      }
    }
  });

  gsap.to(asciiOpacity, {
    value: 1,
    duration: 0.6,
    ease: "power3.out",
    onUpdate: () => {
      if (asciiEffect?.uniforms.get('uOpacity')) {
        asciiEffect.uniforms.get('uOpacity').value = asciiOpacity.value;
      }
    }
  });

  updateDOMOverlay(-1);
};

const navigateProject = (direction) => {
  if (focusedIndex === -1) return;
  
  let nextIndex = focusedIndex + direction;
  if (nextIndex >= projects.length) nextIndex = 0;
  if (nextIndex < 0) nextIndex = projects.length - 1;
  
  // Find nearest cell for this index relative to current focus
  const currentCX = currentFocusCell.x;
  const currentCY = currentFocusCell.y;
  
  const nextCell = findNearestCellForIndex(nextIndex, currentCX, currentCY);
  enterFocusMode(nextIndex, nextCell.x, nextCell.y);
};

// --- Event Handlers ---
const onWindowResize = () => {
  const container = document.getElementById("gallery");
  if (!container || !renderer) return;

  const width = Math.max(1, container.offsetWidth || window.innerWidth || 1);
  const height = Math.max(1, container.offsetHeight || window.innerHeight || 1);

  if (cameraBackground) {
    cameraBackground.aspect = width / height;
    cameraBackground.updateProjectionMatrix();
  }

  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  if (composer) composer.setSize(width, height);
  
  if (plane?.material?.uniforms) {
    plane.material.uniforms.uResolution.value.set(width, height);
  }
};

const onMouseMove = (event) => {
  // 1. Background Camera Logic
  mousePos.x = (event.clientX / window.innerWidth) * 2 - 1;
  mousePos.y = -(event.clientY / window.innerHeight) * 2 + 1;
  cameraTarget.angle = Math.PI / 2 - mousePos.x * 0.1;
  cameraTarget.y = mousePos.y * 0.4;

  // 2. Grid Logic
  if (!renderer) return;
  const rect = renderer.domElement.getBoundingClientRect();
  gridMousePosition.x = event.clientX - rect.left;
  gridMousePosition.y = event.clientY - rect.top;
  
  if (plane?.material?.uniforms) {
    plane.material.uniforms.uMousePos.value.set(gridMousePosition.x, gridMousePosition.y);
  }

  // Parallax for grid (disable if focused)
  const ndcX = (gridMousePosition.x / rect.width) * 2 - 1;
  const ndcY = -(gridMousePosition.y / rect.height) * 2 + 1;
  const parallaxStrength = focusedIndex !== -1 ? 0.0 : 0.05; // Disabled when focused
  targetParallaxOffset.x = ndcX * parallaxStrength;
  targetParallaxOffset.y = ndcY * parallaxStrength;

  // Drag Logic
  if (isDragging) {
    const deltaX = event.clientX - previousMouse.x;
    const deltaY = event.clientY - previousMouse.y;

    if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
      isClick = false;
      if (targetZoom === 1.0) targetZoom = config.zoomLevel;
      
      // If dragging while focused, exit focus mode
      if (focusedIndex !== -1) {
        exitFocusMode();
      }
    }

    targetOffset.x -= deltaX * 0.003;
    targetOffset.y += deltaY * 0.003;

    previousMouse.x = event.clientX;
    previousMouse.y = event.clientY;
  }
};

const startDrag = (x, y) => {
  isDragging = true;
  isClick = true;
  clickStartTime = Date.now();
  document.body.classList.add("dragging");
  previousMouse.x = x;
  previousMouse.y = y;
  targetDistortion = 0.0;
};

const onPointerDown = (e) => {
  // Ignore clicks on UI buttons
  if (e.target.closest('.nav-btn') || e.target.closest('#archive-close')) return;
  startDrag(e.clientX, e.clientY);
  // Immediately zoom out on mousedown (same as dragging)
  if (targetZoom === 1.0) targetZoom = config.zoomLevel;
};

const onTouchStart = (e) => {
  if (e.target.closest('.nav-btn') || e.target.closest('#archive-close')) return;
  e.preventDefault();
  startDrag(e.touches[0].clientX, e.touches[0].clientY);
  // Immediately zoom out on touch down (same as dragging)
  if (targetZoom === 1.0) targetZoom = config.zoomLevel;
};

const onPointerUp = (event) => {
  isDragging = false;
  document.body.classList.remove("dragging");
  targetZoom = 1.0;
  targetDistortion = 0.08;

  if (isClick && Date.now() - clickStartTime < 200) {
    const endX = event.clientX || event.changedTouches?.[0]?.clientX;
    const endY = event.clientY || event.changedTouches?.[0]?.clientY;

    if (endX !== undefined && endY !== undefined && renderer) {
      const rect = renderer.domElement.getBoundingClientRect();
      const screenX = ((endX - rect.left) / rect.width) * 2 - 1;
      const screenY = -(((endY - rect.top) / rect.height) * 2 - 1);

      const radius = Math.sqrt(screenX * screenX + screenY * screenY);
      const distortion = 1.0 - 0.08 * radius * radius;

      let worldX = screenX * distortion * (rect.width / rect.height) * zoomLevel + offset.x;
      let worldY = screenY * distortion * zoomLevel + offset.y;

      const cellX = Math.floor(worldX / config.cellSize);
      const cellY = Math.floor(worldY / config.cellSize);
      
      // Calculate UV within the cell to detect "whitespace" (gaps between images)
      const cellUVX = worldX / config.cellSize - cellX;
      const cellUVY = worldY / config.cellSize - cellY;
      
      // Shader uses approx 0.6 image size centered. 
      // So image is from 0.2 to 0.8.
      // Let's be slightly generous with the hit area, say 0.15 to 0.85.
      const isClickOnImage = cellUVX > 0.15 && cellUVX < 0.85 && cellUVY > 0.15 && cellUVY < 0.85;

      const texIndex = Math.floor((cellX + cellY * 3.0) % projects.length);
      const actualIndex = texIndex < 0 ? projects.length + texIndex : texIndex;

      // Click Logic
      if (focusedIndex === -1) {
        // Enter Focus if clicked on an image
        if (isClickOnImage) {
            enterFocusMode(actualIndex, cellX, cellY);
        }
      } else {
        // If already focused
        if (!isClickOnImage) {
            // Clicked on whitespace -> Exit
            exitFocusMode();
        } else {
            // Clicked on an image
            if (actualIndex !== focusedIndex || cellX !== currentFocusCell.x || cellY !== currentFocusCell.y) {
               enterFocusMode(actualIndex, cellX, cellY);
            }
        }
      }
    }
  }
};

const onKeyDown = (e) => {
  if (focusedIndex === -1) return;
  
  if (e.key === "ArrowRight") navigateProject(1);
  if (e.key === "ArrowLeft") navigateProject(-1);
  if (e.key === "Escape") exitFocusMode();
};

const addListener = (target, type, handler, opts) => {
  target.addEventListener(type, handler, opts);
  listeners.push({ target, type, handler, opts });
};

const setupEventListeners = () => {
  addListener(document, "mousedown", onPointerDown);
  addListener(document, "mousemove", onMouseMove);
  addListener(document, "mouseup", onPointerUp);
  addListener(document, "mouseleave", onPointerUp);

  const passiveOpts = { passive: false };
  addListener(document, "touchstart", onTouchStart, passiveOpts);
  addListener(document, "touchmove", (e) => {
    e.preventDefault();
    if (isDragging) {
        const touch = e.touches[0];
        const deltaX = touch.clientX - previousMouse.x;
        const deltaY = touch.clientY - previousMouse.y;
        
        if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
            isClick = false;
            if (targetZoom === 1.0) targetZoom = config.zoomLevel;
            if (focusedIndex !== -1) exitFocusMode();
        }
        
        targetOffset.x -= deltaX * 0.003;
        targetOffset.y += deltaY * 0.003;
        
        previousMouse.x = touch.clientX;
        previousMouse.y = touch.clientY;
    }
  }, passiveOpts);
  addListener(document, "touchend", onPointerUp, passiveOpts);

  addListener(window, "resize", onWindowResize);
  addListener(document, "contextmenu", (e) => e.preventDefault());
  addListener(window, "keydown", onKeyDown);

  addListener(window, "wheel", (e) => {
    e.preventDefault();
    const sensitivity = 0.002;
    targetOffset.x += e.deltaX * sensitivity;
    targetOffset.y -= e.deltaY * sensitivity;
    
    // Exit focus on scroll?
    if (focusedIndex !== -1 && (Math.abs(e.deltaX) > 5 || Math.abs(e.deltaY) > 5)) {
        exitFocusMode();
    }
  }, { passive: false });

  // UI Buttons
  const closeBtn = document.getElementById("archive-close");
  const prevBtn = document.getElementById("archive-prev");
  const nextBtn = document.getElementById("archive-next");

  if (closeBtn) addListener(closeBtn, "click", (e) => { e.stopPropagation(); exitFocusMode(); });
  if (prevBtn) addListener(prevBtn, "click", (e) => { e.stopPropagation(); navigateProject(-1); });
  if (nextBtn) addListener(nextBtn, "click", (e) => { e.stopPropagation(); navigateProject(1); });
};

// --- Animation Loop ---
const animate = () => {
  if (!isRunning) return;
  animationId = requestAnimationFrame(animate);

  // 1. Update Background Camera (Perspective)
  cameraCurrent.angle += (cameraTarget.angle - cameraCurrent.angle) * 0.025;
  cameraCurrent.y += (cameraTarget.y - cameraCurrent.y) * 0.025;

  const scrollY = window.scrollY;
  const zoomSpeed = 0.001;
  const currentRadius = Math.max(0.5, BASE_CAMERA_RADIUS - (scrollY * zoomSpeed));

  if (cameraBackground) {
    cameraBackground.position.x = Math.cos(cameraCurrent.angle) * currentRadius;
    cameraBackground.position.z = Math.sin(cameraCurrent.angle) * currentRadius;
    cameraBackground.position.y = cameraCurrent.y + 1;
    cameraBackground.lookAt(0, 0, 0);
  }

  // 2. Update Grid State
  offset.x += (targetOffset.x - offset.x) * config.lerpFactor;
  offset.y += (targetOffset.y - offset.y) * config.lerpFactor;
  parallaxOffset.x += (targetParallaxOffset.x - parallaxOffset.x) * 0.05;
  parallaxOffset.y += (targetParallaxOffset.y - parallaxOffset.y) * 0.05;
  zoomLevel += (targetZoom - zoomLevel) * 0.15;
  distortionStrength += (targetDistortion - distortionStrength) * config.lerpFactor;

  if (plane?.material?.uniforms) {
    plane.material.uniforms.uOffset.value.set(offset.x + parallaxOffset.x, offset.y + parallaxOffset.y);
    plane.material.uniforms.uZoom.value = zoomLevel;
    plane.material.uniforms.uDistortion.value = distortionStrength;
    plane.material.uniforms.uTime.value = performance.now() * 0.001;
  }

  // 3. Render
  if (composer) {
    composer.render();
  }

  if (renderer && sceneGrid && cameraGrid) {
    renderer.autoClear = false;
    renderer.clearDepth();
    renderer.render(sceneGrid, cameraGrid);
    renderer.autoClear = true;
  }
};

// --- Initialization ---
const init = async () => {
  const container = document.getElementById("gallery");
  if (!container) return;

  const width = Math.max(1, container.offsetWidth || window.innerWidth || 1);
  const height = Math.max(1, container.offsetHeight || window.innerHeight || 1);

  // 1. Setup Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  // 2. Setup Background Scene
  sceneBackground = new THREE.Scene();
  cameraBackground = new THREE.PerspectiveCamera(100, width / height, 0.1, 1000);
  
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  sceneBackground.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 5, 5);
  sceneBackground.add(directionalLight);

  const gltfLoader = new GLTFLoader();
  gltfLoader.load('/home/scene.glb', (gltf) => {
    model = gltf.scene;
    sceneBackground.add(model);
  }, undefined, (err) => console.error('Failed to load scene.glb', err));

  composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(sceneBackground, cameraBackground);
  composer.addPass(renderPass);
  asciiEffect = new ASCIIEffect({
    fontSize: 54,
    cellSize: 16,
    color: "#ffffff",
    fontFamily: 'secondary'
  });
  const effectPass = new EffectPass(cameraBackground, asciiEffect);
  composer.addPass(effectPass);

  // 3. Setup Grid Scene
  sceneGrid = new THREE.Scene();
  cameraGrid = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  cameraGrid.position.z = 1;

  const imageTextures = await loadTextures();
  const imageAtlas = createTextureAtlas(imageTextures);
  disposables.push(imageAtlas);

  const uniforms = {
    uOffset: { value: new THREE.Vector2(0, 0) },
    uResolution: { value: new THREE.Vector2(width, height) },
    uBorderColor: { value: new THREE.Vector4(...rgbaToArray(config.borderColor)) },
    uHoverColor: { value: new THREE.Vector4(...rgbaToArray(config.hoverColor)) },
    uMousePos: { value: new THREE.Vector2(-1, -1) },
    uZoom: { value: 1.0 },
    uDistortion: { value: 0.08 },
    uTime: { value: 0 },
    uCellSize: { value: config.cellSize },
    uTextureCount: { value: projects.length },
    uImageAtlas: { value: imageAtlas },
    uFocusIndex: { value: -1 },
    uFocusState: { value: 0.0 },
  };

  const geometry = new THREE.PlaneGeometry(2, 2);
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    transparent: true,
  });

  plane = new THREE.Mesh(geometry, material);
  sceneGrid.add(plane);

  // 4. Start
  setupEventListeners();
  isRunning = true;
  animate();
};

export async function initArchiveScene() {
  if (isRunning) return;
  await init();
}

export function destroyArchiveScene() {
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
  
  disposables.forEach((tex) => tex?.dispose?.());
  disposables = [];

  sceneBackground = null;
  cameraBackground = null;
  sceneGrid = null;
  cameraGrid = null;
  model = null;
  plane = null;
  asciiEffect = null;
}
