import { useLayoutEffect } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";

/** Black canvas + no fog — the shared scene keeps Env's HDR / FogExp2 otherwise. */
export default function ArchiveSceneClear() {
  const { scene, gl } = useThree();

  useLayoutEffect(() => {
    scene.background = new THREE.Color(0x000000);
    scene.fog = null;
    gl.setClearColor(0x000000, 1);

    return () => {
      scene.background = null;
      scene.fog = null;
    };
  }, [scene, gl]);

  return null;
}
