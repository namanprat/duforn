// @ts-nocheck
import React, { Suspense } from "react";
import { OrthographicCamera } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import ProjectBg from "./ProjectBg";
import ProjectDetailBackground from "./ProjectDetailBackground";
import ProjectDetailImagePlanes from "./ProjectDetailImagePlanes";
import { useProjectDetailController } from "./useProjectDetailController";
import { useProjectDetailSceneControlsStore } from "../store/projectDetailSceneControls";
import { PROJECT_DETAIL_REVEAL_SETTINGS } from "./projectDetailSceneConfig";
import SceneExposure from "../components/webgl/SceneExposure";

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

export default function ProjectDetailScene() {
  const exposure = useProjectDetailSceneControlsStore((state) => state.controls.renderer.exposure);
  const projectBgFallbackControls = useProjectDetailSceneControlsStore(
    (state) => state.controls.projectBgFallback,
  );

  return (
    <>
      <ProjectDetailCamera />
      <ProjectDetailController />
      <SceneExposure exposure={exposure} />
      <ProjectDetailBackground controls={projectBgFallbackControls} />
      <Suspense fallback={null}>
        <ProjectBg />
      </Suspense>
      <ProjectDetailImagePlanes revealControls={PROJECT_DETAIL_REVEAL_SETTINGS} />
    </>
  );
}
