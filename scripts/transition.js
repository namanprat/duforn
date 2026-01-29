import gsap from "gsap";

// Page slide transition state
let isPageTransitioning = false;
let currentPageWrapper = null;

// ========== PAGE SLIDE TRANSITION ==========
// Replicating index3 slideshow: current page zooms out, next slides up
// Creates a snapshot of current page that zooms out while new page slides over it

export function pageSlideLeave(currentContainer) {
  if (isPageTransitioning) {
    return Promise.resolve();
  }
  isPageTransitioning = true;

  // Create a wrapper to hold a snapshot of current page content
  currentPageWrapper = document.createElement("div");
  currentPageWrapper.className = "page-transition-current";
  currentPageWrapper.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 50;
    overflow: hidden;
    background-color: #000;
    transform-origin: center center;
    pointer-events: none;
  `;

  // Clone #background into the wrapper (if it exists)
  const bgDiv = document.getElementById('background');
  if (bgDiv) {
    const bgClone = bgDiv.cloneNode(true);
    bgClone.id = 'background-clone';
    bgClone.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
    `;
    currentPageWrapper.appendChild(bgClone);

    // Copy canvas content
    const origCanvas = bgDiv.querySelector('canvas');
    const cloneCanvas = bgClone.querySelector('canvas');
    if (origCanvas && cloneCanvas) {
      try {
        cloneCanvas.width = origCanvas.width;
        cloneCanvas.height = origCanvas.height;
        const ctx = cloneCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(origCanvas, 0, 0);
        }
      } catch (e) {
        // WebGL canvas copy might fail - that's ok
      }
    }
  }

  // Clone the current container into the wrapper
  const containerClone = currentContainer.cloneNode(true);
  containerClone.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  `;
  currentPageWrapper.appendChild(containerClone);

  // Copy any canvas content from the original container (work/archive pages)
  const origCanvases = currentContainer.querySelectorAll('canvas');
  const cloneCanvases = containerClone.querySelectorAll('canvas');
  origCanvases.forEach((origCanvas, i) => {
    if (cloneCanvases[i]) {
      try {
        cloneCanvases[i].width = origCanvas.width;
        cloneCanvases[i].height = origCanvas.height;
        const ctx = cloneCanvases[i].getContext('2d');
        if (ctx) {
          ctx.drawImage(origCanvas, 0, 0);
        }
      } catch (e) {
        // WebGL canvas copy might fail
      }
    }
  });

  // Add wrapper to body - it now blocks view of originals
  document.body.appendChild(currentPageWrapper);

  // Prevent body scroll during transition
  document.body.style.overflow = 'hidden';

  return Promise.resolve();
}

export function pageSlideEnter(nextContainer, currentContainer) {
  return new Promise((resolve) => {
    // Set up the next container - fixed position, starts from bottom
    gsap.set(nextContainer, {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 100,
      yPercent: 100,
      backgroundColor: '#000'
    });

    // Create timeline like index3 slideshow
    const tl = gsap.timeline({
      defaults: {
        duration: 1.1,
        ease: 'power2.inOut',
      },
      onComplete: () => {
        // Clean up - reset next container styles
        gsap.set(nextContainer, {
          clearProps: 'position,top,left,width,height,zIndex,yPercent,backgroundColor'
        });

        // Remove the wrapper with the old page snapshot
        if (currentPageWrapper && currentPageWrapper.parentNode) {
          currentPageWrapper.parentNode.removeChild(currentPageWrapper);
          currentPageWrapper = null;
        }

        // Restore body scroll
        document.body.style.overflow = '';

        isPageTransitioning = false;
        resolve();
      }
    });

    // Animation sequence matching index3:
    tl.addLabel('start', 0);

    // 1. Current page wrapper scales down (zooms out)
    if (currentPageWrapper) {
      tl.to(currentPageWrapper, {
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
  if (currentPageWrapper && currentPageWrapper.parentNode) {
    currentPageWrapper.parentNode.removeChild(currentPageWrapper);
    currentPageWrapper = null;
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
