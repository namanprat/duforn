// @ts-nocheck
import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { useLoadingStore } from "../store/loading";

const PRERENDER_FRAME_COUNT = 3;

/**
 * Pre-compiles shaders for the current R3F scene so the first rendered frame
 * avoids GPU shader-compilation stalls. Re-runs when `sceneKey` changes (route /
 * scene branch swap).
 *
 * Place inside <Suspense> so async assets are present before compile.
 * Supports WebGL (synchronous compile) and WebGPU (async compileAsync).
 */
export default function ShaderWarmup({ sceneKey = "default" }) {
  const { gl, scene, camera, advance } = useThree();

  useEffect(() => {
    let cancelled = false;
    const store = useLoadingStore.getState();
    // Flip phase to 'compiling' so other consumers (e.g. UnifiedCanvasFrameLoop'
    // animation loop) can pause their renders while WebGPU's command encoder
    // is in use by compileAsync. Avoids "RenderPassEncoder already ended".
    useLoadingStore.setState({ phase: "compiling" });

    const prerenderFrames = () => {
      const t0 = performance.now();
      for (let i = 0; i < PRERENDER_FRAME_COUNT; i += 1) {
        advance(t0 + i * (1000 / 60));
        gl.render(scene, camera);
      }
    };

    const finish = () => {
      if (cancelled) return;
      prerenderFrames();
      store.markReady();
    };

    const raf = requestAnimationFrame(() => {
      if (cancelled) return;

      if (gl.__rendererType === "webgpu" && typeof gl.compileAsync === "function") {
        gl.compileAsync(scene, camera).then(finish).catch(finish);
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
