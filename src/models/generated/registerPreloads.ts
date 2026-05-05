// @ts-nocheck
/**
 * Single manifest: all GLB URLs preloaded with the same Draco/options as useGLTF.
 * Import this module once from app bootstrap before the canvas renders.
 *
 * Regenerate JSX from GLBs via gltfjsx (see README in this folder).
 */
import { useGLTF } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import { HDRLoader } from "three/addons/loaders/HDRLoader.js";
import { gltfLoaderOptions } from "../gltfLoaderOptions";
import {
  GLTF_URL_MONITOR,
  GLTF_URL_PROJECT_BG,
  GLTF_URL_SCENE,
  GLTF_URL_TEST,
  GLTF_URL_WORK,
} from "../gltfUrls";

useGLTF.preload(GLTF_URL_SCENE, gltfLoaderOptions);
useGLTF.preload(GLTF_URL_WORK, gltfLoaderOptions);
useGLTF.preload(GLTF_URL_PROJECT_BG, gltfLoaderOptions);
useGLTF.preload(GLTF_URL_MONITOR, gltfLoaderOptions);
useGLTF.preload(GLTF_URL_TEST, gltfLoaderOptions);

useLoader.preload(HDRLoader, "/home.hdr");
