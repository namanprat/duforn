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
};

/** webgl-water (Evan Wallace) surface recipe, adapted to the GLB pool. */
export const POOL_WATER_DEFAULTS = {
  /** Final-color multiplier on the water surface (tames the washed-out look). */
  exposure: 0.65,
  /** Above-water tint multiplied into the refracted pool floor (webgl-water). */
  aboveWaterTint: [0.25, 1.0, 1.25],
  /** Fresnel: mix(fresnelBase, 1, pow(1 - cos, fresnelPower)) — webgl-water pow 3. */
  fresnelBase: 0.35,
  fresnelPower: 3.0,
  fresnelNormalStrength: 0.3,
  normalStrength: 0.6,
  /** Screen-UV offset scale for the backdrop refraction (WebGPU path). */
  refractionOffset: 0.08,
  /** Env-reflection UV wobble from the rippled surface normal. */
  envRefractionStrength: 0.08,
  /** Beer's-law absorption on the refracted color. */
  waterDepth: 0.8,
  waterClarity: 0.18,
  defaultReflection: "#7d97a8",
  /** WebGL fallback only — alpha of the tinted-transparency surface. */
  opacity: 0.5,
  /** Pool-wide wind chop (shader-only, UV-space swell — not sim impulses). */
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
  /** Receiver multiplier: base * (1 + (intensity - 1) * strength). */
  strength: 0.35,
  /**
   * Horizontal shear (fraction of pool width) of the surface sample point
   * along the sun direction, so the focused webs land displaced under the
   * light rather than directly beneath each ripple.
   */
  depth: 0.16,
  /**
   * Multiplier on the height-field curvature (discrete Laplacian). The second
   * difference of the ripple field is tiny, so this carries a large gain;
   * higher = sharper, higher-contrast caustic webs from the same ripples.
   */
  normalScale: 300.0,
  /**
   * Focus gain for the wave-curvature caustics: caustic intensity is
   * `1 + gain * (-laplacian(h) * normalScale)`, driven entirely by the live
   * ripple field (concave crests focus light into bright webs, convex troughs
   * darken). When the sim settles flat the curvature → 0 and caustics go
   * neutral, tracking exactly what the surface does on top.
   */
  gain: 0.45,
  /** Clamp on the focused intensity so caustic webs don't blow out. */
  maxIntensity: 4.0,
  /** UV border fade of the caustics RT (fraction of the pool extent). */
  edgeFade: 0.08,
  /** World-space fade band below the water line on receivers. */
  depthFade: 0.2,
  lightElevationDeg: 55,
  lightAzimuthDeg: 49,
};
