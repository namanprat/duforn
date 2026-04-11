// @ts-nocheck
import React, { useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { gltfLoaderOptions } from "./gltfLoaderOptions";
import { GLTF_URL_TEST } from "./gltfUrls";

/**
 * Full `gang.glb` scene (large mesh count). Uses a deep clone so material swaps in
 * `TestScene` do not mutate the shared drei cache.
 */
export default function TestModel(props) {
  const { scene } = useGLTF(GLTF_URL_TEST, gltfLoaderOptions);
  const cloned = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    return () => {
      cloned.traverse((o) => {
        if (o.isMesh) o.geometry?.dispose?.();
      });
    };
  }, [cloned]);

  return <primitive object={cloned} {...props} dispose={null} />;
}
