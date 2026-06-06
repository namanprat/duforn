// @ts-nocheck
import React, { useEffect, useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { PerspectiveCamera } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useWebglStore } from "../store/webgl";
import { useHomeSceneControlsStore } from "../store/homeScene";

/** Initial inspector values (also in `DEFAULT_HOME_SCENE_CONTROLS.spotlight`). */
export const HOME_SCENE_INSPECTOR_LIGHT = {
  position: [-3.914, 0, -27.092] as const,
  intensity: 18.87,
  color: "#ffffff",
  distance: 0,
  angle: 1.571,
  penumbra: 0,
  decay: 2,
  castShadow: false,
};

function InspectorPointCamera({ position, lookAt, fov, visible }) {
  const camRef = useRef(null);
  const lookAtVec = useRef(new THREE.Vector3());

  useLayoutEffect(() => {
    lookAtVec.current.set(lookAt[0], lookAt[1], lookAt[2]);
  }, [lookAt]);

  useFrame(() => {
    const cam = camRef.current;
    if (!cam || !visible) return;
    cam.position.set(position[0], position[1], position[2]);
    cam.lookAt(lookAtVec.current);
    cam.fov = fov;
    cam.updateProjectionMatrix();
  });

  if (!visible) return null;

  return (
    <PerspectiveCamera
      ref={camRef}
      makeDefault={false}
      position={position}
      fov={fov}
      near={0.1}
      far={500}
    />
  );
}

/**
 * Home-only SpotLight + optional fixed POV camera at the inspector pose (main route).
 * Tweaked live via Leva in dev (`HomeSceneSpotLightGui`).
 */
export function HomeSceneSpotLight() {
  const activePage = useWebglStore((s) => s.activePage);
  const spotlight = useHomeSceneControlsStore((s) => s.controls.spotlight);
  const lightRef = useRef(null);
  const targetRef = useRef(null);
  const { scene } = useThree();

  useEffect(() => {
    const light = lightRef.current;
    const target = targetRef.current;
    if (!light || !target) return undefined;

    scene.add(target);
    light.target = target;

    return () => {
      scene.remove(target);
    };
  }, [scene]);

  useFrame(() => {
    const light = lightRef.current;
    const target = targetRef.current;
    if (!light || !target) return;

    const s = useHomeSceneControlsStore.getState().controls.spotlight;

    light.position.set(s.x, s.y, s.z);
    target.position.set(s.targetX, s.targetY, s.targetZ);
    light.target.updateMatrixWorld();

    light.intensity = s.intensity;
    light.color.set(s.color);
    light.distance = s.distance;
    light.angle = s.angle;
    light.penumbra = s.penumbra;
    light.decay = s.decay;
    light.castShadow = s.castShadow;
  });

  if (activePage !== "main" && activePage !== "viewer") return null;

  const inspectorFov = THREE.MathUtils.radToDeg(spotlight.angle);

  return (
    <>
      <object3D ref={targetRef} />
      <spotLight ref={lightRef} />
      <InspectorPointCamera
        position={[spotlight.x, spotlight.y, spotlight.z]}
        lookAt={[spotlight.targetX, spotlight.targetY, spotlight.targetZ]}
        fov={inspectorFov}
        visible={spotlight.showInspectorCamera}
      />
    </>
  );
}

export default HomeSceneSpotLight;
