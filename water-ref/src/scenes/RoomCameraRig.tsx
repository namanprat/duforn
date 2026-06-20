// @ts-nocheck
import React from "react";
import { PerspectiveCamera } from "@react-three/drei";
import RoomCam from "./RoomCam";
import CameraRig from "./CameraRig";

/**
 * Stable module-level literals so drei's <PerspectiveCamera> doesn't re-assert
 * position/fov on every parent render, fighting CameraRig and causing visible
 * 1-frame snaps ("violent shake" on the work cloth strip).
 */
const INITIAL_CAMERA_POSITION: readonly [number, number, number] = [0, 1, 5];
const INITIAL_CAMERA_FOV = 65;

/**
 * Shared default camera + RoomCam pose driver + pointer parallax rig.
 * Used by the home room scene on the unified canvas.
 */
export default function RoomCameraRig() {
  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={INITIAL_CAMERA_POSITION as unknown as [number, number, number]}
        fov={INITIAL_CAMERA_FOV}
      />
      <RoomCam />
      <CameraRig parallaxScale={0.3} parallaxLerp={0.03} />
    </>
  );
}
