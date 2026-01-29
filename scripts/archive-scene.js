import * as THREE from "three";
import { projects } from "./data.js";
import gsap from "gsap";

// --- Configuration ---
const CONFIG = {
  // Layout - structured chaos with more spacing, no rotation
  gridCols: 5,
  gridRows: 4,
  baseSpacing: 2.8,
  scatterAmount: 0.6,
  sizeVariation: { min: 0.7, max: 1.2 },
  rotationRange: 0, // no tilting
  depthLayers: 3,

  // Infinite tiling
  tileRepeat: 3, // How many times to repeat the grid in each direction

  // Interaction
  parallaxStrength: 0.12,
  dragSpeed: 0.004,
  lerpSpeed: 0.08,
  clickThreshold: 12,
  focusAnimationDuration: 0.7, // slower focus animation

  // Performance
  textureSize: 256,
  maxPixelRatio: 1.5,

  // CRT defaults
  crt: {
    scanlineIntensity: 0.35,
    scanlineCount: 480,
    phosphorIntensity: 0.4,
    bloomIntensity: 0.25,
    bloomThreshold: 0.4,
    curvature: 0.03,
    vignetteStrength: 0.3,
    noiseIntensity: 0.04,
    brightness: 1.15,
    contrast: 1.1,
    saturation: 1.15,
    rgbShift: 0.3,
    flickerStrength: 0.015
  }
};

// --- Shaders ---
const imageVertexShader = `
  attribute vec3 offset;
  attribute vec2 atlasUV;
  attribute float size;
  attribute float depth;

  uniform vec2 uViewOffset;
  uniform vec2 uParallax;
  uniform float uFocusIndex;
  uniform float uFocusState;
  uniform float uAspect;
  uniform vec2 uWorldSize; // Total world size for tiling

  varying vec2 vUv;
  varying vec2 vAtlasUV;
  varying float vDepth;
  varying float vIsFocused;

  void main() {
    vUv = uv;
    vAtlasUV = atlasUV;
    vDepth = depth;

    float idx = offset.z;
    vIsFocused = step(abs(idx - uFocusIndex), 0.5);

    // Depth-based parallax (more pronounced)
    float parallaxMult = 1.0 + depth * 0.8;
    vec2 parallaxOffset = uParallax * parallaxMult;

    // Size adjustment for focus
    float focusScale = mix(1.0, 1.25, vIsFocused * uFocusState);
    float finalSize = size * focusScale;

    // Calculate position with infinite tiling
    vec2 basePos = offset.xy - uViewOffset + parallaxOffset;

    // Wrap position for infinite scrolling
    basePos.x = mod(basePos.x + uWorldSize.x * 0.5, uWorldSize.x) - uWorldSize.x * 0.5;
    basePos.y = mod(basePos.y + uWorldSize.y * 0.5, uWorldSize.y) - uWorldSize.y * 0.5;

    vec3 pos = vec3(
      position.xy * finalSize + basePos,
      depth * 0.1
    );

    // Adjust for aspect ratio
    pos.x /= uAspect;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const imageFragmentShader = `
  precision highp float;

  uniform sampler2D uAtlas;
  uniform float uAtlasSize;
  uniform float uFocusState;
  uniform float uFocusIndex;

  varying vec2 vUv;
  varying vec2 vAtlasUV;
  varying float vDepth;
  varying float vIsFocused;

  void main() {
    vec2 tileSize = vec2(1.0 / uAtlasSize);
    vec2 atlasCoord = vAtlasUV + vUv * tileSize;

    vec4 texColor = texture2D(uAtlas, atlasCoord);

    // Depth-based subtle darkening for unfocused distant images
    float depthDim = 1.0 - vDepth * 0.15;

    // Dim non-focused images when in focus mode
    float focusDim = mix(1.0, 0.2, uFocusState * (1.0 - vIsFocused));

    // Soft edge
    vec2 edgeDist = min(vUv, 1.0 - vUv);
    float edge = smoothstep(0.0, 0.02, min(edgeDist.x, edgeDist.y));

    vec3 finalColor = texColor.rgb * depthDim * focusDim;
    float finalAlpha = texColor.a * edge;

    gl_FragColor = vec4(finalColor, finalAlpha);
  }
