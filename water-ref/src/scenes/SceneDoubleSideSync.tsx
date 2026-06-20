// @ts-nocheck
import { useFrame, useThree } from "@react-three/fiber";
import { disableBackfaceCullingOnObject } from "../lib/render/materialSide";

/**
 * Ensures every mesh material in the active R3F scene is double-sided.
 * Catches async/custom materials that never pass through sceneUtils tuning.
 */
export default function SceneDoubleSideSync() {
  const scene = useThree((state) => state.scene);

  useFrame(() => {
    disableBackfaceCullingOnObject(scene);
  });

  return null;
}
