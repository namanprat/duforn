import { createSceneControlsStore } from "./scene";

export const DEFAULT_WORK_SCENE_CONTROLS = {
  strip: {
    // Sits in front of the WORK camera, keeping its (0.5, -0.5, 3.5) offset from
    // the work orbit center. Shifted by the model delta (-6.4, +7.11, -3.0) when
    // the model moved (0, -4.8, 0) → (-6.4, 2.31, -3.0); work orbit center is now
    // (-28.4, 82.11, -63.0).
    x: -27.9,
    y: 81.61,
    z: -67.5,
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
