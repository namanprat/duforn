/** Resolve a CSS length custom property (e.g. `--spacing-space-3`) to pixels. */
export function readCssLengthPx(customProperty: string, fallbackPx = 14): number {
  if (typeof document === "undefined") return fallbackPx;

  const probe = document.createElement("div");
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  probe.style.pointerEvents = "none";
  probe.style.width = `var(${customProperty})`;
  document.documentElement.appendChild(probe);
  const px = probe.getBoundingClientRect().width;
  probe.remove();

  return px > 0 ? px : fallbackPx;
}
