import * as THREE from "three";

/** Strip Blender bake export suffix so "Water_Baked" matches "Water". */
export function stripBakedSuffix(name: string) {
  return name.replace(/_Baked$/i, "");
}

export function meshMatchesName(name: string | undefined, target: string) {
  if (!name) return false;
  return stripBakedSuffix(name) === target;
}

/** Exact getObjectByName, then any node whose name matches after stripping _Baked. */
export function findObjectByName(root: THREE.Object3D, target: string): THREE.Object3D | undefined {
  const exact = root.getObjectByName(target);
  if (exact) return exact;
  let found: THREE.Object3D | undefined;
  root.traverse((o) => {
    if (!found && meshMatchesName(o.name, target)) found = o;
  });
  return found;
}

/**
 * Recenter a model so it sits on the floor (min.y = 0) and is centered on X/Z.
 * Mutates the immediate children's positions. Carried over from duforn v1 so the
 * authored room poses (scale 13) frame the scene identically.
 */
export function normalizeModelBounds(model: THREE.Object3D): {
  box: THREE.Box3;
  center: THREE.Vector3;
  size: THREE.Vector3;
} {
  // Compute bounds in the model's own space. Forcing a matrix update makes this
  // correct regardless of any (scaled) parent the model is mounted under.
  model.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());

  model.children.forEach((child) => {
    child.position.x -= center.x;
    child.position.y -= box.min.y;
    child.position.z -= center.z;
  });

  return { box, center, size };
}
