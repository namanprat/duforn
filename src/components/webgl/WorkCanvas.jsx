import { Canvas } from "@react-three/fiber";
import React, { Suspense, useLayoutEffect, useRef } from "react";
import { Environment } from "@react-three/drei";
import { createRendererOpaque, getRendererType } from "./createWebGPURenderer.js";
import CameraRig from "./CameraRig.jsx";
import Effects from "./Effects.jsx";
import Particles from "./Particles.jsx";
import WorkModel from "../../models/WorkModel.jsx";
import { WorkClothStripScene } from "../../work/WorkClothStrip.jsx";
import { applyModelMaterialTuning, normalizeModelBounds } from "./sceneUtils.js";
import { logWebGPU } from "../../lib/webgpu/debugWebGPU.js";

const WORK_TUNE = {
  roughnessScale: 1.0,
  metalnessScale: 0.9,
  envReflection: 1.2,
  clearcoat: 0.05,
  clearcoatRoughness: 0.25,
};

function WorkScene() {
  const model = { x: 0.0, y: -5.6, z: -16, scale: 1.0 };

  const modelRef = useRef(null);
  const didInitRef = useRef(false);

  useLayoutEffect(() => {
    const m = modelRef.current;
    if (!m || didInitRef.current) return;
    normalizeModelBounds(m);
    applyModelMaterialTuning(m, WORK_TUNE);
    didInitRef.current = true;
  }, []);

  return (
    <>
      <Environment files="/home.hdr" background={false} />
      <fogExp2 attach="fog" color={0xe6e4dc} density={0.0715} />

      <CameraRig />
      <Effects bloomStrength={0.04} vignetteDarkness={0.12} dofMaxBlur={0.006} />
      <Particles count={200} />

      <spotLight
        position={[10, 15, 12]}
        intensity={1260}
        color="#fff5e6"
        angle={Math.PI / 5}
        penumbra={0.5}
        decay={1.6}
        distance={60}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
        shadow-radius={4}
      />
      <spotLight
        position={[0, 10, -15]}
        intensity={1080}
        color="#ffffff"
        angle={Math.PI / 4}
        penumbra={0.6}
        decay={1.5}
        distance={60}
      />
      <pointLight position={[-15, 0, 10]} intensity={0.9} color="#ffffff" decay={2} distance={30} />
      <ambientLight intensity={0.54} color="#ffffff" />

      <group position={[model.x, model.y, model.z]} scale={model.scale}>
        <group ref={modelRef}>
          <WorkModel />
        </group>
      </group>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -6, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <shadowMaterial transparent opacity={0.15} />
      </mesh>

      <WorkClothStripScene />
    </>
  );
}

export default function WorkCanvas() {
  return (
    <div
      id="work-background"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
        pointerEvents: "auto",
      }}
    >
      <Canvas
        camera={{ position: [0, 1, 5], fov: 75 }}
        gl={createRendererOpaque}
        shadows
        onCreated={({ gl }) => {
          logWebGPU("WorkCanvas", "Canvas created", { rendererType: getRendererType(gl) });
        }}
      >
        <color attach="background" args={["#e8e6de"]} />
        <Suspense fallback={null}>
          <WorkScene />
        </Suspense>
      </Canvas>
    </div>
  );
}
