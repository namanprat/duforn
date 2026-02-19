import barba from '@barba/core';
import gsap from 'gsap';
import { initMenu } from './menu.js';
import { preloader } from './preloader.js';

import {
  initWork,
  destroyWork,
} from './work.js';
import { initArchive, destroyArchive } from './archive.js';
import { initFilm, destroyFilm } from './project-canvas.js';
import { animateRevealEnter, animateRevealLeave, cleanupSplits } from './text-reveal.js';
import webgl, {
  destroyWebgl,
  setScenePage,
  isWebglRunning,
  swapModel,
  closeMenuIfOpen,
  setBaseSceneVisibility,
} from './three.js';
import { destroyTransition } from './transition.js';
import { initLinkHover } from './link-hover.js';
import { initBtnHover, destroyBtnHover } from './btn-hover.js';

import { initLenis, destroyLenis } from './lenis-scroll.js';


function tweenToPromise(tween) {
  return tween
    ? new Promise(resolve => tween.eventCallback('onComplete', resolve))
    : Promise.resolve();
}

function gsapToPromise(target, vars = {}) {
  return new Promise((resolve) => {
    gsap.to(target, {
      ...vars,
      onComplete: () => {
        if (typeof vars.onComplete === 'function') {
          vars.onComplete();
        }
        resolve();
      },
    });
  });
}

function transitionDebug(step, payload = null) {
  if (!window.__TRANSITION_DEBUG__) return;
  if (payload !== null) {
    // eslint-disable-next-line no-console
    console.log(`[transition] ${step}`, payload);
  } else {
    // eslint-disable-next-line no-console
    console.log(`[transition] ${step}`);
  }
}

function createContactLeaveTimeline(container, nextNamespace) {
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
const IST_TIME_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
  timeZone: 'Asia/Kolkata',
});

