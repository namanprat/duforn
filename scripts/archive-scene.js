import * as THREE from "three";
import { projects } from "./data.js";
import gsap from "gsap";

// --- Shaders ---
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform vec2 uResolution;
  uniform float uDistortion;
  uniform float uTime;
  uniform sampler2D uImageAtlas;
  uniform float uTextureCount;
  uniform vec2 uOffset;
  uniform float uCellSize;
  uniform float uFocusIndex;
  uniform float uFocusState;

  varying vec2 vUv;

  void main() {
    vec2 screenUV = (vUv - 0.5) * 2.0;

    // Fisheye distortion
    float radius = length(screenUV);
    float distortion = 1.0 - uDistortion * radius * radius;
    vec2 distortedUV = screenUV * distortion;

    vec2 aspectRatio = vec2(uResolution.x / uResolution.y, 1.0);
    vec2 worldCoord = distortedUV * aspectRatio + uOffset;

    vec2 cellPos = worldCoord / uCellSize;
    vec2 cellId = floor(cellPos);
    vec2 cellUV = fract(cellPos);

    float texIndex = mod(cellId.x + cellId.y * 3.0, uTextureCount);
    if (texIndex < 0.0) texIndex += uTextureCount;
    texIndex = floor(texIndex);

    bool isFocused = abs(texIndex - uFocusIndex) < 0.1;

    vec3 color = vec3(0.0);
    float outAlpha = 0.0;

    float baseImageSize = 0.7;
    float targetImageSize = isFocused ? 0.92 : 0.5;
    float imageSize = mix(baseImageSize, targetImageSize, uFocusState);

    float imageBorder = (1.0 - imageSize) * 0.5;
    vec2 imageUV = (cellUV - imageBorder) / imageSize;

    float edgeSmooth = 0.02;
    vec2 imageMask = smoothstep(-edgeSmooth, edgeSmooth, imageUV) *
                    smoothstep(-edgeSmooth, edgeSmooth, 1.0 - imageUV);
    float imageAlpha = imageMask.x * imageMask.y;

    bool inImageArea = imageUV.x >= 0.0 && imageUV.x <= 1.0 && imageUV.y >= 0.0 && imageUV.y <= 1.0;

    if (inImageArea && imageAlpha > 0.0) {
      float atlasSize = ceil(sqrt(uTextureCount));
      vec2 atlasPos = vec2(mod(texIndex, atlasSize), floor(texIndex / atlasSize));

      // Chromatic Aberration
      float caStrength = 0.015 * radius;
      vec2 caOffset = screenUV * caStrength;

      vec2 imageUVR = imageUV - caOffset;
      vec2 atlasUVR = (atlasPos + clamp(imageUVR, 0.0, 1.0)) / atlasSize;
      atlasUVR.y = 1.0 - atlasUVR.y;

      vec2 imageUVG = imageUV;
      vec2 atlasUVG = (atlasPos + imageUVG) / atlasSize;
      atlasUVG.y = 1.0 - atlasUVG.y;

      vec2 imageUVB = imageUV + caOffset;
      vec2 atlasUVB = (atlasPos + clamp(imageUVB, 0.0, 1.0)) / atlasSize;
      atlasUVB.y = 1.0 - atlasUVB.y;

      float r = texture2D(uImageAtlas, atlasUVR).r;
      float g = texture2D(uImageAtlas, atlasUVG).g;
      float b = texture2D(uImageAtlas, atlasUVB).b;
      float a = texture2D(uImageAtlas, atlasUVG).a;

      vec3 finalImageColor = vec3(r, g, b);

      // Darken non-focused images during focus
      if (!isFocused) {
        finalImageColor *= mix(1.0, 0.15, uFocusState);
      }

      color = finalImageColor;
      outAlpha = imageAlpha * a;
    }

    // Vignette fade at edges
    float fade = 1.0 - smoothstep(1.0, 1.6, radius);
    outAlpha *= fade;

    gl_FragColor = vec4(color * fade, outAlpha);
  }
