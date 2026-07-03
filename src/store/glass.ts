import { createSceneControlsStore } from "./scene";
import { DEFAULT_GLASS_CONTROLS } from "../scenes/config/glassDefaults";

export const useGlassControlsStore = createSceneControlsStore(DEFAULT_GLASS_CONTROLS);
