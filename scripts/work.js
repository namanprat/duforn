import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { Draggable } from "gsap/Draggable";
import { workItems } from "../data/work-items.js";
import { getOrSplit } from "./text-reveal.js";

gsap.registerPlugin(MotionPathPlugin, Draggable);

// Constants
const CONFIG = {
  SLIDES_MULTIPLIER: 5,
  EXTRA_SLIDES_MULTIPLIER: 3,
  END_SCALE: 5,
  SLIDE_WIDTH_RATIO: 0.45,
  SCROLL_INTENSITY: 1,
  LERP_FACTOR: 0.1,
  SCROLL_TIMEOUT: 150,
  MOBILE_BREAKPOINT: 1000,
  // Oval/ellipse radii - horizontal and vertical
  OVAL_RADIUS_X_MOBILE: 144,
  OVAL_RADIUS_Y_MOBILE: 336,
  OVAL_RADIUS_X_DESKTOP: 540,
  OVAL_RADIUS_Y_DESKTOP: 336,
  THUMBNAIL_OFFSET_Y: -25,
  OUTER_DISTANCE_MULTIPLIER: 3,
  INTRO_DELAY: 0.2,
  INTRO_EASE: "power2.out",
  INTRO_STAGGER: 0.05,
  INTRO_DURATION: 1.0,
  SPIRAL_ROTATION: 540, // 1.5 rotations
  TAU: Math.PI * 2,
  DRAG_SENSITIVITY: 1.2,
  MOMENTUM_DECAY: 0.94,
  MOMENTUM_MIN_SPEED: 0.05
};

// State
const state = {
  slider: null,
  slideTitle: null,
  thumbnailWheel: null,
  totalImages: workItems.length,
  totalSlides: 0,
  slideWidth: 0,
  viewportCenter: 0,
  isMobile: false,
  currentX: 0,
  targetX: 0,
  isScrolling: false,
  scrollTimeout: null,
  activeSlideIndex: 0,
  isInitialized: false,
  isThumbnailIntroPlaying: false,
  thumbnailIntroTl: null,
  rafId: null,
  slides: null,
  thumbnails: null,
  introRadiusProgress: 0,
  dragProxy: null,
  draggable: null,
  dragMomentum: 0,
  lastDragTime: 0,
  isDragging: false,
};

// Precompute values
let totalWidth = 0;
let outerDistance = 0;
let halfSlideWidth = 0;

// Event listener options
const wheelOpts = { passive: false };

// Utility functions
const normalize = (angle) => {
  let a = angle % CONFIG.TAU;
  return a < 0 ? a + CONFIG.TAU : a;
};

const getThumbnailRadii = () => 
  state.isMobile 
    ? { rx: CONFIG.OVAL_RADIUS_X_MOBILE, ry: CONFIG.OVAL_RADIUS_Y_MOBILE }
    : { rx: CONFIG.OVAL_RADIUS_X_DESKTOP, ry: CONFIG.OVAL_RADIUS_Y_DESKTOP };

const getCurrentRotationRad = () => {
  const progress = Math.abs(state.currentX) / state.slideWidth;
  return -(progress * CONFIG.TAU / state.totalSlides) + Math.PI / 2;
};

// DOM creation
function createSlides() {
  if (!state.slider) return;
  
  const fragment = document.createDocumentFragment();
  const totalSlidesToCreate = state.totalSlides * CONFIG.EXTRA_SLIDES_MULTIPLIER;
  
  for (let i = 0; i < totalSlidesToCreate; i++) {
    const slide = document.createElement("div");
    slide.className = "slide";
    
    const img = document.createElement("img");
    img.src = workItems[i % state.totalImages].image;
    
    slide.appendChild(img);
    fragment.appendChild(slide);
  }
  
  state.slider.appendChild(fragment);
  state.slides = state.slider.querySelectorAll(".slide");
}

