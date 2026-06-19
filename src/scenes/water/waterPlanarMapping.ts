import * as THREE from "three";

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

export function planarBoundsToUniform(bounds: WaterPlanarBounds) {
  return new THREE.Vector4(bounds.minX, bounds.minZ, bounds.width, bounds.depth);
}

export function worldPointToSimUv(
  point: THREE.Vector3,
  bounds: WaterPlanarBounds,
): { u: number; v: number } {
  return {
    u: THREE.MathUtils.clamp((point.x - bounds.minX) / bounds.width, 0, 1),
    v: THREE.MathUtils.clamp(1 - (point.z - bounds.minZ) / bounds.depth, 0, 1),
  };
}
