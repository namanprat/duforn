import { ToneMappingMode } from "postprocessing";
import type { ToneMappingModeName } from "./config/postFxDefaults";

export function toToneMappingMode(mode: ToneMappingModeName): ToneMappingMode {
  switch (mode) {
    case "LINEAR":
      return ToneMappingMode.LINEAR;
    case "REINHARD":
      return ToneMappingMode.REINHARD;
    case "REINHARD2":
      return ToneMappingMode.REINHARD2;
    case "REINHARD2_ADAPTIVE":
      return ToneMappingMode.REINHARD2_ADAPTIVE;
    case "UNCHARTED2":
      return ToneMappingMode.UNCHARTED2;
    case "OPTIMIZED_CINEON":
      return ToneMappingMode.OPTIMIZED_CINEON;
    case "CINEON":
      return ToneMappingMode.CINEON;
    case "ACES_FILMIC":
      return ToneMappingMode.ACES_FILMIC;
    case "AGX":
      return ToneMappingMode.AGX;
    case "NEUTRAL":
      return ToneMappingMode.NEUTRAL;
    default: {
      const _exhaustive: never = mode;
      return _exhaustive;
    }
  }
}
