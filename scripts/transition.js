import gsap from "gsap";

// Page slide transition state
let isPageTransitioning = false;

// ========== PAGE SLIDE TRANSITION ==========
// Replicating index3 slideshow: current zooms out, next slides up
// Both containers exist in DOM during transition - animate them directly

export function pageSlideLeave(currentContainer) {
  // Don't animate here - just prepare
  // The actual animation happens in pageSlideEnter when both containers exist

  if (isPageTransitioning) {
    return Promise.resolve();
  }
  isPageTransitioning = true;

  // Hide the #background (Three.js canvas) - it will be behind the transition
  const bgDiv = document.getElementById('background');
  if (bgDiv) {
    gsap.set(bgDiv, { opacity: 0 });
  }

  // Set up the current container for animation
  // Position it absolutely so it can be animated while next container slides in
  gsap.set(currentContainer, {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
    transformOrigin: 'center center'
  });

  // Return immediately - animation happens in enter()
  return Promise.resolve();
}

export function pageSlideEnter(nextContainer, currentContainer) {
  return new Promise((resolve) => {
    // Set up the next container - starts from bottom
    gsap.set(nextContainer, {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 99,
      yPercent: 100
    });

    // Prevent body scroll during transition
    document.body.style.overflow = 'hidden';

    // Create timeline like index3 slideshow
    const tl = gsap.timeline({
      defaults: {
        duration: 1.1,
        ease: 'power2.inOut',
      },
      onComplete: () => {
        // Clean up - reset container styles
        gsap.set(nextContainer, {
          clearProps: 'position,top,left,width,height,zIndex,yPercent'
        });

        // Remove the old container's fixed positioning (Barba will remove it)
        if (currentContainer && currentContainer.parentNode) {
          gsap.set(currentContainer, {
            clearProps: 'position,top,left,width,height,zIndex,scale'
          });
        }

        // Restore #background
        const bgDiv = document.getElementById('background');
        if (bgDiv) {
          gsap.set(bgDiv, { opacity: 1 });
        }

        // Restore body scroll
        document.body.style.overflow = '';

        isPageTransitioning = false;
        resolve();
      }
    });

    // Animation sequence matching index3:
    // 1. Current container scales down (like currentSlide scaling to 0.4)
    tl.addLabel('start', 0);

    if (currentContainer) {
      tl.to(currentContainer, {
        scale: 0.85,
        duration: 1.1,
        ease: 'power2.inOut'
      }, 'start');
    }

    // 2. At 'middle' point, next container slides up from bottom
    tl.addLabel('middle', 'start+=0.3');

    tl.to(nextContainer, {
      yPercent: 0,
      duration: 1,
      ease: 'expo.out'
    }, 'middle');
  });
}

// Clean up function in case transition is interrupted
export function cleanupPageTransition() {
  const bgDiv = document.getElementById('background');
  if (bgDiv) {
    gsap.set(bgDiv, { opacity: 1 });
  }
  document.body.style.overflow = '';
  isPageTransitioning = false;
}

// utility functions
export function closeMenuIfOpen() {
  const menuToggleBtn = document.querySelector(".menu-toggle-btn");
  if (menuToggleBtn && menuToggleBtn.classList.contains("menu-open")) {
    menuToggleBtn.click();
  }
}

export default { closeMenuIfOpen, pageSlideLeave, pageSlideEnter, cleanupPageTransition };
