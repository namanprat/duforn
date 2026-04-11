// @ts-nocheck
import React, { useLayoutEffect, useRef } from "react";
import { applyModelMaterialTuning, normalizeModelBounds } from "./sceneUtils";
import SceneModel from "../../models/SceneModel";

const TUNE = {
  roughnessScale: 0.9,
  metalnessScale: 1.1,
  envReflection: 1.5,
  clearcoat: 0.08,
  clearcoatRoughness: 0.2,
};

export default function HomeScene() {
  const modelRef = useRef(null);
  const didInitializeRef = useRef(false);

  useLayoutEffect(() => {
    const model = modelRef.current;
    if (!model || didInitializeRef.current) return;
    normalizeModelBounds(model);
    applyModelMaterialTuning(model, TUNE);
    didInitializeRef.current = true;
  }, []);

  return (
    <group position={[0, -1, -5]}>
      <directionalLight
        position={[4.2, 7.5, 6.2]}
        intensity={3.25}
        color={0xffffff}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-normalBias={0.02}
        shadow-bias={-0.0001}
      >
        <orthographicCamera attach="shadow-camera" args={[-7, 7, 7, -7, 1, 30]} />
      </directionalLight>
      <ambientLight intensity={0.18} color="#fff5ff" />
      {/* Fill light — cool lavender from opposite side */}
      <directionalLight position={[-3, 3, 2]} intensity={0.8} color="#c8c0ff" />
      {/* Rim/back light — warm edge highlights for depth separation */}
      <directionalLight position={[0, 2, -8]} intensity={1.2} color="#ffe8d0" />
      {/* Accent spot — subtle pool of light */}
      <spotLight
        position={[2, 5, -3]}
        intensity={0.6}
        color="#e0e8ff"
        angle={Math.PI / 6}
        penumbra={0.8}
        target-position={[0, 0, 0]}
      />
      <group ref={modelRef}>
        <SceneModel />
      </group>
    </group>
  );
}
