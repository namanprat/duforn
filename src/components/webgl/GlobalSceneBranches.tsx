// @ts-nocheck
import React from "react";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import EnvironmentSetup from "./EnvironmentSetup";
import HomeScene from "./HomeScene";
import Particles from "./Particles";
import CameraRig from "./CameraRig";
import NotFoundScene from "./NotFoundScene";
import TestScene from "./TestScene";
import ProjectDetailScene from "../../projectDetail/ProjectDetailScene";
import { useTestSceneControlsStore } from "../../store/testSceneControls";
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
  const enableOrbitControls = useTestSceneControlsStore((s) => s.enableOrbitControls);
  const cameraFov = useTestSceneControlsStore((s) => s.cameraFov);
  const cameraPosX = useTestSceneControlsStore((s) => s.cameraPosX);
  const cameraPosY = useTestSceneControlsStore((s) => s.cameraPosY);
  const cameraPosZ = useTestSceneControlsStore((s) => s.cameraPosZ);
  const orbitCenterX = useTestSceneControlsStore((s) => s.orbitCenterX);
  const orbitCenterY = useTestSceneControlsStore((s) => s.orbitCenterY);
  const orbitCenterZ = useTestSceneControlsStore((s) => s.orbitCenterZ);
  const orbitRadius = useTestSceneControlsStore((s) => s.orbitRadius);
  const orbitTargetX = useTestSceneControlsStore((s) => s.orbitTargetX);
  const orbitTargetY = useTestSceneControlsStore((s) => s.orbitTargetY);
  const orbitTargetZ = useTestSceneControlsStore((s) => s.orbitTargetZ);
  const orbitMinDistance = useTestSceneControlsStore((s) => s.orbitMinDistance);
  const orbitMaxDistance = useTestSceneControlsStore((s) => s.orbitMaxDistance);
  const orbitMinPolarAngle = useTestSceneControlsStore((s) => s.orbitMinPolarAngle);
  const orbitMaxPolarAngle = useTestSceneControlsStore((s) => s.orbitMaxPolarAngle);
  const exposure = useTestSceneControlsStore((s) => s.exposure);

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[cameraPosX, cameraPosY, cameraPosZ]}
        fov={cameraFov}
      />
      <EnvironmentSetup
        hdrFiles="/home.hdr"
        fogColor={0xdde5e5}
        fogDensity={0.009}
        showShadowCatcher={false}
      />
      <SceneExposure exposure={exposure} />
      {enableOrbitControls ? (
        <OrbitControls
          makeDefault
          target={[orbitTargetX, orbitTargetY, orbitTargetZ]}
          enableDamping
          minDistance={orbitMinDistance}
          maxDistance={orbitMaxDistance}
          minPolarAngle={(orbitMinPolarAngle * Math.PI) / 180}
          maxPolarAngle={(orbitMaxPolarAngle * Math.PI) / 180}
        />
      ) : (
        <CameraRig
          orbitCenter={[orbitCenterX, orbitCenterY, orbitCenterZ]}
          orbitRadius={orbitRadius}
          enableContactOffset={false}
          parallaxScale={0.4}
          handheldDriftScale={0.3}
        />
      )}
      <TestScene />
      <Particles count={72} />
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
