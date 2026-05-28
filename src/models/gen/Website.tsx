// @ts-nocheck
/*
 Regenerate: npx gltfjsx@latest public/duforn_website.glb -o src/models/gen/Website.tsx

 Slimmed to mirror the Main.tsx pattern: render the whole scene as a primitive
 so `findWaterMesh` / `applyModelMaterialTuning` can traverse it without
 fighting per-node JSX. The host scene (src/scenes/Main.tsx) handles bounds
 normalization, material tuning, and water-mesh discovery.
*/
import React, { useLayoutEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { extendGltfLoader, gltfLoaderOptions } from "../loader";
import { GLTF_URL_WEBSITE } from "../urls";

export default function WebsiteModel(props) {
  const { scene } = useGLTF(GLTF_URL_WEBSITE, gltfLoaderOptions, true, extendGltfLoader);

  useLayoutEffect(() => {
    scene.traverse((o) => {
      if (!o.isMesh) return;
      o.castShadow = true;
      o.receiveShadow = true;
    });
  }, [scene]);

  return <primitive object={scene} {...props} />;
}
