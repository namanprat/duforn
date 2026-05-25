// @ts-nocheck
import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { debounce } from "../../scripts/runtime/timing";
import { getStableViewportSize, subscribeStableViewport } from "../lib/viewport/stableViewport";

export function useProjectDetailController() {
  const { camera } = useThree();
  const isVisibleRef = useRef(true);

  useEffect(() => {
    const onResize = debounce(() => {
      if (!camera?.isOrthographicCamera) return;

      const { width, height } = getStableViewportSize();

      camera.left = -width / 2;
      camera.right = width / 2;
      camera.top = height / 2;
      camera.bottom = -height / 2;
      camera.updateProjectionMatrix();
    }, 150);

    const onVisibility = () => {
      isVisibleRef.current = !document.hidden;
    };

    document.addEventListener("visibilitychange", onVisibility);

    onResize();
    const unsubscribeViewport = subscribeStableViewport(onResize);

    return () => {
      unsubscribeViewport();
      onResize.cancel?.();
      document.removeEventListener("visibilitychange", onVisibility);

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
