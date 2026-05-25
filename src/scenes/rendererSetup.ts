// @ts-nocheck
/**
 * Compatibility shim.
 * Prefer importing from `src/lib/render/factory` and `rendererType`.
 */
export { createRendererAlpha, createRendererOpaque } from "../lib/render/factory";
export { getRendererType, isWebGLRenderer, isWebGPURenderer } from "../lib/render/type";
