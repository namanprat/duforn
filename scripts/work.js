import gsap from "gsap";
import { workItems } from "../data/work-items.js";

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

function createThumbnailItems() {
  if (!thumbnailWheel) return;
  for (let i = 0; i < totalSlides; i++) {
    const angle = (i / totalSlides) * Math.PI * 2;
    const radius = isMobile ? 100 : 350;
    const x = radius * Math.cos(angle) + window.innerWidth / 2;
    const y = radius * Math.sin(angle) + window.innerHeight / 2 - 25;

    const thumbnail = document.createElement("div");
    thumbnail.className = "thumbnail-item";
    thumbnail.dataset.index = i;
    thumbnail.dataset.angle = angle;
    thumbnail.dataset.radius = radius;

    const img = document.createElement("img");
    const item = workItems[i % totalImages];
    img.src = item.image;
    thumbnail.appendChild(img);

    gsap.set(thumbnail, {
      x,
      y,
      transformOrigin: "center center",
    });

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

  updateThumbnailItems();

  rafId = requestAnimationFrame(animate);
}

function updateThumbnailItems() {
  const exactSlideProgress = Math.abs(currentX) / slideWidth;
  const currentRotationAngle = -(exactSlideProgress * (360 / totalSlides)) + 90;

  const thumbnails = document.querySelectorAll(".thumbnail-item");
  thumbnails.forEach((thumbnail) => {
    const baseAngle = parseFloat(thumbnail.dataset.angle);
    const radius = isMobile ? 150 : 350;
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

function preventScroll(e) {
  if (e.target === document || e.target === document.body) {
    window.scrollTo(0, 0);
  }
}

function onResize() {
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
  createThumbnailItems();
  initializeSlider();
  setupEventListeners();
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
