// @ts-nocheck
/**
 * Roman statue GLB for `/test` — same URL as `useGLTF.preload` in `preload.ts`.
 */
import React, { useLayoutEffect } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { gltfLoaderOptions } from "./gltfLoaderOptions";
import { GLTF_URL_TEST } from "./gltfUrls";

const WATER_NAME_HINTS = ["water", "pool", "plane", "floor", "surface", "lake", "pond"];

function scoreWaterCandidate(mesh) {
  const n = `${mesh.name || ""} ${mesh.material?.name || ""}`.toLowerCase();
  const nameScore = WATER_NAME_HINTS.some((hint) => n.includes(hint)) ? 10 : 0;

  mesh.geometry.computeBoundingBox();
  const box = mesh.geometry.boundingBox;
  const size = box ? box.getSize(new THREE.Vector3()) : new THREE.Vector3(1, 1, 1);
  const isFlat = size.y < Math.max(size.x, size.z) * 0.15;
  const area = size.x * size.z;
  const flatScore = isFlat ? 8 : 0;

  return nameScore + flatScore + area * 0.05;
}

function findLikelyWaterMesh(scene) {
  let best = null;
  let bestScore = -Infinity;

  scene.traverse((o) => {
    if (!o.isMesh || !o.geometry) return;
    const score = scoreWaterCandidate(o);
    if (score > bestScore) {
      best = o;
      bestScore = score;
    }
  });

  return best;
}

export default function TestModel({ onWaterMeshReady, ...props }) {
  const { scene } = useGLTF(GLTF_URL_TEST, gltfLoaderOptions);

  useLayoutEffect(() => {
    scene.traverse((o) => {
      if (!o.isMesh) return;
      o.castShadow = true;
      o.receiveShadow = true;
    });

    const waterMesh = findLikelyWaterMesh(scene);
    if (waterMesh) {
      waterMesh.userData.isWaterPlane = true;
      onWaterMeshReady?.(waterMesh);
    }
  }, [scene, onWaterMeshReady]);

  return <primitive object={scene} {...props} />;
}
