import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let lenis = null;
let tickerCallback = null;

export function initLenis() {
  if (lenis) return lenis;

  lenis = new Lenis({
    lerp: 0.12,
    duration: 1.2,
    smoothWheel: true,
    touchMultiplier: 1,
    wheelMultiplier: 0.8,
  });

  tickerCallback = (time) => {
    lenis.raf(time * 1000);
    ScrollTrigger.update();
  };

  gsap.ticker.add(tickerCallback);
  gsap.ticker.lagSmoothing(500, 33);

  return lenis;
}

export function destroyLenis() {
  if (!lenis) return;

  if (tickerCallback) {
    gsap.ticker.remove(tickerCallback);
    tickerCallback = null;
  }

  lenis.destroy();
  lenis = null;
}

export function getLenis() {
  return lenis;
}
