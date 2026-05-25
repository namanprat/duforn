// @ts-nocheck
import React, { Suspense, useEffect } from "react";
import CanvasSurface, { getCanvasDpr } from "./CanvasSurface";
import { createRendererOpaque, getRendererType } from "../lib/rendering";
import { logWebGPU } from "../lib/webgpu/debugWebGPU";
import { useWebglStore } from "../store/webgl";
import { getRenderQualityProfile } from "../lib/rendering/qualityProfile";
import ShaderCompiler from "./ShaderCompiler";
import { NotFoundCanvasBranch, ProjectDetailCanvasBranch } from "./GlobalSceneBranches";
import SharedRoomCanvasBranch from "./SharedRoomCanvasBranch";
import WarmupOrchestrator from "./WarmupOrchestrator";
import { isRoomNamespace } from "../lib/theatre/roomCameraTransition";

function UnifiedScene({ activePage, shadowMapSize }) {
  switch (activePage) {
    case "archive":
      return null;
    case "projectDetail":
      return <ProjectDetailCanvasBranch />;
    case "notFound":
      return <NotFoundCanvasBranch />;
    case "main":
    case "work":
    case "contact":
      return <SharedRoomCanvasBranch shadowMapSize={shadowMapSize} />;
    default:
      return <SharedRoomCanvasBranch shadowMapSize={shadowMapSize} />;
  }
}

/**
 * Single persistent R3F canvas for all routes. Room pages share one scene branch.
 */
export default function UnifiedCanvas({ activePage }) {
  const isRoomPage = isRoomNamespace(activePage);
  const pointerEvents = activePage === "work" || activePage === "main" ? "auto" : "none";
  const isProjectDetail = activePage === "projectDetail";
  const setRendererType = useWebglStore((s) => s.setRendererType);
  const setQualityProfile = useWebglStore((s) => s.setQualityProfile);
  const quality = useWebglStore((s) => s.qualityProfile);

  useEffect(() => {
    const runtimeQuality = getRenderQualityProfile();
    if (runtimeQuality.tier !== quality.tier) {
      setQualityProfile(runtimeQuality);
    }
  }, [quality.tier, setQualityProfile]);

  const frameloop = isRoomPage ? "never" : "always";
  const dprCap = isRoomPage ? Math.min(quality.dprCap, 1.5) : quality.dprCap;

  return (
    <CanvasSurface
      id="background"
      dpr={getCanvasDpr(dprCap)}
      pointerEvents={pointerEvents}
      gl={createRendererOpaque}
      shadows
      frameloop={frameloop}
      wrapperProps={{ "data-active-canvas": "true" }}
      onCreated={({ gl }) => {
        const rendererType = getRendererType(gl);
        setRendererType(rendererType);
        logWebGPU("UnifiedCanvas", "Canvas created", { rendererType });
      }}
      onPointerMissed={isProjectDetail ? () => {} : undefined}
    >
      <Suspense fallback={null}>
        <UnifiedScene activePage={activePage} shadowMapSize={quality.shadowMapSize} />
        <ShaderCompiler sceneKey={activePage} />
        <WarmupOrchestrator activePage={activePage} />
      </Suspense>
    </CanvasSurface>
  );
}
