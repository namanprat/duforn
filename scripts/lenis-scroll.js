import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const lenis = new Lenis({
  // Slightly higher lerp for smoother scrolling with less computation
  lerp: 0.12,
  duration: 1.2,
  smoothWheel: true,
  touchMultiplier: 1,
  // Reduce wheel multiplier for smoother performance
  wheelMultiplier: 0.8,
});

// Throttle ScrollTrigger updates for better performance
let lastScrollTriggerUpdate = 0;
const SCROLL_TRIGGER_THROTTLE = 16; // ~60fps

lenis.on('scroll', () => {
  const now = performance.now();
  if (now - lastScrollTriggerUpdate >= SCROLL_TRIGGER_THROTTLE) {
    lastScrollTriggerUpdate = now;
    ScrollTrigger.update();
  }
});

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

// Enable lag smoothing for consistent frame pacing
gsap.ticker.lagSmoothing(500, 33);

export { lenis };
