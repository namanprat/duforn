import { DEFAULT_CAMERA_BASE_POSE, type CameraPose } from "./pose";
import type { RoomNamespace } from "../../store/webgl";

export function withDelta(base: CameraPose, delta: Partial<CameraPose>): CameraPose {
  return Object.freeze({ ...base, ...delta });
}

export function posesEqual(a: CameraPose, b: CameraPose): boolean {
  return (
    a.orbitCenterX === b.orbitCenterX &&
    a.orbitCenterY === b.orbitCenterY &&
    a.orbitCenterZ === b.orbitCenterZ &&
    a.orbitRadius === b.orbitRadius &&
    a.cameraHeight === b.cameraHeight &&
    a.fov === b.fov &&
    a.orbitAngleDeg === b.orbitAngleDeg &&
    a.lookAtYawDeg === b.lookAtYawDeg &&
    a.lookAtPitchDeg === b.lookAtPitchDeg
  );
}

/** Compute resting camera position from a pose (matches CameraRig orbit math). */
export function poseToCameraPosition(pose: CameraPose): { x: number; y: number; z: number } {
  const angleRad = (pose.orbitAngleDeg * Math.PI) / 180;
  return {
    x: pose.orbitCenterX + Math.cos(angleRad) * pose.orbitRadius,
    y: pose.orbitCenterY + pose.cameraHeight,
    z: pose.orbitCenterZ + Math.sin(angleRad) * pose.orbitRadius,
  };
}

/**
 * Per-room "stable" camera pose. Values authored against the baked Roman-bath
 * scene at MODEL_SCALE = 13. Tune live via RoomCameraGui (dev) and commit here.
 */
export const MAIN_POSE: CameraPose = Object.freeze({
  ...DEFAULT_CAMERA_BASE_POSE,
  orbitCenterX: 65,
  orbitCenterY: 17.5,
  orbitCenterZ: 10.5,
  orbitRadius: 5,
  cameraHeight: 1,
  fov: 65,
  orbitAngleDeg: -26,
  lookAtYawDeg: 0,
  lookAtPitchDeg: 0,
});

export const ROOM_POSES: Record<RoomNamespace, CameraPose> = Object.freeze({
  main: MAIN_POSE,
  work: Object.freeze({
    ...DEFAULT_CAMERA_BASE_POSE,
    orbitCenterX: 27,
    orbitCenterY: 18,
    orbitCenterZ: -12,
    orbitRadius: 5,
    cameraHeight: 1,
    fov: 63,
    orbitAngleDeg: 0,
    lookAtYawDeg: 90,
    lookAtPitchDeg: 6,
  }),
  contact: withDelta(MAIN_POSE, {
    orbitCenterX: MAIN_POSE.orbitCenterX - 2,
    fov: 60,
    orbitAngleDeg: 0,
  }),
  archive: MAIN_POSE,
});

/** Seconds per directed route transition. */
export const ROOM_TRANSITION_SECONDS = 1.8;

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
