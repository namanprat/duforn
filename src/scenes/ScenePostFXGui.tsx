import { button, useControls } from "leva";
import { usePostFxControlsStore } from "../store/postFx";
import { getDeviceTier } from "../lib/deviceTier";
import { getQualityProfile } from "../lib/qualityProfile";

/**
 * Dev-only Leva panel for the scene post-processing stack.
 */
export default function ScenePostFXGui() {
  const resetControls = usePostFxControlsStore((s) => s.resetControls);

  useControls(
    "Post FX",
    {
      deviceTier: {
        value: `tier ${getDeviceTier()} (max DPR ${getQualityProfile().maxDpr})`,
        editable: false,
      },
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
