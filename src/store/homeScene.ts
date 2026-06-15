import { createSceneControlsStore } from "./scene";
import { POOL_CAUSTICS_DEFAULTS } from "../scenes/water/config/poolWaterDefaults";

export const DEFAULT_HOME_SCENE_CONTROLS = {
  env: {
    skybox: true,
  },
  model: {
    x: 0,
    y: 0,
    z: 0,
    rx: 0,
    ry: 0,
    rz: 0,
    scale: 13,
  },
  camera: {
    orbitCenterX: 65,
    orbitCenterY: 17.5,
    orbitCenterZ: 10.5,
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
    hdrReflection: false,
    exposure: 1,
    tintR: 0.25,
    tintG: 1,
    tintB: 1.25,
    fresnelBase: 0,
    refractionOffset: 0.1,
    waterClarity: 0,
  },
};

export const useHomeSceneControlsStore = createSceneControlsStore(DEFAULT_HOME_SCENE_CONTROLS);

export function getMainCameraPose() {
  return useHomeSceneControlsStore.getState().controls.camera;
}
