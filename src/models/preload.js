import { useGLTF } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import { HDRLoader } from "three/addons/loaders/HDRLoader.js";
import { gltfLoaderOptions } from "./gltfLoaderOptions.js";
import {
  GLTF_URL_PROJECT_BG,
  GLTF_URL_LOGO,
  GLTF_URL_MONITOR,
  GLTF_URL_SCENE,
  GLTF_URL_WORK,
  GLTF_URL_TEST,
} from "./gltfUrls.js";

useGLTF.preload(GLTF_URL_LOGO, gltfLoaderOptions);
useGLTF.preload(GLTF_URL_SCENE, gltfLoaderOptions);
useGLTF.preload(GLTF_URL_WORK, gltfLoaderOptions);
useGLTF.preload(GLTF_URL_PROJECT_BG, gltfLoaderOptions);
useGLTF.preload(GLTF_URL_MONITOR, gltfLoaderOptions);
useGLTF.preload(GLTF_URL_TEST, gltfLoaderOptions);
// HDRLoader replaces deprecated RGBELoader (Three r180+); keeps preloaded HDR in the shared R3F cache.
useLoader.preload(HDRLoader, "/home.hdr");
