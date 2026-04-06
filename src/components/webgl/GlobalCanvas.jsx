import React, { Suspense } from "react";
import { PerspectiveCamera } from "@react-three/drei";
import CanvasSurface from "./CanvasSurface.jsx";
import { createRendererAlpha, getRendererType } from "./createWebGPURenderer.js";
import EnvironmentSetup from "./EnvironmentSetup.jsx";
import CameraRig from "./CameraRig.jsx";
import Effects from "./Effects.jsx";
import Particles from "./Particles.jsx";
import HomeScene from "./HomeScene.jsx";
import { logWebGPU } from "../../lib/webgpu/debugWebGPU.js";
import ProjectDetailScene from "../../projectDetail/ProjectDetailScene.jsx";
import { useProjectDetailSceneControlsStore } from "../../store/projectDetailSceneControls.js";
import ShaderCompiler from "./ShaderCompiler.jsx";

function HomeCanvasBranch() {
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

function ProjectDetailCanvasBranch() {
  const effects = useProjectDetailSceneControlsStore((state) => state.controls.effects);

  return (
    <>
      <ProjectDetailScene />
      <Effects
        bloomStrength={effects.bloomStrength}
        vignetteDarkness={effects.vignetteDarkness}
        grain={effects.grain}
        chromaticShift={effects.chromaticShift}
        dofMaxBlur={effects.dofMaxBlur}
      />
    </>
  );
}

export default function GlobalCanvas({ activePage = "home" }) {
  const isProjectDetailPage = activePage === "projectDetail";

  return (
    <CanvasSurface
      id="background"
      key={isProjectDetailPage ? "project-detail-canvas" : "global-canvas"}
      gl={createRendererAlpha}
      onCreated={({ gl }) => {
        logWebGPU("GlobalCanvas", "Canvas created", { rendererType: getRendererType(gl) });
      }}
      onPointerMissed={isProjectDetailPage ? () => {} : undefined}
    >
      <Suspense fallback={null}>
        {isProjectDetailPage ? <ProjectDetailCanvasBranch /> : <HomeCanvasBranch />}
        <ShaderCompiler />
      </Suspense>
    </CanvasSurface>
  );
}
