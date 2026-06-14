// @ts-nocheck
import React, { useLayoutEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import WebsiteModel from "../models/gen/Website";
import { applyModelMaterialTuning, normalizeModelBounds } from "./sceneUtils";
import { findWaterMesh } from "./water/findWaterMesh";
import WaterRipples from "./water/WaterRipples";
import { useHomeSceneControlsStore } from "../store/homeScene";
export default function Main() {
  const modelRef = useRef(null);
  const outerRef = useRef(null);
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
        console.warn("[Main] water mesh not found in model");
      }

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
    const model = useHomeSceneControlsStore.getState().controls.model;
    const outer = outerRef.current;
    const inner = modelRef.current;
    if (!outer || !inner) return;

    outer.scale.setScalar(model.scale);
    inner.position.set(model.x, model.y, model.z);
    inner.rotation.set(model.rx, model.ry, model.rz);
  });

  return (
    <>
      <group ref={outerRef}>
        <group ref={modelRef}>
          <WebsiteModel />
        </group>
      </group>
      {waterMesh && <WaterRipples mesh={waterMesh} modelRef={modelRef} />}
    </>
  );
}