`;

const crtVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const crtFragmentShader = `
  precision highp float;

  uniform sampler2D tDiffuse;
  uniform vec2 uResolution;
  uniform float uTime;

  uniform float uScanlineIntensity;
  uniform float uScanlineCount;
  uniform float uPhosphorIntensity;
  uniform float uBloomIntensity;
  uniform float uBloomThreshold;
  uniform float uCurvature;
  uniform float uVignetteStrength;
  uniform float uNoiseIntensity;
  uniform float uBrightness;
  uniform float uContrast;
  uniform float uSaturation;
  uniform float uRgbShift;
  uniform float uFlickerStrength;

  varying vec2 vUv;

  const vec3 LUMA = vec3(0.299, 0.587, 0.114);

  // Fast hash for noise
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  // Barrel distortion for arcade monitor curve
  vec2 curveUV(vec2 uv) {
    vec2 curved = uv * 2.0 - 1.0;
    float dist = dot(curved, curved);
    curved *= 1.0 + dist * uCurvature;
    return curved * 0.5 + 0.5;
  }

  void main() {
    vec2 uv = vUv;

    // Apply curvature
    if (uCurvature > 0.001) {
      uv = curveUV(uv);
      if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        return;
      }
    }

    // RGB shift (chromatic aberration)
    float shift = uRgbShift * 0.003;
    vec2 rUV = uv + vec2(shift, 0.0);
    vec2 gUV = uv;
    vec2 bUV = uv - vec2(shift, 0.0);

    float r = texture2D(tDiffuse, rUV).r;
    float g = texture2D(tDiffuse, gUV).g;
    float b = texture2D(tDiffuse, bUV).b;
    vec3 color = vec3(r, g, b);

    // Phosphor dot pattern (arcade RGB subpixels)
    if (uPhosphorIntensity > 0.001) {
      vec2 pixelCoord = uv * uResolution;
      float phosphorX = mod(pixelCoord.x, 3.0);
      vec3 phosphorMask = vec3(
        smoothstep(0.0, 1.0, 1.0 - abs(phosphorX - 0.5)),
        smoothstep(0.0, 1.0, 1.0 - abs(phosphorX - 1.5)),
        smoothstep(0.0, 1.0, 1.0 - abs(phosphorX - 2.5))
      );
      phosphorMask = mix(vec3(1.0), phosphorMask, uPhosphorIntensity);
      color *= phosphorMask;
    }

    // Scanlines
    if (uScanlineIntensity > 0.001) {
      float scanline = sin(uv.y * uScanlineCount * 3.14159) * 0.5 + 0.5;
      scanline = pow(scanline, 1.5);
      color *= 1.0 - scanline * uScanlineIntensity;
    }

    // Simple bloom
    if (uBloomIntensity > 0.001) {
      vec3 bloomSample = vec3(0.0);
      float samples = 0.0;
      for (float x = -2.0; x <= 2.0; x += 1.0) {
        for (float y = -2.0; y <= 2.0; y += 1.0) {
          vec2 offset = vec2(x, y) * 0.003;
          vec3 s = texture2D(tDiffuse, uv + offset).rgb;
          float lum = dot(s, LUMA);
          if (lum > uBloomThreshold) {
            bloomSample += s * (lum - uBloomThreshold);
            samples += 1.0;
          }
        }
      }
      if (samples > 0.0) {
        color += bloomSample / samples * uBloomIntensity;
      }
    }

    // Noise/static
    if (uNoiseIntensity > 0.001) {
      float noise = hash(uv * uResolution + uTime * 100.0) * 2.0 - 1.0;
      color += noise * uNoiseIntensity;
    }

    // Flicker
    if (uFlickerStrength > 0.001) {
      float flicker = 1.0 + sin(uTime * 60.0) * uFlickerStrength;
      color *= flicker;
    }

    // Color adjustments
    color *= uBrightness;
    color = (color - 0.5) * uContrast + 0.5;
    float lum = dot(color, LUMA);
    color = mix(vec3(lum), color, uSaturation);

    // Vignette
    if (uVignetteStrength > 0.001) {
      vec2 vigCoord = uv * 2.0 - 1.0;
      float vignette = 1.0 - dot(vigCoord, vigCoord) * uVignetteStrength * 0.5;
      color *= vignette;
    }

    gl_FragColor = vec4(color, 1.0);
  }
