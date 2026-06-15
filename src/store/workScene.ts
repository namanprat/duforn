import { createSceneControlsStore } from "./scene";

export const DEFAULT_WORK_SCENE_CONTROLS = {
  strip: {
    // Sits in front of the WORK camera, maintaining (0.5, -0.5, 3.5) offset from
    // the work orbit center (-22, 72.5, -60) for the new model position (0, 0, 0).
    x: -21.5,
    y: 72,
    z: -56.5,
    rx: 0,
    ry: 0,
    rz: 0,
    scale: 1.2,
    visibleItems: 7,
    gapSize: 0.04,
    curveRadius: 11,
    curveAmount: 2,
    stripHeight: 4,
    stripYOffset: 0,
    wheelSensitivity: 0.0028,
    dragSensitivity: 0.0068,
    dragVelocityScale: 0.0076,
    scrollLerp: 0.11,
    scrollDamping: 0.9,
    scrollDraggingDamping: 0.82,
    snapVelocityThreshold: 0.035,
    snapLerp: 0.18,
    snapEpsilon: 0.0025,
  },
};

export const useWorkSceneControlsStore = createSceneControlsStore(DEFAULT_WORK_SCENE_CONTROLS);
