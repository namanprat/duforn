import gsap from "gsap";

/**
 * Cinematic Page Transitions using GSAP + Barba.js
 *
 * Transition Flow:
 * 1. LEAVE: Old page zooms out (scale 1 → 0.9) while overlay slides in
 * 2. ENTER: New page slides in from below while overlay slides out
 *
 * Selectors:
 * - .transition: Fixed fullscreen container (z-index: 1000)
 * - .transition-overlay: Animated layer that covers viewport
 * - main[data-barba="container"]: Page content container
 */

// ============================================
// CONFIGURATION
// Adjust these values to fine-tune the animation
// ============================================
const CONFIG = {
  // Leave phase (old page zoom-out)
  leave: {
    scale: 0.92,           // Scale down to this value (1 → 0.92)
    opacity: 0.6,          // Reduce opacity to this value
    duration: 0.6,         // Duration in seconds
    ease: "power2.inOut"   // Smooth, non-bouncy easing
  },

  // Overlay animation
  overlay: {
    inDuration: 0.5,       // Duration for overlay to appear
    outDuration: 0.5,      // Duration for overlay to disappear
    ease: "power2.inOut",  // Easing for overlay
    stagger: 0.1           // Overlap between overlay and content animations
  },

  // Enter phase (new page slide-in)
  enter: {
    yPercent: 25,          // Start offset (slides from 25% below)
    opacity: 0,            // Start opacity
    duration: 0.7,         // Duration in seconds
    ease: "power2.out"     // Smooth deceleration
  }
};

// ============================================
// STATE
// ============================================
let isAnimating = false;

// ============================================
// DOM SELECTORS
// ============================================
function getOverlay() {
  return document.querySelector(".transition-overlay");
}

function getContainer() {
  return document.querySelector('main[data-barba="container"]');
}

// ============================================
// LEAVE TRANSITION
// Called when navigating away from current page
// ============================================
export async function animateTransition() {
  // Prevent navigation during animation
  if (isAnimating) return;
  isAnimating = true;

  const overlay = getOverlay();
  const container = getContainer();

  if (!overlay || !container) {
    console.warn("Transition elements not found");
    isAnimating = false;
    return;
  }

  // Create timeline for coordinated leave animation
  const tl = gsap.timeline({
    defaults: { ease: CONFIG.leave.ease }
  });

  // Prepare overlay for animation
  // Start with overlay off-screen (above viewport)
  gsap.set(overlay, {
    yPercent: -100,
    opacity: 1
  });

  // Set transform origin for zoom-out effect
  gsap.set(container, {
    transformOrigin: "center center"
  });

  // -------------------------
  // LEAVE ANIMATION SEQUENCE
  // -------------------------

  // 1. Zoom out the old page content
  //    Creates depth effect - feels like pulling back
  tl.to(container, {
    scale: CONFIG.leave.scale,
    opacity: CONFIG.leave.opacity,
    duration: CONFIG.leave.duration
  }, 0);

  // 2. Slide overlay in from top
  //    Starts slightly before zoom completes for smooth overlap
  tl.to(overlay, {
    yPercent: 0,
    duration: CONFIG.overlay.inDuration,
    ease: CONFIG.overlay.ease
  }, CONFIG.overlay.stagger);

  // Wait for timeline to complete
  return new Promise((resolve) => {
    tl.eventCallback("onComplete", resolve);
  });
}

// ============================================
// ENTER TRANSITION
// Called when new page content is ready
// ============================================
export async function revealTransition() {
  const overlay = getOverlay();
  const container = getContainer();

  if (!overlay || !container) {
    console.warn("Transition elements not found");
    isAnimating = false;
    return;
  }

  // Create timeline for coordinated enter animation
  const tl = gsap.timeline({
    defaults: { ease: CONFIG.enter.ease }
  });

  // Prepare new page content
  // Start offset below viewport and invisible
  gsap.set(container, {
    yPercent: CONFIG.enter.yPercent,
    opacity: CONFIG.enter.opacity,
    scale: 1,  // Reset scale to normal
    transformOrigin: "center center"
  });

  // -------------------------
  // ENTER ANIMATION SEQUENCE
  // -------------------------

  // 1. Slide overlay out (downward)
  //    Reveals new content underneath
  tl.to(overlay, {
    yPercent: 100,
    duration: CONFIG.overlay.outDuration,
    ease: CONFIG.overlay.ease
  }, 0);

  // 2. Slide new page in from below
  //    Starts slightly before overlay fully exits for overlap effect
  tl.to(container, {
    yPercent: 0,
    opacity: 1,
    duration: CONFIG.enter.duration
  }, CONFIG.overlay.stagger);

  // Wait for timeline to complete
  return new Promise((resolve) => {
    tl.eventCallback("onComplete", () => {
      // Reset all transforms
      gsap.set(container, { clearProps: "all" });
      gsap.set(overlay, { clearProps: "all" });

      // Re-enable navigation
      isAnimating = false;
      resolve();
    });
  });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Close menu if it's currently open
 * Called before page transition to ensure clean state
 */
export function closeMenuIfOpen() {
  const menuToggleBtn = document.querySelector(".menu-toggle-btn");
  if (menuToggleBtn && menuToggleBtn.classList.contains("menu-open")) {
    menuToggleBtn.click();
  }
}

/**
 * Check if transition is currently in progress
 * Can be used to prevent conflicting animations
 */
export function isTransitionActive() {
  return isAnimating;
}

export default { revealTransition, animateTransition, closeMenuIfOpen, isTransitionActive };
