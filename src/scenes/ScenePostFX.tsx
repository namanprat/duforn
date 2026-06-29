import { type ReactNode } from "react";
import { wrapEffect } from "@react-three/postprocessing";
import { DepthOfField, EffectComposer, Vignette } from "@react-three/postprocessing";
import { usePostFxControlsStore } from "../store/postFx";
import { getQualityProfile } from "../lib/qualityProfile";
import SceneN8AOPass from "./SceneN8AOPass";
import { SceneGradeEffect } from "./sceneGradeEffect";

const Grade = wrapEffect(SceneGradeEffect);

/**
 * Lightweight post stack: one merged grade pass (ACES + CA + grain) plus optional
 * heavy passes (AO, DOF, vignette) when dev-toggled on.
 */
export default function ScenePostFX({ children }: { children?: ReactNode }) {
  const fx = usePostFxControlsStore((s) => s.controls);
  const profile = getQualityProfile();

  if (!fx.enabled || profile.postFxMode === "off") return null;

  const showGrade =
    fx.toneMapping.enabled || fx.chromaticAberration.enabled || fx.grain.enabled;
  const showHeavy = fx.ao.enabled || fx.dof.enabled || fx.vignette.enabled;

  if (!showGrade && !showHeavy && !children) return null;

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
      {showGrade ? <Grade /> : null}
      {fx.dof.enabled ? (
        <DepthOfField
          worldFocusDistance={fx.dof.worldFocusDistance}
          worldFocusRange={fx.dof.worldFocusRange}
          bokehScale={fx.dof.bokehScale}
        />
      ) : null}
      {fx.vignette.enabled ? (
        <Vignette
          eskil={fx.vignette.eskil}
          offset={fx.vignette.offset}
          darkness={fx.vignette.darkness}
        />
      ) : null}
      {children}
    </EffectComposer>
  );
}
