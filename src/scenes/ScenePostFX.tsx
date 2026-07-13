import { useContext, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  ChromaticAberration,
  DepthOfField,
  EffectComposer,
  EffectComposerContext,
  N8AO,
  Noise,
  ToneMapping,
  Vignette,
} from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { usePostFxControlsStore } from "../store/postFx";
import { toToneMappingMode } from "./postFxToneMapping";
import ColorGrade from "./ColorGradeEffect";
import DissolveTransition from "./transition/DissolveEffect";
import { postFxComposerRef } from "./postFxComposerRef";

const drawBufferSize = new THREE.Vector2();

/** @react-three/postprocessing sizes the composer to CSS pixels; match the GL drawing buffer. */
function SyncComposerDrawingBuffer() {
  const { gl, size, viewport } = useThree();
  const { composer } = useContext(EffectComposerContext);

  useEffect(() => {
    if (!composer) return;
    postFxComposerRef.current = composer;
    gl.getDrawingBufferSize(drawBufferSize);
    composer.setSize(drawBufferSize.x, drawBufferSize.y);
    return () => {
      if (postFxComposerRef.current === composer) postFxComposerRef.current = null;
    };
  }, [gl, composer, size.width, size.height, viewport.dpr]);

  return null;
}

/** Spatial effects feed the dissolve; full-frame grading stays active over every transition pixel. */
export default function ScenePostFX() {
  const fx = usePostFxControlsStore((s) => s.controls);
  const stackOn = fx.enabled;

  return (
    <EffectComposer multisampling={0} stencilBuffer={false}>
      <SyncComposerDrawingBuffer />
      {stackOn && fx.ao.enabled ? (
        <N8AO
          intensity={fx.ao.intensity}
          aoRadius={fx.ao.radius}
          distanceFalloff={fx.ao.distanceFalloff}
          aoSamples={fx.ao.aoSamples}
          denoiseSamples={fx.ao.denoiseSamples}
          denoiseRadius={fx.ao.denoiseRadius}
          halfRes={fx.ao.halfRes}
          quality={fx.ao.quality}
          screenSpaceRadius
          depthAwareUpsampling
        />
      ) : null}
      {stackOn && fx.chromaticAberration.enabled ? (
        <ChromaticAberration
          offset={[fx.chromaticAberration.offsetX, fx.chromaticAberration.offsetY]}
          radialModulation={fx.chromaticAberration.radialModulation}
          modulationOffset={fx.chromaticAberration.modulationOffset}
        />
      ) : null}
      {stackOn && fx.dof.enabled ? (
        <DepthOfField
          worldFocusDistance={fx.dof.worldFocusDistance}
          worldFocusRange={fx.dof.worldFocusRange}
          bokehScale={fx.dof.bokehScale}
        />
      ) : null}
      <DissolveTransition />
      {stackOn && fx.colorGrade.enabled ? <ColorGrade /> : null}
      <ToneMapping
        mode={
          stackOn && fx.toneMapping.enabled
            ? toToneMappingMode(fx.toneMapping.mode)
            : ToneMappingMode.LINEAR
        }
        opacity={stackOn && fx.toneMapping.enabled ? fx.toneMapping.amount : 0}
      />
      {stackOn && fx.grain.enabled ? <Noise opacity={fx.grain.opacity} /> : null}
      {stackOn && fx.vignette.enabled ? (
        <Vignette
          eskil={fx.vignette.eskil}
          offset={fx.vignette.offset}
          darkness={fx.vignette.darkness}
        />
      ) : null}
    </EffectComposer>
  );
}
