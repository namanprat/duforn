import barba from '@barba/core';
import gsap from 'gsap';
import { lenis } from './lenis-scroll.js';
import { animateTransition, revealTransition, closeMenuIfOpen } from './transition.js';
import { initMenu } from './menu.js';
import { initSpotlight } from './spotlight.js';
import { initVariableFont } from './variable-font.js';
import { initWork, destroyWork } from './work.js';
import { initArchiveScene, destroyArchiveScene } from './archive-scene.js';
import webgl, { destroyWebgl } from './three.js';



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
  initSpotlight();

  const ns = namespace || document.querySelector('[data-barba="container"]')?.dataset.barbaNamespace;
  if (ns === 'work') {
    initWork();
    destroyWebgl();
    destroyArchiveScene();
  } else if (ns === 'archive') {
    destroyWork();
    destroyWebgl();
    initArchiveScene();
  } else {
    destroyWork();
    destroyArchiveScene();
    if (ns === 'home' || ns === 'contact') {
      webgl();
    } else {
      destroyWebgl();
    }
  }
}

barba.init({
  transitions: [
    {
      name: 'home-contact-fade',
      from: { namespace: ['home', 'contact'] },
      to: { namespace: ['home', 'contact'] },
      async leave(data) {
        closeMenuIfOpen();
        const texts = data?.current?.container?.querySelectorAll('h1, h2, h3, h4, p, .text-reveal');
        if (texts?.length) {
          await gsap.to(texts, { opacity: 0, duration: 0.4, ease: 'power2.out' });
        }
      },
      async enter(data) {
        const container = data?.next?.container;
        const texts = container?.querySelectorAll('h1, h2, h3, h4, p, .text-reveal');
        if (texts?.length) {
          gsap.set(texts, { opacity: 0, clearProps: 'transform' });
          await gsap.fromTo(
            texts,
            { opacity: 0 },
            { opacity: 1, duration: 0.55, ease: 'power2.out', stagger: 0.03 }
          );
        }
      },
      async after(data) {
        initPageFeatures(data?.next?.namespace || data?.current?.namespace);
      }
    },
    {
      name: 'default',
      async leave(data) {
        if (data?.current?.namespace === 'home') {
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
      }
    }
  ]
});

barba.hooks.once((data) => {
  initPageFeatures(data?.next?.namespace || data?.current?.namespace);
});

barba.hooks.after((data) => {
  initPageFeatures(data?.next?.namespace || data?.current?.namespace);
});