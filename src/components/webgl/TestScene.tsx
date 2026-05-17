// @ts-nocheck
import React, { useLayoutEffect, useRef } from "react";
import TestModel from "../../models/generated/TestModel";
import { applyModelMaterialTuning, normalizeModelBounds } from "./sceneUtils";

const MODEL_SCALE = 13;

const MATERIAL_TUNE = {
  roughnessScale: 0.96,
  metalnessScale: 0.88,
  envReflection: 1.2,
  clearcoat: 0.05,
  clearcoatRoughness: 0.26,
};

export default function TestScene() {
  const modelRef = useRef(null);
  const didInitializeRef = useRef(false);

  useLayoutEffect(() => {
    const model = modelRef.current;
    if (!model || didInitializeRef.current) return;
    normalizeModelBounds(model);
    applyModelMaterialTuning(model, MATERIAL_TUNE);
    didInitializeRef.current = true;
  }, []);

  return (
    <group scale={MODEL_SCALE}>
      <directionalLight
        position={[6, 8, 4]}
        intensity={2.35}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-normalBias={0.02}
        shadow-bias={-0.0001}
      />
      <ambientLight intensity={0.22} />
      <directionalLight position={[-5, 4, 3]} intensity={0.6} color="#d9e4f5" />
      <directionalLight position={[0, 3, -10]} intensity={0.9} color="#ffe8d0" />
      <spotLight
        position={[3, 8, -2]}
        intensity={0.45}
        color="#e0e8ff"
        angle={Math.PI / 5}
        penumbra={0.85}
        target-position={[0, 0, 0]}
      />
      <group ref={modelRef}>
        <TestModel />
      </group>
    </group>
  );
}
