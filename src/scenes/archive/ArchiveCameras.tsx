import { useRef } from "react";
import { PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { PerspectiveCamera as ThreePerspectiveCamera } from "three";
import { ARCHIVE_FOV } from "../cam/transitionFov";
import { cameraBasePoseRef } from "../cam/pose";
import { useDissolveTransitionStore } from "../../store/routeTransition";

export default function ArchiveCameras() {
  const camRef = useRef<ThreePerspectiveCamera>(null);

  // This camera is makeDefault and NOT driven by CameraRig, so the ink-transition
  // fov punch (which mutates cameraBasePoseRef.fov) wouldn't reach it. Mirror the
  // punched fov while a dissolve is active; rest at ARCHIVE_FOV otherwise (so a
  // direct /archive load isn't stuck on a stale room fov).
  useFrame(() => {
    const cam = camRef.current;
    if (!cam) return;
    const fov = useDissolveTransitionStore.getState().active
      ? cameraBasePoseRef.current.fov
      : ARCHIVE_FOV;
    if (cam.fov !== fov) {
      cam.fov = fov;
      cam.updateProjectionMatrix();
    }
  });

  return (
    <PerspectiveCamera
      ref={camRef}
      makeDefault
      position={[0, 0, 10]}
      fov={ARCHIVE_FOV}
      near={0.1}
      far={1000}
    />
  );
}
