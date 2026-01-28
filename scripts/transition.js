import gsap from "gsap";

// Cache DOM elements
let overlay = null;
let transitionContainer = null;

function getElements() {
  if (!overlay) {
    overlay = document.querySelector(".transition-overlay");
  }
  if (!transitionContainer) {
    transitionContainer = document.querySelector(".transition");
  }
  return { overlay, transitionContainer };
}

/**
 * Leave transition: Scale down current page + animate overlay in
 * Called during Barba's leave hook
 */
export async function animateTransition() {
  const { overlay } = getElements();
  const container = document.querySelector('[data-barba="container"]');

  const tl = gsap.timeline();

  // Set initial state for overlay
  gsap.set(overlay, {
    yPercent: 100,
    visibility: "visible"
  });

  // Scale down current page (zoom-out effect)
  tl.to(container, {
    scale: 0.95,
    opacity: 0.5,
    duration: 0.4,
    ease: "power2.inOut"
  });

  // Animate overlay sliding up to cover screen
  tl.to(overlay, {
    yPercent: 0,
    duration: 0.5,
    ease: "power2.inOut"
  }, "-=0.2"); // Slight overlap for smoother feel

  return tl;
}

/**
 * Enter transition: Slide new page in + animate overlay out
 * Called during Barba's enter hook
 */
export async function revealTransition() {
  const { overlay } = getElements();
  const container = document.querySelector('[data-barba="container"]');

  const tl = gsap.timeline();

  // Set initial state for new page (off-screen to the right)
  gsap.set(container, {
    xPercent: 100,
    scale: 1,
    opacity: 1
  });

  // Animate overlay out (slide up and away)
  tl.to(overlay, {
    yPercent: -100,
    duration: 0.5,
    ease: "power2.inOut"
  });

  // Slide new page into view
  tl.to(container, {
    xPercent: 0,
    duration: 0.6,
    ease: "power2.out"
  }, "-=0.3"); // Overlap with overlay exit

  // Reset overlay position after animation completes
  tl.set(overlay, {
    yPercent: 100,
    visibility: "hidden"
  });

  return tl;
}

/**
 * Initial page reveal (for first page load via Barba's once hook)
 * No slide animation, just ensures page is visible
 */
export async function initialReveal() {
  const { overlay } = getElements();
  const container = document.querySelector('[data-barba="container"]');

  // Ensure container is in normal state
  gsap.set(container, {
    xPercent: 0,
    scale: 1,
    opacity: 1
  });

  // Ensure overlay is hidden
  gsap.set(overlay, {
    yPercent: 100,
    visibility: "hidden"
  });
}

/**
 * Close menu if it's open (utility for transitions)
 */
export function closeMenuIfOpen() {
  const menuToggleBtn = document.querySelector(".menu-toggle-btn");
  if (menuToggleBtn && menuToggleBtn.classList.contains("menu-open")) {
    menuToggleBtn.click();
  }
}

export default { revealTransition, animateTransition, initialReveal, closeMenuIfOpen };
