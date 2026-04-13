// @ts-nocheck
import React from "react";
import { PerspectiveCamera } from "@react-three/drei";
import EnvironmentSetup from "./EnvironmentSetup";
import Effects from "./Effects";
import HomeScene from "./HomeScene";
import Particles from "./Particles";
import CameraRig from "./CameraRig";
import NotFoundScene from "./NotFoundScene";
import TestScene from "./TestScene";
import ProjectDetailScene from "../../projectDetail/ProjectDetailScene";
import { useProjectDetailSceneControlsStore } from "../../store/projectDetailSceneControls";
import { useTestSceneControlsStore } from "../../store/testSceneControls";

export function HomeCanvasBranch() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1, 5]} fov={75} />
      <EnvironmentSetup />
      <CameraRig />
      <HomeScene />
      <Particles count={200} />
      <Effects bloomStrength={0.045} dofMaxBlur={0.008} />
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
      <Effects
        bloomStrength={0.035}
        dofMaxBlur={0.003}
        chromaticShift={0.0015}
        ambientOcclusionStrength={0.28}
      />
    </>
  );
}

export function ProjectDetailCanvasBranch() {
  const effects = useProjectDetailSceneControlsStore((state) => state.controls.effects);

  return (
    <>
      <ProjectDetailScene />
      <Effects
        bloomStrength={effects.bloomStrength}
        vignetteDarkness={effects.vignetteDarkness}
        chromaticShift={effects.chromaticShift}
        dofMaxBlur={effects.dofMaxBlur}
        aoResolutionScale={effects.aoResolutionScale}
        aoRadius={effects.aoRadius}
        aoSamples={effects.aoSamples}
      />
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