function createThumbnailItems() {
  if (!state.thumbnailWheel) return;
  
  const fragment = document.createDocumentFragment();
  const { rx, ry } = getThumbnailRadii();
  const cx = state.viewportCenter;
  const cy = window.innerHeight * 0.5 + CONFIG.THUMBNAIL_OFFSET_Y;
  
  for (let i = 0; i < state.totalSlides; i++) {
    const angle = (i / state.totalSlides) * CONFIG.TAU;
    
    const thumbnail = document.createElement("div");
    thumbnail.className = "thumbnail-item";
    
    const img = document.createElement("img");
    img.src = workItems[i % state.totalImages].image;
    thumbnail.appendChild(img);
    
    // Store angle and compute initial position on oval
    thumbnail._scale = 1; // Default to full scale for resize etc.

    thumbnail._angle = angle;
    const x = rx * Math.cos(angle) + cx;
    const y = ry * Math.sin(angle) + cy;
    
    gsap.set(thumbnail, {
      x, y,
      transformOrigin: "center center"
    });
    
    fragment.appendChild(thumbnail);
  }
  
  state.thumbnailWheel.appendChild(fragment);
  state.thumbnails = state.thumbnailWheel.querySelectorAll(".thumbnail-item");
}

function initializeSlider() {
  if (!state.slides) return;
  
  const positions = new Float32Array(state.slides.length);
  
  state.slides.forEach((slide, i) => {
    positions[i] = i * state.slideWidth - state.slideWidth;
  });
  
  // Batch set positions
  gsap.set(state.slides, {
    x: (i) => positions[i]
  });
  
  const centerOffset = state.viewportCenter - halfSlideWidth;
  state.currentX = centerOffset;
  state.targetX = centerOffset;
}

// Event handlers
function handleScroll(e) {
  const delta = e.deltaY || e.detail || e.wheelDelta * -1;
  state.targetX -= delta * CONFIG.SCROLL_INTENSITY;
  
  state.isScrolling = true;
  clearTimeout(state.scrollTimeout);
  
  state.scrollTimeout = setTimeout(() => {
    state.isScrolling = false;
  }, CONFIG.SCROLL_TIMEOUT);
}

function preventScroll(e) {
  if (e.target === document || e.target === document.body) {
    window.scrollTo(0, 0);
  }
}

// Animation loop
function animate() {
  // Apply momentum to targetX with decay
  if (Math.abs(state.dragMomentum) > CONFIG.MOMENTUM_MIN_SPEED) {
    state.targetX -= state.dragMomentum * 0.016; // approximate per-frame (~60fps)
    state.dragMomentum *= CONFIG.MOMENTUM_DECAY;
  } else if (!state.isDragging) {
    state.dragMomentum = 0;
  }

  state.currentX += (state.targetX - state.currentX) * CONFIG.LERP_FACTOR;
  
  // Infinite loop wrapping
  if (state.currentX > 0) {
    state.currentX -= totalWidth;
    state.targetX -= totalWidth;
  } else if (state.currentX < -totalWidth) {
    state.currentX += totalWidth;
    state.targetX += totalWidth;
  }
  
  let centerSlideIndex = 0;
  let closestToCenter = Infinity;
  
  // Single loop for all slide updates
  state.slides.forEach((slide, index) => {
    const x = index * state.slideWidth + state.currentX;
    const slideCenterX = x + halfSlideWidth;
    const distanceFromCenter = Math.abs(slideCenterX - state.viewportCenter);
    
    // Update position
    slide.style.transform = `translate3d(${x}px, 0, 0)`;
    
    // Calculate and apply scale
    const progress = Math.min(distanceFromCenter / outerDistance, 1);
    const easedProgress = progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) * 0.5;
    
    const scale = 1 + easedProgress * (CONFIG.END_SCALE - 1);
    const img = slide.firstElementChild;
    img.style.transform = `scale(${scale})`;
    
    // Track closest to center
    if (distanceFromCenter < closestToCenter) {
      closestToCenter = distanceFromCenter;
      centerSlideIndex = index % state.totalSlides;
    }
  });
  
  // Update active slide
  const slideProgress = Math.abs(state.currentX) / state.slideWidth;
  const newActiveSlideIndex = Math.floor(slideProgress) % state.totalSlides;
  
  if (newActiveSlideIndex !== state.activeSlideIndex) {
    state.activeSlideIndex = newActiveSlideIndex;
  }
  
  // Update title
  const currentTitleIndex = centerSlideIndex % state.totalImages;
  const currentItem = workItems[currentTitleIndex];
  
  if (state.slideTitle.textContent !== currentItem.title) {
    state.slideTitle.textContent = currentItem.title;
    state.slideTitle.dataset.href = currentItem.href || "";
  }
  
  updateThumbnailItems();
  
  state.rafId = requestAnimationFrame(animate);
}

