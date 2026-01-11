import barba from '@barba/core';
import gsap from 'gsap';
import { lenis } from './lenis-scroll.js';
import { animateTransition, revealTransition, closeMenuIfOpen } from './transition.js';
import { initMenu } from './menu.js';
import { initIndex, destroyIndex } from './index.js';
import { initVariableFont } from './variable-font.js';
import { initWork, destroyWork } from './work.js';
import { initArchiveScene, destroyArchiveScene } from './archive-scene.js';
import { animateRevealEnter, initScrollTextReveals, getOrSplit, cleanupScrollTriggers } from './text-reveal.js';
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
        const container = data?.current?.container;
        if (!container) return;

        // Batch all DOM queries together
        const textRevealHeaders = container.querySelectorAll('.text-reveal-header');
        const heroP = container.querySelector('.hero .hero-contain p');
        const heroBtn = container.querySelector('.hero .btn, .hero .btn a');
        
        const animations = [];

        // Animate headers out
        for (let i = 0; i < textRevealHeaders.length; i++) {
          const header = textRevealHeaders[i];
          const split = getOrSplit(header);
          if (split?.words?.length) {
            // Determine direction based on class
            const isReverse = header.classList.contains('text-reveal-reverse');
            animations.push(
              gsap.to(split.words, {
                y: isReverse ? 100 : -100,
                opacity: 0,
                duration: 0.35,
                stagger: 0.02,
                ease: 'power2.in'
              })
            );
          }
        }

        // Wait for header animations to complete first
        if (animations.length) {
          await Promise.all(animations.map(anim => new Promise(resolve => anim.eventCallback('onComplete', resolve))));
        }

        // Fade out paragraph and button
        const fadeTargets = [heroP, heroBtn].filter(Boolean);
        if (fadeTargets.length) {
          await gsap.to(fadeTargets, { opacity: 0, duration: 0.25, ease: 'power2.out' });
        }
      },
      async enter(data) {
        const container = data?.next?.container;
        if (!container) return;
        
        // Batch DOM queries
        const heroP = container.querySelector('.hero .hero-contain p');
        const heroBtn = container.querySelector('.hero .btn, .hero .btn a');
        
        // Hide paragraph and button (will fade in)
        const fadeElements = [heroP, heroBtn].filter(Boolean);
        if (fadeElements.length) {
          gsap.set(fadeElements, { opacity: 0 });
        }
      },
      async after(data) {
        const container = data?.next?.container;
        if (!container) return;
        
        // Initialize features first
        initPageFeatures(data?.next?.namespace);
        
        // Animate headers in
        await animateRevealEnter(container);
        
        // Then fade in paragraph and button
        const heroP = container.querySelector('.hero .hero-contain p');
        const heroBtn = container.querySelector('.hero .btn, .hero .btn a');
        const fadeTargets = [heroP, heroBtn].filter(Boolean);
        
        if (fadeTargets.length) {
          await gsap.to(fadeTargets, { opacity: 1, duration: 0.35, ease: 'power2.out', delay: 0.2 });
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