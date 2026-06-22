import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SCROLLER = document.body;

let lenis: Lenis | null = null;
let tickerCallback: ((time: number) => void) | null = null;
let lenisScrollTriggerSync: (() => void) | null = null;

function bindScrollTriggerProxy(instance: Lenis) {
  ScrollTrigger.scrollerProxy(SCROLLER, {
    scrollTop(value) {
      if (arguments.length) {
        instance.scrollTo(value, { immediate: true });
      }
      return instance.scroll;
    },
    getBoundingClientRect() {
      return {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      };
    },
    pinType: SCROLLER.style.transform ? "transform" : "fixed",
  });
}

function clearScrollTriggerProxy() {
  ScrollTrigger.scrollerProxy(SCROLLER, {});
}

export function initLenis() {
  if (lenis) return lenis;

  lenis = new Lenis({
    lerp: 0.12,
    duration: 1.2,
    smoothWheel: true,
    touchMultiplier: 1,
    wheelMultiplier: 0.8,
    prevent: (node) => {
      if (!node) return false;
      return Boolean(node.closest?.("[data-lenis-prevent='true']"));
    },
  });

  bindScrollTriggerProxy(lenis);

  lenisScrollTriggerSync = () => {
    ScrollTrigger.update();
  };
  lenis.on("scroll", lenisScrollTriggerSync);

  tickerCallback = (time) => {
    lenis?.raf(time * 1000);
  };

  gsap.ticker.add(tickerCallback);
  gsap.ticker.lagSmoothing(500, 33);

  requestAnimationFrame(() => ScrollTrigger.refresh());

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
  clearScrollTriggerProxy();
}

export function getLenis() {
  return lenis;
}
