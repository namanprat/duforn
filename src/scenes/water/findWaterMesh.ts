// @ts-nocheck
import * as THREE from "three";

const WATER_MATERIAL_NAME = "Water";
const WATER_GROUP_NAME = "Water";
const GROUND_MATERIAL_NAME = "Ground";
const GROUND_GROUP_NAME = "Ground";

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
 * Find the pool ground mesh (material "Ground" or child of group "Ground").
 * Mirrors findWaterMesh — ground is the sibling node directly below water.
 */
export function findGroundMesh(root: THREE.Object3D | null): THREE.Mesh | null {
  if (!root) return null;

  let byMaterial: THREE.Mesh | null = null;
  let byParent: THREE.Mesh | null = null;

  root.traverse((o) => {
    if (!o.isMesh) return;

    const materials = Array.isArray(o.material) ? o.material : [o.material];
    const hasGroundMaterial = materials.some((m) => m?.name === GROUND_MATERIAL_NAME);
    if (hasGroundMaterial && !byMaterial) {
      byMaterial = o;
      return;
    }

    if (o.parent?.name === GROUND_GROUP_NAME && !byParent) {
      byParent = o;
    }
  });

  return byMaterial ?? byParent;
}
