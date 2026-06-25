import { DEFAULT_CAMERA_BASE_POSE, type CameraPose } from "./pose";
import type { RoomNamespace } from "../../lib/route";

export type { RoomNamespace } from "../../lib/route";

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
// Main pose uses shared fov / center Y; work and contact override per-room.
const SHARED_FOV = 70;
const SHARED_CENTER_Y = 19.6;

export const MAIN_POSE: CameraPose = Object.freeze({
  ...DEFAULT_CAMERA_BASE_POSE,
  orbitCenterX: 91.714,
  orbitCenterY: 20,
  orbitCenterZ: 11.275,
  orbitRadius: 5,
  cameraHeight: 0,
  fov: SHARED_FOV,
  orbitAngleDeg: -31,
  lookAtYawDeg: 0,
  lookAtPitchDeg: 0,
});

export const ROOM_POSES: Record<RoomNamespace, CameraPose> = Object.freeze({
  main: MAIN_POSE,
  work: Object.freeze({
    ...DEFAULT_CAMERA_BASE_POSE,
    orbitCenterX: 37,
    orbitCenterY: 18.9,
    orbitCenterZ: -2,
    orbitRadius: 5,
    cameraHeight: 0,
    fov: SHARED_FOV,
    orbitAngleDeg: 90,
    lookAtYawDeg: 0,
    lookAtPitchDeg: 0,
  }),
  contact: Object.freeze({
    ...DEFAULT_CAMERA_BASE_POSE,
    orbitCenterX: -61.968,
    orbitCenterY: 20,
    orbitCenterZ: 9.266,
    orbitRadius: 5,
    cameraHeight: 0,
    fov: SHARED_FOV,
    orbitAngleDeg: -6.5,
    lookAtYawDeg: 0,
    lookAtPitchDeg: 0,
  }),
  archive: MAIN_POSE,
});

/** Seconds per directed route transition. */
export const ROOM_TRANSITION_SECONDS = 1.8;
