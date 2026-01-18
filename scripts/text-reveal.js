import gsap from "gsap";
import SplitType from "split-type";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const splits = new WeakMap();
const splitTracking = []; // Track splits so we can revert them
const scrollTriggers = [];

gsap.registerPlugin(ScrollTrigger);

function tweenToPromise(tween) {
  return tween ? new Promise((resolve) => tween.eventCallback("onComplete", resolve)) : Promise.resolve();
}

function getOrSplit(element, options = { type: "lines, words, chars" }) {
  if (!element) return null;
  // If we already split it with the exact same options, return cached
  if (splits.has(element)) return splits.get(element);

  // Map GSAP SplitText 'type' to SplitType 'types'
  const types = options.type || options.types || "lines, words, chars";
  const splitOptions = { ...options, types };
  delete splitOptions.type;

  const split = new SplitType(element, splitOptions);

  // Batch overflow style updates and handle indentation if "lines" are present
  if (split.lines?.length) {
    const lines = split.lines;
    const len = lines.length;

    // Read computed style once (avoid layout thrashing)
    const computedStyle = window.getComputedStyle(element);
    const textIndent = computedStyle.textIndent;
    const hasIndent = textIndent && textIndent !== "0px";

    // Batch all DOM writes together after reads
    if (hasIndent) {
      lines[0].style.paddingLeft = textIndent;
      element.style.textIndent = "0";
    }

    // Create all wrappers first, then batch DOM operations
    const wrappers = new Array(len);
    for (let i = 0; i < len; i++) {
      const wrapper = document.createElement("div");
      wrapper.className = "u-overflow-hidden";
      wrapper.style.cssText = "display:block;width:100%";
      wrappers[i] = wrapper;
    }

    // Batch DOM insertions
    for (let i = 0; i < len; i++) {
      const line = lines[i];
      const wrapper = wrappers[i];
      line.parentNode.insertBefore(wrapper, line);
      wrapper.appendChild(line);
      line.style.cssText = "display:block;width:100%;overflow:visible";
    }
  }

  splits.set(element, split);
  splitTracking.push(split);
  return split;
}

function revealWords(element, { direction = "up", duration = 0.8, stagger = 0.03, ease = "power2.out" } = {}) {
  const split = getOrSplit(element);
  if (!split) return null;
  const yStart = direction === "down" ? 100 : -100;
  return gsap.fromTo(
    split.words,
    { y: yStart, opacity: 0 },
    { y: 0, opacity: 1, duration, stagger, ease }
  );
}

// Animate text OUT - words slide away and fade out
function hideWords(element, { direction = "up", duration = 0.5, stagger = 0.02, ease = "power2.in" } = {}) {
  const split = getOrSplit(element);
  if (!split?.words?.length) return null;
  const yEnd = direction === "up" ? -100 : 100;
  return gsap.to(split.words, {
    y: yEnd,
    opacity: 0,
    duration,
    stagger,
    ease
  });
}

function fadeNodes(nodes, { duration = 0.55, stagger = 0.03, ease = "power2.out" } = {}) {
  if (!nodes || !nodes.length) return null;
  return gsap.fromTo(nodes, { opacity: 0 }, { opacity: 1, duration, stagger, ease });
}

async function animateRevealEnter(container) {
  if (!container) return;

  const textRevealHeaders = container.querySelectorAll(".text-reveal-header");

  // Early return if no elements found
  if (!textRevealHeaders.length) return;

  // Batch clearProps for all headers
  const toClear = Array.from(textRevealHeaders);
  if (toClear.length) {
    gsap.set(toClear, { clearProps: "all" });
  }

  // Animate each header based on its direction
  const animations = [];
  for (let i = 0; i < textRevealHeaders.length; i++) {
    const header = textRevealHeaders[i];
    const isReverse = header.classList.contains('text-reveal-reverse');
    const direction = isReverse ? 'down' : 'up';

    const tween = revealWords(header, {
      direction,
      duration: 0.8,
      stagger: 0.04
    });

    if (tween) {
      animations.push(tweenToPromise(tween));
    }
  }

  // Wait for all animations to complete
  if (animations.length) {
    await Promise.all(animations);
  }
}

// Animate text headers OUT with specified direction
// direction: "up" = text slides up and out, "down" = text slides down and out
async function animateRevealLeave(container, direction = "up") {
  if (!container) return;

  const textRevealHeaders = container.querySelectorAll(".text-reveal-header");
  if (!textRevealHeaders.length) return;

  const animations = [];
  for (let i = 0; i < textRevealHeaders.length; i++) {
    const header = textRevealHeaders[i];
    const tween = hideWords(header, {
      direction,
      duration: 0.5,
      stagger: 0.02
    });

    if (tween) {
      animations.push(tweenToPromise(tween));
    }
  }

  if (animations.length) {
    await Promise.all(animations);
  }
}

