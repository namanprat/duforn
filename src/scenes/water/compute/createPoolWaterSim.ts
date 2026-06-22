import type * as THREE from "three";
import { PoolShallowWaterSimCPU } from "./PoolShallowWaterSimCPU";

export type PoolWaterSim = PoolShallowWaterSimCPU;

/** WebGL-only shallow-water factory (duforn-best CPU path). */
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
  return Promise.resolve(new PoolShallowWaterSimCPU(nw, nh, simOpts));
}
