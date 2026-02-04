import * as THREE from "three";
import { projects } from "./data.js";
import { CRTShader } from "./CRTShader.js";
import gsap from "gsap";

// --- Archive Shaders ---
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
  uniform float uMousePressed;
  uniform float uZoom;
  uniform vec2 uMouseParallax;
  uniform float uAspectRatios[${projects.length}];

  varying vec2 vUv;

  // Random function for pseudo-random placement
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  // Per-cell parallax intensity variation (creates depth)
  float getParallaxIntensity(vec2 cellId) {
    return 0.5 + random(cellId + vec2(500.0, 0.0)) * 1.5;
  }

  void main() {
    vec2 screenUV = (vUv - 0.5) * 2.0;

    // Apply zoom
    screenUV /= uZoom;

    // Fisheye distortion - flattens when mouse is pressed
    float radius = length(screenUV);
    float effectiveDistortion = mix(uDistortion, 0.0, uMousePressed);
    float distortion = 1.0 - effectiveDistortion * radius * radius;
    vec2 distortedUV = screenUV * distortion;

    vec2 aspectRatio = vec2(uResolution.x / uResolution.y, 1.0);
    float gridCellSize = uCellSize * 1.5;
    
    // Get current cell for parallax variation
    vec2 preCellPos = (distortedUV * aspectRatio + uOffset) / gridCellSize;
    vec2 cellId = floor(preCellPos);
    float parallaxIntensity = getParallaxIntensity(cellId);
    
    // Apply variable parallax based on cell depth (disabled when focused)
    vec2 parallaxOffset = uMouseParallax * parallaxIntensity * (1.0 - uFocusState);
    
    vec2 worldCoord = (distortedUV * aspectRatio) + uOffset + parallaxOffset;

    // Use larger grid cells for looser spacing
    vec2 cellPos = worldCoord / gridCellSize;
    cellId = floor(cellPos);
    vec2 cellUV = fract(cellPos);
    
    // Add random offset to each cell for scattered placement
    vec2 randomOffset = vec2(
      random(cellId) * 0.6 - 0.3,
      random(cellId + vec2(100.0, 0.0)) * 0.6 - 0.3
    );
    
    // Apply random offset to cell UV
    cellUV -= randomOffset;

    float texIndex = mod(cellId.x + cellId.y * 3.0, uTextureCount);
    if (texIndex < 0.0) texIndex += uTextureCount;
    texIndex = floor(texIndex);

    bool isFocused = abs(texIndex - uFocusIndex) < 0.1;

    vec3 color = vec3(0.0);
    float outAlpha = 0.0;

    // Vary image sizes randomly - more varied like reference
    float randomSize = random(cellId + vec2(200.0, 0.0));
    float sizeCategory = random(cellId + vec2(300.0, 0.0));
    float baseImageSize;
    if (sizeCategory < 0.3) {
      baseImageSize = 0.3 + randomSize * 0.15; // Small: 0.30 to 0.45
    } else if (sizeCategory < 0.7) {
      baseImageSize = 0.45 + randomSize * 0.2; // Medium: 0.45 to 0.65
    } else {
      baseImageSize = 0.65 + randomSize * 0.25; // Large: 0.65 to 0.90
    }
    // In focus mode, use natural size without scaling; otherwise use base size
    float targetImageSize = baseImageSize;
    float imageSize = mix(baseImageSize, targetImageSize, uFocusState);
    
    float imageBorder = (1.0 - imageSize) * 0.5;
    vec2 imageUV = (cellUV - imageBorder) / imageSize;

    // Apply natural aspect ratio
    float naturalAspect = uAspectRatios[int(texIndex)];
    if (naturalAspect > 1.0) {
      imageUV.x = (imageUV.x - 0.5) * naturalAspect + 0.5;
    } else {
      imageUV.y = (imageUV.y - 0.5) / naturalAspect + 0.5;
    }

    float edgeSmooth = 0.02;
    vec2 imageMask = smoothstep(-edgeSmooth, edgeSmooth, imageUV) *
                    smoothstep(-edgeSmooth, edgeSmooth, 1.0 - imageUV);
    float imageAlpha = imageMask.x * imageMask.y;

    bool inImageArea = imageUV.x >= 0.0 && imageUV.x <= 1.0 && imageUV.y >= 0.0 && imageUV.y <= 1.0;

    if (inImageArea && imageAlpha > 0.0) {
      float atlasSize = ceil(sqrt(uTextureCount));
      vec2 atlasPos = vec2(mod(texIndex, atlasSize), floor(texIndex / atlasSize));

      // Chromatic Aberration - increases at edges of viewport
      float caStrength = 0.012 * pow(radius, 2.0);
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
  cellSize: 0.85,
  distortion: 0.08,
  lerpFactor: 0.08,
};

// --- State ---
let isRunning = false;
let container = null;
let renderer = null;
let scene = null;
let crtScene = null;
let camera = null;
let plane = null;
let animationId = null;
let renderTarget = null;
let crtPass = null;

let offset = { x: 0, y: 0 };
let targetOffset = { x: 0, y: 0 };
let isDragging = false;
let isClick = true;
let clickStartTime = 0;
let previousMouse = { x: 0, y: 0 };

let focusedIndex = -1;
let focusState = { value: 0 };
let currentFocusCell = { x: 0, y: 0 };

// Drag zoom state
let dragZoom = { value: 1 };
let dragStartPos = { x: 0, y: 0 };
let totalDragDistance = 0;

// Mouse pressed state for fisheye flattening
let mousePressed = { value: 0 };

// Mouse parallax state
let mouse = { x: 0, y: 0 };
let mouseParallax = { x: 0, y: 0 };

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
  // Load textures and get their aspect ratios
  const textureLoader = new THREE.TextureLoader();
  const imageTextures = [];
  const aspectRatios = [];
  let loadedCount = 0;
  
  return new Promise((resolve) => {
    projects.forEach((project, index) => {
      const texture = textureLoader.load(project.image, (tex) => {
        aspectRatios[index] = tex.image.width / tex.image.height;
        if (++loadedCount === projects.length) {
          resolve({ imageTextures, aspectRatios });
        }
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

  // Center on the cell, ensuring it's perfectly in the middle
  const gridCellSize = config.cellSize * 1.5;
  targetOffset.x = (cellX + 0.5) * gridCellSize;
  targetOffset.y = (cellY + 0.5) * gridCellSize;

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

  // Invert fisheye distortion to find pre-distorted coordinates
  const ndc = new THREE.Vector2(screenX, screenY);
  const radius = ndc.length();
  
  // If distortion is zero, this formula is unstable.
  if (config.distortion < 1e-4) {
    // No distortion, direct mapping
  } else {
    // Analytical solution for inverse of lens distortion
    const a = config.distortion;
    const ru = radius; // distorted radius
    // Solve `ru = rd * (1 - a * rd^2)` for rd (undistorted radius)
    // This is a cubic equation: a * rd^3 - rd + ru = 0
    // We can use Cardano's formula or a numerical approximation.
    // Since we need a quick solution, let's use a few iterations of Newton's method.
    let rd = ru; // Initial guess
    for(let i = 0; i < 4; i++) {
      const f = a * rd * rd * rd - rd + ru;
      const f_prime = 3.0 * a * rd * rd - 1.0;
      rd -= f / f_prime;
    }
    ndc.normalize().multiplyScalar(rd);
  }

  const aspectRatio = rect.width / rect.height;
  let worldX = ndc.x * aspectRatio + offset.x;
  let worldY = ndc.y + offset.y;

  // Match shader's grid calculation
  const gridCellSize = config.cellSize * 1.5;
  const cellX = Math.floor(worldX / gridCellSize);
  const cellY = Math.floor(worldY / gridCellSize);
  
  // Check if click is on image (ignoring random offset for precision)
  const cellUVX = (worldX / gridCellSize) - cellX;
  const cellUVY = (worldY / gridCellSize) - cellY;

  // Random size matching shader
  const randomSize = Math.abs(Math.sin((cellX + 200) * 12.9898 + cellY * 78.233) % 1);
  const sizeCategory = Math.abs(Math.sin((cellX + 300) * 12.9898 + cellY * 78.233) % 1);
  let baseImageSize;
  if (sizeCategory < 0.3) {
    baseImageSize = 0.3 + randomSize * 0.15;
  } else if (sizeCategory < 0.7) {
    baseImageSize = 0.45 + randomSize * 0.2;
  } else {
    baseImageSize = 0.65 + randomSize * 0.25;
  }
  const imageSize = baseImageSize;
  const border = (1 - imageSize) / 2;
  
  // Account for natural aspect ratio in hit detection
  const aspectRatios = plane.material.uniforms.uAspectRatios.value;
  let texIndex = (cellX + cellY * 3) % projects.length;
  if (texIndex < 0) texIndex += projects.length;
  const naturalAspect = aspectRatios[texIndex];
  
  let u = (cellUVX - border) / imageSize;
  let v = (cellUVY - border) / imageSize;

  if (naturalAspect > 1.0) {
    u = (u - 0.5) * naturalAspect + 0.5;
  } else {
    v = (v - 0.5) / naturalAspect + 0.5;
  }

  const isOnImage = u >= 0.0 && u <= 1.0 && v >= 0.0 && v <= 1.0;

  return { cellX, cellY, texIndex, isOnImage };
};

// --- Event Handlers ---
const onPointerDown = (e) => {
  // Allow navbar and UI buttons to work
  if (e.target.closest(".nav-wrap") ||
      e.target.closest(".nav-btn") ||
      e.target.closest(".menu-wrap") ||
      e.target.closest(".menu-box") ||
      e.target.closest(".bottom-nav-wrap")) {
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

  // Animate fisheye flattening
  gsap.to(mousePressed, {
    value: 1,
    duration: 0.3,
    ease: "power2.out"
  });
};

const onPointerMove = (e) => {
  // Update mouse position for parallax (only when not dragging)
  if (!isDragging && renderer) {
    const rect = renderer.domElement.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    // Enhanced parallax effect with more intensity
    mouse.x = -x * 0.08;
    mouse.y = y * 0.08;
  }

  if (!isDragging) return;

  const deltaX = e.clientX - previousMouse.x;
  const deltaY = e.clientY - previousMouse.y;

  // Track total drag distance
  totalDragDistance += Math.sqrt(deltaX * deltaX + deltaY * deltaY);

  // Only mark as not a click if significant drag distance
  if (totalDragDistance > 10) {
    isClick = false;

    // Zoom out effect when dragging
    const maxDragDistance = 200;
    const zoomProgress = Math.min(totalDragDistance / maxDragDistance, 1);
    dragZoom.value = 1 - (zoomProgress * 0.2); // Zoom out to 80%

    // Exit focus mode once dragged enough
    if (focusedIndex !== -1 && totalDragDistance > 50) {
      exitFocusMode();
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

  // Reset fisheye flattening
  gsap.to(mousePressed, {
    value: 0,
    duration: 0.4,
    ease: "power2.out"
  });

  // Reset drag zoom with animation
  if (dragZoom.value !== 1) {
    gsap.to(dragZoom, {
      value: 1,
      duration: 0.3,
      ease: "power2.out"
    });
  }

  // Allow click if drag distance is small (less than 15px) or it's a quick action
  const wasQuickClick = Date.now() - clickStartTime < 250;
  const wasSmallDrag = totalDragDistance < 15;
  
  if ((isClick || wasSmallDrag) && wasQuickClick) {
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
  
  // Update render target
  if (renderTarget) {
    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    renderTarget.setSize(width * pixelRatio, height * pixelRatio);
  }
  
  // Update CRT shader resolution
  if (crtPass?.material?.uniforms) {
    crtPass.material.uniforms.uResolution = { value: new THREE.Vector2(width, height) };
  }
};

// --- Animation ---
const animate = () => {
  if (!isRunning) return;
  animationId = requestAnimationFrame(animate);

  // Smooth offset
  offset.x += (targetOffset.x - offset.x) * config.lerpFactor;
  offset.y += (targetOffset.y - offset.y) * config.lerpFactor;

  // Smooth parallax lerp
  mouseParallax.x += (mouse.x - mouseParallax.x) * 0.05;
  mouseParallax.y += (mouse.y - mouseParallax.y) * 0.05;

  if (plane?.material?.uniforms) {
    plane.material.uniforms.uOffset.value.set(offset.x, offset.y);
    plane.material.uniforms.uTime.value = performance.now() * 0.001;
    plane.material.uniforms.uMousePressed.value = mousePressed.value;
    plane.material.uniforms.uZoom.value = dragZoom.value;
    plane.material.uniforms.uMouseParallax.value.set(mouseParallax.x, mouseParallax.y);
  }

  // Render archive scene to render target
  renderer.setRenderTarget(renderTarget);
  renderer.clear();
  renderer.render(scene, camera);
  
  // Render CRT post-processing to screen
  renderer.setRenderTarget(null);
  renderer.clear();
  
  if (crtPass?.material?.uniforms?.time) {
    crtPass.material.uniforms.time.value = performance.now() * 0.001;
  }
  
  renderer.render(crtScene, camera);
};

// --- Initialize ---
const init = async () => {
  container = document.getElementById("gallery");
  if (!container) return;

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
  crtScene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  camera.position.z = 1;

  // Load textures and aspect ratios
  const { imageTextures, aspectRatios } = await loadTextures();
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
      uMousePressed: { value: 0 },
      uZoom: { value: 1 },
      uMouseParallax: { value: new THREE.Vector2(0, 0) },
      uAspectRatios: { value: aspectRatios },
    },
    transparent: true,
  });

  plane = new THREE.Mesh(geometry, material);
  scene.add(plane);

  // Setup render target for post-processing
  const pixelRatio = Math.min(window.devicePixelRatio, 2);
  renderTarget = new THREE.WebGLRenderTarget(width * pixelRatio, height * pixelRatio, {
    format: THREE.RGBAFormat,
    type: THREE.UnsignedByteType,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter
  });
  
  // Create CRT post-processing material with locked settings
  const crtUniforms = {
    tDiffuse: { value: renderTarget.texture },
    scanlineIntensity: { value: 0.46 },
    scanlineCount: { value: 663.0 },
    time: { value: 0.0 },
    yOffset: { value: 0.0 },
    brightness: { value: 1.32 },
    contrast: { value: 1.06 },
    saturation: { value: 1.20 },
    bloomIntensity: { value: 0.23 },
    bloomThreshold: { value: 0.35 },
    rgbShift: { value: 0.0 },
    adaptiveIntensity: { value: 1.0 },
    vignetteStrength: { value: 0.0 },
    curvature: { value: 0.65 },
    flickerStrength: { value: 0.0 }
  };
  
  const crtMaterial = new THREE.ShaderMaterial({
    vertexShader: CRTShader.vertexShader,
    fragmentShader: CRTShader.fragmentShader,
    uniforms: crtUniforms,
    transparent: false,
    depthWrite: false,
    depthTest: false
  });
  
  // CRT Pass plane
  const crtGeometry = new THREE.PlaneGeometry(2, 2);
  crtPass = new THREE.Mesh(crtGeometry, crtMaterial);
  crtScene.add(crtPass);
  
  // Event listeners (use canvas-level where possible)
  const canvas = renderer.domElement;
  canvas.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("resize", onResize);

  // UI Buttons
  const prevBtn = document.getElementById("archive-prev");
  const nextBtn = document.getElementById("archive-next");
  if (prevBtn) prevBtn.addEventListener("click", (e) => { e.stopPropagation(); navigateProject(-1); });
  if (nextBtn) nextBtn.addEventListener("click", (e) => { e.stopPropagation(); navigateProject(1); });

  // Overlay background click
  const overlay = document.getElementById("archive-overlay");
  if (overlay) {
    overlay.addEventListener("click", (e) => {
      // Close if clicking the background (not the header or nav buttons)
      // Check if the click target is the overlay itself or an element that isn't interactive
      if (!e.target.closest('.archive-header') && !e.target.closest('.archive-nav-wrap') && !e.target.closest('.nav-btn')) {
        exitFocusMode();
      }
    });
  }

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
  
  if (crtPass?.material) crtPass.material.dispose();
  if (crtPass?.geometry) crtPass.geometry.dispose();
  
  if (renderTarget) {
    renderTarget.dispose();
  }

  container = null;
  renderer = null;
  scene = null;
  crtScene = null;
  camera = null;
  plane = null;
  crtPass = null;
  renderTarget = null;
  focusedIndex = -1;
  focusState = { value: 0 };
  offset = { x: 0, y: 0 };
  targetOffset = { x: 0, y: 0 };
  dragZoom = { value: 1 };
  totalDragDistance = 0;
  mousePressed = { value: 0 };
  mouse = { x: 0, y: 0 };
  mouseParallax = { x: 0, y: 0 };
}