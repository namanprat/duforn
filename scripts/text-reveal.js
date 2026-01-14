import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const splits = new WeakMap();
const splitTracking = []; // Track splits so we can revert them
const scrollTriggers = [];

gsap.registerPlugin(SplitText, ScrollTrigger);

function tweenToPromise(tween) {
  return tween ? new Promise((resolve) => tween.eventCallback("onComplete", resolve)) : Promise.resolve();
}

function getOrSplit(element, options = { type: "lines, words, chars" }) {
  if (!element) return null;
  // If we already split it with the exact same options, return cached
  // But for body-text-reveal we might need different options (e.g. lines only, mask lines)
  // For simplicity here, we'll just check if it's already split.
  // Warning: mixed usage on same element might overlap.
  if (splits.has(element)) return splits.get(element);
  
  const split = new SplitText(element, options);
  
  // Batch overflow style updates and handle indentation if "lines" are present
  if (split.lines?.length) {
    const computedStyle = window.getComputedStyle(element);
    const textIndent = computedStyle.textIndent;
    
    // Check if there's indentation to preserve on the first line
    if (textIndent && textIndent !== "0px" && split.lines.length > 0) {
       split.lines[0].style.paddingLeft = textIndent;
       element.style.textIndent = "0";
    }

    // Wrap each line in a parent div with u-overflow-hidden to create the mask
    split.lines.forEach(line => {
      const wrapper = document.createElement("div");
      wrapper.className = "u-overflow-hidden"; // Added user requested class
      wrapper.style.display = "block";
      wrapper.style.width = "100%"; // Ensure full width
      
      // Insert wrapper before line, then move line into wrapper
      line.parentNode.insertBefore(wrapper, line);
      wrapper.appendChild(line);
      
      // Ensure line display is block for transform consistency
      line.style.display = "block";
      line.style.width = "100%";
      // Reset any default overflow if needed
      line.style.overflow = "visible"; 
    });
  }
  
  splits.set(element, split);
  splitTracking.push(split); // Track for cleanup
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
  const bodyReveals = document.querySelectorAll(".body-text-reveal");
  
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

  // Process body text reveals (lines)
  for (let i = 0; i < bodyReveals.length; i++) {
    const el = bodyReveals[i];
    // Use specific config for body text: just lines, mask logic handled in getOrSplit
    const split = getOrSplit(el, { type: "lines", linesClass: "line++" });
    if (!split?.lines?.length) continue;
    
    // Set initial state: y: 100% (slide up from bottom of line height)
    gsap.set(split.lines, { y: "100%" });

    const tween = gsap.to(
      split.lines,
      {
        y: "0%",
        duration: 1,
        stagger: 0.1,
        ease: "power4.out",
        scrollTrigger: {
          trigger: el,
          start: "top 80%", // enter 20% into viewport (80% from top)
          // Play on enter, none on leave, play on enter back, none on leave back
          toggleActions: "play none play none" 
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

export { getOrSplit, animateRevealEnter, initScrollTextReveals, cleanupScrollTriggers, cleanupSplits };
