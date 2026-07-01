import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import type { PerspectiveCamera } from "three";
import { registerTransitionCamera, unregisterTransitionCamera } from "./transitionFov";

/** Tracks whichever route camera is `makeDefault` for dissolve FOV punches. */
export default function TransitionCameraRegistrar() {
  const camera = useThree((s) => s.camera);

  useEffect(() => {
    registerTransitionCamera(camera as PerspectiveCamera);
    return () => unregisterTransitionCamera(camera as PerspectiveCamera);
  }, [camera]);

  return null;
}
