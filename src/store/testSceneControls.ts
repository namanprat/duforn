import { createSceneControlsStore } from "./createSceneControlsStore";

export const DEFAULT_TEST_SCENE_CONTROLS = {
  model: {
    x: 0,
    y: 0,
    z: 0,
    scale: 1,
  },
  water: {
    x: 0,
    y: 0,
    z: 0,
    scale: 1,
  },
};

export const useTestSceneControlsStore = createSceneControlsStore(DEFAULT_TEST_SCENE_CONTROLS);
