// @ts-nocheck
import React, { Suspense } from "react";
import { PerspectiveCamera } from "@react-three/drei";
import CanvasSurface from "./CanvasSurface";
import { createRendererOpaque, getRendererType } from "./createWebGPURenderer";
import { logWebGPU } from "../../lib/webgpu/debugWebGPU";
import { useWebglStore } from "../../store/webgl";
import ArchiveScene from "./ArchiveScene";
import WorkPageScene from "./WorkPageScene";
import ShaderCompiler from "./ShaderCompiler";
import {
  HomeCanvasBranch,
  NotFoundCanvasBranch,
  ProjectDetailCanvasBranch,
  TestCanvasBranch,
} from "./GlobalSceneBranches";

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
      return <NotFoundCanvasBranch />;
    case "test":
      return <TestCanvasBranch />;
    default:
      return <HomeCanvasBranch />;
  }
}

/**
 * Single persistent R3F canvas for all routes. Only one scene branch mounts at a time.
 */
export default function UnifiedCanvas({ activePage }) {
  const pointerEvents = activePage === "work" ? "auto" : "none";
  const isProjectDetail = activePage === "projectDetail";
  const setRendererType = useWebglStore((s) => s.setRendererType);

  return (
    <CanvasSurface
      id="background"
      pointerEvents={pointerEvents}
      gl={createRendererOpaque}
      shadows
      wrapperProps={{ "data-active-canvas": "true" }}
      onCreated={({ gl }) => {
        const rendererType = getRendererType(gl);
        setRendererType(rendererType);
        logWebGPU("UnifiedCanvas", "Canvas created", { rendererType });
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
