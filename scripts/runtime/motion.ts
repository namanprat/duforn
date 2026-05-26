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

function requestPermissionFrom(eventCtor) {
  if (!eventCtor || typeof eventCtor.requestPermission !== "function") return null;
  // Call requestPermission() synchronously to keep iOS user-activation context.
  try {
    const promise = eventCtor.requestPermission();
    return Promise.resolve(promise)
      .then((state) => state === "granted")
      .catch(() => false);
  } catch {
    return Promise.resolve(false);
  }
}

export async function requestDeviceOrientationPermission() {
  if (!hasDeviceOrientationApi()) return false;
  if (!canRequestDeviceOrientationPermission() && !canRequestDeviceMotionPermission()) {
    return true;
  }

  // Kick off both prompts synchronously within the same user gesture, then await.
  const orientationPromise = requestPermissionFrom(window.DeviceOrientationEvent);
  const motionPromise = requestPermissionFrom(window.DeviceMotionEvent);
  const [orientationPermission, motionPermission] = await Promise.all([
    orientationPromise,
    motionPromise,
  ]);

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

function isCoarsePointerDevice() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(pointer: coarse)").matches
  );
}

function getVisualOrientationAngle() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return null;
  }
  return window.matchMedia("(orientation: landscape)").matches ? 90 : 0;
}

export function getScreenOrientationAngle() {
  if (typeof window === "undefined") return 0;

  let angle = 0;
  if (window.screen?.orientation && Number.isFinite(window.screen.orientation.angle)) {
    angle = window.screen.orientation.angle;
  } else if (Number.isFinite(window.orientation)) {
    angle = window.orientation;
  }

  angle = ((angle % 360) + 360) % 360;

  // iPad Safari can expose orientation relative to a different natural axis than
  // the current layout. Reconcile against visual orientation on touch devices.
  if (isCoarsePointerDevice()) {
    const visualAngle = getVisualOrientationAngle();
    if (visualAngle !== null) {
      const axisAngle = angle % 180;
      const visualAxis = ((visualAngle % 360) + 360) % 180;
      if (axisAngle !== visualAxis) {
        angle = visualAngle;
      }
    }
  }

  return angle;
}

export function remapOrientationToScreenSpace(
  beta,
  gamma,
  orientationAngle = getScreenOrientationAngle(),
) {
  const angleRad = (orientationAngle * Math.PI) / 180;
  const sin = Math.sin(angleRad);
  const cos = Math.cos(angleRad);

  return {
    beta: beta * cos - gamma * sin,
    gamma: gamma * cos + beta * sin,
  };
}

export function mapDeviceOrientationToParallax(
  event,
  orientationAngle = getScreenOrientationAngle(),
) {
  if (!event || event.gamma === null || event.beta === null) return null;

  const { beta, gamma } = remapOrientationToScreenSpace(event.beta, event.gamma, orientationAngle);

  const x = clamp(gamma / 45, -1, 1);
  const y = clamp((beta - 45) / 45, -1, 1);
  return { x, y };
}
