export const PARALLAX_MOTION_CONFIG = Object.freeze({
  angleRange: 0.2,
  yRange: 0.3,
  tiltRange: 0.04,
  lerp: 0.05,
  orbitRadius: 5,
});

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function mapDeviceOrientationToParallax(event) {
  if (!event || event.gamma === null || event.beta === null) return null;
  const x = clamp(event.gamma / 45, -1, 1);
  const y = clamp((event.beta - 45) / 45, -1, 1);
  return { x, y };
}
