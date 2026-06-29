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
  const ca = usePostFxControlsStore((s) => s.controls.chromaticAberration);

  useControls(
    "Post FX",
    {
      deviceTier: {
        value: `tier ${getDeviceTier()} (max DPR ${getQualityProfile().maxDpr})`,
        editable: false,
      },
      ChromaticAberration: folder({
        enabled: {
          value: ca.enabled,
          onChange: (v) => setControl("chromaticAberration.enabled", v),
        },
        offset: {
          value: ca.offset,
          min: 0,
          max: 0.02,
          step: 0.0001,
          onChange: (v) => setControl("chromaticAberration.offset", v),
        },
        radialModulation: {
          label: "edge only",
          value: ca.radialModulation,
          onChange: (v) => setControl("chromaticAberration.radialModulation", v),
        },
        modulationOffset: {
          label: "edge falloff",
          value: ca.modulationOffset,
          min: 0,
          max: 1,
          step: 0.01,
          onChange: (v) => setControl("chromaticAberration.modulationOffset", v),
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
