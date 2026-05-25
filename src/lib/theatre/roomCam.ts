// @ts-nocheck
import { getTheatreRafDriver } from "./raf";

export const ROOM_NAMESPACES = ["main", "contact", "work"];

/** @typedef {(typeof ROOM_NAMESPACES)[number]} RoomNamespace */

export const ROOM_POSES = Object.freeze({
  main: 0,
  contact: 2,
  work: 8,
});

export const ROOM_ROUTES = Object.freeze({
  "main->contact": Object.freeze([0, 2]),
  "contact->main": Object.freeze([3, 5]),
  "main->work": Object.freeze([6, 8]),
  "work->main": Object.freeze([9, 11]),
  "work->contact": Object.freeze([12, 14]),
  "contact->work": Object.freeze([15, 17]),
});

/** ~1.8s per directed route, each authored as a 2-unit Theatre segment. */
export const ROOM_PLAYBACK_RATE = 2 / 1.8;

let activePlayback = null;

export function isRoomNamespace(value) {
  return ROOM_NAMESPACES.includes(value);
}

export function getRoomRouteKey(from, to) {
  return `${from}->${to}`;
}

export function getRoomRouteRange(from, to) {
  return ROOM_ROUTES[getRoomRouteKey(from, to)] ?? null;
}

export function prefersReducedMotion() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function snapToRoom(sheet, room) {
  if (!sheet?.sequence) return;
  const posePosition = ROOM_POSES[room];
  if (typeof posePosition !== "number") return;
  sheet.sequence.pause();
  sheet.sequence.position = posePosition;
}

export function playToRoom(sheet, from, to, options = {}) {
  if (!sheet?.sequence) return Promise.resolve();

  const reducedMotion = options.reducedMotion ?? prefersReducedMotion();
  if (from === to) return Promise.resolve();

  if (reducedMotion || from == null) {
    snapToRoom(sheet, to);
    return Promise.resolve();
  }

  const routeRange = getRoomRouteRange(from, to);
  if (!routeRange) {
    snapToRoom(sheet, to);
    return Promise.resolve();
  }

  if (activePlayback) {
    activePlayback.cancelled = true;
    sheet.sequence.pause();
  }

  const token = { cancelled: false };
  activePlayback = token;

  const sequence = sheet.sequence;
  const [startT, endT] = routeRange;

  if (Math.abs(endT - startT) < 0.0001) {
    if (activePlayback === token) activePlayback = null;
    return Promise.resolve();
  }

  sequence.position = startT;

  return sequence
    .play({
      iterationCount: 1,
      range: [startT, endT],
      direction: "normal",
      rate: ROOM_PLAYBACK_RATE,
      rafDriver: getTheatreRafDriver(),
    })
    .then(() => {
      if (token.cancelled) return false;
      if (activePlayback === token) activePlayback = null;
      return true;
    })
    .catch(() => {
      if (activePlayback === token) activePlayback = null;
      return false;
    });
}
