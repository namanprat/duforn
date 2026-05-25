// @ts-nocheck
/** gltfjsx-style hook for /monitor.glb — shared by NotFound */
import { useGLTF } from "@react-three/drei";
import { gltfLoaderOptions } from "../loader";
import { GLTF_URL_MONITOR } from "../urls";

export function useMonitorModel() {
  return useGLTF(GLTF_URL_MONITOR, gltfLoaderOptions);
}
