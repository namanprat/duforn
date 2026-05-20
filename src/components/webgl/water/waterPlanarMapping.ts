// @ts-nocheck
import * as THREE from "three";

/** Planar mapping params for the water mesh: minX, minZ, width (X), depth (Z). */
export type WaterPlanarBounds = {
  minX: number;
  minZ: number;
  width: number;
  depth: number;
};

export function boxToPlanarBounds(box: THREE.Box3): WaterPlanarBounds {
  return {
    minX: box.min.x,
    minZ: box.min.z,
    width: Math.max(box.max.x - box.min.x, 1e-4),
    depth: Math.max(box.max.z - box.min.z, 1e-4),
  };
}

/** vec4(minX, minZ, width, depth) packed for the material uPlanar uniform. */
export function planarBoundsToUniform(bounds: WaterPlanarBounds) {
  return new THREE.Vector4(bounds.minX, bounds.minZ, bounds.width, bounds.depth);
}
