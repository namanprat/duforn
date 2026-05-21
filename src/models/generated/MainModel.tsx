// @ts-nocheck
/*
 Regenerate: npx gltfjsx@latest public/models/main.glb -o src/models/generated/MainModel.tsx
*/
import React, { useLayoutEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { gltfLoaderOptions } from "../gltfLoaderOptions";
import { GLTF_URL_MAIN } from "../gltfUrls";

export default function MainModel(props) {
  const { scene } = useGLTF(GLTF_URL_MAIN, gltfLoaderOptions);

  useLayoutEffect(() => {
    scene.traverse((o) => {
      if (!o.isMesh) return;
      o.castShadow = true;
      o.receiveShadow = true;
    });
  }, [scene]);

  return <primitive object={scene} {...props} />;
}
