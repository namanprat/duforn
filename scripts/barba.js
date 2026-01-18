import barba from '@barba/core';
import gsap from 'gsap';
import { lenis } from './lenis-scroll.js';
import { animateTransition, revealTransition, closeMenuIfOpen } from './transition.js';
import { initMenu } from './menu.js';
import { initIndex, destroyIndex } from './index.js';
import { initVariableFont } from './variable-font.js';
import { initWork, destroyWork } from './work.js';
import { initArchiveScene, destroyArchiveScene } from './archive-scene.js';
import { animateRevealEnter, animateRevealLeave, animateRevealEnterDirectional, initScrollTextReveals, cleanupScrollTriggers, cleanupSplits } from './text-reveal.js';
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

barba.init({
  transitions: [
    {
      name: 'home-contact-reverse',
      from: { namespace: ['home', 'contact'] },
      to: { namespace: ['home', 'contact'] },
      async leave(data) {
        closeMenuIfOpen();
        cleanupScrollTriggers();

        const container = data?.current?.container;
        if (!container) return;

        const fromPage = data?.current?.namespace;
        const toPage = data?.next?.namespace;

        // Determine exit direction based on navigation:
        // Home → Contact: text exits UP
        // Contact → Home: text exits DOWN
        const exitDirection = (fromPage === 'home' && toPage === 'contact') ? 'up' : 'down';

        // Fade out supporting elements
        const heroP = container.querySelector('.hero .hero-contain p');
        const heroBtn = container.querySelector('.hero .btn, .hero .btn a');
        const fadeTargets = [heroP, heroBtn].filter(Boolean);

        if (fadeTargets.length) {
          gsap.to(fadeTargets, { opacity: 0, duration: 0.3, ease: 'power2.out' });
        }

        // Animate text headers out with direction
        await animateRevealLeave(container, exitDirection);

        // Clean up splits after animation
        cleanupSplits();
      },
      async enter(data) {
        const container = data?.next?.container;
        if (!container) return;

        // Hide supporting elements initially
        const heroP = container.querySelector('.hero .hero-contain p');
        const heroBtn = container.querySelector('.hero .btn, .hero .btn a');
        const fadeElements = [heroP, heroBtn].filter(Boolean);

        if (fadeElements.length) {
          gsap.set(fadeElements, { opacity: 0 });
        }
      },
      async after(data) {
        const container = data?.next?.container;
        if (!container) return;

        const fromPage = data?.current?.namespace;
        const toPage = data?.next?.namespace;

        // Initialize page features
        initPageFeatures(toPage);

        // Determine enter direction (opposite of exit):
        // Home → Contact: new text enters from DOWN (slides down into view)
        // Contact → Home: new text enters from UP (slides up into view)
        const enterDirection = (fromPage === 'home' && toPage === 'contact') ? 'down' : 'up';

        // Animate text headers in with direction
        await animateRevealEnterDirectional(container, enterDirection);

        // Fade in supporting elements
        const heroP = container.querySelector('.hero .hero-contain p');
        const heroBtn = container.querySelector('.hero .btn, .hero .btn a');
        const fadeTargets = [heroP, heroBtn].filter(Boolean);

        if (fadeTargets.length) {
          await gsap.to(fadeTargets, { opacity: 1, duration: 0.35, ease: 'power2.out', delay: 0.15 });
        }
      }
    },
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
        // Initialize features first
        initPageFeatures(data?.next?.namespace);
        
        await revealTransition();
        
        // Animate text reveals on first load for home/contact pages
        const ns = data?.next?.namespace;
        if (ns === 'home' || ns === 'contact') {
          const container = data?.next?.container;
          if (container) {
            // Set initial state for paragraph and button
            const heroP = container.querySelector('.hero .hero-contain p');
            const heroBtn = container.querySelector('.hero .btn, .hero .btn a');
            const fadeTargets = [heroP, heroBtn].filter(Boolean);
            
            if (fadeTargets.length) {
              gsap.set(fadeTargets, { opacity: 0 });
            }
            
            // Animate headers
            await animateRevealEnter(container);
            
            // Then fade in paragraph and button
            if (fadeTargets.length) {
              await gsap.to(fadeTargets, { opacity: 1, duration: 0.35, ease: 'power2.out', delay: 0.2 });
            }
          }
        }
      },
      async after(data) {
        // Only init if not already initialized in once()
        const ns = data?.next?.namespace;
        if (ns !== 'home' && ns !== 'contact') {
          initPageFeatures(ns);
        }
      }
    }
  ]
});