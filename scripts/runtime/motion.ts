// @ts-nocheck
export const PARALLAX_MOTION_CONFIG = Object.freeze({
  angleRange: 0.25,
  yRange: 0.35,
  tiltRange: 0.05,
  lerp: 0.05,
  orbitRadius: 5,
});

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
