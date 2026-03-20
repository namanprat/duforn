import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { debounce } from "../../scripts/runtime/timing.js";

export function useFilmController() {
  const { gl } = useThree();
  const isVisibleRef = useRef(true);

  useEffect(() => {
    const onResize = debounce(() => {
      gl.setSize(window.innerWidth, window.innerHeight);
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
    };
  }, [gl]);

  return { isVisibleRef };
}
