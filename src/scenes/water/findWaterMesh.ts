// @ts-nocheck
import * as THREE from "three";

const WATER_MATERIAL_NAME = "Water";
const WATER_KEYWORDS = ["water", "pool"];

function isWaterKeyword(s: string | undefined): boolean {
  if (!s) return false;
  const lower = s.toLowerCase();
  return WATER_KEYWORDS.some((kw) => lower.includes(kw));
}

function getMeshWorldBounds(mesh: THREE.Mesh): THREE.Box3 {
  mesh.updateWorldMatrix(true, false);
  return new THREE.Box3().setFromObject(mesh);
}

/**
 * Find the pool water mesh. Priority:
 *   1. material name === "Water"
 *   2. material name contains "water" / "pool"
 *   3. mesh name contains "water" / "pool"
 *   4. parent group name contains "water" / "pool"
 *   5. positional fallback: topmost near-horizontal mesh
 */
export function findWaterMesh(root: THREE.Object3D | null): THREE.Mesh | null {
  if (!root) return null;

  let byExactMaterial: THREE.Mesh | null = null;
  let byFuzzyMaterial: THREE.Mesh | null = null;
  let byMeshName: THREE.Mesh | null = null;
  let byParentName: THREE.Mesh | null = null;
  let topMesh: THREE.Mesh | null = null;
  let topY = -Infinity;

  root.traverse((o) => {
    if (!o.isMesh) return;
    const materials = Array.isArray(o.material) ? o.material : [o.material];

    if (!byExactMaterial && materials.some((m) => m?.name === WATER_MATERIAL_NAME)) {
      byExactMaterial = o;
      return;
    }
    if (!byFuzzyMaterial && materials.some((m) => isWaterKeyword(m?.name))) byFuzzyMaterial = o;
    if (!byMeshName && isWaterKeyword(o.name)) byMeshName = o;
    if (!byParentName && isWaterKeyword(o.parent?.name)) byParentName = o;

    const bounds = getMeshWorldBounds(o);
    const centerY = (bounds.min.y + bounds.max.y) / 2;
    if (centerY > topY) {
      const sizeX = bounds.max.x - bounds.min.x;
      const sizeY = bounds.max.y - bounds.min.y;
      const sizeZ = bounds.max.z - bounds.min.z;
      const isFlat = sizeY < Math.max(sizeX, sizeZ) * 0.15;
      if (isFlat && sizeX > 0.1 && sizeZ > 0.1) {
        topY = centerY;
        topMesh = o;
      }
    }
  });

  const result = byExactMaterial ?? byFuzzyMaterial ?? byMeshName ?? byParentName;
  if (!result && topMesh) {
    console.warn(
      "[findWaterMesh] no water material/name found — using positional fallback:",
      topMesh.name,
    );
    return topMesh;
  }
  return result;
}
