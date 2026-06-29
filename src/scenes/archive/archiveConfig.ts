// Orb + grid field constants.
export const ARCHIVE_CONFIG = {
  tileCount: 100,
  clickThreshold: 5,

  // Resting camera distance + the wheel-zoom range. Default sits mid-range so you
  // can zoom both in and out; min stays outside the sphere (radius 5) so zooming in
  // never enters the orb.
  globeZoom: 10,
  globeZoomMin: 6.5,
  globeZoomMax: 14,
  globeWheelSpeed: 0.01,
  zoomDamp: 0.25,
  globeSpin: 0.06,
  spinSensitivity: 0.005,

  sphereRadius: 5,
  baseHeight: 0.6,
  posterScale: 1.2,
  globeScaleBoost: 1.15,

  morphDuration: 1.4,
  // Grid tile size relative to an orb tile. Camera keeps the orb zoom in grid, so
  // this alone controls how much bigger the images read: 10 → 1000% of orb size.
  gridScaleVsOrb: 10,
  // Extra spacing between grid tiles (1 = tiles touch their cell, 2 = double the gap).
  gridSpacing: 1.5 / 1.5,
  gridGap: 0.38,
  unwrapScale: 2.8,
} as const;

// ivypresto-display (the site primary serif, `--text-style-font-primary`), n1 =
// normal/weight-100 — the only weight the Typekit kit ships and the one the brand
// text renders in. troika needs a direct font-file URL, so this is the kit's
// opentype (`/a`) face, not the CSS family name.
export const ARCHIVE_PRIMARY_FONT =
  "https://use.typekit.net/af/619bdc/00000000000000007735e5a5/31/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n1&v=3";

export const ARCHIVE_GLOBE_HEIGHT =
  ARCHIVE_CONFIG.baseHeight * ARCHIVE_CONFIG.posterScale * ARCHIVE_CONFIG.globeScaleBoost;

/** Poster height in grid mode — `gridScaleVsOrb`× the orb tile (camera keeps orb zoom). */
export const ARCHIVE_GRID_HEIGHT =
  ARCHIVE_GLOBE_HEIGHT * ARCHIVE_CONFIG.gridScaleVsOrb;

/** Cell = poster-fill size × gridSpacing — controls the gap between grid tiles. */
export const ARCHIVE_GRID_CELL_SIZE =
  (ARCHIVE_GRID_HEIGHT / (ARCHIVE_CONFIG.baseHeight * ARCHIVE_CONFIG.posterScale)) *
  ARCHIVE_CONFIG.gridSpacing;

/**
 * Grid laid out as a centered COLS×ROWS block that tiles infinitely in both
 * axes (the wrap period). ponytail: assumes a square-ish tileCount — 100 → 10×10.
 */
export const ARCHIVE_GRID_COLS = Math.round(Math.sqrt(ARCHIVE_CONFIG.tileCount));
export const ARCHIVE_GRID_ROWS = Math.ceil(ARCHIVE_CONFIG.tileCount / ARCHIVE_GRID_COLS);

/** Unwrap spread scaled to grid cells (legacy fallback; morph uses symmetric cells). */
export const ARCHIVE_UNWRAP_SCALE =
  ARCHIVE_GRID_CELL_SIZE * (ARCHIVE_CONFIG.unwrapScale / 1.15);

/** GridHelper: 120 units / 60 divisions = 2 units per line at scale 1. */
export const ARCHIVE_GRID_HELPER_UNIT = 2;
