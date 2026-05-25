// @ts-nocheck
import { pickGpuBranchAsync, isWebGPURenderer } from "../../../lib/rendering";
import { PoolShallowWaterSim } from "./PoolShallowWaterSim";
import { PoolShallowWaterSimCPU } from "./PoolShallowWaterSimCPU";

/**
 * @param {THREE.WebGLRenderer | import('three/webgpu').WebGPURenderer} gl
 */
export async function createPoolWaterSim(gl, nw, nh, simOpts) {
  return pickGpuBranchAsync(gl, {
    webgpu: async () => {
      const sim = new PoolShallowWaterSim(gl, nw, nh, simOpts);
      await sim.init();
      return sim;
    },
    webgl: async () => new PoolShallowWaterSimCPU(nw, nh, simOpts),
  });
}

export function isGpuShallowWaterSim(sim) {
  return isWebGPURenderer(sim?.renderer);
}
