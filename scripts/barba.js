import barba from '@barba/core';
import gsap from 'gsap';
import { initMenu } from './menu.js';
import { preloader } from './preloader.js';

import {
  initWork,
  destroyWork,
  startWorkTexturePreload,
  runWorkStripUnwrapToRect,
  finalizeWorkToFilmVisualState,
  whenWorkFirstFrame,
  resetWorkFirstFrameGate,
} from './work.js';
import { initArchive, destroyArchive } from './archive.js';
import {
  initFilm,
  destroyFilm,
  waitForFilmFirstFrame,
  bindFilmTemplateFromTransitionState,
} from './project-canvas.js';
import { animateRevealEnter, animateRevealLeave, cleanupSplits } from './text-reveal.js';
import webgl, {
  destroyWebgl,
  setScenePage,
  isWebglRunning,
  swapModel,
  closeMenuIfOpen,
  setBaseSceneVisibility,
  setBaseSceneOverlayMode,
} from './three.js';
import { initLinkHover } from './link-hover.js';

import { initLenis, destroyLenis } from './lenis-scroll.js';

const isPaintDebugEnabled = new URLSearchParams(window.location.search).has('debugPaint');
function paintDebugMark(step, payload = null) {
  if (!isPaintDebugEnabled) return;
  const ts = performance.now().toFixed(1);
  if (payload !== null) {
    // eslint-disable-next-line no-console
    console.log(`[paint-debug @${ts}ms] ${step}`, payload);
    return;
  }
  // eslint-disable-next-line no-console
  console.log(`[paint-debug @${ts}ms] ${step}`);
}
paintDebugMark('html parsed');

function setWorkVisualState(state = null) {
  document.body.classList.remove('work-booting', 'work-ready', 'work-transitioning');
  if (state) {
    document.body.classList.add(state);
  }
}

function hideWorkContainer(container) {
  if (!container) return;
  container.style.opacity = '0';
  setWorkVisualState('work-booting');
}

function revealWorkContainer(container) {
  if (!container) return;
  container.style.opacity = '1';
  setWorkVisualState('work-ready');
}


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
let timeIntervalId = null;
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
  if (timeIntervalId) {
    clearInterval(timeIntervalId);
  }
  timeIntervalId = setInterval(updateTime, 1000);
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

  // Set aria-current="page" on links matching current path
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-wrap a, .bottom-nav-wrap a, .menu-box a').forEach(link => {
    if (!link.href) return;
    try {
      const url = new URL(link.href, window.location.origin);
      if (url.pathname === currentPath) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    } catch (e) { }
  });

  const ns = namespace || document.querySelector('[data-barba="container"]')?.dataset.barbaNamespace;
  if (ns !== 'work') {
    setWorkVisualState(null);
  } else if (
    !document.body.classList.contains('work-booting')
    && !document.body.classList.contains('work-transitioning')
  ) {
    setWorkVisualState('work-ready');
  }
  const linkMain = document.querySelector('.link-main');
  if (linkMain) {
    gsap.set(linkMain, { autoAlpha: ns === 'home' ? 0 : 1 });
    if (ns !== 'home' && ns !== 'contact') {
      gsap.set(linkMain, { clearProps: 'transform,opacity' });
    }
  }

  if (ns === 'film') {
    document.body.classList.add('page-wrap--scrollable');
    initLenis();
  } else {
    destroyLenis();
    document.body.classList.remove('page-wrap--scrollable');
  }

  if (ns === 'archive') {
    document.body.classList.add('page-wrap--archive');
  } else {
    document.body.classList.remove('page-wrap--archive');
  }

  // WebGL setup already handled by transition leave/enter hooks
  if (skipWebglSetup) {
    if (ns === 'archive') {
      destroyWork();
      destroyWebgl();
      initArchive();
    } else {
      destroyArchive();
      if (ns === 'work') {
        setBaseSceneOverlayMode(true);
        // initWork() already called in enter() hook — skip to avoid double-init
      } else if (ns === 'film') {
        setBaseSceneOverlayMode(false);
        destroyWork();
        destroyWebgl();
      } else if (ns === 'home' || ns === 'contact') {
        setBaseSceneOverlayMode(false);
        setBaseSceneVisibility(true);
      }
    }
    return;
  }

  if (ns === 'work') {
    destroyArchive();
    destroyFilm();
    webgl();
    setBaseSceneOverlayMode(true);
    setBaseSceneVisibility(true);
    setScenePage('work', true);
    swapModel('work');
    initWork();
  } else if (ns === 'archive') {
    setBaseSceneOverlayMode(false);
    destroyWork();
    destroyFilm();
    destroyWebgl();
    initArchive();
  } else if (ns === 'film') {
    setBaseSceneOverlayMode(false);
    destroyArchive();
    destroyWork();
    destroyWebgl();
    initFilm();
  } else if (ns === 'home' || ns === 'contact') {
    setBaseSceneOverlayMode(false);
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
    destroyWebgl();
  }
}

function clearWorkOutroOverlay(duration = 0.5) {
  const overlay = document.getElementById('work-outro-overlay');
  if (overlay) {
    gsap.to(overlay, {
      autoAlpha: 0,
      duration,
      ease: 'power2.out',
      onComplete: () => overlay.remove()
    });
  }
}

const pinnedContainerStyles = new WeakMap();

