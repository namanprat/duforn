// @ts-nocheck
import { DEFAULT_CAMERA_BASE_POSE } from "./pose";
import { DEFAULT_HOME_SCENE_CONTROLS } from "../../store/homeScene";

const ROOM_NAMESPACES = ["main", "contact", "work"] as const;

export type RoomNamespace = (typeof ROOM_NAMESPACES)[number];

export function isRoomNamespace(value: unknown): value is RoomNamespace {
  return typeof value === "string" && ROOM_NAMESPACES.includes(value as RoomNamespace);
}

/**
 * Per-room "stable" camera pose. Values authored against the duforn_website.glb
 * (Roman bath) scene at MODEL_SCALE = 13. Each room is a fixed target; GSAP
 * tweens between them on route change.
 */
export const ROOM_POSES = Object.freeze({
  main: Object.freeze({
    ...DEFAULT_CAMERA_BASE_POSE,
    ...DEFAULT_HOME_SCENE_CONTROLS.camera,
  }),
  contact: Object.freeze({
    ...DEFAULT_CAMERA_BASE_POSE,
    // Orbit center shifted by the model delta (-6.4, +7.11, -3.0) so framing
    // is preserved after the model move from (0, -4.8, 0) → (-6.4, 2.31, -3.0).
    orbitCenterX: -106.4,
    orbitCenterY: 75,
    orbitCenterZ: -35.0,
    orbitRadius: 6,
    cameraHeight: 1,
    fov: 60,
    orbitAngleDeg: 0,
    lookAtYawDeg: 0,
    lookAtPitchDeg: 0,
  }),
  work: Object.freeze({
    ...DEFAULT_CAMERA_BASE_POSE,
    // Orbit center shifted by the model delta (-6.4, +7.11, -3.0) so framing
    // is preserved after the model move from (0, -4.8, 0) → (-6.4, 2.31, -3.0).
    orbitCenterX: -28.4,
    orbitCenterY: 75,
    orbitCenterZ: -63.0,
    orbitRadius: 6,
    cameraHeight: 1,
    fov: 65,
    orbitAngleDeg: 90,
    lookAtYawDeg: 0,
    lookAtPitchDeg: 0,
  }),
});

/** Seconds per directed route transition (was Theatre's 1.8s playback). */
export const ROOM_TRANSITION_SECONDS = 1.8;

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
