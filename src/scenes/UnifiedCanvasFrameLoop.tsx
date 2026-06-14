import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { getLenis } from "../../scripts/lenis-scroll";
import { useLoadingStore } from "../store/loading";

/**
 * Single animation loop for the unified `#background` canvas (`frameloop="never"`).
 * Order per frame: Lenis raf (which fires ScrollTrigger.update synchronously)
 * → R3F advance → render. Driving Lenis here, instead of on gsap.ticker,
 * guarantees DOM scroll state and WebGL meshes synced via
 * getBoundingClientRect() agree within the same frame — no one-frame lag.
 */
export default function UnifiedCanvasFrameLoop() {
  const { gl, scene, camera, advance } = useThree();

  useEffect(() => {
    let running = true;
    const tick = (timestampMs?: number) => {
      if (!running) return;

      const t = typeof timestampMs === "number" ? timestampMs : performance.now();
      // Keep scrolling alive even while the loading phase gates rendering.
      getLenis()?.raf(t);

      if (useLoadingStore.getState().phase !== "ready") return;

      advance(t);
      gl.render(scene, camera);
    };

    gl.setAnimationLoop(tick);
    return () => {
      running = false;
      gl.setAnimationLoop(null);
    };
  }, [gl, scene, camera, advance]);

  return null;
}
