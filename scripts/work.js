import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { workItems } from "../data/work-items.js";

gsap.registerPlugin(MotionPathPlugin);

let slider;
let slideTitle;
let thumbnailWheel;

const wheelListenerOpts = { passive: false };
const totalImages = workItems.length;
const totalSlides = totalImages * 5; // repeat for smooth loop
const endScale = 5;
let slideWidth = window.innerWidth * 0.45;
let viewportCenter = window.innerWidth / 2;
let isMobile = window.innerWidth < 1000;
let rafId = null;

let currentX = 0;
let targetX = 0;
let isScrolling = false;
let scrollTimeout;
let activeSlideIndex = 0;
let isInitialized = false;

let isThumbnailIntroPlaying = false;
let thumbnailIntroTl = null;

const THUMBNAIL_INTRO_DELAY = 0.2;
const THUMBNAIL_INTRO_EASE = "power2.out";
const THUMBNAIL_INTRO_STAGGER = 0.05;
const TAU = Math.PI * 2;

function getThumbnailRadius() {
  return isMobile ? 150 : 350;
}

function getCurrentRotationAngleDeg() {
  const exactSlideProgress = Math.abs(currentX) / slideWidth;
  return -(exactSlideProgress * (360 / totalSlides)) + 90;
}

function getArcPointsAntiClockwise({ cx, cy, radius, fromAngle, toAngle, steps = 14 }) {
  const normalize = (angle) => {
    let a = angle;
    while (a < 0) a += TAU;
    while (a >= TAU) a -= TAU;
    return a;
  };

  const start = normalize(fromAngle);
  let end = normalize(toAngle);

  // Screen coords use +sin(angle) for y, so decreasing angle moves anti-clockwise.
  if (end > start) end -= TAU;

  const points = [];
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const angle = start + (end - start) * t;
    points.push({
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    });
  }
  return points;
}

function createSlides() {
  if (!slider) return;
  for (let i = 0; i < totalSlides * 3; i++) {
    const slide = document.createElement("div");
    slide.className = "slide";

    const img = document.createElement("img");
    const item = workItems[i % totalImages];
    img.src = item.image;

    slide.appendChild(img);
    slider.appendChild(slide);
  }
}

function createThumbnailItems({ atOrigin = false } = {}) {
  if (!thumbnailWheel) return;
  for (let i = 0; i < totalSlides; i++) {
    const angle = (i / totalSlides) * Math.PI * 2;
    const radius = getThumbnailRadius();

    const thumbnail = document.createElement("div");
    thumbnail.className = "thumbnail-item";
    thumbnail.dataset.index = i;
    thumbnail.dataset.angle = angle;
    thumbnail.dataset.radius = radius;

    const img = document.createElement("img");
    const item = workItems[i % totalImages];
    img.src = item.image;
    thumbnail.appendChild(img);

    if (atOrigin) {
      gsap.set(thumbnail, {
        x: window.innerWidth / 2,
        y: window.innerHeight,
        xPercent: -50,
        yPercent: -100,
        transformOrigin: "center center",
      });
    } else {
      const x = radius * Math.cos(angle) + window.innerWidth / 2;
      const y = radius * Math.sin(angle) + window.innerHeight / 2 - 25;
      gsap.set(thumbnail, {
        x,
        y,
        transformOrigin: "center center",
      });
    }

    thumbnailWheel.appendChild(thumbnail);
  }
}

function initializeSlider() {
  const slides = document.querySelectorAll(".slide");

  slides.forEach((slide, index) => {
    const x = index * slideWidth - slideWidth;
    gsap.set(slide, { x: x });
  });

  const centerOffset = window.innerWidth / 2 - slideWidth / 2;
  currentX = centerOffset;
  targetX = centerOffset;
}

function handleScroll(e) {
  const scrollIntensity = e.deltaY || e.detail || e.wheelDelta * -1;
  targetX -= scrollIntensity * 1;

  isScrolling = true;
  clearTimeout(scrollTimeout);

  scrollTimeout = setTimeout(() => {
    isScrolling = false;
  }, 150);
}

function animate() {
  currentX += (targetX - currentX) * 0.1;

  const totalWidth = totalSlides * slideWidth;
  if (currentX > 0) {
    currentX -= totalWidth;
    targetX -= totalWidth;
  } else if (currentX < -totalWidth) {
    currentX += totalWidth;
    targetX += totalWidth;
  }

  let centerSlideIndex = 0;
  let closestToCenter = Infinity;
  const slides = document.querySelectorAll(".slide");

  slides.forEach((slide, index) => {
    const x = index * slideWidth + currentX;
    gsap.set(slide, { x: x });

    const slideCenterX = x + slideWidth / 2;
    const distanceFromCenter = Math.abs(slideCenterX - viewportCenter);

    const outerDistance = slideWidth * 3;
    const progress = Math.min(distanceFromCenter / outerDistance, 1);

    const easedProgress =
      progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

    const scale = 1 + easedProgress * (endScale - 1);

    const img = slide.querySelector("img");
    gsap.set(img, { scale: scale });

    // Find the slide closest to the center
    if (distanceFromCenter < closestToCenter) {
      closestToCenter = distanceFromCenter;
      centerSlideIndex = index % totalSlides;
    }
  });

  const slideProgress = Math.abs(currentX) / slideWidth;
  const newActiveSlideIndex = Math.floor(slideProgress) % totalSlides;

  if (newActiveSlideIndex !== activeSlideIndex) {
    activeSlideIndex = newActiveSlideIndex;
  }

  const currentTitleIndex = centerSlideIndex % workItems.length;
  const currentItem = workItems[currentTitleIndex];
  slideTitle.textContent = currentItem.title;
  slideTitle.dataset.href = currentItem.href || "";

  if (!isThumbnailIntroPlaying) updateThumbnailItems();

  rafId = requestAnimationFrame(animate);
}

