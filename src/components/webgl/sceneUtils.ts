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

function getFallbackPhysicalMaterial(sourceMaterial, overrides = {}) {
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
    clearcoat: 0.12,
    clearcoatRoughness: 0.16,
    envMapIntensity: 1.35,
    ...overrides,
  });
}

export function applyModelMaterialTuning(
  model,
  {
    roughnessScale = 1,
    metalnessScale = 1,
    envReflection = 1,
    clearcoat = 0,
    clearcoatRoughness = 0.3,
    cloneStandardMaterials = true,
    fallbackMaterialOverrides,
    materialFactory,
  } = {},
) {
  model.traverse((child) => {
    if (!child.isMesh) return;
    if (child.userData?.isWater) return;
    if (child.userData?.isCausticHost) return;

    child.castShadow = true;
    child.receiveShadow = true;

    const apply = (sourceMaterial) => {
      if (!sourceMaterial) return sourceMaterial;

      if (materialFactory) {
        return materialFactory(sourceMaterial, child);
      }

      let material = sourceMaterial;

      if (!material.isMeshStandardMaterial && !material.isMeshPhysicalMaterial) {
        material = getFallbackPhysicalMaterial(sourceMaterial, fallbackMaterialOverrides);
      } else if (cloneStandardMaterials) {
        material = material.clone();
      }

      tuneMaterialMaps(material);
      if (material.userData.baseRoughness === undefined) {
        material.userData.baseRoughness = material.roughness ?? 0.8;
      }
      if (material.userData.baseMetalness === undefined) {
        material.userData.baseMetalness = material.metalness ?? 0.0;
      }
      if (material.userData.baseEnvMapIntensity === undefined) {
        material.userData.baseEnvMapIntensity = material.envMapIntensity ?? 1;
      }

      material.roughness = THREE.MathUtils.clamp(
        material.userData.baseRoughness * roughnessScale,
        0.03,
        1,
      );
      material.metalness = THREE.MathUtils.clamp(
        material.userData.baseMetalness * metalnessScale,
        0,
        1,
      );
      material.envMapIntensity = THREE.MathUtils.clamp(
        material.userData.baseEnvMapIntensity * envReflection,
        0.2,
        5,
      );

      if (clearcoat > 0 && material.isMeshPhysicalMaterial) {
        material.clearcoat = clearcoat;
        material.clearcoatRoughness = clearcoatRoughness;
      }

      return material;
    };

    child.material = Array.isArray(child.material)
      ? child.material.map(apply)
      : apply(child.material);
  });
}
