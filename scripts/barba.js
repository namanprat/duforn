import barba from '@barba/core';
import gsap from 'gsap';
import { lenis } from './lenis-scroll.js';
import { animateTransition, revealTransition, closeMenuIfOpen } from './transition.js';
import { initMenu } from './menu.js';
import { initIndex, destroyIndex } from './index.js';
import { initVariableFont } from './variable-font.js';
import { initWork, destroyWork } from './work.js';
import { initArchiveScene, destroyArchiveScene } from './archive-scene.js';
import { animateRevealEnter, initScrollTextReveals, getOrSplit, cleanupScrollTriggers, cleanupSplits } from './text-reveal.js';
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
        cleanupSplits();
        const container = data?.current?.container;
        if (!container) return;

        const textRevealHeaders = container.querySelectorAll('.text-reveal-header');
        const heroP = container.querySelector('.hero .hero-contain p');
        const heroBtn = container.querySelector('.hero .btn, .hero .btn a');
        
        const animations = [];

        // Fade out paragraph and button
        const fadeTargets = [heroP, heroBtn].filter(Boolean);
        if (fadeTargets.length) {
          animations.push(gsap.to(fadeTargets, { opacity: 0, duration: 0.25, ease: 'power2.out' }));
        }

        // Reverse reveal on text headers as they leave
        for (let i = 0; i < textRevealHeaders.length; i++) {
          const header = textRevealHeaders[i];
          const split = getOrSplit(header);
          if (split?.words?.length) {
            const isReverse = header.classList.contains('text-reveal-reverse');
            // When leaving: reverse goes down (-100), normal goes up (100)
            animations.push(
              gsap.to(split.words, {
                y: isReverse ? -100 : 100,
                opacity: 0,
                duration: 0.4,
                stagger: 0.03,
                ease: 'power2.in'
              })
            );
          }
        }

        if (animations.length) {
          await Promise.all(animations.map(anim => new Promise(resolve => anim.eventCallback('onComplete', resolve))));
        }
      },
      async enter(data) {
        const container = data?.next?.container;
        if (!container) return;
        
        const heroP = container.querySelector('.hero .hero-contain p');
        const heroBtn = container.querySelector('.hero .btn, .hero .btn a');
        const fadeElements = [heroP, heroBtn].filter(Boolean);
        if (fadeElements.length) {
          gsap.set(fadeElements, { opacity: 0 });
        }

        // Reset text headers to pre-reveal state before animating in
        const textRevealHeaders = container.querySelectorAll('.text-reveal-header');
        for (let i = 0; i < textRevealHeaders.length; i++) {
          const header = textRevealHeaders[i];
          const split = getOrSplit(header);
          if (split?.words?.length) {
            const isReverse = header.classList.contains('text-reveal-reverse');
            // Set initial state: reverse comes from top (-100), normal from bottom (100)
            gsap.set(split.words, {
              y: isReverse ? -100 : 100,
              opacity: 0
            });
          }
        }
      },
      async after(data) {
        const container = data?.next?.container;
        if (!container) return;
        
        initPageFeatures(data?.next?.namespace);
        
        // Reveal headers in - animate from their starting positions to 0
        const textRevealHeaders = container.querySelectorAll('.text-reveal-header');
        const animations = [];
        
        for (let i = 0; i < textRevealHeaders.length; i++) {
          const header = textRevealHeaders[i];
          const split = getOrSplit(header);
          if (split?.words?.length) {
            animations.push(
              gsap.to(split.words, {
                y: 0,
                opacity: 1,
                duration: 0.5,
                stagger: 0.03,
                ease: 'power2.out'
              })
            );
          }
        }

        if (animations.length) {
          await Promise.all(animations.map(anim => new Promise(resolve => anim.eventCallback('onComplete', resolve))));
        }
        
        // Then fade in paragraph and button
        const heroP = container.querySelector('.hero .hero-contain p');
        const heroBtn = container.querySelector('.hero .btn, .hero .btn a');
        const fadeTargets = [heroP, heroBtn].filter(Boolean);
        
        if (fadeTargets.length) {
          await gsap.to(fadeTargets, { opacity: 1, duration: 0.35, ease: 'power2.out', delay: 0.1 });
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