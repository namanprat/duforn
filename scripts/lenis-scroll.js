import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";


const lenis = new Lenis({
  // Higher lerp for smoother interpolation; keep touch disabled
  lerp: 0.15,
  duration: 1.1,
  smoothWheel: true,
  touchMultiplier: 0,
});

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

export { lenis };
