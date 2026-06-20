/** Wave-equation pool ripple + ocean-style surface defaults. */

export const POOL_SIM_DEFAULTS = {
  gridSize: 192,
  modifier: 0.994,
  substeps: 1,
  impulseRadius: 3.0,
  impulseStrength: 0.45,
  normalScale: 8.0,
  maxSlope: 0.7,
  pointerThrottleMs: 44,
  minCellDistance: 0.8,
  startupImpulseStrengthScale: 0.24,
};

/** webgl-water (Evan Wallace) surface recipe, adapted to the GLB pool. */
export const POOL_WATER_DEFAULTS = {
  /** When false, reflection uses defaultReflection instead of scene.environment. */
  hdrReflection: false,
  exposure: 1,
  aboveWaterTint: [0.25, 1.0, 1.25] as [number, number, number],
  fresnelBase: 0,
  fresnelPower: 3.0,
  fresnelNormalStrength: 0.3,
  normalStrength: 0.6,
  refractionOffset: 0.1,
  envRefractionStrength: 0.08,
  waterDepth: 0.8,
  waterClarity: 0,
  defaultReflection: "#7d97a8",
  opacity: 0.5,
  breezeStrength: 0.55,
  breezeScale: 7.5,
  breezeSpeed: 0.06,
  breezeDirectionX: 1.0,
  breezeDirectionZ: 0.25,
  breezeMix: 0.28,
  breezeMaxSlope: 0.12,
};

export const POOL_WATER_RENDER_ORDER = 10;

/** Refracted-light caustics projected onto the GLB pool floor/walls. */
export const POOL_CAUSTICS_DEFAULTS = {
  enabled: true,
  strength: 0.35,
  depth: 0.16,
  normalScale: 300.0,
  gain: 0.45,
  maxIntensity: 4.0,
  edgeFade: 0.08,
  depthFade: 0.2,
  lightElevationDeg: 55,
  lightAzimuthDeg: 49,
};
