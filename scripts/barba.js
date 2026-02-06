import barba from '@barba/core';
import gsap from 'gsap';
import { animateTransition, revealTransition, closeMenuIfOpen } from './transition.js';
import { initMenu } from './menu.js';
import { initIndex, destroyIndex } from './index.js';
import { initWork, destroyWork } from './work.js';
import { initArchiveScene, destroyArchiveScene } from './archive/index.js';
import { animateRevealEnter, initScrollTextReveals, getOrSplit, cleanupScrollTriggers } from './text-reveal.js';
import webgl, { destroyWebgl, setScenePage, isWebglRunning } from './three.js';
import { initLinkHover, destroyLinkHover } from './link-hover.js';
import { initBtnHover } from './btn-hover.js';



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
        // Start scene shift toward the target page (runs during text-out animation)
        setScenePage(data?.next?.namespace);
        const container = data?.current?.container;
        const ns = data?.current?.namespace;
        if (!container) return;

        const animations = [];

        if (ns === 'home') {
          // Home page: animate out hero text reveals (lines)
          const heroTextReveals = container.querySelectorAll('.hero-text-reveal');
          for (let i = 0; i < heroTextReveals.length; i++) {
            const el = heroTextReveals[i];
            const split = getOrSplit(el, { type: 'lines' });
            if (split?.lines?.length) {
              animations.push(
                gsap.to(split.lines, {
                  yPercent: -100,
                  opacity: 0,
                  duration: 0.3,
                  stagger: 0.03,
                  ease: 'power2.in'
                })
              );
            }
          }
          // Fade out hero logo
          const heroLogo = container.querySelector('.hero-logo-top h1');
          if (heroLogo) {
            animations.push(
              gsap.to(heroLogo, {
                y: -30,
                opacity: 0,
                duration: 0.3,
                ease: 'power2.in'
              })
            );
          }
        } else if (ns === 'contact') {
          // Contact page: animate text-reveal headers out
          const textRevealHeaders = container.querySelectorAll('.text-reveal-header');
          for (let i = 0; i < textRevealHeaders.length; i++) {
            const header = textRevealHeaders[i];
            const split = getOrSplit(header);
            if (split?.words?.length) {
              const isReverse = header.classList.contains('text-reveal-reverse');
              animations.push(
                gsap.to(split.words, {
                  y: isReverse ? 100 : -100,
                  opacity: 0,
                  duration: 0.25,
                  stagger: 0.015,
                  ease: 'power2.in'
                })
              );
            }
          }
          // Animate out nav link-main (lines)
          const linkMain = document.querySelector('.link-main');
          if (linkMain) {
            animations.push(
              gsap.to(linkMain, {
                y: -20,
                opacity: 0,
                duration: 0.25,
                ease: 'power2.in',
                onComplete: () => {
                  // Hide link-main completely after animation when going to home
                  if (data?.next?.namespace === 'home') {
                    gsap.set(linkMain, { autoAlpha: 0, clearProps: 'transform,opacity' });
                  }
                }
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
        const ns = data?.next?.namespace;
        if (!container) return;

        if (ns === 'home') {
          // Set initial state for home hero line reveals
          const heroTextReveals = container.querySelectorAll('.hero-text-reveal');
          for (let i = 0; i < heroTextReveals.length; i++) {
            const el = heroTextReveals[i];
            const split = getOrSplit(el, { type: 'lines' });
            if (split?.lines?.length) {
              gsap.set(split.lines, { yPercent: 100, opacity: 0 });
            }
          }
          // Set initial state for hero logo
          const heroLogo = container.querySelector('.hero-logo-top h1');
          if (heroLogo) {
            gsap.set(heroLogo, { y: 30, opacity: 0 });
          }
          // Hide nav link-main on home
          const linkMain = document.querySelector('.link-main');
          if (linkMain) {
            gsap.set(linkMain, { autoAlpha: 0 });
          }
        } else if (ns === 'contact') {
          // Set initial state for nav link-main lines
          const linkMain = document.querySelector('.link-main');
          if (linkMain) {
            gsap.set(linkMain, { autoAlpha: 1, y: 20, opacity: 0 });
          }
        }
        // Contact page text-reveal headers handled by animateRevealEnter
      },
      async after(data) {
        const container = data?.next?.container;
        const ns = data?.next?.namespace;
        if (!container) return;

        initPageFeatures(ns);

        if (ns === 'home') {
          // Animate in home hero line reveals
          const promises = [];
          const heroTextReveals = container.querySelectorAll('.hero-text-reveal');
          for (let i = 0; i < heroTextReveals.length; i++) {
            const el = heroTextReveals[i];
            const split = getOrSplit(el, { type: 'lines' });
            if (split?.lines?.length) {
              const tween = gsap.to(split.lines, {
                yPercent: 0,
                opacity: 1,
                duration: 0.6,
                stagger: 0.08,
                ease: 'power2.out'
              });
              promises.push(new Promise(resolve => tween.eventCallback('onComplete', resolve)));
            }
          }
          // Animate in hero logo
          const heroLogo = container.querySelector('.hero-logo-top h1');
          if (heroLogo) {
            const tween = gsap.to(heroLogo, {
              y: 0,
              opacity: 1,
              duration: 0.4,
              ease: 'power2.out'
            });
            promises.push(new Promise(resolve => tween.eventCallback('onComplete', resolve)));
          }
          if (promises.length) await Promise.all(promises);
          // Ensure nav link-main is hidden on home
          const linkMain = document.querySelector('.link-main');
          if (linkMain) {
            gsap.set(linkMain, { autoAlpha: 0 });
          }
        } else if (ns === 'contact') {
          // Animate contact text-reveal headers in
          await animateRevealEnter(container);
          // Animate nav link-main lines in
          const linkMain = document.querySelector('.link-main');
          if (linkMain) {
            await gsap.to(linkMain, {
              y: 0,
              opacity: 1,
              duration: 0.6,
              ease: 'power2.out'
            });
          }
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