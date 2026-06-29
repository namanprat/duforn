import * as THREE from "three";
import { POOL_WATER_DEFAULTS } from "../config/poolWaterDefaults";

/** GLSL: pool-wide calm swell — large, slow, old ripples (include inside fragment shader). */
export const POOL_WATER_BREEZE_GLSL = /* glsl */ `
vec3 sampleBreezeNormal(vec2 uv) {
  vec2 wind = uWindDir;
  vec2 cross = vec2(-wind.y, wind.x);
  float along = dot(uv, wind);
  float aside = dot(uv, cross);
  float f = uBreezeScale;
  float t = uTime * uBreezeSpeed;

  // ~1–2 wavelengths across the pool; soft sin crests read as aged swell.
  float p1 = along * f + t;
  float p2 = along * f * 0.531 + t * 0.27 + 1.85;
  float p3 = aside * f * 0.34 - t * 0.19 + 0.55;

  float dAlong = cos(p1) * f * 0.58 + cos(p2) * f * 0.531 * 0.27;
  float dAside = cos(p3) * f * 0.34 * 0.15;
  vec2 grad = wind * dAlong + cross * dAside;

  vec2 sl = clamp(grad * uBreezeStrength, vec2(-uBreezeMaxSlope), vec2(uBreezeMaxSlope));
  return normalize(vec3(sl.x, 1.0, sl.y));
}

vec3 mixSurfaceNormal(vec3 rippleN, vec2 uv) {
  float edge = smoothstep(0.0, 0.05, uv.x) * smoothstep(0.0, 0.05, 1.0 - uv.x)
             * smoothstep(0.0, 0.05, uv.y) * smoothstep(0.0, 0.05, 1.0 - uv.y);
  vec3 breezeN = sampleBreezeNormal(uv);
  return normalize(mix(rippleN, breezeN, uBreezeMix * edge));
}
`;

export function getPoolWaterBreezeWindDir() {
  const p = POOL_WATER_DEFAULTS;
  return new THREE.Vector2(p.breezeDirectionX, p.breezeDirectionZ).normalize();
}
