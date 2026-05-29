// @ts-nocheck
import React, { Suspense, useEffect } from "react";
import Surface, { getCanvasDpr } from "./Surface";
import { createRendererOpaque, getRendererType } from "../lib/render";
import { logWebGPU } from "../lib/gpu/debug";
import { useWebglStore } from "../store/webgl";
import { getRenderQualityProfile } from "../lib/render/profile";
import { registerLoaderRenderer } from "../models/loader";
import ShaderWarmup from "./ShaderWarmup";
import { NotFoundCanvasBranch, ProjectDetailCanvasBranch } from "./SceneBranches";
import RoomCanvas from "./RoomCanvas";
import Warmup from "./Warmup";
import { isRoomNamespace } from "../lib/cam/roomPoses";

function UnifiedScene({ activePage }) {
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
      return <RoomCanvas />;
    default:
      return <RoomCanvas />;
  }
}

/**
 * Single persistent R3F canvas for all routes. Room pages share one scene branch.
 */
export default function Canvas({ activePage }) {
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
    <Surface
      id="background"
      dpr={getCanvasDpr(dprCap)}
      pointerEvents={pointerEvents}
      gl={createRendererOpaque}
      frameloop={frameloop}
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
        <UnifiedScene activePage={activePage} />
        <ShaderWarmup sceneKey={activePage} />
        <Warmup activePage={activePage} />
      </Suspense>
    </Surface>
  );
}
