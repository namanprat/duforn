import { createSceneControlsStore } from "./scene";

export const DEFAULT_HOME_SCENE_CONTROLS = {
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
  wallHover: {
    enabled: true,
    showDebugBlob: true,
    debugBlobSize: 0.5,
    logHits: false,
    useDecalGlow: false,
    debugAlwaysOn: false,
    innerRadius: 0.2,
    hoverRadius: 4,
    glowIntensity: 0.85,
    glowColor: "#f2ebd8",
    strengthLerp: 9,
    noiseScale: 1.8,
    noiseSpeed: 0.35,
    pulseRate: 1.2,
  },
};

export const useHomeSceneControlsStore = createSceneControlsStore(DEFAULT_HOME_SCENE_CONTROLS);

export function getMainCameraPose() {
  return useHomeSceneControlsStore.getState().controls.camera;
}
