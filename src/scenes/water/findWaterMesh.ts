// @ts-nocheck
import * as THREE from "three";

const WATER_EXACT_NAME = "Water";
const WATER_KEYWORDS = ["water", "pool"];

/** Strong signal: the actual liquid surface (mesh "Water", material "Water liquid"). */
function isWaterWord(s: string | undefined): boolean {
  return !!s && s.toLowerCase().includes("water");
}

/** Weak signal: also matches the pool *shell* ("Swimming Pool Tile Procedural"). */
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
 * Find the pool water mesh. "water" outranks "pool" so the rippling surface lands on the
 * liquid (mesh "Water" / material "Water liquid"), never the pool shell ("Swimming Pool
 * Tile Procedural"). Priority:
 *   1. mesh name === "Water" (exact)
 *   2. material name === "Water" (exact)
 *   3. material name contains "water"  (e.g. "Water liquid")
 *   4. mesh name contains "water"
 *   5. material name contains "pool"   (pool shell / tiles)
 *   6. mesh / parent name contains "water" / "pool"
 *   7. positional fallback: topmost near-horizontal mesh
 */
export function findWaterMesh(root: THREE.Object3D | null): THREE.Mesh | null {
  if (!root) return null;

  let byExactMeshName: THREE.Mesh | null = null;
  let byExactMaterial: THREE.Mesh | null = null;
  let byWaterMaterial: THREE.Mesh | null = null;
  let byWaterMeshName: THREE.Mesh | null = null;
  let byPoolMaterial: THREE.Mesh | null = null;
  let byKeywordName: THREE.Mesh | null = null;
  let byParentName: THREE.Mesh | null = null;
  let topMesh: THREE.Mesh | null = null;
  let topY = -Infinity;

  root.traverse((o) => {
    if (!o.isMesh) return;
    const materials = Array.isArray(o.material) ? o.material : [o.material];

    if (!byExactMeshName && o.name === WATER_EXACT_NAME) byExactMeshName = o;
    if (!byExactMaterial && materials.some((m) => m?.name === WATER_EXACT_NAME)) {
      byExactMaterial = o;
    }
    if (!byWaterMaterial && materials.some((m) => isWaterWord(m?.name))) byWaterMaterial = o;
    if (!byWaterMeshName && isWaterWord(o.name)) byWaterMeshName = o;
    if (!byPoolMaterial && materials.some((m) => isWaterKeyword(m?.name))) byPoolMaterial = o;
    if (!byKeywordName && (isWaterKeyword(o.name) || isWaterKeyword(o.parent?.name))) {
      byKeywordName = o;
    }
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

  const result =
    byExactMeshName ??
    byExactMaterial ??
    byWaterMaterial ??
    byWaterMeshName ??
    byPoolMaterial ??
    byKeywordName ??
    byParentName;
  if (!result && topMesh) {
    console.warn(
      "[findWaterMesh] no water material/name found — using positional fallback:",
      topMesh.name,
    );
    return topMesh;
  }
  return result;
}