// Animate text headers IN with specified direction
// direction: "up" = text slides up from below, "down" = text slides down from above
async function animateRevealEnterDirectional(container, direction = "up") {
  if (!container) return;

  const textRevealHeaders = container.querySelectorAll(".text-reveal-header");
  if (!textRevealHeaders.length) return;

  // Clear any existing transforms
  const toClear = Array.from(textRevealHeaders);
  if (toClear.length) {
    gsap.set(toClear, { clearProps: "all" });
  }

  const animations = [];
  for (let i = 0; i < textRevealHeaders.length; i++) {
    const header = textRevealHeaders[i];
    const tween = revealWords(header, {
      direction,
      duration: 0.8,
      stagger: 0.04
    });

    if (tween) {
      animations.push(tweenToPromise(tween));
    }
  }

  if (animations.length) {
    await Promise.all(animations);
  }
}

function initScrollTextReveals() {
  // Clear previous ScrollTriggers
  cleanupScrollTriggers();
  
  // Batch query all types at once - but exclude ones in .hero section
  const regular = document.querySelectorAll(".text-reveal:not(.hero .text-reveal)");
  const reverse = document.querySelectorAll(".text-reveal-reverse:not(.hero .text-reveal-reverse)");
  const headers = document.querySelectorAll(".text-reveal-header:not(.hero .text-reveal-header)");
  const bodyReveals = document.querySelectorAll(".body-text-reveal");
  
  // Process regular reveals
  for (let i = 0; i < regular.length; i++) {
    const el = regular[i];
    const split = getOrSplit(el);
    if (!split?.words?.length) continue;

    const tween = gsap.fromTo(
      split.words,
      { y: -100, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.05,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          toggleActions: "play reverse play reverse"
        },
      }
    );

    if (tween.scrollTrigger) {
      scrollTriggers.push(tween.scrollTrigger);
    }
  }

  // Process reverse reveals
  for (let i = 0; i < reverse.length; i++) {
    const el = reverse[i];
    const split = getOrSplit(el);
    if (!split?.words?.length) continue;

    const tween = gsap.fromTo(
      split.words,
      { y: 100, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.05,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          toggleActions: "play reverse play reverse"
        },
      }
    );

    if (tween.scrollTrigger) {
      scrollTriggers.push(tween.scrollTrigger);
    }
  }

  // Process header reveals (check for direction class)
  for (let i = 0; i < headers.length; i++) {
    const el = headers[i];
    const split = getOrSplit(el);
    if (!split?.words?.length) continue;

    const isReverse = el.classList.contains('text-reveal-reverse');
    const yStart = isReverse ? 100 : -100;

    const tween = gsap.fromTo(
      split.words,
      { y: yStart, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.05,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          toggleActions: "play reverse play reverse"
        },
      }
    );

    if (tween.scrollTrigger) {
      scrollTriggers.push(tween.scrollTrigger);
    }
  }

  // Process body text reveals (lines)
  for (let i = 0; i < bodyReveals.length; i++) {
    const el = bodyReveals[i];
    // Use specific config for body text: just lines, mask logic handled in getOrSplit
    const split = getOrSplit(el, { type: "lines" });
    if (!split?.lines?.length) continue;
    
    // Set initial state: y: 100% (slide up from bottom of line height)
    gsap.set(split.lines, { yPercent: 100, opacity: 0 });

    const tween = gsap.to(
      split.lines,
      {
        yPercent: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.1,
        ease: "power4.out",
        scrollTrigger: {
          trigger: el,
          start: "top 90%", // enter 10% into viewport (90% from top)
          // Play on enter, reverse on leave, play on enter back, reverse on leave back
          toggleActions: "play reverse play reverse" 
        },
      }
    );
    
    if (tween.scrollTrigger) {
      scrollTriggers.push(tween.scrollTrigger);
    }
  }
}

// Cleanup function for ScrollTriggers
function cleanupScrollTriggers() {
  while (scrollTriggers.length) {
    const trigger = scrollTriggers.pop();
    if (trigger) trigger.kill();
  }
}

// Cleanup function to revert all splits and clear cache
function cleanupSplits() {
  // Revert all tracked splits to restore original text
  for (let i = splitTracking.length - 1; i >= 0; i--) {
    const split = splitTracking[i];
    if (split && typeof split.revert === 'function') {
      split.revert();
    }
  }
  splitTracking.length = 0; // Clear the tracking array
}

export { getOrSplit, animateRevealEnter, animateRevealLeave, animateRevealEnterDirectional, initScrollTextReveals, cleanupScrollTriggers, cleanupSplits };
