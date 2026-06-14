import { createSceneControlsStore } from "./scene";
import {
  POOL_CAUSTICS_DEFAULTS,
  POOL_WATER_DEFAULTS,
} from "../scenes/water/config/poolWaterDefaults";

export const DEFAULT_HOME_SCENE_CONTROLS = {
  env: {
    skybox: true,
  },
  model: {
    x: -6.4,
    y: 2.31,
    z: -3.0,
    rx: 0,
    ry: 0,
    rz: 0,
    scale: 13,
  },
  camera: {
    orbitCenterX: 15,
    orbitCenterY: 75,
    orbitCenterZ: -30,
    orbitRadius: 5,
    cameraHeight: 1,
    fov: 65,
    orbitAngleDeg: -26,
    lookAtYawDeg: 0,
    lookAtPitchDeg: 0,
  },
  spotlight: {
    x: -3.914,
    y: 0,
    z: -27.092,
    targetX: 15,
    targetY: 0,
    targetZ: -30,
    intensity: 18.87,
    color: "#ffffff",
    distance: 0,
    angle: 1.571,
    penumbra: 0,
    decay: 2,
    castShadow: false,
    showInspectorCamera: false,
  },
  caustics: {
    enabled: POOL_CAUSTICS_DEFAULTS.enabled,
    strength: POOL_CAUSTICS_DEFAULTS.strength,
    depth: POOL_CAUSTICS_DEFAULTS.depth,
    normalScale: POOL_CAUSTICS_DEFAULTS.normalScale,
    maxIntensity: POOL_CAUSTICS_DEFAULTS.maxIntensity,
    gain: POOL_CAUSTICS_DEFAULTS.gain,
  },
  water: {
    exposure: POOL_WATER_DEFAULTS.exposure,
    tintR: POOL_WATER_DEFAULTS.aboveWaterTint[0],
    tintG: POOL_WATER_DEFAULTS.aboveWaterTint[1],
    tintB: POOL_WATER_DEFAULTS.aboveWaterTint[2],
    fresnelBase: POOL_WATER_DEFAULTS.fresnelBase,
    refractionOffset: POOL_WATER_DEFAULTS.refractionOffset,
    waterClarity: POOL_WATER_DEFAULTS.waterClarity,
  },
};

export const useHomeSceneControlsStore = createSceneControlsStore(DEFAULT_HOME_SCENE_CONTROLS);

export function getMainCameraPose() {
  return useHomeSceneControlsStore.getState().controls.camera;
}
