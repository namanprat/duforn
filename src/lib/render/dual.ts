/**
 * ## Site GPU convention
 *
 * - **Primary:** `WebGPURenderer` + **TSL** (`three/tsl`, `three/webgpu`). Compiled to WGSL inside Three.
 * - **Fallback:** `WebGLRenderer` + **GLSL** (`ShaderMaterial`, `MeshBasicMaterial`, etc.).
 *
 * Use `pickGpuBranch` / `pickGpuBranchAsync` so both paths stay explicit at the callsite.
 */
// @ts-nocheck

import { createRendererOpaque } from "./factory";
import { getRendererType, isWebGLRenderer, isWebGPURenderer } from "./type";

export { createRendererOpaque, getRendererType, isWebGLRenderer, isWebGPURenderer };

/** @template T @param branches {{ webgpu: () => T; webgl: () => T }} */
export function pickGpuBranch(gl, branches) {
  return isWebGPURenderer(gl) ? branches.webgpu() : branches.webgl();
}

/** @template T @param branches {{ webgpu: () => T | Promise<T>; webgl: () => T | Promise<T> }} */
export async function pickGpuBranchAsync(gl, branches) {
  return isWebGPURenderer(gl) ? branches.webgpu() : branches.webgl();
}
