// @ts-nocheck
import React, { Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import * as THREE from "three";
import TestModel from "../../models/generated/TestModel";
import { useTestSceneControlsStore } from "../../store/testSceneControls";
import { applyModelMaterialTuning, normalizeModelBounds } from "./sceneUtils";
import WaterController from "./water/WaterController";

function findWaterMesh(root) {
  let found = null;
  root.traverse((o) => {
    if (!o.isMesh) return;
    if (found) return;
    const meshNameMatch = /water/i.test(o.name ?? "");
    const matName = Array.isArray(o.material)
      ? o.material.map((m) => m?.name ?? "").join(" ")
      : (o.material?.name ?? "");
    const matNameMatch = /water/i.test(matName);
    const parentNameMatch = /water/i.test(o.parent?.name ?? "");
    if (meshNameMatch || matNameMatch || parentNameMatch) {
      found = o;
    }
  });
  return found;
}

export default function TestScene() {
  const controls = useTestSceneControlsStore();
  const modelRef = useRef(null);
  const didNormalizeRef = useRef(false);
  const didCloneMaterialsRef = useRef(false);
  const [waterMesh, setWaterMesh] = useState(null);

  const tryInit = () => {
    const model = modelRef.current;
    if (!model) return false;
    let hasMesh = false;
    model.traverse((o) => {
      if (o.isMesh) hasMesh = true;
    });
    if (!hasMesh) return false;
    if (!didNormalizeRef.current) {
      normalizeModelBounds(model);
      didNormalizeRef.current = true;
    }
    if (!waterMesh) {
      const mesh = findWaterMesh(model);
      if (mesh) {
        mesh.userData.isWater = true;
        setWaterMesh(mesh);
      } else {
        console.warn("[TestScene] water mesh not found in test.glb");
      }
    }
    return true;
  };

  useLayoutEffect(() => {
    if (tryInit()) return;
    let raf = 0;
    const tick = () => {
      if (tryInit()) return;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
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
      {waterMesh && <WaterController mesh={waterMesh} modelRoot={modelRef.current} />}
    </>
  );
}