function pinContainerForTransition(container, { zIndex = '1', hidden = false } = {}) {
  if (!container) return;
  if (!pinnedContainerStyles.has(container)) {
    pinnedContainerStyles.set(container, {
      position: container.style.position,
      inset: container.style.inset,
      width: container.style.width,
      height: container.style.height,
      zIndex: container.style.zIndex,
      opacity: container.style.opacity,
      pointerEvents: container.style.pointerEvents,
    });
  }

  container.style.position = 'fixed';
  container.style.inset = '0';
  container.style.width = '100vw';
  container.style.height = '100vh';
  container.style.zIndex = zIndex;
  container.style.pointerEvents = hidden ? 'none' : '';
  container.style.opacity = hidden ? '0' : '1';
}

function unpinContainerAfterTransition(container) {
  if (!container) return;
  const saved = pinnedContainerStyles.get(container);
  if (!saved) return;
  container.style.position = saved.position;
  container.style.inset = saved.inset;
  container.style.width = saved.width;
  container.style.height = saved.height;
  container.style.zIndex = saved.zIndex;
  container.style.opacity = saved.opacity;
  container.style.pointerEvents = saved.pointerEvents;
  pinnedContainerStyles.delete(container);
}

function getFilmCoverTargetRect(container) {
  const rect = container?.querySelector?.('.coverimg')?.getBoundingClientRect?.();
  if (rect && Number.isFinite(rect.width) && Number.isFinite(rect.height) && rect.width > 1 && rect.height > 1) {
    return {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
    };
  }

  const vw = window.innerWidth || 1;
  const vh = window.innerHeight || 1;
  const width = Math.min(vw * 0.42, 620);
  const height = width * 0.62;
  return {
    x: (vw - width) * 0.5,
    y: (vh - height) * 0.5,
    width,
    height,
  };
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
        clearWorkOutroOverlay();
        const fromNs = data?.current?.namespace;
        const toNs = data?.next?.namespace;
        const container = data?.next?.container;

        const involvesWork = (fromNs === 'work' || toNs === 'work');

        if (involvesWork) {
          const targetModel = toNs === 'work' ? 'work' : 'home';
          setBaseSceneOverlayMode(toNs === 'work');
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
      name: 'work-to-film-transition',
      from: { namespace: ['work'] },
      to: { namespace: ['film'] },
      async leave(data) {
        closeMenuIfOpen();
        cleanupSplits();
        pinContainerForTransition(data?.current?.container, { zIndex: '2', hidden: false });
      },
      async enter(data) {
        const container = data?.next?.container;
        pinContainerForTransition(container, { zIndex: '1', hidden: true });
        bindFilmTemplateFromTransitionState(container);

        // Wait for the coverimg to load before measuring its rect.
        // The src is set just above; if the image isn't in cache yet it won't
        // have decoded, and getBoundingClientRect returns zero height → fallback.
        const coverImgEl = container.querySelector('.coverimg img');
        if (coverImgEl && !coverImgEl.complete && coverImgEl.src) {
          await Promise.race([
            new Promise(r => { coverImgEl.onload = r; coverImgEl.onerror = r; }),
            new Promise(r => setTimeout(r, 600)),
          ]);
        }
        await new Promise((resolve) => requestAnimationFrame(resolve));

        const targetRect = getFilmCoverTargetRect(container);
        await runWorkStripUnwrapToRect(targetRect);
        finalizeWorkToFilmVisualState();

        const bgEl = document.getElementById('background');
        if (bgEl) {
          await gsapToPromise(bgEl, {
            opacity: 0,
            duration: 0.3,
            ease: 'power2.inOut',
          });
        }

        destroyWork();
        setBaseSceneOverlayMode(false);
        destroyWebgl();

        await initFilm(container);
        await waitForFilmFirstFrame();
        unpinContainerAfterTransition(container);
        if (bgEl) {
          await gsapToPromise(bgEl, {
            opacity: 1,
            duration: 0.4,
            ease: 'power2.out',
            clearProps: 'opacity',
          });
        }
        clearWorkOutroOverlay(0.35);
      },
      async after(data) {
        const ns = data?.next?.namespace;
        const nextContainer = data?.next?.container;
        unpinContainerAfterTransition(data?.current?.container);
        unpinContainerAfterTransition(nextContainer);
        initPageFeatures(ns, { skipWebglSetup: true });
        animateRevealEnter(nextContainer);
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
          destroyWebgl();
        }

        cleanupSplits();
      },
      async enter() {
        clearWorkOutroOverlay();
      },
      async once(data) {
        const ns = data?.next?.namespace;
        const container = data?.next?.container;

        if (container) {
          const titlesToHide = container.querySelectorAll('.reveal-title, .reveal-body');
          gsap.set(titlesToHide, { opacity: 0 });
        }

        // Non-webgl pages (archive, film, etc.) don't call webgl() so the
        // preloader never fires via loadModels(). Run it here instead.
        if (!isWebglPage(ns)) {
          // init() is synchronous until its first await — runPromise is set
          // before it returns, so startWorkTexturePreload() can safely hold().
          const initPromise = preloader.init();
          startWorkTexturePreload();
          await Promise.all([initPromise, preloader.load([])]);
        }

        initPageFeatures(ns);

        // For webgl pages, webgl() → loadModels() → preloader.init() has run
        // synchronously inside initPageFeatures, so hold() is now safe.
        if (isWebglPage(ns)) {
          startWorkTexturePreload();
        }
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
        // Wait for preloader to fully close and resolve before revealing
        if (preloader.runPromise) {
          await preloader.runPromise;
        }

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
