import barba from '@barba/core';
import gsap from 'gsap';
import { lenis } from './lenis-scroll.js';
import { animateTransition, revealTransition, closeMenuIfOpen } from './transition.js';
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
        destroyBtnHover(); // Clean up button hover animations
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