// @ts-nocheck
/** gltfjsx-style hook for /monitor.glb — shared by NotFoundScene */
import { useGLTF } from "@react-three/drei";
import { gltfLoaderOptions } from "../gltfLoaderOptions";
import { GLTF_URL_MONITOR } from "../gltfUrls";

export function useMonitorModel() {
  return useGLTF(GLTF_URL_MONITOR, gltfLoaderOptions);
}
