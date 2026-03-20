import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette, Noise } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import { CRTShader } from "../../scripts/shaders/post-fx.js";

function CRTPass() {
  const materialRef = useRef();

  const uniforms = useMemo(
    () => ({
      tDiffuse: { value: null },
      scanlineIntensity: { value: 0.5 },
      scanlineCount: { value: 280.0 },
      time: { value: 0.0 },
      yOffset: { value: 0.0 },
      brightness: { value: 1.0 },
      contrast: { value: 1.05 },
      saturation: { value: 1.05 },
      bloomIntensity: { value: 0.1 },
      bloomThreshold: { value: 0.5 },
      rgbShift: { value: 0.002 },
      adaptiveIntensity: { value: 0.5 },
      vignetteStrength: { value: 0.3 },
      curvature: { value: 0.5 },
      flickerStrength: { value: 0.0 },
    }),
    [],
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  return (
    <shaderPass
      args={[
        {
          uniforms,
          vertexShader: CRTShader.vertexShader,
          fragmentShader: CRTShader.fragmentShader,
        },
      ]}
      ref={materialRef}
    />
  );
}

export default function ArchiveEffects() {
  return (
    <EffectComposer>
      <Bloom intensity={0.1} luminanceThreshold={0.8} luminanceSmoothing={0.35} mipmapBlur />
      <Vignette offset={1.0} darkness={0.15} blendFunction={BlendFunction.NORMAL} />
      <Noise opacity={0.03} blendFunction={BlendFunction.OVERLAY} />
    </EffectComposer>
  );
}
