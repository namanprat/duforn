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

// ScrollTrigger updates automatically via GSAP ticker - no manual update needed
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

// Enable lag smoothing for consistent frame pacing
gsap.ticker.lagSmoothing(500, 33);

export { lenis };
