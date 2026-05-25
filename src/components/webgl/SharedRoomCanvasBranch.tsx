// @ts-nocheck
import React from "react";
import { PerspectiveCamera } from "@react-three/drei";
import EnvironmentSetup from "./EnvironmentSetup";
import SceneExposure from "./SceneExposure";
import TheatreCameraController from "./TheatreCameraController";
import CameraRig from "./CameraRig";
import MainScene from "./MainScene";
import { WorkClothStripScene } from "../../work/WorkClothStrip";

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
export default function SharedRoomCanvasBranch({ shadowMapSize = 1536 }) {
  const shadowMapSizeClamped = Math.min(shadowMapSize, 1536);

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={INITIAL_CAMERA_POSITION as unknown as [number, number, number]}
        fov={INITIAL_CAMERA_FOV}
      />
      <EnvironmentSetup
        hdrFiles="/home.hdr"
        backgroundColor={0x000000}
        fogColor={0x000000}
        fogDensity={0}
        showShadowCatcher={false}
      />
      <SceneExposure exposure={1} />
      <TheatreCameraController />
      <CameraRig parallaxScale={0.3} parallaxLerp={0.03} handheldDriftScale={0} />
      <MainScene shadowMapSize={shadowMapSizeClamped} />
      <WorkClothStripScene />
    </>
  );
}