function updateThumbnailItems() {
  const exactSlideProgress = Math.abs(currentX) / slideWidth;
  const currentRotationAngle = -(exactSlideProgress * (360 / totalSlides)) + 90;

  const thumbnails = document.querySelectorAll(".thumbnail-item");
  thumbnails.forEach((thumbnail) => {
    const baseAngle = parseFloat(thumbnail.dataset.angle);
    const radius = getThumbnailRadius();
    const currentAngle = baseAngle + (currentRotationAngle * Math.PI) / 180;

    const x = radius * Math.cos(currentAngle) + window.innerWidth / 2;
    const y = radius * Math.sin(currentAngle) + window.innerHeight / 2 - 25;

    gsap.set(thumbnail, {
      x: x,
      y: y,
      rotation: 0,
      transformOrigin: "center center",
    });
  });
}

function playThumbnailWheelIntro() {
  if (!thumbnailWheel) return;

  const thumbnails = Array.from(thumbnailWheel.querySelectorAll(".thumbnail-item"));
  if (thumbnails.length === 0) return;

  if (thumbnailIntroTl) {
    thumbnailIntroTl.kill();
    thumbnailIntroTl = null;
  }

  isThumbnailIntroPlaying = true;

  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2 - 25;
  const radius = getThumbnailRadius();

  const currentRotationDeg = getCurrentRotationAngleDeg();
  const currentRotationRad = (currentRotationDeg * Math.PI) / 180;

  // Position all thumbnails at center before animation
  gsap.set(thumbnails, {
    x: cx,
    y: cy,
    rotation: 0,
    scale: 0.8,
    opacity: 0,
  });

  // Spiral intro timeline
  thumbnailIntroTl = gsap.timeline({
    delay: THUMBNAIL_INTRO_DELAY,
    defaults: { ease: THUMBNAIL_INTRO_EASE },
    onComplete: () => {
      updateThumbnailItems();
      isThumbnailIntroPlaying = false;
    },
  });

  thumbnails.forEach((thumbnail, index) => {
    const baseAngle = parseFloat(thumbnail.dataset.angle);
    const targetAngle = baseAngle + currentRotationRad;

    // Calculate final position on the wheel
    const endX = radius * Math.cos(targetAngle) + cx;
    const endY = radius * Math.sin(targetAngle) + cy;

    // Spiral rotation: full rotation per item, creating a spiral effect
    const spiralRotation = 360 * 1.5; // 1.5 full rotations for nice spiral

    thumbnailIntroTl.to(
      thumbnail,
      {
        duration: 1.0,
        x: endX,
        y: endY,
        rotation: spiralRotation,
        scale: 1,
        opacity: 1,
      },
      index * THUMBNAIL_INTRO_STAGGER
    );
  });
}

function preventScroll(e) {
  if (e.target === document || e.target === document.body) {
    window.scrollTo(0, 0);
  }
}

function onResize() {
  if (thumbnailIntroTl) {
    thumbnailIntroTl.kill();
    thumbnailIntroTl = null;
  }
  isThumbnailIntroPlaying = false;
  isMobile = window.innerWidth < 1000;
  slideWidth = window.innerWidth * 0.45;
  viewportCenter = window.innerWidth / 2;
  if (thumbnailWheel) {
    thumbnailWheel.innerHTML = "";
  }
  createThumbnailItems();
  initializeSlider();
}

function setupEventListeners() {
  window.addEventListener("wheel", handleScroll, wheelListenerOpts);
  window.addEventListener("DOMMouseScroll", handleScroll, wheelListenerOpts);
  window.addEventListener("scroll", preventScroll, wheelListenerOpts);
  window.addEventListener("resize", onResize);
}

function cleanupWork() {
  if (thumbnailIntroTl) {
    thumbnailIntroTl.kill();
    thumbnailIntroTl = null;
  }
  isThumbnailIntroPlaying = false;
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  window.removeEventListener("wheel", handleScroll, wheelListenerOpts);
  window.removeEventListener("DOMMouseScroll", handleScroll, wheelListenerOpts);
  window.removeEventListener("scroll", preventScroll, wheelListenerOpts);
  window.removeEventListener("resize", onResize);
  if (slideTitle) {
    slideTitle.onclick = null;
  }
  if (slider) slider.innerHTML = "";
  if (thumbnailWheel) thumbnailWheel.innerHTML = "";
  isInitialized = false;
}

function initWork() {
  cleanupWork();
  slider = document.querySelector(".slider");
  slideTitle = document.querySelector(".slide-title");
  thumbnailWheel = document.querySelector(".thumbnail-wheel");
  if (!slider || !slideTitle || !thumbnailWheel) return;

  slideWidth = window.innerWidth * 0.45;
  viewportCenter = window.innerWidth / 2;
  isMobile = window.innerWidth < 1000;

  createSlides();
  createThumbnailItems({ atOrigin: true });
  initializeSlider();
  setupEventListeners();
  playThumbnailWheelIntro();
  slideTitle.onclick = () => {
    const href = slideTitle.dataset.href;
    if (href) {
      window.location.href = href;
    }
  };
  animate();
  isInitialized = true;
}

export { initWork, cleanupWork as destroyWork };
