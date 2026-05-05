// @ts-nocheck
/** gltfjsx-style hook for project-bg.glb */
import { useGLTF } from "@react-three/drei";
import { gltfLoaderOptions } from "../gltfLoaderOptions";
import { GLTF_URL_PROJECT_BG } from "../gltfUrls";

export function useProjectBgModel() {
  return useGLTF(GLTF_URL_PROJECT_BG, gltfLoaderOptions);
}
