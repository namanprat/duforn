import { getQualityProfile } from "../../../lib/qualityProfile";

/** Wave-equation pool ripple + ocean-style surface defaults. */

/** Basin backdrop RT (fraction of drawing-buffer res). */
export const REFLECTION_SCALE = 0.65;
/** Layer holding the basin (caustics-receiver) meshes — the only geometry the
 *  backdrop refraction pass needs to draw. */
export const WATER_BASIN_LAYER = 1;

export function getWaterQuality() {
  const p = getQualityProfile();
  return {
    simRes: p.waterSimRes,
    causticsSize: p.causticsSize,
    passInterval: p.waterPassInterval,
    backdropInterval: p.waterBackdropInterval,
    planarReflectionScale: p.planarReflectionScale,
    backdropScale: p.waterBackdropScale,
  };
}
/** Grid cells from the domain edge over which ripples are damped (sim units). */
export const SIM_EDGE_BAND = 10;

export const POOL_SIM_DEFAULTS = {
  gridSize: 256,
  modifier: 0.995,
  substeps: 1,
  /** Soft elegant rings — quieter/wider than a raindrop plop. */
  impulseRadius: 4.5,
  impulseStrength: 0.22,
  normalScale: 9.0,
  maxSlope: 0.75,
  pointerThrottleMs: 28,
  minCellDistance: 0.45,
  pointerImpulsesPerFrame: 4,
};

/** Generated water plane fit vs PoolWalls (dev-tweakable via WaterGui). */
export const POOL_PLANE_DEFAULTS = {
  inset: 0.96,
  rimDrop: 0.08,
  rimDropMax: 0.04,
  offsetX: 0,
  offsetY: 0,
  offsetZ: 0,
};

/** webgl-water (Evan Wallace) surface recipe, adapted to the GLB pool. */
export const POOL_WATER_DEFAULTS = {
  exposure: 1,
  aboveWaterTint: [0.22, 0.98, 1.18] as [number, number, number],
  /** Schlick F0 — ~0.02 for water (IOR 1.33). */
  fresnelBase: 0.02,
  fresnelPower: 5.0,
  fresnelNormalStrength: 1.0,
  normalStrength: 0.65,
  refractionOffset: 0.05,
  /** Ripple normal offset on planar reflection UV (UV-space scale). */
  reflectionDistortion: 0.08,
  envRefractionStrength: 0.08,
  envIntensity: 1.15,
  /** Scales cubemap sky contribution in reflections (helps hide cheap planar RT). */
  hdrBlend: 0.42,
  reflectionCubemapUrl: "/main.hdr",
  /** Perturb cubemap reflection by ripple normals (0 = mirror, 1 = very rough). */
  reflectionRoughness: 0.14,
  /** Cubemap fill weight for upward reflections (sky). */
  planarSkyFill: 0.9,
  waterDepth: 1.15,
  waterClarity: 0.38,
  opacity: 0.72,
  displacementScale: 0.05,
  hdrReflection: true,
  sunStrength: 1.05,
  sunShininess: 220.0,
  sunColor: "#fff4e8",
  /** Sparkle on ripple crests + sun disk in reflections. */
  sunGlintStrength: 0.72,
  breezeStrength: 0.22,
  breezeScale: 2.6,
  breezeSpeed: 0.018,
  breezeDirectionX: 1.0,
  breezeDirectionZ: 0.25,
  breezeMix: 0.26,
  breezeMaxSlope: 0.045,
};

export const POOL_WATER_RENDER_ORDER = 10;

/** Visualize the resolved water mesh as solid red (debug). */
export const WATER_DEBUG_HIGHLIGHT_PLANE = false;

/** Refracted-light caustics splatted onto the GLB pool floor/walls. */
export const POOL_CAUSTICS_DEFAULTS = {
  enabled: true,
  strength: 0.55,
  /** Gradient scale for surface normals used in refraction. */
  normalScale: 14.0,
  edgeFade: 0.08,
  depthFade: 0.2,
  /** Fake chromatic fringe — RT UV shift per channel at the receiver. */
  chromaShift: 0.0015,
  /** Clamp on the caustics brightness multiplier (additive HDR filaments can spike). */
  maxBoost: 4.0,
  lightElevationDeg: 55,
  lightAzimuthDeg: 49,
};
