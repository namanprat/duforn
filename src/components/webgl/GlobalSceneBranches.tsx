// @ts-nocheck
import React from "react";
import { PerspectiveCamera } from "@react-three/drei";
import EnvironmentSetup from "./EnvironmentSetup";
import HomeScene from "./HomeScene";
import Particles from "./Particles";
import CameraRig from "./CameraRig";
import NotFoundScene from "./NotFoundScene";
import TestScene from "./TestScene";
import ProjectDetailScene from "../../projectDetail/ProjectDetailScene";
import { useTestSceneControlsStore } from "../../store/testSceneControls";

export function HomeCanvasBranch() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1, 5]} fov={75} />
      <EnvironmentSetup />
      <CameraRig />
      <HomeScene />
      <Particles count={200} />
    </>
  );
}

export function TestCanvasBranch() {
  const cameraFov = useTestSceneControlsStore((s) => s.cameraFov);
  const orbitCenterX = useTestSceneControlsStore((s) => s.orbitCenterX);
  const orbitCenterY = useTestSceneControlsStore((s) => s.orbitCenterY);
  const orbitCenterZ = useTestSceneControlsStore((s) => s.orbitCenterZ);
  const orbitRadius = useTestSceneControlsStore((s) => s.orbitRadius);

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1, 5]} fov={cameraFov} />
      <EnvironmentSetup
        hdrFiles="/home.hdr"
        fogColor={0xdde5e5}
        fogDensity={0.009}
        showShadowCatcher={false}
      />
      <CameraRig
        orbitCenter={[orbitCenterX, orbitCenterY, orbitCenterZ]}
        orbitRadius={orbitRadius}
        enableContactOffset={false}
        parallaxScale={0.4}
        handheldDriftScale={0.3}
      />
      <TestScene />
      <Particles count={72} />
    </>
  );
}

export function ProjectDetailCanvasBranch() {
  return (
    <>
      <ProjectDetailScene />
    </>
  );
}

export function NotFoundCanvasBranch() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 1.35]} fov={34} />
      <NotFoundScene />
    </>
  );
}
