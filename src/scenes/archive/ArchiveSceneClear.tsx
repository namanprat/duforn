import { useLayoutEffect } from "react";
import * as THREE from "three";
import { SWATCH_DARK_NUM } from "../../lib/siteColors";
import { useThree } from "@react-three/fiber";

/** Black canvas + no fog — the shared scene keeps Env's HDR / FogExp2 otherwise. */
export default function ArchiveSceneClear() {
  const { scene, gl } = useThree();

  useLayoutEffect(() => {
    scene.background = new THREE.Color(SWATCH_DARK_NUM);
    scene.fog = null;
    gl.setClearColor(SWATCH_DARK_NUM, 1);

    return () => {
      scene.background = null;
      scene.fog = null;
    };
  }, [scene, gl]);

  return null;
}
