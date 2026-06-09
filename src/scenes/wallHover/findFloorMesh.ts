// @ts-nocheck
import * as THREE from "three";

export const ROOM_1_FLOORING_NAME = "Room 1 : Flooring";

function isRoom1FlooringName(name: string | undefined): boolean {
  return name === ROOM_1_FLOORING_NAME;
}

/**
 * Find the Room 1 floor mesh from the website GLB (exact node name match).
 */
export function findFloorMesh(root: THREE.Object3D | null): THREE.Mesh | null {
  if (!root) return null;

  let match: THREE.Mesh | null = null;

  root.traverse((o) => {
    if (match || !o.isMesh) return;
    if (!isRoom1FlooringName(o.name) && !isRoom1FlooringName(o.parent?.name)) return;

    o.userData.isFloor = true;
    match = o;
  });

  return match;
}

/**
 * @returns 0 or 1 floor mesh for raycast targets.
 */
export function findFloorMeshes(root: THREE.Object3D | null): THREE.Mesh[] {
  const mesh = findFloorMesh(root);
  return mesh ? [mesh] : [];
}
