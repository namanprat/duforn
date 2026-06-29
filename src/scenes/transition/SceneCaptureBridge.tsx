import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { sceneCaptureRef } from "./sceneCaptureRef";

/** Keeps sceneCaptureRef in sync for dissolve frame grabs. */
export default function SceneCaptureBridge() {
  const { gl, scene, camera } = useThree();

  useEffect(() => {
    sceneCaptureRef.gl = gl;
    sceneCaptureRef.scene = scene;
    sceneCaptureRef.camera = camera;
    return () => {
      sceneCaptureRef.gl = null;
      sceneCaptureRef.scene = null;
      sceneCaptureRef.camera = null;
    };
  }, [gl, scene, camera]);

  return null;
}