`;

// --- State ---
let isRunning = false;
let container = null;
let renderer = null;
let scene = null;
let crtScene = null;
let camera = null;
let renderTarget = null;
let crtMesh = null;
let imagesMesh = null;
let atlasTexture = null;

let imageData = []; // Pre-computed image positions, sizes, depths
let viewOffset = { x: 0, y: 0 };
let targetOffset = { x: 0, y: 0 };
let parallax = { x: 0, y: 0 };
let targetParallax = { x: 0, y: 0 };

let isDragging = false;
let dragStart = { x: 0, y: 0 };
let dragDistance = 0;
let clickStartTime = 0;

let focusedIndex = -1;
let focusState = { value: 0 };
let animationId = null;

// Tweak panel reference
let tweakPanel = null;

// --- World size for infinite tiling ---
let worldSize = { x: 0, y: 0 };

function generateImageLayout() {
  const count = projects.length;
  imageData = [];

  // Calculate grid dimensions
  const cols = CONFIG.gridCols;
  const rows = Math.ceil(count / cols);

  for (let i = 0; i < count; i++) {
    // Grid position as base
    const gridX = (i % cols) - (cols - 1) / 2;
    const gridY = Math.floor(i / cols) - (rows - 1) / 2;

    // Base position with spacing
    let x = gridX * CONFIG.baseSpacing;
    let y = gridY * CONFIG.baseSpacing;

    // Structured scatter - offset alternating rows/columns for visual interest
    const rowOffset = (Math.floor(i / cols) % 2) * 0.4;
    x += rowOffset;

    // Add controlled scatter noise
    const scatterX = (seededRandom(i * 17) - 0.5) * CONFIG.scatterAmount;
    const scatterY = (seededRandom(i * 31) - 0.5) * CONFIG.scatterAmount;
    x += scatterX;
    y += scatterY;

    // Assign depth layer (0, 1, 2) - distribute evenly
    const depth = i % CONFIG.depthLayers;

    // Size variation based on depth (closer = slightly larger)
    const baseSize = CONFIG.sizeVariation.min +
      seededRandom(i * 73) * (CONFIG.sizeVariation.max - CONFIG.sizeVariation.min);
    const depthSizeBonus = (CONFIG.depthLayers - 1 - depth) * 0.1;
    const size = baseSize + depthSizeBonus;

    imageData.push({
      index: i,
      x, y, depth, size,
      project: projects[i]
    });
  }

  // Calculate world size for tiling (with padding)
  const padding = CONFIG.baseSpacing;
  worldSize.x = cols * CONFIG.baseSpacing + padding;
  worldSize.y = rows * CONFIG.baseSpacing + padding;

  // Sort by depth (back to front for proper rendering)
  imageData.sort((a, b) => b.depth - a.depth);
}

function seededRandom(seed) {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

// --- Texture Atlas ---
function createTextureAtlas(images) {
  const size = Math.ceil(Math.sqrt(projects.length));
  const tileSize = CONFIG.textureSize;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size * tileSize;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  images.forEach((img, i) => {
    const x = (i % size) * tileSize;
    const y = Math.floor(i / size) * tileSize;

    if (img && img.complete && img.naturalWidth > 0) {
      // Cover fit
      const imgAspect = img.naturalWidth / img.naturalHeight;
      let drawW = tileSize, drawH = tileSize, drawX = x, drawY = y;

      if (imgAspect > 1) {
        drawH = tileSize / imgAspect;
        drawY = y + (tileSize - drawH) / 2;
      } else {
        drawW = tileSize * imgAspect;
        drawX = x + (tileSize - drawW) / 2;
      }

      ctx.drawImage(img, drawX, drawY, drawW, drawH);
    }
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.flipY = false;
  return { texture, size };
}

async function loadImages() {
  const images = await Promise.all(
    projects.map(p => new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = p.image;
    }))
  );
  return images;
}

// --- Create Instanced Mesh ---
function createImagesMesh(atlasSize) {
  const count = imageData.length;
  const geometry = new THREE.PlaneGeometry(0.5, 0.5);

  // Instance attributes
  const offsets = new Float32Array(count * 3);
  const atlasUVs = new Float32Array(count * 2);
  const sizes = new Float32Array(count);
  const depths = new Float32Array(count);

  imageData.forEach((data, i) => {
    offsets[i * 3] = data.x;
    offsets[i * 3 + 1] = data.y;
    offsets[i * 3 + 2] = data.index; // Store original index for focus detection

    const atlasX = (data.index % atlasSize) / atlasSize;
    const atlasY = Math.floor(data.index / atlasSize) / atlasSize;
    atlasUVs[i * 2] = atlasX;
    atlasUVs[i * 2 + 1] = 1 - atlasY - (1 / atlasSize); // Flip Y

    sizes[i] = data.size;
    depths[i] = data.depth / (CONFIG.depthLayers - 1);
  });

  geometry.setAttribute("offset", new THREE.InstancedBufferAttribute(offsets, 3));
  geometry.setAttribute("atlasUV", new THREE.InstancedBufferAttribute(atlasUVs, 2));
  geometry.setAttribute("size", new THREE.InstancedBufferAttribute(sizes, 1));
  geometry.setAttribute("depth", new THREE.InstancedBufferAttribute(depths, 1));

  const material = new THREE.ShaderMaterial({
    vertexShader: imageVertexShader,
    fragmentShader: imageFragmentShader,
    uniforms: {
      uAtlas: { value: atlasTexture },
      uAtlasSize: { value: atlasSize },
      uViewOffset: { value: new THREE.Vector2(0, 0) },
      uParallax: { value: new THREE.Vector2(0, 0) },
      uFocusIndex: { value: -1 },
      uFocusState: { value: 0 },
      uAspect: { value: 1 },
      uWorldSize: { value: new THREE.Vector2(worldSize.x, worldSize.y) }
    },
    transparent: true,
    depthTest: true,
    depthWrite: false
  });

  const mesh = new THREE.InstancedMesh(geometry, material, count);
  mesh.frustumCulled = false;
  return mesh;
}

// --- CRT Post-processing ---
function createCRTPass(width, height) {
  const geometry = new THREE.PlaneGeometry(2, 2);
  const material = new THREE.ShaderMaterial({
    vertexShader: crtVertexShader,
    fragmentShader: crtFragmentShader,
    uniforms: {
      tDiffuse: { value: null },
      uResolution: { value: new THREE.Vector2(width, height) },
      uTime: { value: 0 },
      uScanlineIntensity: { value: CONFIG.crt.scanlineIntensity },
      uScanlineCount: { value: CONFIG.crt.scanlineCount },
      uPhosphorIntensity: { value: CONFIG.crt.phosphorIntensity },
      uBloomIntensity: { value: CONFIG.crt.bloomIntensity },
      uBloomThreshold: { value: CONFIG.crt.bloomThreshold },
      uCurvature: { value: CONFIG.crt.curvature },
      uVignetteStrength: { value: CONFIG.crt.vignetteStrength },
      uNoiseIntensity: { value: CONFIG.crt.noiseIntensity },
      uBrightness: { value: CONFIG.crt.brightness },
      uContrast: { value: CONFIG.crt.contrast },
      uSaturation: { value: CONFIG.crt.saturation },
      uRgbShift: { value: CONFIG.crt.rgbShift },
      uFlickerStrength: { value: CONFIG.crt.flickerStrength }
    }
  });

  return new THREE.Mesh(geometry, material);
}

// --- Helper to wrap coordinate for infinite tiling ---
function wrapCoord(val, size) {
  return ((val % size) + size) % size - size / 2;
}

// --- Hit Testing ---
function getClickedImage(clientX, clientY) {
  if (!renderer || !container) return null;

  const rect = container.getBoundingClientRect();
  const aspect = rect.width / rect.height;

  // Convert to world coordinates
  const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
  const ndcY = -((clientY - rect.top) / rect.height) * 2 + 1;

  const worldX = ndcX * aspect * 2 + viewOffset.x;
  const worldY = ndcY * 2 + viewOffset.y;

  // Find closest image (accounting for tiling)
  let closest = null;
  let minDist = Infinity;

  for (const data of imageData) {
    const depthParallax = (1 + data.depth / (CONFIG.depthLayers - 1) * 0.8) * CONFIG.parallaxStrength;

    // Calculate wrapped position (same as shader)
    let imgX = data.x - viewOffset.x + targetParallax.x * depthParallax;
    let imgY = data.y - viewOffset.y + targetParallax.y * depthParallax;
    imgX = wrapCoord(imgX, worldSize.x);
    imgY = wrapCoord(imgY, worldSize.y);

    // Convert back to world space for comparison
    imgX += viewOffset.x;
    imgY += viewOffset.y;

    const halfSize = data.size * 0.28;

    const dx = Math.abs(worldX - imgX);
    const dy = Math.abs(worldY - imgY);

    if (dx < halfSize && dy < halfSize) {
      const dist = dx * dx + dy * dy;
      if (dist < minDist) {
        minDist = dist;
        closest = data;
      }
    }
  }

  return closest;
}

// --- Focus Mode ---
function enterFocusMode(data) {
  if (focusedIndex === data.index) return;

  focusedIndex = data.index;

  // Center on image (account for current view offset to find nearest tile)
  let targetX = data.x;
  let targetY = data.y;

  // Find the nearest tiled instance of this image
  const offsetX = viewOffset.x - data.x;
  const offsetY = viewOffset.y - data.y;
  const tilesX = Math.round(offsetX / worldSize.x);
  const tilesY = Math.round(offsetY / worldSize.y);
  targetX += tilesX * worldSize.x;
  targetY += tilesY * worldSize.y;

  targetOffset.x = targetX;
  targetOffset.y = targetY;

  if (imagesMesh?.material?.uniforms) {
    imagesMesh.material.uniforms.uFocusIndex.value = data.index;
  }

  // Slower, smoother animation
  gsap.to(focusState, {
    value: 1,
    duration: CONFIG.focusAnimationDuration,
    ease: "power3.out",
    onUpdate: updateFocusUniform
  });

  updateOverlay(data.index);
}

function exitFocusMode() {
  if (focusedIndex === -1) return;
  focusedIndex = -1;

  gsap.to(focusState, {
    value: 0,
    duration: CONFIG.focusAnimationDuration * 0.6,
    ease: "power2.inOut",
    onUpdate: updateFocusUniform
  });

  updateOverlay(-1);
}

function updateFocusUniform() {
  if (imagesMesh?.material?.uniforms) {
    imagesMesh.material.uniforms.uFocusState.value = focusState.value;
  }
}

function navigateProject(direction) {
  if (focusedIndex === -1) return;

  let nextIndex = focusedIndex + direction;
  if (nextIndex >= projects.length) nextIndex = 0;
  if (nextIndex < 0) nextIndex = projects.length - 1;

  const data = imageData.find(d => d.index === nextIndex);
  if (data) enterFocusMode(data);
}

// --- DOM Overlay ---
function updateOverlay(index) {
  const overlay = document.getElementById("archive-overlay");
  const title = document.getElementById("archive-title");

  if (index !== -1 && title) {
    const newTitle = projects[index].title;
    animateTitle(title, newTitle);
    overlay?.classList.add("active");
  } else {
    overlay?.classList.remove("active");
  }
}

function animateTitle(el, text) {
  if (!el.querySelector("span")) {
    el.innerHTML = wrapChars(el.textContent || "");
  }

  const oldChars = el.querySelectorAll("span");
  gsap.to(oldChars, {
    y: "100%",
    opacity: 0,
    stagger: 0.02,
    duration: 0.2,
    ease: "power2.in",
    onComplete: () => {
      el.innerHTML = wrapChars(text);
      gsap.fromTo(el.querySelectorAll("span"),
        { y: "100%", opacity: 0 },
        { y: "0%", opacity: 1, stagger: 0.02, duration: 0.2, ease: "power2.out" }
      );
    }
  });
}

function wrapChars(text) {
  return text.split("").map(c =>
    `<span style="display:inline-block">${c === " " ? "&nbsp;" : c}</span>`
  ).join("");
}

// --- Event Handlers ---
function onPointerDown(e) {
  if (e.target.closest(".nav-wrap, .nav-btn, .menu-wrap, .bottom-nav-wrap, .archive-header, .archive-nav-wrap")) {
    return;
  }

  isDragging = true;
  dragStart.x = e.clientX;
  dragStart.y = e.clientY;
  dragDistance = 0;
  clickStartTime = Date.now();
}

function onPointerMove(e) {
  // Always update parallax target
  if (container) {
    const rect = container.getBoundingClientRect();
    targetParallax.x = ((e.clientX - rect.left) / rect.width - 0.5) * -2;
    targetParallax.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
  }

  if (!isDragging) return;

  const dx = e.clientX - dragStart.x;
  const dy = e.clientY - dragStart.y;
  dragDistance = Math.sqrt(dx * dx + dy * dy);

  if (dragDistance > CONFIG.clickThreshold) {
    targetOffset.x -= (e.clientX - dragStart.x) * CONFIG.dragSpeed;
    targetOffset.y += (e.clientY - dragStart.y) * CONFIG.dragSpeed;
    dragStart.x = e.clientX;
    dragStart.y = e.clientY;

    if (focusedIndex !== -1 && dragDistance > 30) {
      exitFocusMode();
    }
  }
}

function onPointerUp(e) {
  if (!isDragging) return;
  isDragging = false;

  const wasQuickClick = Date.now() - clickStartTime < 250;
  const wasSmallDrag = dragDistance < CONFIG.clickThreshold;

  if (wasQuickClick && wasSmallDrag) {
    const clicked = getClickedImage(e.clientX, e.clientY);

    if (clicked) {
      if (focusedIndex === -1) {
        enterFocusMode(clicked);
      } else if (clicked.index === focusedIndex) {
        exitFocusMode();
      } else {
        enterFocusMode(clicked);
      }
    } else if (focusedIndex !== -1) {
      exitFocusMode();
    }
  }
}

function onWheel(e) {
  if (!e.target.closest("#gallery")) return;
  e.preventDefault();

  targetOffset.x += e.deltaX * 0.002;
  targetOffset.y -= e.deltaY * 0.002;

  if (focusedIndex !== -1 && (Math.abs(e.deltaX) > 20 || Math.abs(e.deltaY) > 20)) {
    exitFocusMode();
  }
}

function onKeyDown(e) {
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
}

function onResize() {
  if (!container || !renderer) return;

  const width = container.offsetWidth;
  const height = container.offsetHeight;
  const pixelRatio = Math.min(window.devicePixelRatio, CONFIG.maxPixelRatio);

  renderer.setSize(width, height);
  renderer.setPixelRatio(pixelRatio);

  if (renderTarget) {
    renderTarget.setSize(width * pixelRatio, height * pixelRatio);
  }

  if (imagesMesh?.material?.uniforms) {
    imagesMesh.material.uniforms.uAspect.value = width / height;
  }

  if (crtMesh?.material?.uniforms) {
    crtMesh.material.uniforms.uResolution.value.set(width, height);
  }
}

// --- Animation Loop ---
function animate() {
  if (!isRunning) return;
  animationId = requestAnimationFrame(animate);

  // Smooth interpolation
  viewOffset.x += (targetOffset.x - viewOffset.x) * CONFIG.lerpSpeed;
  viewOffset.y += (targetOffset.y - viewOffset.y) * CONFIG.lerpSpeed;
  parallax.x += (targetParallax.x - parallax.x) * 0.08;
  parallax.y += (targetParallax.y - parallax.y) * 0.08;

  // Update uniforms
  if (imagesMesh?.material?.uniforms) {
    imagesMesh.material.uniforms.uViewOffset.value.set(viewOffset.x, viewOffset.y);
    imagesMesh.material.uniforms.uParallax.value.set(
      parallax.x * CONFIG.parallaxStrength,
      parallax.y * CONFIG.parallaxStrength
    );
  }

  // Render to target
  renderer.setRenderTarget(renderTarget);
  renderer.clear();
  renderer.render(scene, camera);

  // CRT pass
  renderer.setRenderTarget(null);
  if (crtMesh?.material?.uniforms) {
    crtMesh.material.uniforms.tDiffuse.value = renderTarget.texture;
    crtMesh.material.uniforms.uTime.value = performance.now() * 0.001;
  }
  renderer.render(crtScene, camera);
}

// --- Tweak Panel ---
function createTweakPanel() {
  const panel = document.createElement("div");
  panel.id = "crt-tweak-panel";
  panel.innerHTML = `
    <style>
      #crt-tweak-panel {
        position: fixed;
        top: 80px;
        right: 20px;
        background: rgba(0,0,0,0.9);
        border: 1px solid #333;
        padding: 16px;
        font-family: monospace;
        font-size: 11px;
        color: #fff;
        z-index: 1000;
        width: 240px;
        max-height: calc(100vh - 100px);
        overflow-y: auto;
        display: none;
      }
      #crt-tweak-panel.visible { display: block; }
      #crt-tweak-panel h3 {
        margin: 0 0 12px;
        font-size: 12px;
        color: #0f0;
        border-bottom: 1px solid #333;
        padding-bottom: 8px;
      }
      #crt-tweak-panel .section {
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid #222;
      }
      #crt-tweak-panel .section-title {
        color: #888;
        margin-bottom: 8px;
        font-size: 10px;
        text-transform: uppercase;
      }
      #crt-tweak-panel label {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
      }
      #crt-tweak-panel input[type="range"] {
        width: 100px;
        height: 4px;
        -webkit-appearance: none;
        background: #333;
        border-radius: 2px;
      }
      #crt-tweak-panel input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 12px;
        height: 12px;
        background: #0f0;
        border-radius: 50%;
        cursor: pointer;
      }
      #crt-tweak-panel .value {
        width: 35px;
        text-align: right;
        color: #0f0;
      }
      #crt-tweak-panel button {
        width: 100%;
        padding: 8px;
        margin-top: 8px;
        background: #222;
        border: 1px solid #444;
        color: #fff;
        cursor: pointer;
        font-family: monospace;
      }
      #crt-tweak-panel button:hover { background: #333; }
      #crt-toggle {
        position: fixed;
        top: 80px;
        right: 20px;
        background: rgba(0,0,0,0.8);
        border: 1px solid #333;
        color: #0f0;
        padding: 8px 12px;
        font-family: monospace;
        font-size: 11px;
        cursor: pointer;
        z-index: 999;
      }
    </style>
    <h3>CRT SHADER</h3>
    <div class="section">
      <div class="section-title">Scanlines</div>
      ${createSlider("scanlineIntensity", "Intensity", 0, 1, 0.01)}
      ${createSlider("scanlineCount", "Count", 100, 800, 10)}
      ${createSlider("phosphorIntensity", "Phosphor", 0, 1, 0.01)}
    </div>
    <div class="section">
      <div class="section-title">Color</div>
      ${createSlider("brightness", "Brightness", 0.5, 2, 0.01)}
      ${createSlider("contrast", "Contrast", 0.5, 2, 0.01)}
      ${createSlider("saturation", "Saturation", 0, 2, 0.01)}
      ${createSlider("rgbShift", "RGB Shift", 0, 2, 0.1)}
    </div>
    <div class="section">
      <div class="section-title">Effects</div>
      ${createSlider("bloomIntensity", "Bloom", 0, 1, 0.01)}
      ${createSlider("bloomThreshold", "Bloom Thresh", 0, 1, 0.01)}
      ${createSlider("noiseIntensity", "Noise", 0, 0.2, 0.005)}
      ${createSlider("flickerStrength", "Flicker", 0, 0.1, 0.005)}
    </div>
    <div class="section">
      <div class="section-title">Distortion</div>
      ${createSlider("curvature", "Curvature", 0, 0.15, 0.005)}
      ${createSlider("vignetteStrength", "Vignette", 0, 1, 0.01)}
    </div>
    <button id="crt-reset">Reset Defaults</button>
  `;

  const toggle = document.createElement("button");
  toggle.id = "crt-toggle";
  toggle.textContent = "CRT ⚙";
  toggle.onclick = () => panel.classList.toggle("visible");

  document.body.appendChild(panel);
  document.body.appendChild(toggle);

  // Bind sliders
  panel.querySelectorAll("input[type=range]").forEach(input => {
    const key = input.dataset.key;
    input.value = CONFIG.crt[key];
    input.nextElementSibling.textContent = parseFloat(input.value).toFixed(2);

    input.oninput = () => {
      const val = parseFloat(input.value);
      input.nextElementSibling.textContent = val.toFixed(2);
      CONFIG.crt[key] = val;
      if (crtMesh?.material?.uniforms) {
        const uniformKey = "u" + key.charAt(0).toUpperCase() + key.slice(1);
        if (crtMesh.material.uniforms[uniformKey]) {
          crtMesh.material.uniforms[uniformKey].value = val;
        }
      }
    };
  });

  panel.querySelector("#crt-reset").onclick = resetCRTDefaults;

  return { panel, toggle };
}

function createSlider(key, label, min, max, step) {
  return `
    <label>
      <span>${label}</span>
      <input type="range" data-key="${key}" min="${min}" max="${max}" step="${step}">
      <span class="value">0</span>
    </label>
  `;
}

function resetCRTDefaults() {
  const defaults = {
    scanlineIntensity: 0.35,
    scanlineCount: 480,
    phosphorIntensity: 0.4,
    bloomIntensity: 0.25,
    bloomThreshold: 0.4,
    curvature: 0.03,
    vignetteStrength: 0.3,
    noiseIntensity: 0.04,
    brightness: 1.15,
    contrast: 1.1,
    saturation: 1.15,
    rgbShift: 0.3,
    flickerStrength: 0.015
  };

  Object.assign(CONFIG.crt, defaults);

  document.querySelectorAll("#crt-tweak-panel input[type=range]").forEach(input => {
    const key = input.dataset.key;
    if (defaults[key] !== undefined) {
      input.value = defaults[key];
      input.nextElementSibling.textContent = defaults[key].toFixed(2);

      if (crtMesh?.material?.uniforms) {
        const uniformKey = "u" + key.charAt(0).toUpperCase() + key.slice(1);
        if (crtMesh.material.uniforms[uniformKey]) {
          crtMesh.material.uniforms[uniformKey].value = defaults[key];
        }
      }
    }
  });
}

// --- Init / Destroy ---
async function init() {
  container = document.getElementById("gallery");
  if (!container) return;

  const width = container.offsetWidth;
  const height = container.offsetHeight;
  const pixelRatio = Math.min(window.devicePixelRatio, CONFIG.maxPixelRatio);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(pixelRatio);
  renderer.setClearColor(0x000000, 1);
  container.appendChild(renderer.domElement);

  // Scenes & Camera
  scene = new THREE.Scene();
  crtScene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  camera.position.z = 5;

  // Generate layout
  generateImageLayout();

  // Load textures
  const images = await loadImages();
  const { texture, size } = createTextureAtlas(images);
  atlasTexture = texture;

  // Create meshes
  imagesMesh = createImagesMesh(size);
  imagesMesh.material.uniforms.uAspect.value = width / height;
  scene.add(imagesMesh);

  // Render target
  renderTarget = new THREE.WebGLRenderTarget(width * pixelRatio, height * pixelRatio, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter
  });

  // CRT pass
  crtMesh = createCRTPass(width, height);
  crtScene.add(crtMesh);

  // Tweak panel
  tweakPanel = createTweakPanel();

  // Event listeners
  const canvas = renderer.domElement;
  canvas.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("resize", onResize);

  // Nav buttons
  document.getElementById("archive-prev")?.addEventListener("click", (e) => {
    e.stopPropagation();
    navigateProject(-1);
  });
  document.getElementById("archive-next")?.addEventListener("click", (e) => {
    e.stopPropagation();
    navigateProject(1);
  });

  isRunning = true;
  animate();
}

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

  // Clean up tweak panel
  document.getElementById("crt-tweak-panel")?.remove();
  document.getElementById("crt-toggle")?.remove();

  if (renderer) {
    renderer.dispose();
    renderer.domElement?.remove();
  }

  if (imagesMesh) {
    imagesMesh.geometry.dispose();
    imagesMesh.material.dispose();
  }

  if (crtMesh) {
    crtMesh.geometry.dispose();
    crtMesh.material.dispose();
  }

  if (renderTarget) renderTarget.dispose();
  if (atlasTexture) atlasTexture.dispose();

  container = null;
  renderer = null;
  scene = null;
  crtScene = null;
  camera = null;
  imagesMesh = null;
  crtMesh = null;
  renderTarget = null;
  atlasTexture = null;
  imageData = [];
  worldSize = { x: 0, y: 0 };
  focusedIndex = -1;
  focusState = { value: 0 };
  viewOffset = { x: 0, y: 0 };
  targetOffset = { x: 0, y: 0 };
  parallax = { x: 0, y: 0 };
  targetParallax = { x: 0, y: 0 };
}