function updateTime() {
  if (!cachedTimeElement) {
    cachedTimeElement = document.getElementById('time');
  }
  if (cachedTimeElement) {
    cachedTimeElement.textContent = `${IST_TIME_FORMATTER.format(new Date())} IST`;
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

// One-shot flag: once() fires on initial load and calls animateRevealEnter.
// after() fires immediately after once() on initial load and must not re-animate.
let skipNextAfterReveal = false;

// Helper: determine if a namespace uses the shared WebGL canvas
function isWebglPage(ns) {
  return ns === 'home' || ns === 'contact' || ns === 'work';
}



function initPageFeatures(namespace, { skipWebglSetup = false } = {}) {
  initTime();
  // Menu and link hover target persistent nav elements — only init once
  initMenu();
  initLinkHover();
  // Btn hover needs rebuild since buttons may be in page content
  destroyBtnHover();
  initBtnHover();

  const ns = namespace || document.querySelector('[data-barba="container"]')?.dataset.barbaNamespace;
  const linkMain = document.querySelector('.link-main');
  if (linkMain) {
    gsap.set(linkMain, { autoAlpha: ns === 'home' ? 0 : 1 });
    if (ns !== 'home' && ns !== 'contact') {
      gsap.set(linkMain, { clearProps: 'transform,opacity' });
    }
  }

  // WebGL setup already handled by transition leave/enter hooks
  if (skipWebglSetup) {
    if (ns === 'archive') {
      destroyWork();
      destroyTransition();
      destroyWebgl();
      initArchive();
    } else {
      destroyArchive();
      if (ns === 'work') {
        // initWork() already called in enter() hook — skip to avoid double-init
      } else if (ns === 'home' || ns === 'contact') {
        setBaseSceneVisibility(true);
      }
    }
    return;
  }

  if (ns === 'film') {
    document.body.classList.add('page-wrap--scrollable');
    initLenis();
  } else {
    document.body.classList.remove('page-wrap--scrollable');
  }

  if (ns === 'archive') {
    document.body.classList.add('page-wrap--archive');
  } else {
    document.body.classList.remove('page-wrap--archive');
  }

  if (ns === 'work') {
    destroyArchive();
    destroyFilm();
    webgl();
    setBaseSceneVisibility(true);
    setScenePage('work', true);
    swapModel('work');
    initWork();
  } else if (ns === 'archive') {
    destroyWork();
    destroyFilm();
    destroyTransition();
    destroyWebgl();
    initArchive();
  } else if (ns === 'film') {
    destroyArchive();
    destroyWork();
    destroyTransition();
    destroyWebgl();
    initFilm();
  } else if (ns === 'home' || ns === 'contact') {
    destroyArchive();
    destroyWork();
    destroyFilm();
    webgl();
    setBaseSceneVisibility(true);
    setScenePage(ns, true);
    swapModel('home');
  } else {
    destroyArchive();
    destroyWork();
    destroyFilm();
    destroyTransition();
    destroyWebgl();
  }
}

barba.init({
  transitions: [
    {
      name: 'webgl-page-transition',
      from: { namespace: ['home', 'contact', 'work'] },
      to: { namespace: ['home', 'contact', 'work'] },
      async leave(data) {
        const fromNs = data?.current?.namespace;
        const toNs = data?.next?.namespace;
        const container = data?.current?.container;

        closeMenuIfOpen();

        // Animate text out (chars/lines slide down) — must complete before cleanupSplits
        await animateRevealLeave(container);

        const involvesWork = (fromNs === 'work' || toNs === 'work');

        if (involvesWork) {
          if (fromNs === 'work') {
            destroyWork();
          }
        } else {
          if (fromNs === 'contact') {
            await tweenToPromise(createContactLeaveTimeline(container, toNs));
          }
        }

        // Clean up AFTER leave animation so splits are still valid during animation
        cleanupSplits();
      },
      async enter(data) {
        const fromNs = data?.current?.namespace;
        const toNs = data?.next?.namespace;
        const container = data?.next?.container;

        const involvesWork = (fromNs === 'work' || toNs === 'work');

        if (involvesWork) {
          const targetModel = toNs === 'work' ? 'work' : 'home';
          swapModel(targetModel);
          setScenePage(toNs, true);

          if (toNs === 'work') {
            await initWork();
            // Wait one frame so updateTitle() populates .slide-title before reveal
            await new Promise(r => requestAnimationFrame(r));
          }
        } else {
          if (toNs === 'home') {
            primeHomeEnter();
            setScenePage('home');
          } else if (toNs === 'contact') {
            primeContactEnter();
            setScenePage('contact');
          }
        }

        // Animate text in for all webgl pages (home, contact, work)
        animateRevealEnter(container);
      },
      async after(data) {
        const container = data?.next?.container;
        const ns = data?.next?.namespace;
        if (!container) return;

        // WebGL setup (model swap, camera, etc.) already handled in leave/enter
        initPageFeatures(ns, { skipWebglSetup: true });

        if (ns === 'home') {
          const linkMain = document.querySelector('.link-main');
          if (linkMain) {
            gsap.set(linkMain, { autoAlpha: 0 });
          }
        } else if (ns === 'contact') {
          await tweenToPromise(createContactEnterTween());
        }
      }
    },
    {
      name: 'default',
      async leave(data) {
        const fromNs = data?.current?.namespace;
        const toNs = data?.next?.namespace;

        closeMenuIfOpen();

        // Animate text out before any teardown
        await animateRevealLeave(data?.current?.container);

        if (fromNs === 'work') {
          destroyWork();
        }
        if (fromNs === 'archive') {
          destroyArchive();
        }
        if (fromNs === 'film') {
          destroyFilm();
          destroyLenis();
          document.body.classList.remove('page-wrap--scrollable');
        }

        const shouldDestroyWebgl = isWebglPage(fromNs)
          || (fromNs === 'film' && isWebglRunning() && !isWebglPage(toNs));
        if (shouldDestroyWebgl) {
          destroyTransition();
          destroyWebgl();
        }

        cleanupSplits();
      },
      async enter() {
        // Simple page swap — no ink dissolve for non-webgl pages
      },
      async once(data) {
        const ns = data?.next?.namespace;

        // Non-webgl pages (archive, film, etc.) don't call webgl() so the
        // preloader never fires via loadModels(). Run it here instead.
        if (!isWebglPage(ns)) {
          await Promise.all([preloader.init(), preloader.load([])]);
        }

        initPageFeatures(ns);
        const container = data?.next?.container;
        if (!container) return;

        if (ns === 'home') {
          const linkMainHome = document.querySelector('.link-main');
          if (linkMainHome) {
            gsap.set(linkMainHome, { autoAlpha: 0 });
          }
        } else if (ns === 'contact') {
          const linkMain = document.querySelector('.link-main');
          if (linkMain) {
            gsap.set(linkMain, { autoAlpha: 1, y: 20, opacity: 0 });
            await gsapToPromise(linkMain, {
              y: 0,
              opacity: 1,
              duration: 0.8,
              ease: 'power2.out',
              delay: 0.2
            });
          }
        }

        // Reveal text on initial page load for all pages
        // For work page, wait a frame so initWork's rAF populates .slide-title
        if (ns === 'work') {
          await new Promise(r => requestAnimationFrame(r));
        }
        skipNextAfterReveal = true;
        animateRevealEnter(container);
      },
      async after(data) {
        const ns = data?.next?.namespace;
        if (ns) {
          initPageFeatures(ns);
        }

        const container = data?.next?.container;

        if (ns === 'contact') {
          const linkMain = document.querySelector('.link-main');
          if (linkMain) {
            gsap.set(linkMain, { autoAlpha: 1, y: 20, opacity: 0 });
            await gsapToPromise(linkMain, {
              y: 0,
              opacity: 1,
              duration: 0.6,
              ease: 'power2.out'
            });
          }
        }

        // Reveal text after a navigation transition (not on initial load — once() handles that)
        if (container && !skipNextAfterReveal) {
          // For work page, wait a frame so initWork's rAF populates .slide-title
          if (ns === 'work') {
            await new Promise(r => requestAnimationFrame(r));
          }
          animateRevealEnter(container);
        }
        skipNextAfterReveal = false;
      }
    }
  ]
});
