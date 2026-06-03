// @ts-nocheck
import { useEffect, useRef } from "react";
import { getLenis } from "../../../scripts/lenis-scroll";
import { SPIRAL_CONFIG } from "./spiralConfig";

/** Shared scroll signals for About page 3D (Lenis-aware). */
export function useAboutScroll() {
  const scrollYRef = useRef(0);
  const velocityRef = useRef(0);
  const pageProgressRef = useRef(0);
  const heroProgressRef = useRef(0);

  useEffect(() => {
    const readScrollY = () => getLenis()?.scroll ?? window.scrollY;

    const update = (scrollY = readScrollY(), velocity = velocityRef.current) => {
      scrollYRef.current = scrollY;
      velocityRef.current = velocity;
      const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      pageProgressRef.current = Math.min(1, Math.max(0, scrollY / max));
      heroProgressRef.current = Math.min(
        1,
        Math.max(0, scrollY / (window.innerHeight * SPIRAL_CONFIG.scrollMultiplier)),
      );
    };

    const onWindowScroll = () => update(readScrollY(), 0);
    const onLenisScroll = (e) => update(e.scroll, e.velocity);

    update();

    window.addEventListener("scroll", onWindowScroll, { passive: true });
    window.addEventListener("resize", onWindowScroll);

    let lenis = getLenis();
    lenis?.on("scroll", onLenisScroll);

    const lenisPoll = window.setInterval(() => {
      const next = getLenis();
      if (next && next !== lenis) {
        lenis?.off("scroll", onLenisScroll);
        lenis = next;
        lenis.on("scroll", onLenisScroll);
      }
      update(readScrollY());
    }, 250);

    return () => {
      window.clearInterval(lenisPoll);
      window.removeEventListener("scroll", onWindowScroll);
      window.removeEventListener("resize", onWindowScroll);
      lenis?.off("scroll", onLenisScroll);
    };
  }, []);

  return { scrollYRef, velocityRef, pageProgressRef, heroProgressRef };
}
