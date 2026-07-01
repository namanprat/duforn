/** Site palette — keep in sync with --swatch-* in styles.css */
export const SWATCH_LIGHT = "#EAE9E4";
export const SWATCH_DARK = "#000000";
export const SWATCH_LIGHT_RGB = [234, 233, 228] as const;
export const SWATCH_LIGHT_NUM = 0xeae9e4;
export const SWATCH_DARK_NUM = 0x000000;
/** Slightly dimmer than SWATCH_LIGHT — Env fog fallback when HDRI is hidden. */
export const SWATCH_LIGHT_FOG_NUM = 0xe4e3de;

export const SWATCH_LIGHT_RGBA = (alpha: number) =>
  `rgba(${SWATCH_LIGHT_RGB[0]}, ${SWATCH_LIGHT_RGB[1]}, ${SWATCH_LIGHT_RGB[2]}, ${alpha})`;

export const SWATCH_DARK_RGBA = (alpha: number) => `rgba(0, 0, 0, ${alpha})`;

/** Project detail page overscroll / transition swatch — keep in sync with --project-overscroll-bg */
export const PROJECT_DETAIL_SWATCH = "#c3c3c3";
