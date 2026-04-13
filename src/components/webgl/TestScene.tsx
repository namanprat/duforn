// @ts-nocheck
import React, { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import TestModel from "../../models/TestModel";
import { useTestSceneControlsStore } from "../../store/testSceneControls";
import { applyModelMaterialTuning, normalizeModelBounds } from "./sceneUtils";
import {
  createWaterMaterial,
  RippleSimulation,
  updateWaterMaterial,
} from "./materials/TestWaterRuntime";

const DOWN_EVENT = "pointerdown";
const UP_EVENT = "pointerup";

function toUvFromHit(intersection, mesh) {
  if (intersection?.uv) return intersection.uv;
  mesh.geometry.computeBoundingBox();
  const box = mesh.geometry.boundingBox;
  if (!box) return null;

  const local = mesh.worldToLocal(intersection.point.clone());
  const u = THREE.MathUtils.mapLinear(local.x, box.min.x, box.max.x, 0, 1);
  const v = THREE.MathUtils.mapLinear(local.z, box.min.z, box.max.z, 0, 1);
  return new THREE.Vector2(THREE.MathUtils.clamp(u, 0, 1), THREE.MathUtils.clamp(v, 0, 1));
}

export default function TestScene() {
  const controls = useTestSceneControlsStore();
  const modelRef = useRef(null);
  const waterMeshRef = useRef(null);
  const waterMaterialRef = useRef(null);
  const didNormalizeRef = useRef(false);
  const didCloneMaterialsRef = useRef(false);
  const pointerDownRef = useRef(false);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const simulation = useMemo(() => new RippleSimulation(128, 0.985), []);
  const [waterMesh, setWaterMesh] = useState(null);

  const pointer = useThree((state) => state.pointer);
  const camera = useThree((state) => state.camera);

  useLayoutEffect(() => {
    const model = modelRef.current;
    if (!model || didNormalizeRef.current) return;
    normalizeModelBounds(model);
    didNormalizeRef.current = true;
  }, []);

  useEffect(() => {
    const onDown = () => {
      pointerDownRef.current = true;
    };
    const onUp = () => {
      pointerDownRef.current = false;
    };

    window.addEventListener(DOWN_EVENT, onDown);
    window.addEventListener(UP_EVENT, onUp);
    return () => {
      window.removeEventListener(DOWN_EVENT, onDown);
      window.removeEventListener(UP_EVENT, onUp);
    };
  }, []);

  useEffect(() => () => simulation.dispose(), [simulation]);

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
      materialFactory: (sourceMaterial, child) => {
        if (child.userData?.isWaterPlane) return sourceMaterial;
        return sourceMaterial;
      },
    });

    didCloneMaterialsRef.current = true;
  }, [
    controls.clearcoat,
    controls.clearcoatRoughness,
    controls.envReflection,
    controls.metalnessScale,
    controls.roughnessScale,
  ]);

  useEffect(() => {
    if (!waterMesh) return;
    const prevMaterial = waterMesh.material;

    const material = createWaterMaterial(simulation, controls);
    waterMesh.material = material;
    waterMeshRef.current = waterMesh;
    waterMaterialRef.current = material;

    return () => {
      waterMesh.material = prevMaterial;
      material.dispose();
      waterMaterialRef.current = null;
    };
  }, [waterMesh, simulation]);

  useFrame((state, delta) => {
    simulation.step();
    updateWaterMaterial(waterMaterialRef.current, controls, state.clock.elapsedTime);

    if (!pointerDownRef.current || !waterMeshRef.current) return;

    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObject(waterMeshRef.current, false);
    const hit = hits[0];
    if (!hit) return;

    const uv = toUvFromHit(hit, waterMeshRef.current);
    if (!uv) return;

    simulation.addDrop(
      uv.x,
      uv.y,
      controls.waterDropRadius,
      controls.waterInteractionStrength * THREE.MathUtils.clamp(delta * 60, 0.3, 1.2),
    );
  });

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
            <TestModel position={[0, 0, 0]} onWaterMeshReady={setWaterMesh} />
          </group>
        </group>
      </Suspense>
    </>
  );
}
