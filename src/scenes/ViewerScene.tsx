// @ts-nocheck
import React, { useLayoutEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { GLTF_URL_TEST } from "../models/urls";
import { applyModelMaterialTuning, normalizeModelBounds } from "./sceneUtils";
import { useViewerSceneControlsStore } from "../store/viewerScene";

function TestGlbModel() {
  const { scene } = useGLTF(GLTF_URL_TEST);
  return <primitive object={scene} />;
}

/** Loads `/test.glb` with material tuning and Leva-driven transform. */
export default function ViewerScene() {
  const modelRef = useRef(null);
  const outerRef = useRef(null);
  const didInitializeRef = useRef(false);

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
      applyModelMaterialTuning(model);

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

  useFrame(() => {
    const model = useViewerSceneControlsStore.getState().controls.model;
    const outer = outerRef.current;
    const inner = modelRef.current;
    if (!outer || !inner) return;

    outer.scale.setScalar(model.scale);
    inner.position.set(model.x, model.y, model.z);
    inner.rotation.set(model.rx, model.ry, model.rz);
  });

  return (
    <group ref={outerRef}>
      <group ref={modelRef}>
        <TestGlbModel />
      </group>
    </group>
  );
}
