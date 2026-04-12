// @ts-nocheck
import React, { Suspense, useEffect, useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import TestModel from "../../models/TestModel";
import { useTestSceneControlsStore } from "../../store/testSceneControls";
import { applyModelMaterialTuning, normalizeModelBounds } from "./sceneUtils";

export default function TestScene() {
  const controls = useTestSceneControlsStore();
  const modelRef = useRef(null);
  const didNormalizeRef = useRef(false);
  const didCloneMaterialsRef = useRef(false);

  useLayoutEffect(() => {
    const model = modelRef.current;
    if (!model || didNormalizeRef.current) return;
    normalizeModelBounds(model);
    didNormalizeRef.current = true;
  }, []);

  useEffect(() => {
    const model = modelRef.current;
    if (!model) return;

    applyModelMaterialTuning(model, {
      roughnessScale: controls.roughnessScale,
      metalnessScale: controls.metalnessScale,
      envReflection: controls.envReflection,
      clearcoat: controls.clearcoat,
      clearcoatRoughness: controls.clearcoatRoughness,
      cloneStandardMaterials: !didCloneMaterialsRef.current,
    });

    didCloneMaterialsRef.current = true;
  }, [
    controls.clearcoat,
    controls.clearcoatRoughness,
    controls.envReflection,
    controls.metalnessScale,
    controls.roughnessScale,
  ]);

  return (
    <>
      <directionalLight
        position={[controls.directionalX, controls.directionalY, controls.directionalZ]}
        intensity={controls.directionalIntensity}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-normalBias={0.02}
        shadow-bias={-0.0001}
      />
      <ambientLight intensity={controls.ambientIntensity} />
      <directionalLight position={[-5, 4, 3]} intensity={controls.fillIntensity} color="#d9e4f5" />
      <directionalLight position={[0, 3, -10]} intensity={controls.rimIntensity} color="#ffe8d0" />
      <spotLight
        position={[3, 8, -2]}
        intensity={controls.accentIntensity}
        color="#e0e8ff"
        angle={Math.PI / 5}
        penumbra={0.85}
        target-position={[0, 0, 0]}
      />
      <Suspense fallback={null}>
        <group
          scale={controls.modelScale}
          position={[controls.modelPosX, controls.modelPosY, controls.modelPosZ]}
          rotation={[
            THREE.MathUtils.degToRad(controls.modelRotX),
            THREE.MathUtils.degToRad(controls.modelRotY),
            THREE.MathUtils.degToRad(controls.modelRotZ),
          ]}
        >
          <group ref={modelRef}>
            <TestModel position={[0, 0, 0]} />
          </group>
        </group>
      </Suspense>
    </>
  );
}
