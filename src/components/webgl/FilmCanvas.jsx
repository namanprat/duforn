import { Canvas } from "@react-three/fiber";
import React, { Suspense } from "react";
import { useControls, folder } from "leva";
import { createWebGLRendererAlpha, getRendererType } from "./createWebGPURenderer.js";
import FilmBackground from "../../film/FilmBackground.jsx";
import FilmEffects from "../../film/FilmEffects.jsx";
import FilmImagePlanes from "../../film/FilmImagePlanes.jsx";
import { useFilmController } from "../../film/useFilmController.js";
import { logWebGPU } from "../../lib/webgpu/debugWebGPU.js";

function FilmController() {
  useFilmController();
  return null;
}

export default function FilmCanvas() {
  const revealControls = useControls("Image Reveal", {
    duration: { value: 2.8, min: 0.5, max: 6.0, step: 0.1, label: "Duration (s)" },
    edge: { value: 0.12, min: 0.02, max: 0.4, step: 0.01, label: "Edge Softness" },
    noiseScale: { value: 10.0, min: 1.0, max: 30.0, step: 0.5, label: "Noise Scale" },
    noiseStrength: { value: 0.15, min: 0.0, max: 0.4, step: 0.01, label: "Noise Strength" },
    greyLevel: { value: 0.55, min: 0.0, max: 1.0, step: 0.05, label: "Grey Level" },
  });

  const controls = useControls("Trail Background", {
    "Fade & Motion": folder({
      fadeRate: { value: 1.5, min: 0.1, max: 5.0, step: 0.1, label: "Fade Rate" },
      advection1: { value: 0.15, min: 0, max: 1.0, step: 0.01, label: "Advection (fine)" },
      advection2: { value: 0.3, min: 0, max: 1.0, step: 0.01, label: "Advection (coarse)" },
      pointerLerp: { value: 15, min: 1, max: 30, step: 1, label: "Pointer Smoothing" },
    }),
    "Trail Size": folder({
      speedMin: { value: 0.075, min: 0.01, max: 0.2, step: 0.005, label: "Min Radius" },
      speedMax: { value: 0.25, min: 0.1, max: 0.8, step: 0.01, label: "Max Radius" },
      speedScale: { value: 5.0, min: 1.0, max: 15.0, step: 0.5, label: "Intensity Scale" },
    }),
    "Trail Colors": folder({
      colorOuter: { value: { r: 199, g: 199, b: 204 }, label: "Outer Halo" },
      colorMid: { value: { r: 217, g: 217, b: 222 }, label: "Mid Ring" },
      colorCore: { value: { r: 184, g: 184, b: 191 }, label: "Core" },
    }),
  });

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
      }}
    >
      <Canvas
        orthographic
        camera={{
          left: -window.innerWidth / 2,
          right: window.innerWidth / 2,
          top: window.innerHeight / 2,
          bottom: -window.innerHeight / 2,
          near: 1,
          far: 1000,
          position: [0, 0, 10],
        }}
        gl={createWebGLRendererAlpha}
        onCreated={({ gl }) => {
          logWebGPU("FilmCanvas", "Canvas created", { rendererType: getRendererType(gl) });
        }}
        onPointerMissed={() => {}}
      >
        <FilmController />
        <Suspense fallback={null}>
          <FilmBackground controls={controls} />
          <FilmImagePlanes revealControls={revealControls} />
          <FilmEffects />
        </Suspense>
      </Canvas>
    </div>
  );
}
