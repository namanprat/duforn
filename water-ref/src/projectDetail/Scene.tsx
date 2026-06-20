import { Suspense, useState } from "react";
import { OrthographicCamera } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import ProjectBg from "./Bg";
import ProjectDetailBackground from "./Background";
import ProjectDetailImagePlanes from "./ImagePlanes";
import { useProjectDetailController } from "./useController";
import { useProjectDetailSceneControlsStore } from "../store/projectScene";
import { PROJECT_DETAIL_REVEAL_SETTINGS } from "./sceneConfig";

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
  const projectBgFallbackControls = useProjectDetailSceneControlsStore(
    (state) => state.controls.projectBgFallback,
  );
  // The shader fallback only covers the gap until the GLTF background is
  // live — unmounting it afterwards saves a full-screen pass every frame.
  const [bgReady, setBgReady] = useState(false);

  return (
    <>
      <ProjectDetailCamera />
      <ProjectDetailController />
      {!bgReady ? <ProjectDetailBackground controls={projectBgFallbackControls} /> : null}
      <Suspense fallback={null}>
        <ProjectBg onReady={setBgReady} />
      </Suspense>
      <ProjectDetailImagePlanes revealControls={PROJECT_DETAIL_REVEAL_SETTINGS} />
    </>
  );
}
