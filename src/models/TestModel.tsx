// @ts-nocheck
/**
 * Roman statue GLB for `/test` — same URL as `useGLTF.preload` in `preload.ts`.
 */
import React, { useLayoutEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { gltfLoaderOptions } from "./gltfLoaderOptions";
import { GLTF_URL_TEST } from "./gltfUrls";

export default function TestModel(props) {
  const { scene } = useGLTF(GLTF_URL_TEST, gltfLoaderOptions);

  useLayoutEffect(() => {
    scene.traverse((o) => {
      if (!o.isMesh) return;
      o.castShadow = true;
      o.receiveShadow = true;
    });
  }, [scene]);

  return <primitive object={scene} {...props} />;
}
