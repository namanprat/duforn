// @ts-nocheck
/**
 * @param {import("three").WebGPURenderer | unknown} renderer
 * @returns {GPUDevice | null}
 */
export function getWebGPUDeviceFromRenderer(renderer) {
  const backend = renderer?.backend;
  if (!backend || typeof backend.device === "undefined" || backend.device === null) {
    return null;
  }
  return backend.device;
}
