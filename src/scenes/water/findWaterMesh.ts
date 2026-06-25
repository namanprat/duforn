import * as THREE from "three";
import { findObjectByName, meshMatchesName } from "../sceneUtils";

const WATER_EXACT_NAME = "Water";

/**
 * Resolve the liquid surface mesh only — exact name or material "Water".
 * Ripples never land on pool shell / tile materials.
 */
export function findWaterMesh(root: THREE.Object3D | null): THREE.Mesh | null {
  if (!root) return null;

  const byName = findObjectByName(root, WATER_EXACT_NAME) as THREE.Mesh | null;
  if (byName?.isMesh) return byName;

  let byExactMaterial: THREE.Mesh | null = null;
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh || byExactMaterial) return;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    if (materials.some((m) => meshMatchesName(m?.name, WATER_EXACT_NAME))) {
      byExactMaterial = mesh;
    }
  });

  return byExactMaterial;
}
