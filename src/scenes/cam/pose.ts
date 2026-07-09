/**
 * Camera base pose shared between RoomCam (writer, via GSAP tweens) and
 * CameraRig (reader, per-frame). RoomCam mutates `cameraBasePoseRef.current`;
 * CameraRig reads it every frame and positions the camera on its orbit.
 */
export interface CameraPose {
  orbitCenterX: number;
  orbitCenterY: number;
  orbitCenterZ: number;
  orbitRadius: number;
  cameraHeight: number;
  fov: number;
  orbitAngleDeg: number;
  lookAtYawDeg: number;
  lookAtPitchDeg: number;
}

export const DEFAULT_CAMERA_BASE_POSE: CameraPose = Object.freeze({
  orbitCenterX: 0,
  orbitCenterY: 0.5,
  orbitCenterZ: 0,
  orbitRadius: 5,
  cameraHeight: 0,
  fov: 65,
  orbitAngleDeg: 90,
  lookAtYawDeg: 0,
  lookAtPitchDeg: 0,
});

/** Mutable base pose written by RoomCam each frame; read by CameraRig. */
export const cameraBasePoseRef: { current: CameraPose } = {
  current: { ...DEFAULT_CAMERA_BASE_POSE },
};

/** True while RoomCam GSAP is tweening between room poses. */
export const cameraTransitionRef = { current: false };

/** Hover-driven additive FOV offset (e.g. the home "View Work" pill). Added on top of base.fov. */
export const cameraFovOffsetRef = { current: 0 };

export const cameraRigControlsRef = {
  current: {
    parallaxEnabled: true,
    gyroEnabled: false,
    orbitControlEnabled: false,
  },
};

/** Set by RoomCam on room change; CameraRig recenters parallax on snap arrivals. */
export const parallaxRecenterRef = { current: false };

export function requestParallaxRecenter(): void {
  parallaxRecenterRef.current = true;
}

export const POSE_KEYS = Object.keys(DEFAULT_CAMERA_BASE_POSE) as (keyof CameraPose)[];
