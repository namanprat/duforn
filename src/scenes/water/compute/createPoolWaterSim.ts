import type * as THREE from "three";
import { PoolShallowWaterSimCPU } from "./PoolShallowWaterSimCPU";

export { PoolShallowWaterSimCPU } from "./PoolShallowWaterSimCPU";

export function createPoolWaterSim(
  _gl: THREE.WebGLRenderer,
  nw: number,
  nh: number,
  simOpts: Partial<{
    modifier: number;
    impulseStrength: number;
    impulseRadius: number;
  }> = {},
) {
  return new PoolShallowWaterSimCPU(nw, nh, simOpts);
}
