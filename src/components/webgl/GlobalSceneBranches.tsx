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
import { useWebglStore } from "../../store/webgl";
import SceneExposure from "./SceneExposure";

export function HomeCanvasBranch() {
  const quality = useWebglStore((s) => s.qualityProfile);

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1, 5]} fov={75} />
      <EnvironmentSetup />
      <CameraRig />
      <HomeScene shadowMapSize={quality.shadowMapSize} />
      <Particles count={quality.homeParticles} />
    </>
  );
}

export function TestCanvasBranch() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1, 5]} fov={65} />
      <EnvironmentSetup
        hdrFiles="/home.hdr"
        fogColor={0xdde5e5}
        fogDensity={0.009}
        showShadowCatcher={false}
      />
      <SceneExposure exposure={1} />
      <CameraRig
        orbitCenter={[0, 0.5, 0]}
        orbitRadius={5}
        enableContactOffset={false}
        parallaxScale={0.45}
        parallaxAngleScale={0.525}
        parallaxLerp={0.035}
        handheldDriftScale={0}
      />
      <TestScene />
    </>
  );
}

export function ProjectDetailCanvasBranch() {
  const quality = useWebglStore((s) => s.qualityProfile);

  return (
    <>
      <ProjectDetailScene projectBgRenderScale={quality.projectBgRenderScale} />
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
