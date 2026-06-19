/** Used by components to decide if rotate markup runs in React (survives re-renders). */
export function shouldUseNavRotateHover() {
  if (typeof window === "undefined") return false;
  if (!window.matchMedia("(hover: hover)").matches) return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  return true;
}
