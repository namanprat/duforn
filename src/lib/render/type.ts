// @ts-nocheck

export function getRendererType(renderer) {
  if (!renderer) return "unknown";
  if (renderer.__rendererType) return renderer.__rendererType;
  if (renderer.isWebGPURenderer) return "webgpu";
  if (renderer.isWebGLRenderer) return "webgl";
  return "unknown";
}

export function isWebGPURenderer(renderer) {
  return getRendererType(renderer) === "webgpu";
}

export function isWebGLRenderer(renderer) {
  return getRendererType(renderer) === "webgl";
}
