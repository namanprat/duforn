// @ts-nocheck
import * as THREE from "three";

export function normalizeModelBounds(model) {
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

function tuneMaterialMaps(material) {
  if (material.map) material.map.colorSpace = THREE.SRGBColorSpace;
  if (material.emissiveMap) material.emissiveMap.colorSpace = THREE.SRGBColorSpace;
  material.needsUpdate = true;
}

function getFallbackPhysicalMaterial(sourceMaterial) {
  return new THREE.MeshPhysicalMaterial({
    name: sourceMaterial?.name || "",
    color: sourceMaterial?.color?.clone ? sourceMaterial.color.clone() : new THREE.Color(0xffffff),
    map: sourceMaterial?.map || null,
    normalMap: sourceMaterial?.normalMap || null,
    roughnessMap: sourceMaterial?.roughnessMap || null,
    metalnessMap: sourceMaterial?.metalnessMap || null,
    aoMap: sourceMaterial?.aoMap || null,
    roughness: sourceMaterial?.roughness ?? 0.65,
    metalness: sourceMaterial?.metalness ?? 0.2,
    clearcoat: sourceMaterial?.clearcoat ?? 0,
    clearcoatRoughness: sourceMaterial?.clearcoatRoughness ?? 0,
    envMapIntensity: sourceMaterial?.envMapIntensity ?? 1,
  });
}

/** Fix map color spaces and upgrade non-PBR materials without retuning values. */
export function applyModelMaterialTuning(model) {
  model.traverse((child) => {
    if (!child.isMesh) return;

    const apply = (sourceMaterial) => {
      if (!sourceMaterial) return sourceMaterial;

      let material = sourceMaterial;

      if (!material.isMeshStandardMaterial && !material.isMeshPhysicalMaterial) {
        material = getFallbackPhysicalMaterial(sourceMaterial);
      }

      tuneMaterialMaps(material);
      return material;
    };

    child.material = Array.isArray(child.material)
      ? child.material.map(apply)
      : apply(child.material);
  });
}
