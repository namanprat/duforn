// @ts-nocheck
import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { useLoadingStore } from "../store/loading";

/**
 * Single animation loop for the unified `#background` canvas (`frameloop="never"`).
 * Drives `advance` + `gl.render` for all route branches (room, about, project detail, etc.).
 */
export default function UnifiedCanvasFrameLoop() {
  const { gl, scene, camera, advance } = useThree();

  useEffect(() => {
    let running = true;
    const tick = (timestampMs) => {
      if (!running) return;
      if (useLoadingStore.getState().phase !== "ready") return;

      const t = typeof timestampMs === "number" ? timestampMs : performance.now();
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
