import * as THREE from "three";
import { boxToPlanarBounds, type WaterPlanarBounds } from "./waterPlanarMapping";

const RECEIVER_NAMES = ["poolwall", "poolfloor", "poolbasin", "poolwalls", "tiles"];

function meshBox(mesh: THREE.Object3D) {
  mesh.updateWorldMatrix(true, false);
  return new THREE.Box3().setFromObject(mesh);
}

function findMesh(root: THREE.Object3D, name: string) {
  let found: THREE.Mesh | null = null;
  root.traverse((o) => {
    if ((o as THREE.Mesh).isMesh && o.name === name) found = o as THREE.Mesh;
  });
  return found;
}

/**
 * Baked GLB has no `Water` node. Build a horizontal water plane from `PoolWalls`
 * footprint at the top of the pool cavity.
 */
export function createPoolWaterMesh(root: THREE.Object3D): THREE.Mesh | null {
  const poolWalls = findMesh(root, "PoolWalls");
  if (!poolWalls) return null;

  poolWalls.geometry.computeBoundingBox();
  const bbox = poolWalls.geometry.boundingBox!.clone();
  bbox.applyMatrix4(poolWalls.matrix);

  const width = bbox.max.x - bbox.min.x;
  const depth = bbox.max.z - bbox.min.z;
  if (width < 0.1 || depth < 0.1) return null;

  const geo = new THREE.PlaneGeometry(width, depth, 1, 1);
  geo.rotateX(-Math.PI / 2);

  const mesh = new THREE.Mesh(geo);
  mesh.name = "PoolWater";
  mesh.position.set((bbox.min.x + bbox.max.x) * 0.5, bbox.max.y, (bbox.min.z + bbox.max.z) * 0.5);
  mesh.userData.isWater = true;
  mesh.renderOrder = 10;
  mesh.frustumCulled = false;

  // Hide the stray Circle disc from the export if it exists (not the pool surface).
  const circle = findMesh(root, "Circle");
  if (circle) circle.visible = false;

  root.add(mesh);
  return mesh;
}

export function getWaterBounds(mesh: THREE.Mesh): { bounds: WaterPlanarBounds; waterY: number } {
  const box = meshBox(mesh);
  return { bounds: boxToPlanarBounds(box), waterY: box.max.y };
}

export function findCausticsReceiverMeshes(
  root: THREE.Object3D,
  waterMesh: THREE.Mesh,
  bounds: WaterPlanarBounds,
  waterY: number,
) {
  const meshes: THREE.Mesh[] = [];
  const minOverlap = bounds.width * bounds.depth * 0.015;

  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh || mesh === waterMesh || mesh.userData?.isWater) return;

    const norm = mesh.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const forced = RECEIVER_NAMES.some((n) => norm.includes(n));

    const box = meshBox(mesh);
    const overlapX =
      Math.min(box.max.x, bounds.minX + bounds.width) - Math.max(box.min.x, bounds.minX);
    const overlapZ =
      Math.min(box.max.z, bounds.minZ + bounds.depth) - Math.max(box.min.z, bounds.minZ);
    const overlap = Math.max(0, overlapX) * Math.max(0, overlapZ);

    if (forced || (overlap >= minOverlap && box.min.y < waterY - 0.01)) {
      meshes.push(mesh);
    }
  });

  return meshes;
}
