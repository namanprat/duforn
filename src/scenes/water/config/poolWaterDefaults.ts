// @ts-nocheck
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
  breezeStrength: 0.8,
  breezeIntervalMs: 1400,
  breezeStep: 0.07,
  breezeYInset: 0.28,
};

export const POOL_WATER_DEFAULTS = {
  shallowWaterColor: "#6FB5B8",
  deepWaterColor: "#14424A",
  depthFalloff: 2.5,
  waterDepth: 0.8,
  waterClarity: 0.18,
  fresnelPower: 5.0,
  fresnelNormalStrength: 0.3,
  normalStrength: 0.6,
  opacity: 0.82,
  defaultReflection: "#7d97a8",
  sunColor: "#ffffff",
  sunSpecularIntensity: 0.6,
  specularShininess: 220.0,
  subsurfaceIntensity: 0.25,
  subsurfacePower: 3.0,
  subsurfaceColor: "#33ccff",
  refractionStrength: 0.04,
  fogStartDistance: 8.0,
  fogEndDistance: 24.0,
  fogIntensity: 0.15,
  fogColor: "#b3d9ff",
  foamAmount: 0.05,
  foamThreshold: 0.6,
  causticsIntensity: 0.9,
  causticsScale: 9.0,
  causticsSpeed: 0.25,
  causticsColor: "#fff6df",
};

export const POOL_WATER_RENDER_ORDER = 10;
