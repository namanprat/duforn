import type * as THREE from "three";
import { PoolShallowWaterSimGPU } from "./PoolShallowWaterSimGPU";

export type PoolWaterSim = PoolShallowWaterSimGPU;

/**
 * GPU ping-pong shallow-water factory. The CPU implementation
 * (`PoolShallowWaterSimCPU` / `shallowWaterCPU.ts`) is retained as the validated
 * reference for the wave equation the GPU shader ports — see its selfcheck.
 */
export function createPoolWaterSim(
  gl: THREE.WebGLRenderer,
  nw: number,
  nh: number,
  simOpts: Partial<{
    modifier: number;
    impulseStrength: number;
    impulseRadius: number;
  }> = {},
) {
  return Promise.resolve(new PoolShallowWaterSimGPU(gl, nw, nh, simOpts));
}
