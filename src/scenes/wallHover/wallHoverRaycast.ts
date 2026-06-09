// @ts-nocheck
import * as THREE from "three";

const NORMAL_OFFSET = 0.02;

export function clientToNdc(canvas, clientX, clientY, target = new THREE.Vector2()) {
  const rect = canvas.getBoundingClientRect();
  target.x = ((clientX - rect.left) / rect.width) * 2 - 1;
  target.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  return target;
}

/**
 * Raycast into the scaled model root and return the first Room 1 floor hit.
 */
export function pickFloorHit({ raycaster, camera, ndc, root, floorMeshes }) {
  raycaster.setFromCamera(ndc, camera);

  const targets = root ? [root] : floorMeshes;
  const hits = raycaster
    .intersectObjects(targets, true)
    .filter((hit) => hit.object?.userData?.isFloor);

  if (!hits.length) return null;

  const hit = hits[0];
  const normal = hit.face?.normal
    ? hit.face.normal.clone().transformDirection(hit.object.matrixWorld).normalize()
    : new THREE.Vector3(0, 1, 0);

  const point = hit.point.clone().addScaledVector(normal, NORMAL_OFFSET);

  return {
    point,
    normal,
    mesh: hit.object,
    distance: hit.distance,
  };
}

/** @deprecated Use pickFloorHit */
export const pickWallHit = pickFloorHit;
