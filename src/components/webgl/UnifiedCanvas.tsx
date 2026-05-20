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
  NotFoundCanvasBranch,
  ProjectDetailCanvasBranch,
  TestCanvasBranch,
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
  const pointerEvents = activePage === "work" || activePage === "test" ? "auto" : "none";
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

  // Test scene runs its own animation loop via gl.setAnimationLoop so it can
  // await compute kernels before the render pass — avoids WebGPU
  // "RenderPassEncoder was already ended" when ripples are dense. See
  // WaterRipples.tsx and PoolShallowWaterSim.stepAsync().
  const frameloop = activePage === "test" ? "never" : "always";

  return (
    <CanvasSurface
      id="background"
      dpr={getCanvasDpr(quality.dprCap)}
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
