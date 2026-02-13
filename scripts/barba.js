import barba from '@barba/core';
import gsap from 'gsap';
import { animateTransition, revealTransition, closeMenuIfOpen } from './transition.js';
import { initMenu } from './menu.js';

import { initWork, destroyWork } from './work.js';
import { initArchiveScene, destroyArchiveScene } from './archive/index.js';
import { initScrollTextReveals, cleanupScrollTriggers, cleanupSplits } from './text-reveal.js';
import webgl, { destroyWebgl, setScenePage, isWebglRunning, mountSceneText, unmountSceneText } from './three.js';
import { initLinkHover, destroyLinkHover } from './link-hover.js';
import { initBtnHover } from './btn-hover.js';


function tweenToPromise(tween) {
  return tween
    ? new Promise(resolve => tween.eventCallback('onComplete', resolve))
    : Promise.resolve();
}

function createHomeLeaveTimeline() {
  // Home hero text is rendered by Troika on the WebGL canvas — no DOM animations needed
  return null;
}

function createContactLeaveTimeline(container, nextNamespace) {
  // Contact text is rendered by Troika on the WebGL canvas — only animate link-main
  const tl = gsap.timeline({ defaults: { ease: 'power2.in' } });
  let hasSteps = false;

  const linkMain = document.querySelector('.link-main');
  if (linkMain) {
    hasSteps = true;
    tl.to(linkMain, {
      y: -20,
      opacity: 0,
      duration: 0.25,
      onComplete: () => {
        if (nextNamespace === 'home') {
          gsap.set(linkMain, { autoAlpha: 0, clearProps: 'transform,opacity' });
        }
      }
    }, 0);
  }

  return hasSteps ? tl : null;
}

function primeHomeEnter() {
  // Home hero text is rendered by Troika — only set link-main state
  const linkMain = document.querySelector('.link-main');
  if (linkMain) {
    gsap.set(linkMain, { autoAlpha: 0 });
  }
}

function primeContactEnter() {
  const linkMain = document.querySelector('.link-main');
  if (linkMain) {
    gsap.set(linkMain, { autoAlpha: 1, y: 20, opacity: 0 });
  }
}

function createHomeEnterTimeline() {
  // Home hero text is rendered by Troika on the WebGL canvas — no DOM animations needed
  return null;
}

function createContactEnterTween() {
  const linkMain = document.querySelector('.link-main');
  if (!linkMain) return null;
  return gsap.to(linkMain, {
    y: 0,
    opacity: 1,
    duration: 0.6,
    ease: 'power2.out'
  });
}


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
  initScrollTextReveals();
  destroyLinkHover();
  initLinkHover();
  initBtnHover();

  const ns = namespace || document.querySelector('[data-barba="container"]')?.dataset.barbaNamespace;
  const linkMain = document.querySelector('.link-main');
  if (linkMain) {
    gsap.set(linkMain, { autoAlpha: ns === 'home' ? 0 : 1 });
    if (ns !== 'home' && ns !== 'contact') {
      gsap.set(linkMain, { clearProps: 'transform,opacity' });
    }
  }
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
    const wasRunning = isWebglRunning();
    webgl();
    // Ensure scene offset matches current page on fresh init (no snap during transitions)
    if (!wasRunning) {
      setScenePage(ns, true);
    }
    // Mount Troika text overlay after layout settles (next frame)
    requestAnimationFrame(() => mountSceneText(ns));
  } else {
    destroyWork();
    destroyArchiveScene();
    destroyWebgl();
  }
}

barba.init({
  transitions: [
    {
      name: 'home-contact-transition',
      from: { namespace: ['home', 'contact'] },
      to: { namespace: ['home', 'contact'] },
      async leave(data) {
        closeMenuIfOpen();
        // Start scene shift toward the target page (runs during text-out animation)
        setScenePage(data?.next?.namespace);
        // Clean up Troika text from current page before transition
        unmountSceneText();
        const container = data?.current?.container;
        const ns = data?.current?.namespace;
        if (!container) return;

        if (ns === 'home') {
          await tweenToPromise(createHomeLeaveTimeline(container));
        } else if (ns === 'contact') {
          await tweenToPromise(createContactLeaveTimeline(container, data?.next?.namespace));
        }

        // Clean up AFTER leave animation so splits are still valid during animation
        cleanupScrollTriggers();
        cleanupSplits();
      },
      async enter(data) {
        const container = data?.next?.container;
        const ns = data?.next?.namespace;
        if (!container) return;

        if (ns === 'home') {
          primeHomeEnter();
        } else if (ns === 'contact') {
          primeContactEnter();
        }
        // Contact text is rendered by Troika — no DOM text animations needed
      },
      async after(data) {
        const container = data?.next?.container;
        const ns = data?.next?.namespace;
        if (!container) return;

        initPageFeatures(ns);

        if (ns === 'home') {
          // Ensure nav link-main is hidden on home
          const linkMain = document.querySelector('.link-main');
          if (linkMain) {
            gsap.set(linkMain, { autoAlpha: 0 });
          }
        } else if (ns === 'contact') {
          // Animate nav link-main lines in
          await tweenToPromise(createContactEnterTween());
        }
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
        // Clean up Troika text if leaving home/contact
        if (data?.current?.namespace === 'home' || data?.current?.namespace === 'contact') {
          unmountSceneText();
        }
        closeMenuIfOpen();
        await animateTransition();
        // Clean up AFTER capture/overlay so html2canvas sees correct layout
        cleanupScrollTriggers();
        cleanupSplits();
      },
      async enter() {
        await revealTransition();
      },
      async once(data) {
        initPageFeatures(data?.next?.namespace);

        await revealTransition();

        const ns = data?.next?.namespace;
        const container = data?.next?.container;
        if (!container) return;

        if (ns === 'home') {
          // Home hero text is rendered by Troika — just hide nav link-main
          const linkMainHome = document.querySelector('.link-main');
          if (linkMainHome) {
            gsap.set(linkMainHome, { autoAlpha: 0 });
          }
        } else if (ns === 'contact') {
          // Contact text is rendered by Troika — just animate nav link-main
          const linkMain = document.querySelector('.link-main');
          if (linkMain) {
            gsap.set(linkMain, { autoAlpha: 1, y: 20, opacity: 0 });
            await gsap.to(linkMain, {
              y: 0,
              opacity: 1,
              duration: 0.8,
              ease: 'power2.out',
              delay: 0.2
            });
          }
        }
      },
      async after(data) {
        // Initialize page features after default transitions
        const ns = data?.next?.namespace;
        if (ns) {
          initPageFeatures(ns);
        }

        if (ns === 'contact') {
          // Contact text is rendered by Troika — just animate nav link-main
          const linkMain = document.querySelector('.link-main');
          if (linkMain) {
            gsap.set(linkMain, { autoAlpha: 1, y: 20, opacity: 0 });
            await gsap.to(linkMain, {
              y: 0,
              opacity: 1,
              duration: 0.6,
              ease: 'power2.out'
            });
          }
        }
      }
    }
  ]
});
