import { Canvas } from "@react-three/fiber";
import React, { Suspense } from "react";
import { Environment } from "@react-three/drei";
import ArchiveTube from "../../archive/ArchiveTube.jsx";
import ArchiveGrid from "../../archive/ArchiveGrid.jsx";
import ArchiveLogo from "../../archive/ArchiveLogo.jsx";
import ArchiveEffects from "../../archive/ArchiveEffects.jsx";
import { useArchiveController } from "../../archive/useArchiveController.js";

function ArchiveScene() {
  const { state, setTubeMeshes } = useArchiveController();

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <Environment
        files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_09_1k.hdr"
        background={false}
      />
      <ArchiveTube controllerState={state} setTubeMeshes={setTubeMeshes} />
      <ArchiveGrid controllerState={state} />
      <ArchiveLogo controllerState={state} />
      <ArchiveEffects />
    </>
  );
}

export default function ArchiveCanvas() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
        pointerEvents: "none",
        background: "#000",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 6.5], fov: 75 }}
        gl={{ antialias: true, alpha: true }}
        dpr={Math.min(window.devicePixelRatio || 1, 1.75)}
      >
        <color attach="background" args={["#000000"]} />
        <Suspense fallback={null}>
          <ArchiveScene />
        </Suspense>
      </Canvas>
    </div>
  );
}
