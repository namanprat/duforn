import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import type { OrthographicCamera } from "three";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { debounce } from "../../scripts/runtime/timing";

export function useProjectDetailController() {
  const { camera } = useThree();
  const isVisibleRef = useRef(true);

  useEffect(() => {
    const onResize = debounce(() => {
      if (!camera || !("isOrthographicCamera" in camera) || !camera.isOrthographicCamera) return;
      const orthographicCamera = camera as OrthographicCamera;
      const w = window.innerWidth;
      const h = window.innerHeight;
      orthographicCamera.left = -w / 2;
      orthographicCamera.right = w / 2;
      orthographicCamera.top = h / 2;
      orthographicCamera.bottom = -h / 2;
      orthographicCamera.updateProjectionMatrix();
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
            return trigger instanceof Element && filmContainer.contains(trigger);
          })
          .forEach((st) => st.kill());
      }
    };
  }, [camera]);

  return { isVisibleRef };
}
