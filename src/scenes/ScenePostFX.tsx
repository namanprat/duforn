import { type ReactNode } from "react";
import { EffectComposer, wrapEffect } from "@react-three/postprocessing";
import { usePostFxControlsStore } from "../store/postFx";
import { getQualityProfile } from "../lib/qualityProfile";
import { SceneGradeEffect } from "./sceneGradeEffect";

const Grade = wrapEffect(SceneGradeEffect);

/**
 * Lightweight post stack: one merged grade pass (ACES + CA + grain).
 */
export default function ScenePostFX({ children }: { children?: ReactNode }) {
  const fx = usePostFxControlsStore((s) => s.controls);
  const profile = getQualityProfile();

  if (!fx.enabled || profile.postFxMode === "off") return null;

  const showGrade =
    fx.toneMapping.enabled || fx.chromaticAberration.enabled || fx.grain.enabled;

  if (!showGrade && !children) return null;

  return (
    <EffectComposer multisampling={0} stencilBuffer={false}>
      {showGrade ? <Grade /> : null}
      {children}
    </EffectComposer>
  );
}
