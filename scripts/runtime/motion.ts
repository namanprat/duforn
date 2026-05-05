// @ts-nocheck
export const PARALLAX_MOTION_CONFIG = Object.freeze({
  angleRange: 0.25,
  yRange: 0.35,
  tiltRange: 0.05,
  lerp: 0.05,
  orbitRadius: 5,
});

export function hasDeviceOrientationApi() {
  return typeof window !== "undefined" && typeof window.DeviceOrientationEvent !== "undefined";
}

export function canRequestDeviceOrientationPermission() {
  return (
    hasDeviceOrientationApi() &&
    typeof window.DeviceOrientationEvent.requestPermission === "function"
  );
}

function canRequestDeviceMotionPermission() {
  return (
    typeof window !== "undefined" &&
    typeof window.DeviceMotionEvent !== "undefined" &&
    typeof window.DeviceMotionEvent.requestPermission === "function"
  );
}

async function requestPermissionFrom(eventCtor) {
  if (!eventCtor || typeof eventCtor.requestPermission !== "function") return null;
  try {
    const state = await eventCtor.requestPermission();
    return state === "granted";
  } catch {
    return false;
  }
}

export async function requestDeviceOrientationPermission() {
  if (!hasDeviceOrientationApi()) return false;
  if (!canRequestDeviceOrientationPermission() && !canRequestDeviceMotionPermission()) {
    return true;
  }

  const orientationPermission = await requestPermissionFrom(window.DeviceOrientationEvent);
  const motionPermission = await requestPermissionFrom(window.DeviceMotionEvent);

  // If either API explicitly grants, treat gyro as enabled.
  if (orientationPermission === true || motionPermission === true) return true;

  // If at least one API exists and explicitly denies (or throws), deny.
  if (orientationPermission === false || motionPermission === false) return false;

  // No definitive response; default to enabled for browsers that gate silently.
  return true;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function mapDeviceOrientationToParallax(event) {
  if (!event || event.gamma === null || event.beta === null) return null;
  const x = clamp(event.gamma / 45, -1, 1);
  const y = clamp((event.beta - 45) / 45, -1, 1);
  return { x, y };
}
