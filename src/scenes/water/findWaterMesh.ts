// @ts-nocheck
import * as THREE from "three";

const WATER_MATERIAL_NAME = "Water";
const WATER_GROUP_NAME = "Water";
const GROUND_MATERIAL_NAME = "Ground";
const GROUND_GROUP_NAME = "Ground";

function getMeshWorldBounds(mesh: THREE.Mesh): THREE.Box3 {
  mesh.updateWorldMatrix(true, false);
  return new THREE.Box3().setFromObject(mesh);
}

function getXZOverlapArea(a: THREE.Box3, b: THREE.Box3): number {
  const overlapX = Math.max(0, Math.min(a.max.x, b.max.x) - Math.max(a.min.x, b.min.x));
  const overlapZ = Math.max(0, Math.min(a.max.z, b.max.z) - Math.max(a.min.z, b.min.z));
  return overlapX * overlapZ;
}

/**
 * Find the pool water mesh (material "Water" or child of group "Water").
 */
export function findWaterMesh(root: THREE.Object3D | null): THREE.Mesh | null {
  if (!root) return null;

  let byMaterial: THREE.Mesh | null = null;
  let byParent: THREE.Mesh | null = null;

  root.traverse((o) => {
    if (!o.isMesh) return;

    const materials = Array.isArray(o.material) ? o.material : [o.material];
    const hasWaterMaterial = materials.some((m) => m?.name === WATER_MATERIAL_NAME);
    if (hasWaterMaterial && !byMaterial) {
      byMaterial = o;
      return;
    }

    if (o.parent?.name === WATER_GROUP_NAME && !byParent) {
      byParent = o;
    }
  });

  return byMaterial ?? byParent;
}

/** World-space XZ bounds of the water quad for planar sim UVs. */
export function getWaterPlanarBounds(mesh: THREE.Mesh): THREE.Box3 {
  mesh.updateWorldMatrix(true, false);
  return new THREE.Box3().setFromObject(mesh);
}

/**
 * Find the pool ground mesh (material/name "Ground" or child of group "Ground").
 * Prefer the ground whose world-space bounds overlap the water footprint and
 * sit directly below it, rather than the first matching Ground elsewhere.
 */
export function findGroundMesh(
  root: THREE.Object3D | null,
  waterMesh: THREE.Mesh | null = null,
): THREE.Mesh | null {
  if (!root) return null;

  const waterBounds = waterMesh ? getMeshWorldBounds(waterMesh) : null;

  let bestOverlapMatch: THREE.Mesh | null = null;
  let bestOverlapScore = -Infinity;
  let byMaterial: THREE.Mesh | null = null;
  let byParent: THREE.Mesh | null = null;
  let byName: THREE.Mesh | null = null;

  root.traverse((o) => {
    if (!o.isMesh) return;

    const materials = Array.isArray(o.material) ? o.material : [o.material];
    const hasGroundMaterial = materials.some((m) => m?.name === GROUND_MATERIAL_NAME);
    const hasGroundName = o.name === GROUND_GROUP_NAME;

    const isGroundCandidate =
      hasGroundMaterial || hasGroundName || o.parent?.name === GROUND_GROUP_NAME;

    if (!isGroundCandidate) return;

    if (waterBounds) {
      const candidateBounds = getMeshWorldBounds(o);
      const overlapArea = getXZOverlapArea(candidateBounds, waterBounds);
      const belowWater =
        candidateBounds.max.y <= waterBounds.min.y + 0.05 ||
        candidateBounds.getCenter(new THREE.Vector3()).y <
          waterBounds.getCenter(new THREE.Vector3()).y;

      if (overlapArea > 0 && belowWater) {
        const verticalGap = Math.max(0, waterBounds.min.y - candidateBounds.max.y);
        const score = overlapArea - verticalGap * 0.01;
        if (score > bestOverlapScore) {
          bestOverlapScore = score;
          bestOverlapMatch = o;
        }
      }
    }

    if (hasGroundMaterial && !byMaterial) {
      byMaterial = o;
    }

    if (o.parent?.name === GROUND_GROUP_NAME && !byParent) {
      byParent = o;
    }

    if (hasGroundName && !byName) {
      byName = o;
    }
  });

  return bestOverlapMatch ?? byMaterial ?? byName ?? byParent;
}
