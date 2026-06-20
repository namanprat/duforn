// @ts-nocheck
import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { useLoadingStore } from "../store/loading";

const PRERENDER_FRAME_COUNT = 3;

/**
 * Pre-compiles shaders for the current R3F scene so the first rendered frame
 * avoids GPU shader-compilation stalls. Re-runs when `sceneKey` changes (route /
 * scene branch swap).
 *
 * Place inside <Suspense> so async assets are present before compile.
 * WebGL: synchronous compile + prerender. WebGPU: advance-only warmup (no
 * compileAsync — it races other encoders and triggers "already ended" errors).
 */
export default function ShaderWarmup({ sceneKey = "default" }) {
  const { gl, scene, camera, advance } = useThree();
  const generationRef = useRef(0);

  useEffect(() => {
    const generation = ++generationRef.current;
    let cancelled = false;
    const store = useLoadingStore.getState();
    useLoadingStore.setState({ phase: "compiling" });

    const prerenderFrames = () => {
      const t0 = performance.now();
      for (let i = 0; i < PRERENDER_FRAME_COUNT; i += 1) {
        advance(t0 + i * (1000 / 60));
        gl.render(scene, camera);
      }
    };

    const warmupAdvanceOnly = () => {
      const t0 = performance.now();
      for (let i = 0; i < PRERENDER_FRAME_COUNT; i += 1) {
        advance(t0 + i * (1000 / 60));
      }
    };

    const finish = () => {
      if (cancelled || generationRef.current !== generation) return;
      if (gl.__rendererType === "webgpu") {
        warmupAdvanceOnly();
      } else {
        prerenderFrames();
      }
      store.markReady();
    };

    const raf = requestAnimationFrame(() => {
      if (cancelled || generationRef.current !== generation) return;

      if (gl.__rendererType === "webgpu") {
        finish();
      } else if (typeof gl.compile === "function") {
        gl.compile(scene, camera);
        finish();
      } else {
        finish();
      }
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [sceneKey, gl, scene, camera, advance]);

  return null;
}
