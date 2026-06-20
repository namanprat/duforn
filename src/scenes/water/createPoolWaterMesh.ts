import * as THREE from "three";

const WATER_EXACT_NAME = "Water";
const WATER_KEYWORDS = ["water", "pool"];

function isWaterWord(s: string | undefined): boolean {
  return !!s && s.toLowerCase().includes("water");
}

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
 * Find the pool water mesh in a model. "water" outranks "pool" so the rippling
 * surface lands on the liquid (mesh "Water" / material "Water liquid"), never the
 * pool shell. Priority:
 *   1. mesh name === "Water"        2. material name === "Water"
 *   3. material name contains "water"   4. mesh name contains "water"
 *   5. material name contains "pool"    6. mesh / parent name contains keyword
 *   7. positional fallback: topmost near-horizontal mesh
 */
export function resolveWaterMesh(root: THREE.Object3D | null): THREE.Mesh | null {
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
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];

    if (!byExactMeshName && mesh.name === WATER_EXACT_NAME) byExactMeshName = mesh;
    if (!byExactMaterial && materials.some((m) => m?.name === WATER_EXACT_NAME)) {
      byExactMaterial = mesh;
    }
    if (!byWaterMaterial && materials.some((m) => isWaterWord(m?.name))) byWaterMaterial = mesh;
    if (!byWaterMeshName && isWaterWord(mesh.name)) byWaterMeshName = mesh;
    if (!byPoolMaterial && materials.some((m) => isWaterKeyword(m?.name))) byPoolMaterial = mesh;
    if (!byKeywordName && (isWaterKeyword(mesh.name) || isWaterKeyword(mesh.parent?.name))) {
      byKeywordName = mesh;
    }
    if (!byParentName && isWaterKeyword(mesh.parent?.name)) byParentName = mesh;

    const bounds = getMeshWorldBounds(mesh);
    const centerY = (bounds.min.y + bounds.max.y) / 2;
    if (centerY > topY) {
      const sizeX = bounds.max.x - bounds.min.x;
      const sizeY = bounds.max.y - bounds.min.y;
      const sizeZ = bounds.max.z - bounds.min.z;
      const isFlat = sizeY < Math.max(sizeX, sizeZ) * 0.15;
      if (isFlat && sizeX > 0.1 && sizeZ > 0.1) {
        topY = centerY;
        topMesh = mesh;
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
      "[resolveWaterMesh] no water material/name found — using positional fallback:",
      (topMesh as THREE.Mesh).name,
    );
    return topMesh;
  }
  return result;
}
