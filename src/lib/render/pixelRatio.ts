/** Single clamped DPR for canvas + renderer configuration. */
export function getClampedPixelRatio(limit = 2) {
  if (typeof window === "undefined") return 1;
  return Math.min(window.devicePixelRatio || 1, limit);
}
