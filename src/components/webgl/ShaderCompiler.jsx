import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { useLoadingStore } from "../../store/loading.js";

/**
 * Pre-compiles all shaders in the current R3F scene so the first rendered frame
 * is free of GPU shader-compilation stalls.
 *
 * Place this inside a <Suspense> boundary (after scene content) so it only runs
 * once all models and textures have been loaded and their materials are present
 * in the scene graph.
 *
 * Supports both WebGL (synchronous compile) and WebGPU (async compileAsync).
 */
export default function ShaderCompiler() {
  const { gl, scene, camera } = useThree();

  useEffect(() => {
    const markReady = useLoadingStore.getState().markReady;

    if (gl.__rendererType === "webgpu" && typeof gl.compileAsync === "function") {
      gl.compileAsync(scene, camera).then(markReady).catch(markReady);
    } else if (typeof gl.compile === "function") {
      gl.compile(scene, camera);
      markReady();
    } else {
      markReady();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
