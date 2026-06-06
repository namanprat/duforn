// @ts-nocheck
/**
 * Unified site 3D: one `#background` WebGPURenderer (WebGL fallback), one R3F tree.
 * Route content swaps via SceneBranches; no per-page nested `<Canvas>`.
 * GPU materials use pickGpuBranchAsync; DOM-linked meshes sync via getBoundingClientRect.
 * Ink transitions stay on OverlayCanvas (alpha layer above content).
 */
import React, { Suspense } from "react";
import Surface, { getCanvasDpr } from "./Surface";
import { createRendererOpaque, getRendererType } from "../lib/render";
import { logWebGPU } from "../lib/gpu/debug";
import { useWebglStore } from "../store/webgl";
import { registerLoaderRenderer } from "../models/loader";
import ShaderWarmup from "./ShaderWarmup";
import UnifiedCanvasFrameLoop from "./UnifiedCanvasFrameLoop";
import SceneDoubleSideSync from "./SceneDoubleSideSync";
import {
  AboutCanvasBranch,
  NotFoundCanvasBranch,
  ProjectDetailCanvasBranch,
  TestCanvasBranch,
} from "./SceneBranches";
import RoomCanvas from "./RoomCanvas";
import ViewerCanvas from "./ViewerCanvas";

function UnifiedScene({ activePage }) {
  switch (activePage) {
    case "about":
      return <AboutCanvasBranch />;
    case "projectDetail":
      return <ProjectDetailCanvasBranch />;
    case "notFound":
      return <NotFoundCanvasBranch />;
    case "test":
      return <TestCanvasBranch />;
    case "main":
    case "work":
    case "contact":
      return <RoomCanvas />;
    case "viewer":
      return <ViewerCanvas />;
    default:
      return <RoomCanvas />;
  }
}

/**
 * Single persistent R3F canvas for all routes. Room pages share one scene branch.
 */
export default function Canvas({ activePage }) {
  const pointerEvents =
    activePage === "work" ||
    activePage === "main" ||
    activePage === "test" ||
    activePage === "viewer"
      ? "auto"
      : "none";
  const isProjectDetail = activePage === "projectDetail";
  const setRendererType = useWebglStore((s) => s.setRendererType);

  return (
    <Surface
      id="background"
      dpr={getCanvasDpr(2)}
      pointerEvents={pointerEvents}
      gl={createRendererOpaque}
      frameloop="never"
      wrapperProps={{ "data-active-canvas": "true" }}
      onCreated={({ gl }) => {
        const rendererType = getRendererType(gl);
        setRendererType(rendererType);
        registerLoaderRenderer(gl);
        logWebGPU("Canvas", "Canvas created", { rendererType });
      }}
      onPointerMissed={isProjectDetail ? () => {} : undefined}
    >
      <Suspense fallback={null}>
        <UnifiedCanvasFrameLoop />
        <SceneDoubleSideSync />
        <UnifiedScene activePage={activePage} />
        {activePage !== "test" ? <ShaderWarmup sceneKey={activePage} /> : null}
      </Suspense>
    </Surface>
  );
}
