// @ts-nocheck
import React from "react";
import { PerspectiveCamera } from "@react-three/drei";
import EnvironmentSetup from "./EnvironmentSetup";
import CameraRig from "./CameraRig";
import Effects from "./Effects";
import Particles from "./Particles";
import HomeScene from "./HomeScene";
import TestScene from "./TestScene";
import NotFoundScene from "./NotFoundScene";
import ProjectDetailScene from "../../projectDetail/ProjectDetailScene";
import { useProjectDetailSceneControlsStore } from "../../store/projectDetailSceneControls";

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
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1, 5]} fov={75} />
      <EnvironmentSetup />
      <CameraRig />
      <TestScene />
      <Particles count={200} />
      <Effects bloomStrength={0.045} dofMaxBlur={0.008} />
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
