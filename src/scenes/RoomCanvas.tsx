// @ts-nocheck
import React from "react";
import { PerspectiveCamera } from "@react-three/drei";
import Env from "./Env";
import Exposure from "./Exposure";
import TheatreCam from "./TheatreCam";
import CameraRig from "./CameraRig";
import Main from "./Main";
import { WorkClothStripScene } from "../work/ClothStrip";

/**
 * Stable module-level literals so drei's <PerspectiveCamera> doesn't re-assert
 * position/fov on every parent render, fighting CameraRig and causing visible
 * 1-frame snaps ("violent shake" on the work cloth strip).
 */
const INITIAL_CAMERA_POSITION: readonly [number, number, number] = [0, 1, 5];
const INITIAL_CAMERA_FOV = 65;

/**
 * Persistent multi-room scene: one model, one camera, Theatre-driven room poses.
 */
export default function RoomCanvas({ shadowMapSize = 1536 }) {
  const shadowMapSizeClamped = Math.min(shadowMapSize, 1536);

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={INITIAL_CAMERA_POSITION as unknown as [number, number, number]}
        fov={INITIAL_CAMERA_FOV}
      />
      <Env
        hdrFiles="/home.hdr"
        backgroundColor={0x000000}
        fogColor={0x000000}
        fogDensity={0}
        showShadowCatcher={false}
      />
      <Exposure exposure={1} />
      <TheatreCam />
      <CameraRig parallaxScale={0.3} parallaxLerp={0.03} handheldDriftScale={0} />
      <Main shadowMapSize={shadowMapSizeClamped} />
      <WorkClothStripScene />
    </>
  );
}
