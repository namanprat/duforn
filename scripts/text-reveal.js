import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(SplitText, ScrollTrigger);

// Cache for split text instances
const splits = new Map();
const scrollTriggers = new Set();

// Helper function to convert GSAP tween to promise
function tweenToPromise(tween) {
  if (!tween) return Promise.resolve();
  return new Promise((resolve) => {
    tween.eventCallback("onComplete", resolve);
  });
}

// Get or create split text instance with caching
function getOrSplit(element) {
  if (!element) return null;
  
  // Return cached split if it exists
  if (splits.has(element)) {
    return splits.get(element);
  }
  
  // Create new split
  const split = new SplitText(element, { 
    type: "lines,words",
    linesClass: "split-line"
  });
  
  // Set overflow hidden on lines for reveal effect
  if (split.lines?.length) {
    gsap.set(split.lines, { overflow: "hidden" });
  }
  
  // Cache the split
  splits.set(element, split);
  return split;
}

// Clear split cache for an element
function clearSplit(element) {
  if (!element) return;
  
  const split = splits.get(element);
  if (split) {
    split.revert();
    splits.delete(element);
  }
}

// Reveal words with direction animation
function revealWords(element, { 
  direction = "up", 
  duration = 0.8, 
  stagger = 0.04, 
  ease = "power3.out" 
} = {}) {
  if (!element) return null;
  
  const split = getOrSplit(element);
  if (!split?.words?.length) return null;
  
  const yStart = direction === "down" ? 100 : -100;
  
  return gsap.fromTo(
    split.words,
    { 
      y: yStart, 
      autoAlpha: 0 
    },
    { 
      y: 0, 
      autoAlpha: 1, 
      duration, 
      stagger, 
      ease,
      clearProps: "transform,opacity,visibility"
    }
  );
}

// Animate text reveal on page enter
async function animateRevealEnter(container) {
  if (!container) return;
  
  const textReveal = container.querySelector(".text-reveal");
  const textRevealReverse = container.querySelector(".text-reveal-reverse");

  // Animate text-reveal (up direction)
  if (textReveal) {
    // Ensure element is visible
    gsap.set(textReveal, { autoAlpha: 1 });
    
    const tween = revealWords(textReveal, { 
      direction: "up", 
      duration: 0.8, 
      stagger: 0.04 
    });
    
    if (tween) {
      await tweenToPromise(tween);
    }
    return;
  }

  // Animate text-reveal-reverse (down direction)
  if (textRevealReverse) {
    // Ensure element is visible
    gsap.set(textRevealReverse, { autoAlpha: 1 });
    
    const tween = revealWords(textRevealReverse, { 
      direction: "down", 
      duration: 0.8, 
      stagger: 0.04 
    });
    
    if (tween) {
      await tweenToPromise(tween);
    }
    return;
  }
}

// Kill all existing ScrollTriggers for text reveals
function killScrollTriggers() {
  scrollTriggers.forEach(trigger => {
    if (trigger && trigger.kill) {
      trigger.kill();
    }
  });
  scrollTriggers.clear();
}

// Initialize scroll-triggered text reveals
function initScrollTextReveals() {
  // Kill existing triggers first
  killScrollTriggers();
  
  // Batch process regular reveals
  const regular = gsap.utils.toArray(".text-reveal");
  regular.forEach((el) => {
    const split = getOrSplit(el);
    if (!split?.words?.length) return;
    
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top 80%",
      once: true,
      onEnter: () => {
        gsap.fromTo(
          split.words,
          { y: -100, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.8,
            stagger: 0.04,
            ease: "power3.out",
            clearProps: "transform,opacity,visibility"
          }
        );
      }
    });
    
    scrollTriggers.add(trigger);
  });

  // Batch process reverse reveals
  const reverse = gsap.utils.toArray(".text-reveal-reverse");
  reverse.forEach((el) => {
    const split = getOrSplit(el);
    if (!split?.words?.length) return;
    
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top 80%",
      once: true,
      onEnter: () => {
        gsap.fromTo(
          split.words,
          { y: 100, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.8,
            stagger: 0.04,
            ease: "power3.out",
            clearProps: "transform,opacity,visibility"
          }
        );
      }
    });
    
    scrollTriggers.add(trigger);
  });
}

// Cleanup function for page transitions
function destroyTextReveals() {
  killScrollTriggers();
  
  // Optionally clear all splits (uncomment if needed)
  // splits.forEach((split) => split.revert());
  // splits.clear();
}

export { 
  getOrSplit, 
  clearSplit,
  animateRevealEnter, 
  initScrollTextReveals,
  destroyTextReveals,
  revealWords
};