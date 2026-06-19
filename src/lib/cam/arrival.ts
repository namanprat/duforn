import type { RoomNamespace } from "../../store/webgl";

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
