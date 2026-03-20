import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";

export default function ArchiveLogo({ controllerState }) {
  const groupRef = useRef();
  const { scene } = useGLTF("/models/logo.glb");
  const [model, setModel] = useState(null);

  useEffect(() => {
    if (!scene) return;

    const cloned = scene.clone(true);
    const box = new THREE.Box3().setFromObject(cloned);
    const center = box.getCenter(new THREE.Vector3());

    cloned.traverse((child) => {
      if (child.isMesh && child.geometry) {
        child.geometry = child.geometry.clone();
        child.geometry.translate(-center.x, -center.y, -center.z);
        if (child.material) {
          child.material = child.material.clone();
          child.material.transparent = true;
          child.material.opacity = 0.9;
          child.material.envMapIntensity = 1.0;
          child.material.needsUpdate = true;
        }
      }
    });

    cloned.scale.set(70, 70, 70);
    setModel(cloned);
  }, [scene]);

  useFrame((state) => {
    if (!groupRef.current || !model) return;
    const s = controllerState.current;
    const elapsed = state.clock.elapsedTime;
    const dt = Math.min(state.clock.getDelta(), 0.05);
    const fpsFactor = Math.min(dt / 0.01666, 3.0);
    const lerpFactor = Math.min(0.05 * fpsFactor, 1.0);

    groupRef.current.rotation.y = elapsed * 0.2 + s.tubeAngle * 0.5;

    const targetLookX = (s.targetCenterUv.x - 0.5) * 2;
    const targetLookY = (s.targetCenterUv.y - 0.5) * 2;
    groupRef.current.rotation.x += (targetLookY * 0.5 - groupRef.current.rotation.x) * lerpFactor;
    groupRef.current.rotation.z += (-targetLookX * 0.5 - groupRef.current.rotation.z) * lerpFactor;
  });

  if (!model) return null;

  return <primitive ref={groupRef} object={model} />;
}
