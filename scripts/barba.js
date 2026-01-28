import barba from '@barba/core';
import gsap from 'gsap';
import { lenis } from './lenis-scroll.js';
import { closeMenuIfOpen } from './transition.js';
import { initMenu } from './menu.js';
import { initIndex, destroyIndex } from './index.js';
import { initVariableFont } from './variable-font.js';
import { initWork, destroyWork } from './work.js';
import { initArchiveScene, destroyArchiveScene } from './archive-scene.js';
import { initScrollTextReveals, cleanupScrollTriggers, cleanupSplits } from './text-reveal.js';
import webgl, { destroyWebgl } from './three.js';
import { initLinkHover, destroyLinkHover } from './link-hover.js';
import { initBtnHover, destroyBtnHover } from './btn-hover.js';



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
  initBtnHover();

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

/**
 * Page Transition - Adapted from SlideshowAnimations demo3
 *
 * Effect: Current page scales down while content scales up (parallax),
 * then new page slides in from bottom with reverse parallax effect.
 *
 * Based on the slideshow transition pattern:
 * - Current: scale 1 -> 0.4, inner scale 1 -> 1.5
 * - Upcoming: yPercent 100 -> 0, inner yPercent -30 -> 0, scale 1.5 -> 1
 */

barba.init({
  transitions: [
    {
      name: 'demo3-transition',
      sync: true,

      leave(data) {
        const done = this.async();
        const currentContainer = data?.current?.container;

        // Cleanup old page
        if (data?.current?.namespace === 'home') {
          destroyIndex();
        }
        if (data?.current?.namespace === 'work') {
          destroyWork();
        }
        if (data?.current?.namespace === 'archive') {
          destroyArchiveScene();
        }
        cleanupScrollTriggers();
        cleanupSplits();
        destroyBtnHover();
        closeMenuIfOpen();

        // Disable interactions during transition
        const transition = document.querySelector('.transition');
        if (transition) {
          gsap.set(transition, { pointerEvents: 'auto' });
        }

        // Demo3-style leave animation
        // Current page scales down while inner content scales up (creates depth)
        const tl = gsap.timeline({
          defaults: {
            duration: 1.1,
            ease: 'power2.inOut'
          },
          onComplete: done
        });

        if (currentContainer) {
          // Get inner content elements for parallax effect
          const innerContent = currentContainer.querySelectorAll('section, .hero, .slider, .contact-contain');

          tl.addLabel('start', 0)
            // Scale down the container (like demo3 scales the slide)
            .to(currentContainer, {
              scale: 0.4,
              opacity: 0.3,
            }, 'start')
            // Scale up inner content for parallax depth effect
            .to(innerContent, {
              scale: 1.5,
            }, 'start');
        }

        return tl;
      },

      enter(data) {
        const done = this.async();
        const nextContainer = data?.next?.container;

        // Get inner content for parallax effect
        const innerContent = nextContainer?.querySelectorAll('section, .hero, .slider, .contact-contain');

        // Prepare new page - positioned below viewport with scaled content
        if (nextContainer) {
          gsap.set(nextContainer, {
            yPercent: 100,
            scale: 1,
            opacity: 1,
            zIndex: 99
          });

          // Set inner content initial state for parallax
          if (innerContent && innerContent.length > 0) {
            gsap.set(innerContent, {
              scale: 1.5,
              yPercent: -30
            });
          }
        }

        // Demo3-style enter animation
        const tl = gsap.timeline({
          defaults: {
            ease: 'expo.out'
          },
          onComplete: () => {
            // Reset z-index after transition
            if (nextContainer) {
              gsap.set(nextContainer, { zIndex: 1, clearProps: 'transform' });
            }
            if (innerContent && innerContent.length > 0) {
              gsap.set(innerContent, { clearProps: 'transform' });
            }

            // Re-enable interactions
            const transition = document.querySelector('.transition');
            if (transition) {
              gsap.set(transition, { pointerEvents: 'none' });
            }

            // Scroll to top
            if (lenis) {
              lenis.scrollTo(0, { immediate: true });
            } else {
              window.scrollTo(0, 0);
            }

            done();
          }
        });

        // Slide in from bottom (matching demo3 timing - starts at 0.65s mark)
        if (nextContainer) {
          tl.addLabel('middle', 0)
            // Slide container in from bottom
            .to(nextContainer, {
              yPercent: 0,
              duration: 1.0,
            }, 'middle')
            // Parallax inner content - scales down and moves up
            .to(innerContent, {
              scale: 1,
              yPercent: 0,
              duration: 1.1,
            }, 'middle');
        }

        return tl;
      },

      once(data) {
        initPageFeatures(data?.next?.namespace);

        // Set overlay to hidden for first load
        const overlay = document.querySelector('.transition-overlay');
        if (overlay) {
          gsap.set(overlay, { opacity: 0 });
        }
      },

      after(data) {
        initPageFeatures(data?.next?.namespace);
      }
    }
  ]
});