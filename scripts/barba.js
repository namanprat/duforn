import barba from '@barba/core';
import gsap from 'gsap';
import { animateTransition, revealTransition, closeMenuIfOpen } from './transition.js';
import { initMenu } from './menu.js';
import { initIndex, destroyIndex } from './index.js';
import { initWork, destroyWork } from './work.js';
import { initArchiveScene, destroyArchiveScene } from './archive/index.js';
import { animateRevealEnter, initScrollTextReveals, getOrSplit, cleanupScrollTriggers } from './text-reveal.js';
import webgl, { destroyWebgl, setScenePage, isWebglRunning, mountSceneText } from './three.js';
import { initLinkHover, destroyLinkHover } from './link-hover.js';
import { initBtnHover } from './btn-hover.js';


function tweenToPromise(tween) {
  return tween
    ? new Promise(resolve => tween.eventCallback('onComplete', resolve))
    : Promise.resolve();
}

function createHomeLeaveTimeline(container) {
  const tl = gsap.timeline({ defaults: { ease: 'power2.in' } });
  let hasSteps = false;

  const heroTextReveals = container.querySelectorAll('.hero-text-reveal');
  for (let i = 0; i < heroTextReveals.length; i++) {
    const split = getOrSplit(heroTextReveals[i], { type: 'lines' });
    if (!split?.lines?.length) continue;
    hasSteps = true;
    tl.to(split.lines, {
      yPercent: -100,
      opacity: 0,
      duration: 0.3,
      stagger: 0.03
    }, 0);
  }

  const heroLogo = container.querySelector('.hero-logo-top h1');
  if (heroLogo) {
    hasSteps = true;
    tl.to(heroLogo, {
      y: -30,
      opacity: 0,
      duration: 0.3
    }, 0);
  }

  return hasSteps ? tl : null;
}

function createContactLeaveTimeline(container, nextNamespace) {
  const tl = gsap.timeline({ defaults: { ease: 'power2.in' } });
  let hasSteps = false;

  const textRevealHeaders = container.querySelectorAll('.text-reveal-header');
  for (let i = 0; i < textRevealHeaders.length; i++) {
    const header = textRevealHeaders[i];
    const split = getOrSplit(header);
    if (!split?.words?.length) continue;
    hasSteps = true;
    const isReverse = header.classList.contains('text-reveal-reverse');
    tl.to(split.words, {
      y: isReverse ? 100 : -100,
      opacity: 0,
      duration: 0.25,
      stagger: 0.015
    }, 0);
  }

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

function primeHomeEnter(container) {
  const heroTextReveals = container.querySelectorAll('.hero-text-reveal');
  for (let i = 0; i < heroTextReveals.length; i++) {
    const split = getOrSplit(heroTextReveals[i], { type: 'lines' });
    if (split?.lines?.length) {
      gsap.set(split.lines, { yPercent: 100, opacity: 0 });
    }
  }

  const heroLogo = container.querySelector('.hero-logo-top h1');
  if (heroLogo) {
    gsap.set(heroLogo, { y: 30, opacity: 0 });
  }

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

function createHomeEnterTimeline(container) {
  const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
  let stepCount = 0;

  const heroTextReveals = container.querySelectorAll('.hero-text-reveal');
  for (let i = 0; i < heroTextReveals.length; i++) {
    const split = getOrSplit(heroTextReveals[i], { type: 'lines' });
    if (!split?.lines?.length) continue;
    tl.to(split.lines, {
      yPercent: 0,
      opacity: 1,
      duration: 0.6,
      stagger: 0.08
    }, stepCount > 0 ? '<0.04' : 0);
    stepCount += 1;
  }

  const heroLogo = container.querySelector('.hero-logo-top h1');
  if (heroLogo) {
    tl.to(heroLogo, {
      y: 0,
      opacity: 1,
      duration: 0.4
    }, 0.1);
    stepCount += 1;
  }

  return stepCount > 0 ? tl : null;
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
    const wasRunning = isWebglRunning();
    webgl();
    // Ensure scene offset matches current page on fresh init (no snap during transitions)
    if (!wasRunning) {
      setScenePage(ns, true);
    }
    mountSceneText(ns);
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
      name: 'home-contact-transition',
      from: { namespace: ['home', 'contact'] },
      to: { namespace: ['home', 'contact'] },
      async leave(data) {
        closeMenuIfOpen();
        cleanupScrollTriggers();
        // Start scene shift toward the target page (runs during text-out animation)
        setScenePage(data?.next?.namespace);
        const container = data?.current?.container;
        const ns = data?.current?.namespace;
        if (!container) return;

        if (ns === 'home') {
          await tweenToPromise(createHomeLeaveTimeline(container));
        } else if (ns === 'contact') {
          await tweenToPromise(createContactLeaveTimeline(container, data?.next?.namespace));
        }
      },
      async enter(data) {
        const container = data?.next?.container;
        const ns = data?.next?.namespace;
        if (!container) return;

        if (ns === 'home') {
          primeHomeEnter(container);
        } else if (ns === 'contact') {
          primeContactEnter();
        }
        // Contact page text-reveal headers handled by animateRevealEnter
      },
      async after(data) {
        const container = data?.next?.container;
        const ns = data?.next?.namespace;
        if (!container) return;

        initPageFeatures(ns);

        if (ns === 'home') {
          await tweenToPromise(createHomeEnterTimeline(container));
          // Ensure nav link-main is hidden on home
          const linkMain = document.querySelector('.link-main');
          if (linkMain) {
            gsap.set(linkMain, { autoAlpha: 0 });
          }
        } else if (ns === 'contact') {
          // Animate contact text-reveal headers in
          await animateRevealEnter(container);
          // Animate nav link-main lines in
          await tweenToPromise(createContactEnterTween());
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
        initPageFeatures(data?.next?.namespace);

        await revealTransition();

        const ns = data?.next?.namespace;
        const container = data?.next?.container;
        if (!container) return;

        if (ns === 'home') {
          // Animate home hero on initial load
          const promises = [];
          const heroTextReveals = container.querySelectorAll('.hero-text-reveal');
          for (let i = 0; i < heroTextReveals.length; i++) {
            const el = heroTextReveals[i];
            const split = getOrSplit(el, { type: 'lines' });
            if (split?.lines?.length) {
              gsap.set(split.lines, { yPercent: 100, opacity: 0 });
              const tween = gsap.to(split.lines, {
                yPercent: 0,
                opacity: 1,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power2.out',
                delay: 0.1
              });
              promises.push(new Promise(resolve => tween.eventCallback('onComplete', resolve)));
            }
          }
          // Animate hero logo
          const heroLogo = container.querySelector('.hero-logo-top h1');
          if (heroLogo) {
            gsap.set(heroLogo, { y: 30, opacity: 0 });
            const tween = gsap.to(heroLogo, {
              y: 0,
              opacity: 1,
              duration: 0.5,
              ease: 'power2.out',
              delay: 0.1
            });
            promises.push(new Promise(resolve => tween.eventCallback('onComplete', resolve)));
          }
          if (promises.length) await Promise.all(promises);
          // Ensure nav link-main is hidden on home (once)
          const linkMainHome = document.querySelector('.link-main');
          if (linkMainHome) {
            gsap.set(linkMainHome, { autoAlpha: 0 });
          }
        } else if (ns === 'contact') {
          await animateRevealEnter(container);
          // Animate nav link-main lines in on initial load
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
          const container = data?.next?.container;
          if (!container) return;
          await animateRevealEnter(container);
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
