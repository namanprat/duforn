import React from "react";
import { PerspectiveCamera } from "@react-three/drei";
import EnvironmentSetup from "./EnvironmentSetup.jsx";
import CameraRig from "./CameraRig.jsx";
import Effects from "./Effects.jsx";
import Particles from "./Particles.jsx";
import HomeScene from "./HomeScene.jsx";
import NotFoundScene from "./NotFoundScene.jsx";
import ProjectDetailScene from "../../projectDetail/ProjectDetailScene.jsx";
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
