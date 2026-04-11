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

const STANDARD_CANVAS_CAMERA = {
  position: [0, 1, 5] as [number, number, number],
  fov: 75,
};

const STANDARD_EFFECTS_DEFAULTS = {
  bloomStrength: 0.045,
  dofMaxBlur: 0.008,
};

type StandardCanvasBranchProps = {
  children: React.ReactNode;
};

function StandardCanvasBranch({ children }: StandardCanvasBranchProps) {
  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={STANDARD_CANVAS_CAMERA.position}
        fov={STANDARD_CANVAS_CAMERA.fov}
      />
      <EnvironmentSetup />
      <CameraRig />
      {children}
      <Particles count={200} />
      <Effects
        bloomStrength={STANDARD_EFFECTS_DEFAULTS.bloomStrength}
        dofMaxBlur={STANDARD_EFFECTS_DEFAULTS.dofMaxBlur}
      />
    </>
  );
}

export function HomeCanvasBranch() {
  return (
    <StandardCanvasBranch>
      <HomeScene />
    </StandardCanvasBranch>
  );
}

export function TestCanvasBranch() {
  return (
    <StandardCanvasBranch>
      <TestScene />
    </StandardCanvasBranch>
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
