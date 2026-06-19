import { createSceneControlsStore } from "./scene";

export const DEFAULT_WORK_SCENE_CONTROLS = {
  strip: {
    x: 31.9,
    y: 18,
    z: -18,
    rx: 0,
    ry: (-4.5 * Math.PI) / 180,
    rz: 0,
    scale: 1.0,
    visibleItems: 7,
    gapSize: 0.04,
    curveRadius: 11,
    curveAmount: 2,
    stripHeight: 4,
    stripYOffset: 0,
    windStrength: 0.8,
    flutterAmplitude: 0.05,
    flutterFrequency: 16,
    gravityScale: 1.2,
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
