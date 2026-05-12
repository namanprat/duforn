// @ts-nocheck
import React, { Suspense, useEffect } from "react";
import * as THREE from "three";
import { OrthographicCamera } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import ProjectBg from "./ProjectBg";
import ProjectDetailBackground from "./ProjectDetailBackground";
import ProjectDetailImagePlanes from "./ProjectDetailImagePlanes";
import { useProjectDetailController } from "./useProjectDetailController";
import { useProjectDetailSceneControlsStore } from "../store/projectDetailSceneControls";
import { PROJECT_DETAIL_REVEAL_SETTINGS } from "./projectDetailSceneConfig";
import SceneExposure from "../components/webgl/SceneExposure";
import { useWorkToProjectTransitionStore } from "../store/workToProjectTransition";

function TransitionBridgeBackground() {
  const { scene } = useThree();
  const active = useWorkToProjectTransitionStore((state) => state.active);
  const progress = useWorkToProjectTransitionStore((state) => state.projectBackgroundProgress);
  const bridgeColor = useWorkToProjectTransitionStore((state) => state.bridgeColor);

  const shouldOverride = active && progress < 1;

  useEffect(() => {
    if (!shouldOverride) {
      // Hard clear: ensure no leftover bridge color sits behind the project quad.
      scene.background = null;
      return undefined;
    }
    const previous = scene.background;
    scene.background = new THREE.Color(bridgeColor);
    return () => {
      // On every dependency change / unmount, restore to null so the bridge color
      // never persists past the transition window.
      scene.background = previous instanceof THREE.Color ? null : previous;
    };
  }, [scene, shouldOverride, bridgeColor]);

  return null;
}

function ProjectDetailCamera() {
  const { size } = useThree();

  return (
    <OrthographicCamera
      makeDefault
      left={-size.width / 2}
      right={size.width / 2}
      top={size.height / 2}
      bottom={-size.height / 2}
      near={1}
      far={1000}
      position={[0, 0, 10]}
      zoom={1}
    />
  );
}

function ProjectDetailController() {
  useProjectDetailController();
  return null;
}

function FallbackBackgroundGate({ children }) {
  const active = useWorkToProjectTransitionStore((state) => state.active);
  const progress = useWorkToProjectTransitionStore((state) => state.projectBackgroundProgress);
  if (active && progress < 1) return null;
  return children;
}

export default function ProjectDetailScene({ projectBgRenderScale = 1 }) {
  const exposure = useProjectDetailSceneControlsStore((state) => state.controls.renderer.exposure);
  const projectBgFallbackControls = useProjectDetailSceneControlsStore(
    (state) => state.controls.projectBgFallback,
  );

  return (
    <>
      <TransitionBridgeBackground />
      <ProjectDetailCamera />
      <ProjectDetailController />
      <SceneExposure exposure={exposure} />
      <FallbackBackgroundGate>
        <ProjectDetailBackground controls={projectBgFallbackControls} />
      </FallbackBackgroundGate>
      <Suspense fallback={null}>
        <ProjectBg renderScale={projectBgRenderScale} />
      </Suspense>
      <ProjectDetailImagePlanes revealControls={PROJECT_DETAIL_REVEAL_SETTINGS} />
    </>
  );
}
