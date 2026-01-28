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

barba.init({
  transitions: [
    {
      name: 'default',
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

        // Animate current page out: scale down and fade out
        const tl = gsap.timeline({ onComplete: done });

        if (currentContainer) {
          tl.to(currentContainer, {
            scale: 0.95,
            opacity: 0,
            duration: 0.8,
            ease: 'power2.inOut'
          }, 0);
        }

        return tl;
      },

      enter(data) {
        const done = this.async();
        const nextContainer = data?.next?.container;
        const overlay = document.querySelector('.transition-overlay');

        // Prepare new page to slide in from bottom
        if (nextContainer) {
          gsap.set(nextContainer, {
            opacity: 1,
            y: '100vh',
            scale: 1
          });
        }

        const tl = gsap.timeline({ onComplete: done });

        // Slide new page in from bottom (y: 0)
        if (nextContainer) {
          tl.to(nextContainer, {
            y: 0,
            duration: 1.0,
            ease: 'power2.out'
          }, 0);
        }

        // Fade out overlay to reveal new page
        if (overlay) {
          tl.to(overlay, {
            opacity: 0,
            duration: 0.6,
            ease: 'power2.out'
          }, 0.3);
        }

        // Re-enable interactions at end
        const transition = document.querySelector('.transition');
        if (transition) {
          tl.set(transition, { pointerEvents: 'none' });
        }

        return tl;
      },

      once(data) {
        initPageFeatures(data?.next?.namespace);
        
        // Set overlay to visible for first load
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