`;

// --- Configuration ---
const config = {
  cellSize: 0.65,
  distortion: 0.06,
  lerpFactor: 0.08,
  // Parallax tilt config
  tiltMaxX: 8, // Max rotation in degrees on X axis
  tiltMaxY: 8, // Max rotation in degrees on Y axis
  tiltLerpFactor: 0.06,
  perspective: 1200,
};

// --- State ---
let isRunning = false;
let container = null;
let renderer = null;
let scene = null;
let camera = null;
let plane = null;
let animationId = null;

let offset = { x: 0, y: 0 };
let targetOffset = { x: 0, y: 0 };
let isDragging = false;
let isClick = true;
let clickStartTime = 0;
let previousMouse = { x: 0, y: 0 };

let focusedIndex = -1;
let focusState = { value: 0 };
let currentFocusCell = { x: 0, y: 0 };

// Parallax tilt state
let tilt = { x: 0, y: 0 };
let targetTilt = { x: 0, y: 0 };
let mousePosition = { x: 0.5, y: 0.5 };

// Drag zoom state
let dragZoom = { value: 1 };
let dragStartPos = { x: 0, y: 0 };
let totalDragDistance = 0;

// --- Helper Functions ---
const createTextureAtlas = (textures) => {
  const atlasSize = Math.ceil(Math.sqrt(textures.length));
  const textureSize = 512;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = atlasSize * textureSize;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

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
  atlasTexture.wrapS = THREE.ClampToEdgeWrapping;
  atlasTexture.wrapT = THREE.ClampToEdgeWrapping;
  atlasTexture.minFilter = THREE.LinearFilter;
  atlasTexture.magFilter = THREE.LinearFilter;
  atlasTexture.flipY = false;
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
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      imageTextures.push(texture);
    });
  });
};

const findNearestCellForIndex = (targetIndex, centerX, centerY) => {
  let bestCell = { x: 0, y: 0 };
  let minDist = Infinity;
  const radius = 15;

  const cx = Math.round(centerX);
  const cy = Math.round(centerY);

  for (let x = cx - radius; x <= cx + radius; x++) {
    for (let y = cy - radius; y <= cy + radius; y++) {
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
  return bestCell;
};

// --- Title Animation ---
const wrapChars = (text) =>
  text.split("").map((c) =>
    `<span style="display:inline-block; will-change: transform;">${c === " " ? "&nbsp;" : c}</span>`
  ).join("");

const animateTitle = (element, newText) => {
  if (!element.querySelector("span")) {
    element.innerHTML = wrapChars(element.textContent);
  }
  const oldChars = element.querySelectorAll("span");
  gsap.to(oldChars, {
    y: "100%",
    opacity: 0,
    stagger: 0.015,
    duration: 0.25,
    ease: "power2.in",
    onComplete: () => {
      element.innerHTML = wrapChars(newText);
      const newChars = element.querySelectorAll("span");
      gsap.fromTo(newChars,
        { y: "100%", opacity: 0 },
        { y: "0%", opacity: 1, stagger: 0.015, duration: 0.25, ease: "power2.out" }
      );
    },
  });
};

// --- Focus Mode ---
const updateDOMOverlay = (index) => {
  const overlay = document.getElementById("archive-overlay");
  const title = document.getElementById("archive-title");

  if (index !== -1) {
    const newTitleText = projects[index].title;
    if (title) {
      if (overlay.classList.contains("active") && title.textContent.replace(/\u00a0/g, " ") !== newTitleText) {
        animateTitle(title, newTitleText);
      } else {
        title.innerHTML = wrapChars(newTitleText);
        gsap.set(title.querySelectorAll("span"), { y: "0%", opacity: 1 });
      }
    }
    overlay.classList.add("active");
  } else {
    overlay.classList.remove("active");
  }
};

const enterFocusMode = (index, cellX, cellY) => {
  if (focusedIndex === index && currentFocusCell.x === cellX && currentFocusCell.y === cellY) return;

  focusedIndex = index;
  currentFocusCell = { x: cellX, y: cellY };

  if (plane?.material?.uniforms) {
    plane.material.uniforms.uFocusIndex.value = index;
  }

  gsap.to(focusState, {
    value: 1,
    duration: 0.5,
    ease: "power2.out",
    onUpdate: () => {
      if (plane?.material?.uniforms) {
        plane.material.uniforms.uFocusState.value = focusState.value;
      }
    },
  });

  // Center on the cell
  targetOffset.x = (cellX + 0.5) * config.cellSize;
  targetOffset.y = (cellY + 0.5) * config.cellSize;

  updateDOMOverlay(index);
};

const exitFocusMode = () => {
  if (focusedIndex === -1) return;
  focusedIndex = -1;

  gsap.to(focusState, {
    value: 0,
    duration: 0.4,
    ease: "power2.out",
    onUpdate: () => {
      if (plane?.material?.uniforms) {
        plane.material.uniforms.uFocusState.value = focusState.value;
      }
    },
  });

  updateDOMOverlay(-1);
};

const navigateProject = (direction) => {
  if (focusedIndex === -1) return;

  let nextIndex = focusedIndex + direction;
  if (nextIndex >= projects.length) nextIndex = 0;
  if (nextIndex < 0) nextIndex = projects.length - 1;

  const nextCell = findNearestCellForIndex(nextIndex, currentFocusCell.x, currentFocusCell.y);
  enterFocusMode(nextIndex, nextCell.x, nextCell.y);
};

// --- Click Detection ---
const getClickedCell = (clientX, clientY) => {
  if (!renderer) return null;

  const rect = renderer.domElement.getBoundingClientRect();
  const screenX = ((clientX - rect.left) / rect.width) * 2 - 1;
  const screenY = -(((clientY - rect.top) / rect.height) * 2 - 1);

  // Apply same distortion as shader
  const radius = Math.sqrt(screenX * screenX + screenY * screenY);
  const distortion = 1.0 - config.distortion * radius * radius;

  const aspectRatio = rect.width / rect.height;
  let worldX = screenX * distortion * aspectRatio + offset.x;
  let worldY = screenY * distortion + offset.y;

  const cellX = Math.floor(worldX / config.cellSize);
  const cellY = Math.floor(worldY / config.cellSize);

  // Check if click is on image (images occupy ~70% of cell, centered)
  const cellUVX = worldX / config.cellSize - cellX;
  const cellUVY = worldY / config.cellSize - cellY;

  const imageSize = focusedIndex === -1 ? 0.7 : (focusState.value > 0.5 ? 0.92 : 0.7);
  const border = (1 - imageSize) / 2;
  const isOnImage = cellUVX > border && cellUVX < (1 - border) &&
                    cellUVY > border && cellUVY < (1 - border);

  let texIndex = (cellX + cellY * 3) % projects.length;
  if (texIndex < 0) texIndex += projects.length;

  return { cellX, cellY, texIndex, isOnImage };
};

// --- Event Handlers ---
const onPointerDown = (e) => {
  // Allow navbar and UI buttons to work
  if (e.target.closest(".nav-wrap") ||
      e.target.closest(".nav-btn") ||
      e.target.closest(".menu-wrap") ||
      e.target.closest(".menu-box") ||
      e.target.closest(".bottom-nav-wrap") ||
      e.target.closest(".archive-overlay")) {
    return;
  }

  isDragging = true;
  isClick = true;
  clickStartTime = Date.now();
  previousMouse.x = e.clientX;
  previousMouse.y = e.clientY;
  dragStartPos.x = e.clientX;
  dragStartPos.y = e.clientY;
  totalDragDistance = 0;
};

const onPointerMove = (e) => {
  // Always update mouse position for parallax tilt
  if (container) {
    const rect = container.getBoundingClientRect();
    mousePosition.x = (e.clientX - rect.left) / rect.width;
    mousePosition.y = (e.clientY - rect.top) / rect.height;

    // Update target tilt based on mouse position (centered at 0.5, 0.5)
    targetTilt.x = (mousePosition.y - 0.5) * config.tiltMaxX * 2;
    targetTilt.y = (mousePosition.x - 0.5) * -config.tiltMaxY * 2;
  }

  if (!isDragging) return;

  const deltaX = e.clientX - previousMouse.x;
  const deltaY = e.clientY - previousMouse.y;

  // Track total drag distance
  totalDragDistance += Math.sqrt(deltaX * deltaX + deltaY * deltaY);

  if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
    isClick = false;

    // Zoom out effect when dragging in focus mode
    if (focusedIndex !== -1) {
      // Calculate zoom based on drag distance (zoom out as you drag more)
      const maxDragDistance = 150;
      const zoomProgress = Math.min(totalDragDistance / maxDragDistance, 1);
      dragZoom.value = 1 - (zoomProgress * 0.15); // Zoom out to 85%

      // Exit focus mode once dragged enough
      if (totalDragDistance > 50) {
        exitFocusMode();
      }
    }
  }

  targetOffset.x -= deltaX * 0.002;
  targetOffset.y += deltaY * 0.002;

  previousMouse.x = e.clientX;
  previousMouse.y = e.clientY;
};

const onPointerUp = (e) => {
  if (!isDragging) return;
  isDragging = false;

  // Reset drag zoom with animation
  if (dragZoom.value !== 1) {
    gsap.to(dragZoom, {
      value: 1,
      duration: 0.3,
      ease: "power2.out"
    });
  }

  if (isClick && Date.now() - clickStartTime < 250) {
    const result = getClickedCell(e.clientX, e.clientY);
    if (!result) {
      // Clicked outside valid area - exit focus mode if active
      if (focusedIndex !== -1) {
        exitFocusMode();
      }
      return;
    }

    const { cellX, cellY, texIndex, isOnImage } = result;

    if (focusedIndex === -1) {
      // Not in focus mode - only enter if clicking on image
      if (isOnImage) {
        enterFocusMode(texIndex, cellX, cellY);
      }
    } else {
      // In focus mode
      if (!isOnImage) {
        // Clicked on blank space - exit focus mode
        exitFocusMode();
      } else if (texIndex !== focusedIndex || cellX !== currentFocusCell.x || cellY !== currentFocusCell.y) {
        // Clicked on different image - switch to it
        enterFocusMode(texIndex, cellX, cellY);
      } else {
        // Clicked on same image - exit focus mode
        exitFocusMode();
      }
    }
  }

  // Reset total drag distance
  totalDragDistance = 0;
};

const onWheel = (e) => {
  // Only handle wheel on canvas
  if (!e.target.closest("#gallery")) return;

  e.preventDefault();
  targetOffset.x += e.deltaX * 0.001;
  targetOffset.y -= e.deltaY * 0.001;

  if (focusedIndex !== -1 && (Math.abs(e.deltaX) > 10 || Math.abs(e.deltaY) > 10)) {
    exitFocusMode();
  }
};

const onKeyDown = (e) => {
  if (focusedIndex === -1) return;

  if (e.key === "ArrowRight") {
    e.preventDefault();
    navigateProject(1);
  } else if (e.key === "ArrowLeft") {
    e.preventDefault();
    navigateProject(-1);
  } else if (e.key === "Escape") {
    e.preventDefault();
    exitFocusMode();
  }
};

const onResize = () => {
  if (!container || !renderer) return;

  const width = container.offsetWidth;
  const height = container.offsetHeight;

  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  if (plane?.material?.uniforms) {
    plane.material.uniforms.uResolution.value.set(width, height);
  }
};

// --- Animation ---
const animate = () => {
  if (!isRunning) return;
  animationId = requestAnimationFrame(animate);

  // Smooth offset
  offset.x += (targetOffset.x - offset.x) * config.lerpFactor;
  offset.y += (targetOffset.y - offset.y) * config.lerpFactor;

  // Smooth parallax tilt
  tilt.x += (targetTilt.x - tilt.x) * config.tiltLerpFactor;
  tilt.y += (targetTilt.y - tilt.y) * config.tiltLerpFactor;

  // Apply parallax tilt to canvas container
  if (container) {
    const scale = dragZoom.value;
    container.style.transform = `perspective(${config.perspective}px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${scale})`;
  }

  if (plane?.material?.uniforms) {
    plane.material.uniforms.uOffset.value.set(offset.x, offset.y);
    plane.material.uniforms.uTime.value = performance.now() * 0.001;
  }

  renderer.render(scene, camera);
};

// --- Initialize ---
const init = async () => {
  container = document.getElementById("gallery");
  if (!container) return;

  // Setup container for 3D transforms
  container.style.transformStyle = "preserve-3d";
  container.style.transformOrigin = "center center";
  container.style.willChange = "transform";

  const width = container.offsetWidth;
  const height = container.offsetHeight;

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  // Scene & Camera
  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  camera.position.z = 1;

  // Load textures
  const imageTextures = await loadTextures();
  const imageAtlas = createTextureAtlas(imageTextures);

  // Shader plane
  const geometry = new THREE.PlaneGeometry(2, 2);
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uResolution: { value: new THREE.Vector2(width, height) },
      uDistortion: { value: config.distortion },
      uTime: { value: 0 },
      uImageAtlas: { value: imageAtlas },
      uTextureCount: { value: projects.length },
      uOffset: { value: new THREE.Vector2(0, 0) },
      uCellSize: { value: config.cellSize },
      uFocusIndex: { value: -1 },
      uFocusState: { value: 0 },
    },
    transparent: true,
  });

  plane = new THREE.Mesh(geometry, material);
  scene.add(plane);

  // Global mousemove for parallax (even when not dragging)
  const onMouseMove = (e) => {
    if (container) {
      const rect = container.getBoundingClientRect();
      mousePosition.x = (e.clientX - rect.left) / rect.width;
      mousePosition.y = (e.clientY - rect.top) / rect.height;

      // Clamp to reasonable bounds
      mousePosition.x = Math.max(0, Math.min(1, mousePosition.x));
      mousePosition.y = Math.max(0, Math.min(1, mousePosition.y));

      // Update target tilt based on mouse position (centered at 0.5, 0.5)
      targetTilt.x = (mousePosition.y - 0.5) * config.tiltMaxX * 2;
      targetTilt.y = (mousePosition.x - 0.5) * -config.tiltMaxY * 2;
    }
  };

  // Event listeners (use canvas-level where possible)
  const canvas = renderer.domElement;
  canvas.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("mousemove", onMouseMove);
  canvas.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("resize", onResize);

  // Store reference for cleanup
  container._onMouseMove = onMouseMove;

  // UI Buttons
  const prevBtn = document.getElementById("archive-prev");
  const nextBtn = document.getElementById("archive-next");
  if (prevBtn) prevBtn.addEventListener("click", (e) => { e.stopPropagation(); navigateProject(-1); });
  if (nextBtn) nextBtn.addEventListener("click", (e) => { e.stopPropagation(); navigateProject(1); });

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

  // Clean up mousemove listener
  if (container?._onMouseMove) {
    window.removeEventListener("mousemove", container._onMouseMove);
  }

  window.removeEventListener("pointermove", onPointerMove);
  window.removeEventListener("pointerup", onPointerUp);
  window.removeEventListener("keydown", onKeyDown);
  window.removeEventListener("resize", onResize);

  if (renderer) {
    renderer.dispose();
    if (renderer.domElement?.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
  }

  if (plane?.material) plane.material.dispose();
  if (plane?.geometry) plane.geometry.dispose();

  container = null;
  renderer = null;
  scene = null;
  camera = null;
  plane = null;
  focusedIndex = -1;
  focusState = { value: 0 };
  offset = { x: 0, y: 0 };
  targetOffset = { x: 0, y: 0 };
  tilt = { x: 0, y: 0 };
  targetTilt = { x: 0, y: 0 };
  dragZoom = { value: 1 };
  totalDragDistance = 0;
}
