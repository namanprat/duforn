import { Canvas } from "@react-three/fiber";
import React, { Suspense, useRef, useEffect, useState } from "react";
import { createWebGLRendererAlpha, getRendererType } from "./createWebGPURenderer.js";
import FilmBackground from "../../film/FilmBackground.jsx";
import FilmImagePlanes from "../../film/FilmImagePlanes.jsx";
import FilmEffects from "../../film/FilmEffects.jsx";
import { useFilmController } from "../../film/useFilmController.js";
import { logWebGPU } from "../../lib/webgpu/debugWebGPU.js";

function FilmController() {
  useFilmController();
  return null;
}

export default function FilmCanvas() {
  const containerRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const el = document.querySelector('[data-page-container="true"][data-page-namespace="film"]');
      containerRef.current = el;
      setReady(true);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

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
          <FilmBackground />
          {ready && <FilmImagePlanes containerRef={containerRef} />}
          <FilmEffects />
        </Suspense>
      </Canvas>
    </div>
  );
}
