// @ts-nocheck

/**
 * Camera base pose shared between RoomCam (writer, via GSAP tweens) and
 * CameraRig (reader, per-frame). Same shape as the previous Theatre-driven
 * implementation so CameraRig didn't need rewriting.
 */
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

/** Mutable base pose written by RoomCam each frame; read by CameraRig. */
export const cameraBasePoseRef = {
  current: { ...DEFAULT_CAMERA_BASE_POSE },
};
