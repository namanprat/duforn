import { useMemo, type ReactNode } from "react";
import {
  ChromaticAberration,
  EffectComposer,
  Noise,
  ToneMapping,
  Vignette,
} from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { Vector2 } from "three";
import { usePostFxControlsStore } from "../store/postFx";
import SceneN8AOPass from "./SceneN8AOPass";

const TONE_MAPPING_MODES: Record<string, ToneMappingMode> = {
  LINEAR: ToneMappingMode.LINEAR,
  REINHARD: ToneMappingMode.REINHARD,
  REINHARD2: ToneMappingMode.REINHARD2,
  REINHARD2_ADAPTIVE: ToneMappingMode.REINHARD2_ADAPTIVE,
  UNCHARTED2: ToneMappingMode.UNCHARTED2,
  OPTIMIZED_CINEON: ToneMappingMode.OPTIMIZED_CINEON,
  CINEON: ToneMappingMode.CINEON,
  ACES_FILMIC: ToneMappingMode.ACES_FILMIC,
  AGX: ToneMappingMode.AGX,
  NEUTRAL: ToneMappingMode.NEUTRAL,
};

/**
 * Subtle realism stack: AO, ACES tonemapping, edge-weighted chromatic aberration,
 * restrained vignette, and film grain.
 */
export default function ScenePostFX({ children }: { children?: ReactNode }) {
  const fx = usePostFxControlsStore((s) => s.controls);

  const chromaticOffset = useMemo(
    () => new Vector2(fx.chromaticAberration.offsetX, fx.chromaticAberration.offsetY),
    [fx.chromaticAberration.offsetX, fx.chromaticAberration.offsetY],
  );

  if (!fx.enabled) return null;

  const toneMode = TONE_MAPPING_MODES[fx.toneMapping.mode] ?? ToneMappingMode.ACES_FILMIC;

  return (
    <EffectComposer multisampling={0} stencilBuffer={false}>
      {fx.ao.enabled ? (
        <SceneN8AOPass
          intensity={fx.ao.intensity}
          radius={fx.ao.radius}
          distanceFalloff={fx.ao.distanceFalloff}
          aoSamples={fx.ao.aoSamples}
          denoiseSamples={fx.ao.denoiseSamples}
          denoiseRadius={fx.ao.denoiseRadius}
          halfRes={fx.ao.halfRes}
          quality={fx.ao.quality}
        />
      ) : null}
      {fx.toneMapping.enabled ? <ToneMapping mode={toneMode} /> : null}
      {fx.chromaticAberration.enabled ? (
        <ChromaticAberration
          offset={chromaticOffset}
          radialModulation={fx.chromaticAberration.radialModulation}
          modulationOffset={fx.chromaticAberration.modulationOffset}
        />
      ) : null}
      {fx.vignette.enabled ? (
        <Vignette
          eskil={fx.vignette.eskil}
          offset={fx.vignette.offset}
          darkness={fx.vignette.darkness}
        />
      ) : null}
      {fx.grain.enabled ? <Noise opacity={fx.grain.opacity} /> : null}
      {children}
    </EffectComposer>
  );
}
