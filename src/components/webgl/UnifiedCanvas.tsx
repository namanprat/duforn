// @ts-nocheck
import React, { Suspense, useEffect } from "react";
import { PerspectiveCamera } from "@react-three/drei";
import CanvasSurface, { getCanvasDpr } from "./CanvasSurface";
import { createRendererOpaque, getRendererType } from "../../lib/rendering";
import { logWebGPU } from "../../lib/webgpu/debugWebGPU";
import { useWebglStore } from "../../store/webgl";
import { getRenderQualityProfile } from "../../lib/rendering/qualityProfile";
import WorkPageScene from "./WorkPageScene";
import ShaderCompiler from "./ShaderCompiler";
import {
  HomeCanvasBranch,
  MainCanvasBranch,
  NotFoundCanvasBranch,
  ProjectDetailCanvasBranch,
} from "./GlobalSceneBranches";
import WarmupOrchestrator from "./WarmupOrchestrator";

function UnifiedScene({ activePage, shadowMapSize }) {
  switch (activePage) {
    case "work":
      return (
        <>
          <PerspectiveCamera makeDefault position={[0, 1, 5]} fov={75} />
          <WorkPageScene shadowMapSize={shadowMapSize} />
        </>
      );
    case "archive":
      return <HomeCanvasBranch />;
    case "projectDetail":
      return <ProjectDetailCanvasBranch />;
    case "notFound":
      return <NotFoundCanvasBranch />;
    case "old":
      return <HomeCanvasBranch />;
    case "main":
      return <MainCanvasBranch />;
    default:
      return <MainCanvasBranch />;
  }
}

/**
 * Single persistent R3F canvas for all routes. Only one scene branch mounts at a time.
 */
export default function UnifiedCanvas({ activePage }) {
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

  // Main + contact share MainCanvasBranch / WaterRipples. Custom loop via
  // gl.setAnimationLoop keeps compute ordering and stable CameraRig deltas.
  const frameloop = activePage === "main" || activePage === "contact" ? "never" : "always";
  const isMainScene = activePage === "main" || activePage === "contact";
  const dprCap = isMainScene ? Math.min(quality.dprCap, 1.5) : quality.dprCap;

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
