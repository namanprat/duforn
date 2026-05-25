// @ts-nocheck
import React, { useLayoutEffect, useRef, useState } from "react";
import MainModel from "../models/generated/MainModel";
import { applyModelMaterialTuning, normalizeModelBounds } from "./sceneUtils";
import { findWaterMesh } from "./water/findWaterMesh";
import WaterRipples from "./water/WaterRipples";

const MODEL_SCALE = 13;

const MATERIAL_TUNE = {
  roughnessScale: 0.96,
  metalnessScale: 0.88,
  envReflection: 1.2,
  clearcoat: 0.05,
  clearcoatRoughness: 0.26,
};

export default function MainScene({ shadowMapSize = 1536 }) {
  const modelRef = useRef(null);
  const didInitializeRef = useRef(false);
  const [waterMesh, setWaterMesh] = useState(null);

  useLayoutEffect(() => {
    const tryInit = () => {
      const model = modelRef.current;
      if (!model || didInitializeRef.current) return false;

      let hasMesh = false;
      model.traverse((o) => {
        if (o.isMesh) hasMesh = true;
      });
      if (!hasMesh) return false;

      normalizeModelBounds(model);

      const mesh = findWaterMesh(model);
      if (mesh) {
        mesh.userData.isWater = true;
        setWaterMesh(mesh);
      } else {
        console.warn("[MainScene] water mesh not found in main.glb");
      }

      applyModelMaterialTuning(model, MATERIAL_TUNE);

      didInitializeRef.current = true;
      return true;
    };

    if (tryInit()) return undefined;

    let raf = 0;
    const tick = () => {
      if (tryInit()) return;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <group scale={MODEL_SCALE}>
      <directionalLight
        position={[6, 8, 4]}
        intensity={2.35}
        castShadow
        shadow-mapSize={[shadowMapSize, shadowMapSize]}
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
        <MainModel />
      </group>
      {waterMesh && <WaterRipples mesh={waterMesh} />}
    </group>
  );
}
