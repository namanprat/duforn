// @ts-nocheck
/*
 Auto-rewritten by `npm run model:update`.
 Regenerate per-node JSX (if you need it) with:
   npx gltfjsx@latest public/duforn_website.compressed.glb -o src/models/gen/Website.tsx

 The served GLB ships meshopt-compressed with WebP textures (built from the raw
 `public/duforn_website.glb` source by `npm run model:update`). Loaded via the
 shared decoder wiring (Meshopt + KTX2 extension) — same pattern as the monitor.
 The runtime traversal in src/scenes/Main.tsx handles bounds normalization,
 material tuning, and water-mesh discovery — so the wrapper just renders the
 scene as a primitive. Keep that pattern.
*/
import React from "react";
import { useGLTF } from "@react-three/drei";
import { extendGltfLoader, gltfLoaderOptions } from "../loader";
import { GLTF_URL_WEBSITE } from "../urls";

export default function WebsiteModel(props) {
  const { scene } = useGLTF(GLTF_URL_WEBSITE, gltfLoaderOptions, true, extendGltfLoader);

  return <primitive object={scene} {...props} />;
}

useGLTF.preload(GLTF_URL_WEBSITE, gltfLoaderOptions, true, extendGltfLoader);
