// Orb + grid field constants.
export const ARCHIVE_CONFIG = {
  tileCount: 100,
  clickThreshold: 5,

  globeZoom: 10,
  globeZoomMin: 4.5,
  globeWheelSpeed: 0.01,
  zoomDamp: 0.25,
  globeSpin: 0.06,
  spinSensitivity: 0.005,
  maxPitch: 1.2,

  sphereRadius: 5,
  baseHeight: 0.6,
  posterScale: 1.2,

  morphDuration: 1.4,
  cellSize: 1.15,
  gridGap: 0.38,
  gridPanSensitivity: 0.012,
  gridCameraZ: 14,
  unwrapScale: 2.8,
} as const;

export const ARCHIVE_PRIMARY_FONT =
  "https://use.typekit.net/af/b78836/00000000000000007735ba66/31/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n4&v=3";

export const ARCHIVE_GLOBE_HEIGHT =
  ARCHIVE_CONFIG.baseHeight * ARCHIVE_CONFIG.posterScale;

/** Poster height inside a grid cell (phantom-style ~60% fill). */
export const ARCHIVE_GRID_HEIGHT =
  ARCHIVE_CONFIG.cellSize * 0.6 * ARCHIVE_CONFIG.posterScale;
