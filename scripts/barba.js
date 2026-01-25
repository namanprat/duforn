import barba from '@barba/core';
import gsap from 'gsap';
import { lenis } from './lenis-scroll.js';
import { animateTransition, revealTransition, closeMenuIfOpen } from './transition.js';
import { initMenu } from './menu.js';
import { initIndex, destroyIndex } from './index.js';
import { initVariableFont } from './variable-font.js';
import { initWork, destroyWork } from './work.js';
import { initArchiveScene, destroyArchiveScene } from './archive-scene.js';
import {
  initScrollTextReveals,
  cleanupScrollTriggers,
  cleanupSplits,
  getNavigationDirection,
  getOrSplit
} from './text-reveal.js';
import webgl, { destroyWebgl } from './three.js';
import { initLinkHover, destroyLinkHover } from './link-hover.js';



// Update time display
let cachedTimeElement = null;
function updateTime() {
  if (!cachedTimeElement) {
    cachedTimeElement = document.getElementById('time');
  }
  if (cachedTimeElement) {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    cachedTimeElement.textContent = `${hours}:${minutes}:${seconds} IST`;
  }
}

// Initialize time updates
function initTime() {
  cachedTimeElement = null; // Reset cache for new page
  updateTime();
  if (window.timeInterval) {
    clearInterval(window.timeInterval);
  }
  window.timeInterval = setInterval(updateTime, 1000);
}

function initPageFeatures(namespace) {
  initTime();
  initMenu();
  initVariableFont();
  initScrollTextReveals();
  initLinkHover();

  const ns = namespace || document.querySelector('[data-barba="container"]')?.dataset.barbaNamespace;
  if (ns === 'work') {
    destroyIndex();
    initWork();
    destroyWebgl();
    destroyArchiveScene();
  } else if (ns === 'archive') {
    destroyIndex();
    destroyWork();
    destroyWebgl();
    initArchiveScene();
  } else if (ns === 'home' || ns === 'contact') {
    destroyWork();
    destroyArchiveScene();
    webgl();
    if (ns === 'home') {
      initIndex();
    } else {
      destroyIndex();
    }
  } else {
    destroyIndex();
    destroyWork();
    destroyArchiveScene();
    destroyWebgl();
  }
}

// Optimized page features init for fast home ↔ contact transitions
// Keeps WebGL persistent (no destroy/recreate) for seamless background
function initPageFeaturesForFastTransition(namespace) {
  initTime();
  initMenu();
  initVariableFont();
  initScrollTextReveals();
  initLinkHover();

  // Only handle home/contact specific features
  // WebGL stays persistent - no destroy/recreate needed
  if (namespace === 'home') {
    initIndex();
  } else if (namespace === 'contact') {
    destroyIndex(); // Clean up home-specific features
  }
}

