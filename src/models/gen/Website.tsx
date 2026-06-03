// @ts-nocheck
/*
 Regenerate: npx gltfjsx@latest public/duforn_website.glb -o src/models/gen/Website.tsx

 Plain gltfjsx pipeline — the GLB ships uncompressed and is loaded with a
 vanilla `useGLTF` (no Draco / Meshopt / KTX2 decoders). Slimmed to the
 <primitive> pattern so `applyModelMaterialTuning` can traverse the scene.
 The host scene (src/scenes/Main.tsx) handles bounds normalization and material tuning.
*/
import React from "react";
import { useGLTF } from "@react-three/drei";
import { GLTF_URL_WEBSITE } from "../urls";

export default function WebsiteModel(props) {
  const { scene } = useGLTF(GLTF_URL_WEBSITE);

  return <primitive object={scene} {...props} />;
}

useGLTF.preload(GLTF_URL_WEBSITE);
