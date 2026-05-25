// @ts-nocheck
import React from "react";
import { PerspectiveCamera } from "@react-three/drei";
import EnvironmentSetup from "./EnvironmentSetup";
import HomeScene from "./HomeScene";
import Particles from "./Particles";
import CameraRig from "./CameraRig";
import NotFoundScene from "./NotFoundScene";
import MainScene from "./MainScene";
import ProjectDetailScene from "../projectDetail/Scene";
import { useWebglStore } from "../store/webgl";
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

export function MainCanvasBranch() {
  const quality = useWebglStore((s) => s.qualityProfile);
  const shadowMapSize = Math.min(quality.shadowMapSize, 1536);

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1, 5]} fov={65} />
      <EnvironmentSetup
        hdrFiles="/home.hdr"
        backgroundColor={0x000000}
        fogColor={0x000000}
        fogDensity={0}
        showShadowCatcher={false}
      />
      <SceneExposure exposure={1} />
      <CameraRig
        orbitCenter={[0, 0.5, 0]}
        orbitRadius={5}
        parallaxScale={0.3}
        parallaxLerp={0.03}
        handheldDriftScale={0}
      />
      <MainScene shadowMapSize={shadowMapSize} />
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
