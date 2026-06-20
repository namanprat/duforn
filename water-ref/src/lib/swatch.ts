/**
 * Hex value for `--swatch-dark` (Canvas 2D / THREE.Color). Keep in sync with styles.css :root.
 */
export function getCssSwatchDarkHex() {
  if (typeof document === "undefined") return "#000000";
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--swatch-dark").trim();
  if (/^#[0-9a-fA-F]{3,8}$/.test(raw)) return raw;
  return "#000000";
}
