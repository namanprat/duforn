import barba from '@barba/core';
import gsap from 'gsap';
import { lenis } from './lenis-scroll.js';
import { animateTransition, revealTransition, closeMenuIfOpen } from './transition.js';
import { initMenu } from './menu.js';
import { initIndex } from './index.js';
import { initVariableFont } from './variable-font.js';
import { initWork, destroyWork } from './work.js';
import { initArchiveScene, destroyArchiveScene } from './archive-scene.js';
import { animateRevealEnter, initScrollTextReveals, getOrSplit } from './text-reveal.js';
import webgl, { destroyWebgl } from './three.js';
import { initLinkHover, destroyLinkHover } from './link-hover.js';
import { destroyMiddleCarousel } from './middle-carousel.js';

// Cache for DOM queries
const cache = {
  timeElement: null,
  timeInterval: null
};

// Update time display
function updateTime() {
  if (!cache.timeElement) {
    cache.timeElement = document.getElementById('time');
  }
  if (cache.timeElement) {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    cache.timeElement.textContent = `${hours}:${minutes}:${seconds} IST`;
  }
}

// Initialize time updates
function initTime() {
  cache.timeElement = null;
  updateTime();
  if (cache.timeInterval) {
    clearInterval(cache.timeInterval);
  }
  cache.timeInterval = setInterval(updateTime, 1000);
}

// Cleanup function for page-specific features
function cleanupPageFeatures(namespace) {
  if (namespace === 'work') {
    destroyWork();
  } else if (namespace === 'archive') {
    destroyArchiveScene();
  }
  
  const container = document.querySelector('[data-barba="container"]');
  const nextNs = container?.dataset.barbaNamespace;
  if (nextNs !== 'home' && nextNs !== 'contact') {
    destroyWebgl();
  }
}

// Initialize page features based on namespace
function initPageFeatures(namespace) {
  initTime();
  initMenu();
  initVariableFont();
  initScrollTextReveals();
  initLinkHover();
  initIndex();

  const ns = namespace || document.querySelector('[data-barba="container"]')?.dataset.barbaNamespace;
  
  switch(ns) {
    case 'work':
      destroyWebgl();
      destroyArchiveScene();
      initWork();
      break;
    case 'archive':
      destroyWork();
      destroyWebgl();
      initArchiveScene();
      break;
    case 'home':
    case 'contact':
      destroyWork();
      destroyArchiveScene();
      webgl();
      break;
    default:
      destroyWork();
      destroyArchiveScene();
      destroyWebgl();
  }
}

// Helper to get fade elements (paragraph and button only)
function getFadeElements(container) {
  if (!container) return [];
  
  const heroP = container.querySelector('.hero .hero-contain p');
  const heroBtn = container.querySelector('.hero .btn, .hero .btn a');
  
  return [heroP, heroBtn].filter(Boolean);
}

// Optimized home-contact transition
barba.init({
  preventRunning: true,
  transitions: [
    {
      name: 'home-contact-smooth',
      from: { namespace: ['home', 'contact'] },
      to: { namespace: ['home', 'contact'] },
      
      async leave(data) {
        closeMenuIfOpen();
        const container = data?.current?.container;
        if (!container) return;
        
        const textReveal = container.querySelector('.text-reveal');
        const textRevealReverse = container.querySelector('.text-reveal-reverse');
        const fadeElements = getFadeElements(container);
        
        // Kill any existing animations
        gsap.killTweensOf([textReveal, textRevealReverse, ...fadeElements]);
        
        const timeline = gsap.timeline();
        
        // Animate headers out (reverse of reveal)
        if (textReveal) {
          const split = getOrSplit(textReveal);
          if (split?.words?.length) {
            timeline.to(split.words, {
              y: -100,
              autoAlpha: 0,
              duration: 0.4,
              stagger: 0.02,
              ease: 'power2.in'
            }, 0);
          }
        }
        
        if (textRevealReverse) {
          const split = getOrSplit(textRevealReverse);
          if (split?.words?.length) {
            timeline.to(split.words, {
              y: 100,
              autoAlpha: 0,
              duration: 0.4,
              stagger: 0.02,
              ease: 'power2.in'
            }, 0);
          }
        }
        
        // Fade out paragraph and button
        if (fadeElements.length) {
          timeline.to(fadeElements, { 
            autoAlpha: 0, 
            duration: 0.3, 
            ease: 'power2.out' 
          }, 0);
        }
        
        await timeline.then();
      },
      
      async enter(data) {
        const container = data?.next?.container;
        if (!container) return;
        
        const textReveal = container.querySelector('.text-reveal');
        const textRevealReverse = container.querySelector('.text-reveal-reverse');
        const fadeElements = getFadeElements(container);
        
        // Prepare text reveal elements
        if (textReveal) {
          const split = getOrSplit(textReveal);
          if (split?.words) {
            gsap.set(split.words, { y: 100, autoAlpha: 0 });
          }
        }
        
        if (textRevealReverse) {
          const split = getOrSplit(textRevealReverse);
          if (split?.words) {
            gsap.set(split.words, { y: -100, autoAlpha: 0 });
          }
        }
        
        // Hide fade elements
        if (fadeElements.length) {
          gsap.set(fadeElements, { autoAlpha: 0 });
        }
        
        // Initialize page features
        initPageFeatures(data?.next?.namespace);
      },
      
      async after(data) {
        const container = data?.next?.container;
        if (!container) return;
        
        const fadeElements = getFadeElements(container);
        
        // Start both animations simultaneously
        const timeline = gsap.timeline();
        
        // Fade in paragraph and button
        if (fadeElements.length) {
          timeline.to(fadeElements, { 
            autoAlpha: 1, 
            duration: 0.4, 
            ease: 'power2.out' 
          }, 0.2);
        }
        
        // Animate headers in
        const revealPromise = animateRevealEnter(container);
        
        await Promise.all([timeline.then(), revealPromise]);
      }
    },
    {
      name: 'default',
      async leave(data) {
        cleanupPageFeatures(data?.current?.namespace);
        closeMenuIfOpen();
        await animateTransition();
      },
      async enter(data) {
        initPageFeatures(data?.next?.namespace);
        await revealTransition();
      },
      async once(data) {
        initPageFeatures(data?.next?.namespace);
        await revealTransition();
      },
      async after(data) {
        const container = data?.next?.container;
        if (container) {
          gsap.set(container, { clearProps: 'all' });
        }
      }
    }
  ]
});

// Initial page load
barba.hooks.once((data) => {
  initPageFeatures(data?.next?.namespace);
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (cache.timeInterval) {
    clearInterval(cache.timeInterval);
  }
});