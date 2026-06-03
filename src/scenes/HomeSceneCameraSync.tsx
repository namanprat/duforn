// @ts-nocheck
import { useFrame } from "@react-three/fiber";
import { useWebglStore } from "../store/webgl";
import { cameraBasePoseRef, cameraTransitionRef } from "../lib/cam/pose";
import { getMainCameraPose } from "../store/homeScene";

/** Dev GUI: live-sync home camera sliders onto the shared room camera pose. */
export default function HomeSceneCameraSync() {
  const activePage = useWebglStore((state) => state.activePage);

  useFrame(() => {
    if (!import.meta.env.DEV || activePage !== "main") return;
    if (cameraTransitionRef.current) return;
    Object.assign(cameraBasePoseRef.current, getMainCameraPose());
  });

  return null;
}
