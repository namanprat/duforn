import { useGLTF } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import { HDRLoader } from "three/addons/loaders/HDRLoader.js";

useGLTF.preload("/models/logo.glb");
useGLTF.preload("/models/scene.glb");
useGLTF.preload("/models/work.glb");
// HDRLoader replaces deprecated RGBELoader (Three r180+); keeps preloaded HDR in the shared R3F cache.
useLoader.preload(HDRLoader, "/home.hdr");
