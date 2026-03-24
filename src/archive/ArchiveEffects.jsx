import React from "react";
import { EffectComposer, Bloom, Vignette, Noise } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

export default function ArchiveEffects() {
  return (
    <EffectComposer>
      <Bloom intensity={0.1} luminanceThreshold={0.8} luminanceSmoothing={0.35} mipmapBlur />
      <Vignette offset={1.0} darkness={0.15} blendFunction={BlendFunction.NORMAL} />
      <Noise opacity={0.03} blendFunction={BlendFunction.OVERLAY} />
    </EffectComposer>
  );
}
