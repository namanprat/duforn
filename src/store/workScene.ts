import { createSceneControlsStore } from "./scene";

export const DEFAULT_WORK_SCENE_CONTROLS = {
  strip: {
    // Translated by the work orbit-center delta from (0, 0.5, 0) → (-22, 75, -60)
    // so the strip sits in front of the bath-scene WORK camera at the same
    // relative offset it had before the model swap.
    x: -22,
    y: 73.5,
    z: -64.85,
    rx: 0,
    ry: 0,
    rz: 0,
    scale: 1.2,
    visibleItems: 7,
    gapSize: 0.035,
    curveRadius: 10,
    curveAmount: 2,
    stripHeight: 4,
    stripYOffset: 0,
    roughness: 0.72,
    sheenR: 0.92,
    sheenG: 0.88,
    sheenB: 0.82,
    subsurfaceStr: 1,
    windStrength: 1.1,
    flutterAmplitude: 0.08,
    flutterFrequency: 20,
    gravityScale: 1.5,
    constraintMix: 0.4,
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
