// @ts-nocheck
/**
 * Pool water defaults — wave-equation ripple sim (4rknova) + ocean-webgpu look.
 * Tuned so the pool floor stays visible through a transparent surface and
 * ripples read as normal/refraction shading on a flat quad (no vertex
 * displacement — see PoolWaterMaterial.ts).
 */

export const POOL_SIM_DEFAULTS = {
  gridSize: 192,
  /** Wave-equation damping per step (MODIFIER in 4rknova shader). */
  modifier: 0.994,
  /** Number of integration steps per frame. */
  substeps: 1,
  /** Impulse falloff radius (cells, matches shader smoothstep outer edge). */
  impulseRadius: 3.0,
  /** Impulse amplitude (STRENGTH in shader). Lower than iter 2 to calm peaks. */
  impulseStrength: 0.45,
  /** Height → normal perturbation scale (central-difference gain). */
  normalScale: 8.0,
  /** Cap on per-cell slope so tall peaks don't tip the normal horizontal. */
  maxSlope: 0.7,
  pointerThrottleMs: 44,
  minCellDistance: 0.8,
  startupImpulseStrengthScale: 0.24,
  /** Subtle directional breeze — replaces the old random ambient. */
  breezeStrength: 0.8,
  breezeIntervalMs: 1400,
  breezeStep: 0.07,
  /** Keep impulses well clear of the 10-cell absorbing edge band. */
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
  // Sun specular
  sunColor: "#ffffff",
  sunSpecularIntensity: 0.6,
  specularShininess: 220.0,
  // Subsurface scattering (ocean-webgpu)
  subsurfaceIntensity: 0.25,
  subsurfacePower: 3.0,
  subsurfaceColor: "#33ccff",
  // Refraction offset on env sample
  refractionStrength: 0.04,
  // Atmospheric fog
  fogStartDistance: 8.0,
  fogEndDistance: 24.0,
  fogIntensity: 0.15,
  fogColor: "#b3d9ff",
  // Foam (tight band on near-breaking crests only)
  foamAmount: 0.05,
  foamThreshold: 0.6,
  // Caustics — procedural light bands on the underwater color.
  causticsIntensity: 0.9,
  causticsScale: 9.0,
  causticsSpeed: 0.25,
  causticsColor: "#fff6df",
};

export const POOL_ENV_DEFAULTS = {
  sunElevation: 35,
  sunAzimuth: 49,
};

export const POOL_WATER_RENDER_ORDER = 10;
