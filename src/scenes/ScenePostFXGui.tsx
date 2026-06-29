import { button, folder, useControls } from "leva";
import { usePostFxControlsStore } from "../store/postFx";
import { getDeviceTier } from "../lib/deviceTier";
import { getQualityProfile } from "../lib/qualityProfile";

/**
 * Dev-only Leva panel for the scene post-processing stack.
 */
export default function ScenePostFXGui() {
  const setControl = usePostFxControlsStore((s) => s.setControl);
  const resetControls = usePostFxControlsStore((s) => s.resetControls);
  const fx = usePostFxControlsStore((s) => s.controls);

  useControls(
    "Post FX",
    {
      deviceTier: {
        value: `tier ${getDeviceTier()} (max DPR ${getQualityProfile().maxDpr})`,
        editable: false,
      },
      enabled: {
        value: fx.enabled,
        onChange: (v) => setControl("enabled", v),
      },
      "ACES tone mapping": folder({
        toneEnabled: {
          label: "enabled",
          value: fx.toneMapping.enabled,
          onChange: (v) => setControl("toneMapping.enabled", v),
        },
      }),
      ChromaticAberration: folder({
        caEnabled: {
          label: "enabled",
          value: fx.chromaticAberration.enabled,
          onChange: (v) => setControl("chromaticAberration.enabled", v),
        },
        offsetX: {
          value: fx.chromaticAberration.offsetX,
          min: 0,
          max: 0.01,
          step: 0.0001,
          onChange: (v) => setControl("chromaticAberration.offsetX", v),
        },
        offsetY: {
          value: fx.chromaticAberration.offsetY,
          min: 0,
          max: 0.01,
          step: 0.0001,
          onChange: (v) => setControl("chromaticAberration.offsetY", v),
        },
        radialModulation: {
          label: "edge only",
          value: fx.chromaticAberration.radialModulation,
          onChange: (v) => setControl("chromaticAberration.radialModulation", v),
        },
        modulationOffset: {
          label: "edge falloff",
          value: fx.chromaticAberration.modulationOffset,
          min: 0,
          max: 1,
          step: 0.01,
          onChange: (v) => setControl("chromaticAberration.modulationOffset", v),
        },
      }),
      Grain: folder({
        grainEnabled: {
          label: "enabled",
          value: fx.grain.enabled,
          onChange: (v) => setControl("grain.enabled", v),
        },
        opacity: {
          value: fx.grain.opacity,
          min: 0,
          max: 0.08,
          step: 0.001,
          onChange: (v) => setControl("grain.opacity", v),
        },
      }),
      "Reset defaults": button(() => resetControls()),
      "Log values": button(() => {
        const values = usePostFxControlsStore.getState().controls;
        console.info("[Post FX]", JSON.stringify(values, null, 2));
      }),
    },
    { collapsed: false },
  );

  return null;
}
