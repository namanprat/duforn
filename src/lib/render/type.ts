export function getRendererType(renderer: unknown) {
  const candidate = renderer as
    | { __rendererType?: string; isWebGPURenderer?: boolean; isWebGLRenderer?: boolean }
    | undefined;
  if (!candidate) return "unknown";
  if (candidate.__rendererType) return candidate.__rendererType;
  if (candidate.isWebGPURenderer) return "webgpu";
  if (candidate.isWebGLRenderer) return "webgl";
  return "unknown";
}

export function isWebGPURenderer(renderer: unknown) {
  return getRendererType(renderer) === "webgpu";
}

export function isWebGLRenderer(renderer: unknown) {
  return getRendererType(renderer) === "webgl";
}
