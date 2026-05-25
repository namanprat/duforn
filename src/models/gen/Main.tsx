// @ts-nocheck
/*
 Regenerate: npx gltfjsx@latest public/models/main.glb -o src/models/gen/Main.tsx
*/
import React, { useLayoutEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { gltfLoaderOptions } from "../loader";
import { GLTF_URL_MAIN } from "../urls";

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
