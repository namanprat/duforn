import { createSceneControlsStore } from "./scene";
import { DEFAULT_POST_FX_CONTROLS, type PostFxControls } from "../scenes/config/postFxDefaults";

export const usePostFxControlsStore = createSceneControlsStore(
  DEFAULT_POST_FX_CONTROLS as PostFxControls,
);