barba.init({
  preventRunning: true, // Prevent concurrent transitions

  transitions: [
    // Fast transition specifically for home ↔ contact (640ms total)
    {
      name: 'fast-home-contact',

      // Only run between home and contact pages
      from: { namespace: ['home', 'contact'] },
      to: { namespace: ['home', 'contact'] },

      // LEAVE HOOK - Animate current page out (~350ms)
      async leave(data) {
        const currentContainer = data.current.container;
        const navDirection = getNavigationDirection(data.current.namespace, data.next.namespace);

        // Cleanup home-specific features if leaving home
        if (data.current.namespace === 'home') {
          destroyIndex();
        }

        // Close menu if open
        closeMenuIfOpen();

        // Create a master timeline for coordinated animations
        const tl = gsap.timeline();

        // Get all text headers for animation
        const headers = currentContainer.querySelectorAll('.text-reveal-header');

        // Animate text headers out
        if (headers.length) {
          headers.forEach(header => {
            const split = getOrSplit(header);
            if (!split?.words?.length) return;

            const isReverse = header.classList.contains('text-reveal-reverse');
            let exitDir;
            if (navDirection === 'forward') {
              exitDir = isReverse ? 'up' : 'down';
            } else {
              exitDir = isReverse ? 'down' : 'up';
            }

            const yEnd = exitDir === 'up' ? -100 : 100;

            tl.to(split.words, {
              y: yEnd,
              opacity: 0,
              stagger: navDirection === 'backward' ? -0.02 : 0.02,
              duration: 0.35,
              ease: 'power2.in',
              overwrite: 'auto'
            }, 0);
          });
        }

        // Fade out body text, buttons, and other content simultaneously
        const fadeElements = currentContainer.querySelectorAll('.body-text-reveal, .btn, .u-text-style-large');
        if (fadeElements.length) {
          tl.to(fadeElements, {
            opacity: 0,
            duration: 0.25,
            ease: 'power2.in'
          }, 0);
        }

        // Cleanup after animations start (slight delay to avoid conflicts)
        tl.add(() => {
          cleanupScrollTriggers();
          cleanupSplits();
        }, 0.1);

        // Wait for timeline to complete
        await new Promise(resolve => {
          tl.eventCallback('onComplete', resolve);
        });
      },

      // ENTER HOOK - Prepare new page elements (runs immediately after leave)
      enter(data) {
        const nextContainer = data.next.container;
        const navDirection = getNavigationDirection(data.current.namespace, data.next.namespace);

        // Hide container initially
        gsap.set(nextContainer, {
          visibility: 'hidden',
          opacity: 1
        });

        // Position text headers off-screen for animation
        const headers = nextContainer.querySelectorAll('.text-reveal-header');
        headers.forEach(header => {
          const split = getOrSplit(header);
          if (!split?.words?.length) return;

          const isReverse = header.classList.contains('text-reveal-reverse');
          let enterDir;
          if (navDirection === 'forward') {
            enterDir = isReverse ? 'down' : 'up';
          } else {
            enterDir = isReverse ? 'up' : 'down';
          }

          const yStart = enterDir === 'up' ? 100 : -100;
          gsap.set(split.words, {
            y: yStart,
            opacity: 0
          });
        });

        // Hide body text and buttons
        const fadeElements = nextContainer.querySelectorAll('.body-text-reveal, .btn, .u-text-style-large');
        if (fadeElements.length) {
          gsap.set(fadeElements, { opacity: 0 });
        }
      },

      // AFTER HOOK - Animate new page in (~290ms)
      async after(data) {
        const nextContainer = data.next.container;
        const navDirection = getNavigationDirection(data.current.namespace, data.next.namespace);

        // Make container visible
        gsap.set(nextContainer, { visibility: 'visible' });

        // Initialize page features FIRST (but don't destroy/recreate WebGL)
        initPageFeaturesForFastTransition(data.next.namespace);

        // Create master timeline for enter animations
        const tl = gsap.timeline();

        // Animate text headers in
        const headers = nextContainer.querySelectorAll('.text-reveal-header');
        if (headers.length) {
          headers.forEach(header => {
            const split = getOrSplit(header);
            if (!split?.words?.length) return;

            tl.to(split.words, {
              y: 0,
              opacity: 1,
              stagger: navDirection === 'backward' ? -0.03 : 0.03,
              duration: 0.4,
              ease: 'power2.out',
              overwrite: 'auto'
            }, 0.05);
          });
        }

        // Fade in body text and buttons with slight delay
        const fadeElements = nextContainer.querySelectorAll('.body-text-reveal, .btn, .u-text-style-large');
        if (fadeElements.length) {
          tl.to(fadeElements, {
            opacity: 1,
            duration: 0.3,
            ease: 'power2.out'
          }, 0.1);
        }

        // Wait for timeline to complete
        await new Promise(resolve => {
          tl.eventCallback('onComplete', resolve);
        });
      },

      // ONCE HOOK - Initial page load
      async once(data) {
        initPageFeatures(data?.next?.namespace);
        await revealTransition();
      }
    },

    // Default transition for all other page combinations
    {
      name: 'default',
      async leave(data) {
        if (data?.current?.namespace === 'home') {
          destroyIndex();
        }
        if (data?.current?.namespace === 'work') {
          destroyWork();
        }
        if (data?.current?.namespace === 'archive') {
          destroyArchiveScene();
        }
        cleanupScrollTriggers(); // Clean up ScrollTriggers before transition
        cleanupSplits(); // Revert splits
        closeMenuIfOpen();
        await animateTransition();
      },
      async enter() {
        await revealTransition();
      },
      async once(data) {
        initPageFeatures(data?.next?.namespace);
        await revealTransition();
      },
      async after(data) {
        initPageFeatures(data?.next?.namespace);
      }
    }
  ]
});