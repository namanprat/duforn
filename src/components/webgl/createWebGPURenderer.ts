// @ts-nocheck
/**
 * Compatibility shim.
 * Prefer importing from `src/lib/rendering/rendererFactory` and `rendererType`.
 */
export { createRendererAlpha, createRendererOpaque } from "../../lib/rendering/rendererFactory";
export {
  getRendererType,
  isWebGLRenderer,
  isWebGPURenderer,
} from "../../lib/rendering/rendererType";
