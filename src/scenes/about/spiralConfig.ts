/** Spiral gallery constants — ported from deadlock-studios Spiral.jsx */
export const SPIRAL_CONFIG = {
  tilesPerRevolution: 15,
  revolutions: 5,
  startRadius: 5,
  endRadius: 3.5,
  tileHeightRatio: 1.1,
  tileSegments: 24,
  spiralGap: 0.35,
  tileOverlap: 0.005,
  cameraZ: 12,
  cameraSmoothing: 0.075,
  baseRotationSpeed: 0.001,
  scrollRotationMultiplier: 0.005,
  rotationDecay: 0.9,
  scrollMultiplier: 1.25,
  cameraYMultiplier: 0.2,
} as const;

export const SPIRAL_IMAGE_COUNT = 19;
export const SPIRAL_URLS = Array.from(
  { length: SPIRAL_IMAGE_COUNT },
  (_, i) => `/spiral/spiral-${i + 1}.jpg`,
);

export const SPIRAL_TOTAL_TILES = SPIRAL_CONFIG.tilesPerRevolution * SPIRAL_CONFIG.revolutions;
