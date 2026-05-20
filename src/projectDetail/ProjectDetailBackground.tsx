// @ts-nocheck
import React, { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { pickGpuBranchAsync } from "../lib/rendering";
import {
  buildProjectDetailBackgroundMaterialWebGl,
  buildProjectDetailBackgroundMaterialWebGpu,
} from "../lib/projectDetail/projectDetailBackgroundMaterials";
import { usePointerField } from "./usePointerField";

export default function ProjectDetailBackground({ controls }) {
  const meshRef = useRef(null);
  const systemRef = useRef(null);
  const [ready, setReady] = useState(false);
  const { gl, size } = useThree();
  const { pointerRef, velocityRef, step } = usePointerField();

  useEffect(() => {
    let cancelled = false;

    async function build() {
      const system = await pickGpuBranchAsync(gl, {
        webgpu: () => buildProjectDetailBackgroundMaterialWebGpu(controls),
        webgl: () => buildProjectDetailBackgroundMaterialWebGl(controls),
      });

      if (cancelled) {
        system.material.dispose();
        return;
      }

      systemRef.current = system;
      setReady(true);
    }

    build();

    return () => {
      cancelled = true;
      setReady(false);
      systemRef.current?.material.dispose();
      systemRef.current = null;
    };
  }, [controls, gl]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    step(dt, controls.pointerLerp);

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
