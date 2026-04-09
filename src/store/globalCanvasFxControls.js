import { createSceneControlsStore } from "./createSceneControlsStore.js";

export const DEFAULT_GLOBAL_CANVAS_FX_CONTROLS = {
  grain: {
    enabled: true,
    opacity: 0.25,
    intensity: 0.35,
    scale: 10,
    speed: 2.5,
    fps: 60,
    contrast: 0.59,
    monochrome: true,
    tint: "#ffffff",
    blendMode: "soft-light",
  },
};

export const useGlobalCanvasFxControlsStore = createSceneControlsStore(
  DEFAULT_GLOBAL_CANVAS_FX_CONTROLS,
);
