import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const splits = new WeakMap();
const scrollTriggers = [];

gsap.registerPlugin(SplitText, ScrollTrigger);

function tweenToPromise(tween) {
  return tween ? new Promise((resolve) => tween.eventCallback("onComplete", resolve)) : Promise.resolve();
}

function getOrSplit(element) {
  if (!element) return null;
  if (splits.has(element)) return splits.get(element);
  
  const split = new SplitText(element, { type: "lines, words, chars" });
  
  // Batch overflow style updates
  if (split.lines?.length) {
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < split.lines.length; i++) {
      split.lines[i].style.overflow = "hidden";
    }
  }
  
  splits.set(element, split);
  return split;
}

function revealWords(element, { direction = "up", duration = 0.8, stagger = 0.03, ease = "power2.out" } = {}) {
  const split = getOrSplit(element);
  if (!split) return null;
  const yStart = direction === "down" ? 100 : -100;
  return gsap.fromTo(
    split.words,
    { y: yStart, filter: "blur(0px)", opacity: 0 },
    { y: 0, filter: "blur(0px)", opacity: 1, duration, stagger, ease }
  );
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

function initScrollTextReveals() {
  // Clear previous ScrollTriggers
  cleanupScrollTriggers();
  
  // Batch query all types at once - but exclude ones in .hero section
  const regular = document.querySelectorAll(".text-reveal:not(.hero .text-reveal)");
  const reverse = document.querySelectorAll(".text-reveal-reverse:not(.hero .text-reveal-reverse)");
  const headers = document.querySelectorAll(".text-reveal-header:not(.hero .text-reveal-header)");
  
  // Process regular reveals
  for (let i = 0; i < regular.length; i++) {
    const el = regular[i];
    const split = getOrSplit(el);
    if (!split?.words?.length) continue;
    
    const tween = gsap.fromTo(
      split.words,
      { y: -100, filter: "blur(0px)", opacity: 0 },
      {
        y: 0,
        filter: "blur(0px)",
        opacity: 1,
        duration: 1,
        stagger: 0.05,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          once: true // Optimize: only trigger once
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
      { y: 100, filter: "blur(0px)", opacity: 0 },
      {
        y: 0,
        filter: "blur(0px)",
        opacity: 1,
        duration: 1,
        stagger: 0.05,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          once: true // Optimize: only trigger once
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
      { y: yStart, filter: "blur(0px)", opacity: 0 },
      {
        y: 0,
        filter: "blur(0px)",
        opacity: 1,
        duration: 1,
        stagger: 0.05,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          once: true
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

export { getOrSplit, animateRevealEnter, initScrollTextReveals, cleanupScrollTriggers };
