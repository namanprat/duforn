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



// Update time display
function updateTime() {
  const timeElement = document.getElementById('time');
  if (timeElement) {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    timeElement.textContent = `${hours}:${minutes}:${seconds} IST`;
  }
}

// Initialize time updates
function initTime() {
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
  initIndex();

  const ns = namespace || document.querySelector('[data-barba="container"]')?.dataset.barbaNamespace;
  if (ns === 'work') {
    initWork();
    destroyWebgl();
    destroyArchiveScene();
  } else if (ns === 'archive') {
    destroyWork();
    destroyWebgl();
    initArchiveScene();
  } else if (ns === 'home' || ns === 'contact') {
    destroyWork();
    destroyArchiveScene();
    webgl();
  } else {
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

        // Reverse text reveal animations
        const textReveal = container?.querySelector('.text-reveal');
        const textRevealReverse = container?.querySelector('.text-reveal-reverse');
        if (textReveal) {
          const split = getOrSplit(textReveal);
          if (split?.words?.length) {
            await gsap.to(split.words, {
              y: -100,
              opacity: 0,
              duration: 0.35,
              stagger: 0.02,
              ease: 'power2.in'
            });
          }
        }
        if (textRevealReverse) {
          const split = getOrSplit(textRevealReverse);
          if (split?.words?.length) {
            await gsap.to(split.words, {
              y: 100,
              opacity: 0,
              duration: 0.35,
              stagger: 0.02,
              ease: 'power2.in'
            });
          }
        }

        // Fade out hero <p> and button (home page elements)
        const heroP = container?.querySelector('.hero .hero-contain p');
        const heroBtn = container?.querySelector('.hero .btn, .hero .btn a');
        const fadeTargets = [heroP, heroBtn].filter(Boolean);
        if (fadeTargets.length) {
          await gsap.to(fadeTargets, { opacity: 0, duration: 0.25, ease: 'power2.out' });
        }

        // Fade out all other text elements
        const texts = container?.querySelectorAll('h1,h2,h3,h4,p,a,span');
        const exclude = new Set([textReveal, textRevealReverse, heroP, heroBtn]);
        const others = Array.from(texts || []).filter(el => el && !exclude.has(el));
        if (others.length) {
          await gsap.to(others, { opacity: 0, duration: 0.25, stagger: 0.01, ease: 'power2.out' });
        }
      },
      async enter(data) {
        const container = data?.next?.container;
        // Prepare new hero elements hidden
        const heroP = container?.querySelector('.hero .hero-contain p');
        const heroBtn = container?.querySelector('.hero .btn, .hero .btn a');
        const fadeTargets = [heroP, heroBtn].filter(Boolean);
        if (fadeTargets.length) {
          gsap.set(fadeTargets, { opacity: 0 });
        }

        // Prepare other texts hidden
        const texts = container?.querySelectorAll('h1,h2,h3,h4,p,a,span');
        const exclude = new Set([heroP, heroBtn]);
        const others = Array.from(texts || []).filter(el => el && !exclude.has(el));
        if (others.length) {
          gsap.set(others, { opacity: 0 });
        }
      },
      async after(data) {
        const container = data?.next?.container;
        // Fade in hero <p> and button
        const heroP = container?.querySelector('.hero .hero-contain p');
        const heroBtn = container?.querySelector('.hero .btn, .hero .btn a');
        const fadeTargets = [heroP, heroBtn].filter(Boolean);
        if (fadeTargets.length) {
          await gsap.to(fadeTargets, { opacity: 1, duration: 0.35, ease: 'power2.out' });
        }

        // Fade in other texts
        const texts = container?.querySelectorAll('h1,h2,h3,h4,p,a,span');
        const exclude = new Set([heroP, heroBtn]);
        const others = Array.from(texts || []).filter(el => el && !exclude.has(el));
        if (others.length) {
          await gsap.to(others, { opacity: 1, duration: 0.3, stagger: 0.015, ease: 'power2.out' });
        }

        // Initialize features and then reveal text
        initPageFeatures(data?.next?.namespace);
        await animateRevealEnter(container);
      }
    },
    {
      name: 'default',
      async leave(data) {
        if (data?.current?.namespace === 'work') {
          destroyWork();
        }
        if (data?.current?.namespace === 'archive') {
          destroyArchiveScene();
        }
        closeMenuIfOpen();
        await animateTransition();
      },
      async enter() {
        await revealTransition();
      },
      async once() {
        await revealTransition();
      },
      async after(data) {
        initPageFeatures(data?.next?.namespace);
      }
    }
  ]
});

barba.hooks.once((data) => {
  initPageFeatures(data?.next?.namespace);
});