function updateThumbnailItems() {
  if (!state.thumbnails) return;
  
  const currentRotation = getCurrentRotationRad();
  const { rx, ry } = getThumbnailRadii();
  const cx = state.viewportCenter;
  const cy = window.innerHeight * 0.5 + CONFIG.THUMBNAIL_OFFSET_Y;
  
  state.thumbnails.forEach((thumbnail) => {
    // Determine effective scale from property or default to 1 if not set
    // (during normal operation _scale might be undefined or we just use 1)
    const s = (typeof thumbnail._scale === 'number') ? thumbnail._scale : 1;
    // Determine expansion factor: if intro is playing, we use state.introRadiusProgress
    // If intro finished or on resize, we expect full radius (progress = 1)
    
    // BUT: onResize sets isThumbnailIntroPlaying = false, but introRadiusProgress might be 0.
    // So we should check if intro is playing. If NOT playing, force full expansion?
    // Let's rely on state.introRadiusProgress being managed correctly.
    // In onResize we will set it to 1.
    
    const radiusMultiplier = state.introRadiusProgress;

    const angle = thumbnail._angle + currentRotation;
    // Interpolate from center (cx,cy) to oval position
    // Center is when radiusMultiplier is 0
    // Oval is when radiusMultiplier is 1
    const x = (rx * radiusMultiplier) * Math.cos(angle) + cx;
    const y = (ry * radiusMultiplier) * Math.sin(angle) + cy;
    
    thumbnail.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${s})`;
  });
}

// Draggable setup
let lastDragX = 0;
function onDragPress() {
  lastDragX = state.draggable ? state.draggable.x : 0;
  state.lastDragTime = performance.now();
  state.dragMomentum = 0;
  state.isDragging = true;
}

function onDragMove() {
  if (!state.draggable) return;
  const now = performance.now();
  const dx = state.draggable.x - lastDragX;
  const dt = Math.max((now - state.lastDragTime) / 1000, 0.001); // seconds
  lastDragX = state.draggable.x;
  state.lastDragTime = now;
  // Map horizontal drag to slider movement with sensitivity
  const delta = dx * CONFIG.DRAG_SENSITIVITY;
  state.targetX -= delta;
  // Update momentum with latest speed
  state.dragMomentum = delta / dt;
}

function onDragRelease() {
  state.isDragging = false;
  // momentum decay handled in animate()
}

function setupDrag() {
  // Ensure previous instance is cleaned
  destroyDrag();

  // Invisible proxy so the wheel itself doesn't move
  const proxy = document.createElement("div");
  proxy.style.position = "absolute";
  proxy.style.left = "0";
  proxy.style.top = "0";
  proxy.style.width = "1px";
  proxy.style.height = "1px";
  proxy.style.pointerEvents = "none";
  document.body.appendChild(proxy);
  state.dragProxy = proxy;

  // Create draggable bound to the thumbnail wheel as the trigger
  const instances = Draggable.create(proxy, {
    trigger: state.thumbnailWheel,
    type: "x",
    cursor: "grab",
    activeCursor: "grabbing",
    onPress: onDragPress,
    onDrag: onDragMove,
    onRelease: onDragRelease,
    allowContextMenu: true,
    minimumMovement: 1,
    zIndexBoost: false,
    dragResistance: 0.02,
  });
  state.draggable = instances && instances[0] ? instances[0] : null;
}

function destroyDrag() {
  if (state.draggable) {
    state.draggable.kill();
    state.draggable = null;
  }
  if (state.dragProxy && state.dragProxy.parentNode) {
    state.dragProxy.parentNode.removeChild(state.dragProxy);
    state.dragProxy = null;
  }
}

function playThumbnailWheelIntro() {
  if (!state.thumbnailWheel || !state.thumbnails?.length) return;
  
  if (state.thumbnailIntroTl) {
    state.thumbnailIntroTl.kill();
  }
  
  state.isThumbnailIntroPlaying = true;
  state.introRadiusProgress = 0; // Ensure we start at center
  
  const cx = state.viewportCenter;
  const cy = window.innerHeight * 0.5 + CONFIG.THUMBNAIL_OFFSET_Y;
  const { rx, ry } = getThumbnailRadii();
  
  // Disable pointer events during animation
  if (state.thumbnailWheel) {
    state.thumbnailWheel.style.pointerEvents = 'none';
  }
  if (state.slider) {
    state.slider.style.pointerEvents = 'none';
  }
  
  // Set initial state: all thumbnails stacked at center (radius 0)
  // Scale 0, opacity 0.
  state.thumbnails.forEach((t, i) => {
    t._scale = 0;
    gsap.set(t, { opacity: 0, zIndex: 100 + (state.thumbnails.length - 1 - i) });
  });

  // Create timeline
  state.thumbnailIntroTl = gsap.timeline({
    onComplete: () => {
      // Clean handoff to normal state
      state.isThumbnailIntroPlaying = false;
      state.introRadiusProgress = 1;
      
      // Re-enable pointer events
      if (state.thumbnailWheel) {
        state.thumbnailWheel.style.pointerEvents = 'auto';
      }
      if (state.slider) {
        state.slider.style.pointerEvents = 'auto';
      }
      // Draggable becomes usable after intro when pointer events are enabled
    }
  });
  
  // Phase 1: Thumbnails appear stacked (last one first, first one last) - starting bigger
  // Animate _scale and opacity
  state.thumbnails.forEach((thumbnail, i) => {
    const delay = (state.thumbnails.length - 1 - i) * 0.08;
    
    // Opacity on element directly
    state.thumbnailIntroTl.to(thumbnail, { opacity: 1, duration: 0.5, ease: "power2.out" }, delay);
    
    // _scale on element property
    state.thumbnailIntroTl.to(thumbnail, { _scale: 1.3, duration: 0.5, ease: "power2.out" }, delay);
  });
  
  // Phase 2: Short pause
  state.thumbnailIntroTl.to({}, { duration: 0.3 });
  
  // Phase 3: Spread to circle positions (radiusProgress -> 1) and scale down to normal (_scale -> 1)
  // All together
  state.thumbnailIntroTl.to(state, {
    introRadiusProgress: 1,
    duration: 1.2,
    ease: "power2.inOut"
  }, "expand");
  
  state.thumbnails.forEach((thumbnail) => {
    state.thumbnailIntroTl.to(thumbnail, {
      _scale: 1,
      duration: 1.2,
      ease: "power2.inOut"
    }, "expand");
  });

  // Text reveal overlaps with expansion
  const slideTitle = document.querySelector('.slide-title');
  if (slideTitle) {
    const split = getOrSplit(slideTitle);
    if (split?.chars) {
      gsap.set(slideTitle, { opacity: 1 });
      state.thumbnailIntroTl.fromTo(
        split.chars,
        { y: 100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: {
            amount: 0.2,
          },
          ease: "power2.out"
        },
        "expand+=0.2"
      );
    }
  }
}
// Resize handler
function onResize() {
  if (state.thumbnailIntroTl) {
    state.thumbnailIntroTl.kill();
    state.thumbnailIntroTl = null;
  }
  
  state.isThumbnailIntroPlaying = false;
  state.introRadiusProgress = 1;
  state.isMobile = window.innerWidth < CONFIG.MOBILE_BREAKPOINT;
  state.slideWidth = window.innerWidth * CONFIG.SLIDE_WIDTH_RATIO;
  state.viewportCenter = window.innerWidth * 0.5;
  
  // Recalculate derived values
  halfSlideWidth = state.slideWidth * 0.5;
  totalWidth = state.totalSlides * state.slideWidth;
  outerDistance = state.slideWidth * CONFIG.OUTER_DISTANCE_MULTIPLIER;
  
  if (state.thumbnailWheel) {
    state.thumbnailWheel.innerHTML = "";
  }
  
  createThumbnailItems();
  initializeSlider();
  updateThumbnailItems();
}

// Setup and cleanup
function setupEventListeners() {
  window.addEventListener("wheel", handleScroll, wheelOpts);
  window.addEventListener("DOMMouseScroll", handleScroll, wheelOpts);
  window.addEventListener("scroll", preventScroll, wheelOpts);
  window.addEventListener("resize", onResize);
}

function cleanupWork() {
  if (state.thumbnailIntroTl) {
    state.thumbnailIntroTl.kill();
    state.thumbnailIntroTl = null;
  }
  
  state.isThumbnailIntroPlaying = false;
  
  if (state.rafId) {
    cancelAnimationFrame(state.rafId);
    state.rafId = null;
  }
  
  window.removeEventListener("wheel", handleScroll, wheelOpts);
  window.removeEventListener("DOMMouseScroll", handleScroll, wheelOpts);
  window.removeEventListener("scroll", preventScroll, wheelOpts);
  window.removeEventListener("resize", onResize);
  
  if (state.slideTitle) {
    state.slideTitle.onclick = null;
  }
  
  if (state.slider) state.slider.innerHTML = "";
  if (state.thumbnailWheel) state.thumbnailWheel.innerHTML = "";
  destroyDrag();
  
  // Clear cached references
  state.slides = null;
  state.thumbnails = null;
  state.isInitialized = false;
}

function initWork() {
  cleanupWork();
  
  state.slider = document.querySelector(".slider");
  state.slideTitle = document.querySelector(".slide-title");
  state.thumbnailWheel = document.querySelector(".thumbnail-wheel");
  
  if (!state.slider || !state.slideTitle || !state.thumbnailWheel) return;
  
  // Initialize dimensions
  state.isMobile = window.innerWidth < CONFIG.MOBILE_BREAKPOINT;
  state.slideWidth = window.innerWidth * CONFIG.SLIDE_WIDTH_RATIO;
  state.viewportCenter = window.innerWidth * 0.5;
  state.totalSlides = state.totalImages * CONFIG.SLIDES_MULTIPLIER;
  
  // Precompute frequently used values
  halfSlideWidth = state.slideWidth * 0.5;
  totalWidth = state.totalSlides * state.slideWidth;
  outerDistance = state.slideWidth * CONFIG.OUTER_DISTANCE_MULTIPLIER;
  
  createSlides();
  createThumbnailItems();
  initializeSlider();
  setupEventListeners();
  setupDrag();
  
  // Hide slide title initially
  if (state.slideTitle) {
    gsap.set(state.slideTitle, { opacity: 0 });
  }
  
  // Play circle intro animation
  playThumbnailWheelIntro();
  
  state.slideTitle.onclick = () => {
    const href = state.slideTitle.dataset.href;
    if (href) window.location.href = href;
  };
  
  animate();
  state.isInitialized = true;
}

export { initWork, cleanupWork as destroyWork };