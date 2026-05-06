// @ts-nocheck
import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { debounce } from "../../scripts/runtime/timing";

export function useProjectDetailController() {
  const { camera } = useThree();
  const isVisibleRef = useRef(true);
  const lockedMobileHeightRef = useRef(0);
  const lastMobileWidthRef = useRef(0);

  useEffect(() => {
    const onResize = debounce(() => {
      if (!camera?.isOrthographicCamera) return;

      const isCoarsePointer =
        typeof window.matchMedia === "function" && window.matchMedia("(pointer: coarse)").matches;
      const w = window.innerWidth;
      let h = window.innerHeight;

      // Mobile browser chrome (address/tool bars) can emit height-only resize events.
      // Keep a stable, max-seen height so the project background doesn't "breathe" with UI chrome.
      if (isCoarsePointer) {
        if (lastMobileWidthRef.current !== w) {
          lastMobileWidthRef.current = w;
          lockedMobileHeightRef.current = h;
        } else {
          lockedMobileHeightRef.current = Math.max(lockedMobileHeightRef.current || h, h);
        }
        h = lockedMobileHeightRef.current || h;
      } else {
        lockedMobileHeightRef.current = 0;
        lastMobileWidthRef.current = 0;
      }

      camera.left = -w / 2;
      camera.right = w / 2;
      camera.top = h / 2;
      camera.bottom = -h / 2;
      camera.updateProjectionMatrix();
    }, 150);

    const onVisibility = () => {
      isVisibleRef.current = !document.hidden;
    };

    onResize();
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("resize", onResize);
      onResize.cancel?.();
      document.removeEventListener("visibilitychange", onVisibility);

      // Safety net: kill any ScrollTriggers scoped to the project detail page
      const filmContainer = document.querySelector('[data-page-namespace="projectDetail"]');
      if (filmContainer) {
        ScrollTrigger.getAll()
          .filter((st) => {
            const trigger = st.vars?.trigger;
            return trigger && filmContainer.contains(trigger);
          })
          .forEach((st) => st.kill());
      }
    };
  }, [camera]);

  return { isVisibleRef };
}
