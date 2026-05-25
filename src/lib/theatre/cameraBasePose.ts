// @ts-nocheck

export const DEFAULT_CAMERA_BASE_POSE = Object.freeze({
  orbitCenterX: 0,
  orbitCenterY: 0.5,
  orbitCenterZ: 0,
  orbitRadius: 5,
  cameraHeight: 1,
  fov: 65,
  orbitAngleDeg: 90,
  lookAtYawDeg: 0,
  lookAtPitchDeg: 0,
});

/** Mutable base pose written by TheatreCameraController; read by CameraRig each frame. */
export const cameraBasePoseRef = {
  current: { ...DEFAULT_CAMERA_BASE_POSE },
};
