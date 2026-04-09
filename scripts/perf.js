/**
 * Coarse hints for gating expensive effects (bloom, particles, etc.).
 * Safe on SSR: call only from browser code paths.
 */
export function getPerformanceProfile() {
  if (typeof window === "undefined") {
    return {
      tier: "unknown",
      prefersReducedMotion: false,
      saveData: false,
      coarsePointer: false,
      cores: 4,
    };
  }

  const prefersReducedMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const coarsePointer =
    typeof window.matchMedia === "function" && window.matchMedia("(pointer: coarse)").matches;

  const cores =
    typeof navigator !== "undefined" && typeof navigator.hardwareConcurrency === "number"
      ? navigator.hardwareConcurrency
      : 4;

  const connection =
    typeof navigator !== "undefined" && navigator.connection ? navigator.connection : null;
  const saveData = Boolean(connection?.saveData);

  let tier = "high";
  if (prefersReducedMotion || saveData) {
    tier = "low";
  } else if (coarsePointer || cores <= 4) {
    tier = "medium";
  }

  return { tier, prefersReducedMotion, saveData, coarsePointer, cores };
}
