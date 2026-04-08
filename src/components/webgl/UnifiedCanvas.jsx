import React, { Suspense } from "react";
import { PerspectiveCamera } from "@react-three/drei";
import CanvasSurface from "./CanvasSurface.jsx";
import { createRendererOpaque, getRendererType } from "./createWebGPURenderer.js";
import { logWebGPU } from "../../lib/webgpu/debugWebGPU.js";
import ArchiveScene from "./ArchiveScene.jsx";
import WorkPageScene from "./WorkPageScene.jsx";
import NotFoundScene from "./NotFoundScene.jsx";
import ShaderCompiler from "./ShaderCompiler.jsx";
import { HomeCanvasBranch, ProjectDetailCanvasBranch } from "./GlobalSceneBranches.jsx";

function UnifiedScene({ activePage }) {
  switch (activePage) {
    case "work":
      return (
        <>
          <PerspectiveCamera makeDefault position={[0, 1, 5]} fov={75} />
          <WorkPageScene />
        </>
      );
    case "archive":
      return (
        <>
          <PerspectiveCamera makeDefault position={[0, 0, 3.8]} fov={70} />
          <ArchiveScene />
        </>
      );
    case "projectDetail":
      return <ProjectDetailCanvasBranch />;
    case "notFound":
      return (
        <>
          <PerspectiveCamera makeDefault position={[0, 0, 1.35]} fov={34} />
          <NotFoundScene />
        </>
      );
    default:
      return <HomeCanvasBranch />;
  }
}

/**
 * Single persistent R3F canvas for all routes. Only one scene branch mounts at a time.
 */
export default function UnifiedCanvas({ activePage }) {
  const pointerEvents =
    activePage === "work" || activePage === "archive" || activePage === "notFound"
      ? "auto"
      : "none";
  const isProjectDetail = activePage === "projectDetail";

  return (
    <CanvasSurface
      id="background"
      pointerEvents={pointerEvents}
      gl={createRendererOpaque}
      shadows
      wrapperProps={{ "data-active-canvas": "true" }}
      onCreated={({ gl }) => {
        logWebGPU("UnifiedCanvas", "Canvas created", { rendererType: getRendererType(gl) });
      }}
      onPointerMissed={isProjectDetail ? () => {} : undefined}
    >
      <Suspense fallback={null}>
        <UnifiedScene activePage={activePage} />
        <ShaderCompiler sceneKey={activePage} />
      </Suspense>
    </CanvasSurface>
  );
}
