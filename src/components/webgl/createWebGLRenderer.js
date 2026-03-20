import { createWebGLRendererAlpha } from "./createWebGPURenderer.js";

export default function createWebGLRenderer(defaultProps) {
  return createWebGLRendererAlpha(defaultProps);
}
