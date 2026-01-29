import gsap from "gsap";
import html2canvas from "html2canvas";

/**
 * Page Transition System
 *
 * Inspired by Codrops Slideshow Animations demo3 - uses a scale+translate approach:
 * - On leave: capture current page as snapshot, scale it down
 * - On enter: new page slides up from bottom
 * - Both animations overlap for a cinematic effect
 *
 * This approach handles Three.js canvases by capturing them as part of the html2canvas
 * snapshot, so they visually remain part of the outgoing page during transition.
 */

// Module state
let snapshotEl = null;
let transitionContainer = null;
let isAnimating = false;

/**
 * Get or create the transition container
 * This container holds the snapshot during transitions
 */
function getTransitionContainer() {
  if (transitionContainer) return transitionContainer;

  transitionContainer = document.querySelector('.transition');
  if (!transitionContainer) {
    transitionContainer = document.createElement('div');
    transitionContainer.className = 'transition';
    document.body.appendChild(transitionContainer);
  }

  return transitionContainer;
}

/**
 * Capture the current page state including all canvases
 * Returns an image element with the snapshot
 */
async function capturePageSnapshot() {
  // Configure html2canvas to capture WebGL canvases
  const canvas = await html2canvas(document.body, {
    backgroundColor: '#000000',
    useCORS: true,
    logging: false,
    scale: Math.min(window.devicePixelRatio || 1, 2),
    // Allow tainted canvas to capture WebGL content
    allowTaint: true,
    // Capture canvas elements
    onclone: (clonedDoc) => {
      // Copy canvas content from original to cloned document
      const originalCanvases = document.querySelectorAll('canvas');
      const clonedCanvases = clonedDoc.querySelectorAll('canvas');

      originalCanvases.forEach((originalCanvas, index) => {
        if (clonedCanvases[index]) {
          try {
            const clonedCtx = clonedCanvases[index].getContext('2d');
            if (clonedCtx) {
              clonedCanvases[index].width = originalCanvas.width;
              clonedCanvases[index].height = originalCanvas.height;
              clonedCtx.drawImage(originalCanvas, 0, 0);
            }
          } catch (e) {
            // Canvas might be tainted, that's OK - html2canvas will handle it
          }
        }
      });
    }
  });

  // Create image element from canvas
  const img = document.createElement('img');
  img.src = canvas.toDataURL('image/png');
  img.className = 'transition-snapshot';
  img.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    object-fit: cover;
    z-index: 999;
    pointer-events: none;
    transform-origin: center center;
    will-change: transform, opacity;
  `;

  return img;
}

/**
 * Clean up snapshot element
 */
function cleanupSnapshot() {
  if (snapshotEl && snapshotEl.parentNode) {
    snapshotEl.parentNode.removeChild(snapshotEl);
  }
  snapshotEl = null;
}

/**
 * Main transition animation - leave phase
 *
 * Captures the current page state and begins the scale-down animation.
 * The snapshot remains visible while Barba.js swaps the page content.
 *
 * Three.js canvas handling:
 * - The canvas is captured as part of the html2canvas snapshot
 * - After capture, the original page content AND #background are hidden
 * - The snapshot visually represents the old page during the transition
 * - This prevents any flash or reinitialization of WebGL content
 */
export async function animateTransition() {
  if (isAnimating) return Promise.resolve();
  isAnimating = true;

  // Clean up any previous snapshot
  cleanupSnapshot();

  const container = getTransitionContainer();
  const barbaContainer = document.querySelector('[data-barba="container"]');
  const backgroundEl = document.getElementById('background');

  try {
    // Capture the current page state (including WebGL canvases)
    snapshotEl = await capturePageSnapshot();
    container.appendChild(snapshotEl);

    // Ensure the snapshot is visible
    gsap.set(snapshotEl, {
      opacity: 1,
      scale: 1,
      y: 0
    });

    // Hide the original page content after capturing
    // This ensures no duplicate content shows underneath the snapshot
    if (barbaContainer) {
      gsap.set(barbaContainer, { opacity: 0 });
    }

    // Also hide the #background element (WebGL canvas container)
    // This prevents the WebGL from showing as the snapshot scales down
    if (backgroundEl) {
      gsap.set(backgroundEl, { opacity: 0 });
    }

    // Animate the snapshot scaling down (zoom out effect)
    // This creates the "current page moving away" effect
    await gsap.to(snapshotEl, {
      scale: 0.85,
      opacity: 0.95,
      duration: 0.45,
      ease: 'power2.inOut'
    });

  } catch (error) {
    console.warn('Transition capture failed, continuing without snapshot:', error);
    // Restore visibility if capture failed
    if (barbaContainer) {
      gsap.set(barbaContainer, { opacity: 1 });
    }
    if (backgroundEl) {
      gsap.set(backgroundEl, { opacity: 1 });
    }
    isAnimating = false;
    return Promise.resolve();
  }

  return Promise.resolve();
}

/**
 * Reveal transition - enter phase
 *
 * The new page slides up from the bottom OVER the old snapshot,
 * which continues to scale down behind it.
 *
 * Key z-index handling:
 * - Snapshot stays at z-index 999 (inside .transition at 1000)
 * - New page container is elevated to z-index 1001 during animation
 * - This creates the effect of the new page sliding over the old
 */
export async function revealTransition() {
  const barbaContainer = document.querySelector('[data-barba="container"]');
  const backgroundEl = document.getElementById('background');
  const namespace = barbaContainer?.dataset?.barbaNamespace;

  if (!barbaContainer) {
    cleanupSnapshot();
    isAnimating = false;
    return Promise.resolve();
  }

  // Elevate the new page ABOVE the snapshot layer during transition
  // This creates the effect of the new page sliding over the old
  gsap.set(barbaContainer, {
    y: '100%',
    opacity: 1,
    position: 'relative',
    zIndex: 1001 // Above .transition (1000) and snapshot (999)
  });

  // Create a timeline for overlapping animations
  const tl = gsap.timeline({
    defaults: {
      ease: 'power3.out'
    },
    onComplete: () => {
      // Clean up
      cleanupSnapshot();
      isAnimating = false;

      // Reset container styles
      gsap.set(barbaContainer, {
        clearProps: 'transform,y,zIndex,position'
      });

      // Restore #background visibility for pages that need WebGL
      // (home/contact pages use the WebGL background)
      if (backgroundEl && (namespace === 'home' || namespace === 'contact')) {
        gsap.set(backgroundEl, { opacity: 1 });
      }
    }
  });

  // Continue scaling down the snapshot (visible behind the sliding page)
  if (snapshotEl) {
    tl.to(snapshotEl, {
      scale: 0.7,
      opacity: 0.3,
      duration: 0.9,
      ease: 'power2.inOut'
    }, 0);
  }

  // Slide the new page up from bottom (over the snapshot)
  tl.to(barbaContainer, {
    y: '0%',
    duration: 0.85,
    ease: 'expo.out'
  }, 0.05); // Slight delay for staggered start

  return tl.then();
}

/**
 * Initial page reveal (first load)
 * Simpler animation without the snapshot
 */
export async function initialReveal() {
  const barbaContainer = document.querySelector('[data-barba="container"]');

  if (!barbaContainer) {
    return Promise.resolve();
  }

  // Fade in the page
  gsap.set(barbaContainer, {
    opacity: 0,
    y: 30
  });

  await gsap.to(barbaContainer, {
    opacity: 1,
    y: 0,
    duration: 0.6,
    ease: 'power2.out'
  });

  gsap.set(barbaContainer, {
    clearProps: 'transform,opacity,y'
  });

  return Promise.resolve();
}

/**
 * Close menu if open before transition
 */
export function closeMenuIfOpen() {
  const menuToggleBtn = document.querySelector(".menu-toggle-btn");
  if (menuToggleBtn && menuToggleBtn.classList.contains("menu-open")) {
    menuToggleBtn.click();
  }
}

/**
 * Check if a transition is currently in progress
 */
export function isTransitioning() {
  return isAnimating;
}

/**
 * Force cleanup (useful for error recovery)
 */
export function forceCleanup() {
  cleanupSnapshot();
  isAnimating = false;

  const barbaContainer = document.querySelector('[data-barba="container"]');
  if (barbaContainer) {
    gsap.set(barbaContainer, {
      clearProps: 'all'
    });
  }
}

export default {
  animateTransition,
  revealTransition,
  initialReveal,
  closeMenuIfOpen,
  isTransitioning,
  forceCleanup
};
