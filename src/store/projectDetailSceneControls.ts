import { createSceneControlsStore } from "./createSceneControlsStore";

export const DEFAULT_PROJECT_DETAIL_SCENE_CONTROLS = {
  renderer: {
    exposure: 1,
  },
  projectBgFallback: {
    pointerLerp: 7,
    swirlStrength: 0.11,
    swirlDensity: 3.3,
    distortion: 0.18,
    pointerInfluence: 0.12,
    fadeStrength: 0.64,
    largeNoiseScale: 2.1,
    mediumNoiseScale: 4.1,
    fineNoiseScale: 7.4,
    colorOuter: "#f2f2f4",
    colorMid: "#e4e5e9",
    colorCore: "#c9cbd1",
    colorShade: "#abadb4",
  },
  projectBg: {
    x: 0,
    y: 0,
    z: 0,
    scale: 1.15,
    rotationZ: 180,
    cameraFov: 30,
    coverScale: 1,
    cameraZOffset: 0,
    scrollDrift: 0.24,
    scrollLag: 2.2,
  },
  trail: {
    /** `immersive` matches `immersive/src/trail.js`; `brush` is the older comet/smudge stamp. */
    variant: "immersive",
    size: 1024,
    fadeAlpha: 0.025,
    blurPx: 4,
    radiusFactor: 0.12,
    gradientScale: 2.5,
    smudgeStrength: 0.22,
    smudgeBlurPx: 0.5,
    roughness: 0.05,
    stampAlpha: 1,
  },
  hover: {
    lightStrength: 0.28,
    shadowStrength: 0.18,
    shadowSoftness: 0.7,
  },
};

export const useProjectDetailSceneControlsStore = createSceneControlsStore(
  DEFAULT_PROJECT_DETAIL_SCENE_CONTROLS,
);
