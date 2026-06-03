// @ts-nocheck
import * as THREE from "three";

/** Disable backface culling on a single material (or material array). */
export function disableBackfaceCullingOnMaterial(material) {
  if (!material) return;

  if (Array.isArray(material)) {
    for (const entry of material) disableBackfaceCullingOnMaterial(entry);
    return;
  }

  if (material.side === THREE.DoubleSide) return;
  material.side = THREE.DoubleSide;
  material.needsUpdate = true;
}

/** Walk a scene/object subtree and double-side every mesh material. */
export function disableBackfaceCullingOnObject(root) {
  if (!root?.traverse) return;

  root.traverse((child) => {
    if (!child.isMesh) return;
    disableBackfaceCullingOnMaterial(child.material);
  });
}
