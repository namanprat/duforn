import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { buildProjectDetailBackgroundMaterial } from "./backgroundMaterials";
import { usePointerField } from "./usePointerField";
import { PROJECT_BG_FALLBACK } from "./sceneConfig";

export default function ProjectBackground() {
  const meshRef = useRef<THREE.Mesh>(null);
  const systemRef = useRef<ReturnType<typeof buildProjectDetailBackgroundMaterial> | null>(null);
  const [ready, setReady] = useState(false);
  const { pointerRef, velocityRef, step } = usePointerField();
  const { size } = useThree();

  useEffect(() => {
    const system = buildProjectDetailBackgroundMaterial(PROJECT_BG_FALLBACK);
    systemRef.current = system;
    setReady(true);
    return () => {
      system.material.dispose();
      systemRef.current = null;
      setReady(false);
    };
  }, []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    step(dt, PROJECT_BG_FALLBACK.pointerLerp);

    if (meshRef.current) {
      meshRef.current.position.set(0, 0, -25);
      meshRef.current.scale.set(size.width, size.height, 1);
    }

    const system = systemRef.current;
    if (!system) return;

    system.uniforms.uTime.value = state.clock.elapsedTime;
    system.uniforms.uResolution.value.set(size.width, size.height);
    system.uniforms.uPointer.value.copy(pointerRef.current);
    system.uniforms.uVelocity.value.copy(velocityRef.current);
  });

  if (!ready || !systemRef.current) return null;

  return (
    <mesh ref={meshRef} renderOrder={-5}>
      <planeGeometry args={[1, 1]} />
      <primitive object={systemRef.current.material} attach="material" />
    </mesh>
  );
}
