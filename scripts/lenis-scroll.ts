import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;
let lenisScrollTriggerSync: (() => void) | null = null;

/**
 * Lenis is NOT driven by gsap.ticker. The unified canvas frame loop
 * (UnifiedCanvasFrameLoop) calls `getLenis()?.raf(time)` right before the
 * WebGL render so DOM scroll, ScrollTrigger progress, and
 * getBoundingClientRect() reads stay consistent within a single frame.
 */
export function initLenis(): Lenis {
  if (lenis) return lenis;

  // Default Lenis settings — only the prevent hook for nested scroll containers.
  lenis = new Lenis({
    prevent: (node) => {
      if (!node) return false;
      return Boolean(node.closest?.("[data-lenis-prevent='true']"));
    },
  });

  lenisScrollTriggerSync = () => {
    ScrollTrigger.update();
  };
  lenis.on("scroll", lenisScrollTriggerSync);

  gsap.ticker.lagSmoothing(500, 33);

  return lenis;
}

export function destroyLenis(): void {
  if (!lenis) return;

  if (lenisScrollTriggerSync) {
    lenis.off("scroll", lenisScrollTriggerSync);
    lenisScrollTriggerSync = null;
  }

  lenis.destroy();
  lenis = null;
}

export function getLenis(): Lenis | null {
  return lenis;
}
