import { Canvas } from "@react-three/fiber";
import React, { Suspense } from "react";
import { createRendererAlpha, getRendererType } from "./createWebGPURenderer.js";
import EnvironmentSetup from "./EnvironmentSetup.jsx";
import CameraRig from "./CameraRig.jsx";
import Effects from "./Effects.jsx";
import Particles from "./Particles.jsx";
import HomeScene from "./HomeScene.jsx";
import { logWebGPU } from "../../lib/webgpu/debugWebGPU.js";

export default function GlobalCanvas() {
  return (
    <div
      id="background"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
        pointerEvents: "none",
        background: "transparent",
      }}
    >
      <Canvas
        camera={{ position: [0, 1, 5], fov: 75 }}
        gl={createRendererAlpha}
        onCreated={({ gl }) => {
          logWebGPU("GlobalCanvas", "Canvas created", { rendererType: getRendererType(gl) });
        }}
      >
        <Suspense fallback={null}>
          <EnvironmentSetup />
          <CameraRig />
          <Particles count={200} />
          <HomeScene />
          <Effects bloomStrength={0.045} dofMaxBlur={0.008} />
        </Suspense>
      </Canvas>
    </div>
  );
}
