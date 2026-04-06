import { useGLTF } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";

useGLTF.preload("/models/logo.glb");
useGLTF.preload("/models/scene.glb");
useGLTF.preload("/models/work.glb");
// Use RGBELoader (same as @react-three/drei's Environment internally) so the
// preloaded texture lands in the shared R3F loader cache.
useLoader.preload(RGBELoader, "/home.hdr");
