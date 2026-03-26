import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { debounce } from "../../scripts/runtime/timing.js";

export function useFilmController() {
  const { gl, camera } = useThree();
  const isVisibleRef = useRef(true);

  useEffect(() => {
    const onResize = debounce(() => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      gl.setSize(w, h);
      // Keep orthographic camera bounds in sync with viewport
      camera.left = -w / 2;
      camera.right = w / 2;
      camera.top = h / 2;
      camera.bottom = -h / 2;
      camera.updateProjectionMatrix();
    }, 150);

    const onVisibility = () => {
      isVisibleRef.current = !document.hidden;
    };

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("resize", onResize);
      onResize.cancel?.();
      document.removeEventListener("visibilitychange", onVisibility);

      // Safety net: kill any ScrollTriggers scoped to the film page
      const filmContainer = document.querySelector('[data-page-namespace="film"]');
      if (filmContainer) {
        ScrollTrigger.getAll()
          .filter((st) => {
            const trigger = st.vars?.trigger;
            return trigger && filmContainer.contains(trigger);
          })
          .forEach((st) => st.kill());
      }
    };
  }, [gl, camera]);

  return { isVisibleRef };
}
