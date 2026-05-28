/**
 * Camera arrival signal.
 *
 * `RoomCam` writes the room name once the camera has reached its target pose
 * (tween complete, or snap on first mount / reduced motion). Page components
 * (or `TextRevealLines` via `waitForCamera`) read this to know whether the
 * camera is already at rest for the *current* room — needed to avoid a race
 * where the page mounts after the arrival event has already fired (e.g.
 * navigating back to a room you've already visited).
 *
 * Pattern: subscribers must compare `getArrivedRoom()` against the room they
 * care about. Using a single mutable ref instead of a store keeps the read
 * synchronous and React-render-free.
 */
import type { RoomNamespace } from "./roomPoses";

export const CAMERA_ARRIVED_EVENT = "duforn:room-camera-arrived";

let arrivedRoom: RoomNamespace | null = null;

export function setArrivedRoom(room: RoomNamespace | null): void {
  arrivedRoom = room;
  if (typeof window !== "undefined" && room != null) {
    window.dispatchEvent(new CustomEvent(CAMERA_ARRIVED_EVENT, { detail: { room } }));
  }
}

export function getArrivedRoom(): RoomNamespace | null {
  return arrivedRoom;
}
