import { isWebGPURenderer } from "./type";

export function pickGpuBranch<T>(gl: unknown, branches: { webgpu: () => T; webgl: () => T }) {
  return isWebGPURenderer(gl) ? branches.webgpu() : branches.webgl();
}
