import { createSceneControlsStore } from "./scene";

export const DEFAULT_VIEWER_SCENE_CONTROLS = {
  model: {
    x: 0,
    y: 0,
    z: 0,
    rx: 0,
    ry: 0,
    rz: 0,
    scale: 1,
  },
};

export const useViewerSceneControlsStore = createSceneControlsStore(DEFAULT_VIEWER_SCENE_CONTROLS);
