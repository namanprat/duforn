// @ts-nocheck
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let lenis = null;
let tickerCallback = null;
let lenisScrollTriggerSync = null;

export function initLenis() {
  if (lenis) return lenis;

  lenis = new Lenis({
    lerp: 0.06,
    duration: 1.2,
    smoothWheel: true,
    touchMultiplier: 1,
    wheelMultiplier: 0.8,
    // Allow nested scroll containers (debug panels, etc.) to scroll normally.
    prevent: (node) => {
      if (!node) return false;
      if (node.closest?.("[data-lenis-prevent='true']")) return true;
      return false;
    },
  });

  lenisScrollTriggerSync = () => {
    ScrollTrigger.update();
  };
  lenis.on("scroll", lenisScrollTriggerSync);

  tickerCallback = (time) => {
    lenis.raf(time * 1000);
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

  if (lenisScrollTriggerSync) {
    lenis.off("scroll", lenisScrollTriggerSync);
    lenisScrollTriggerSync = null;
  }

  lenis.destroy();
  lenis = null;
}

export function getLenis() {
  return lenis;
}
