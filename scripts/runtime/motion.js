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

export async function requestDeviceOrientationPermission() {
  if (!hasDeviceOrientationApi()) return false;
  if (!canRequestDeviceOrientationPermission()) return true;

  const state = await window.DeviceOrientationEvent.requestPermission();
  return state === "granted";
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
