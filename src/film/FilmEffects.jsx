import React from "react";
import { ChromaticAberration, EffectComposer, Noise } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { Vector2 } from "three";

export default function FilmEffects() {
  return (
    <EffectComposer multisampling={0} disableNormalPass>
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={new Vector2(0.0035, 0.0018)}
        radialModulation
        modulationOffset={0.16}
      />
      <Noise blendFunction={BlendFunction.OVERLAY} opacity={0.02} />
    </EffectComposer>
  );
}
