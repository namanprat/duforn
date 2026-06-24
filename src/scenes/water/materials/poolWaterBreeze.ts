import * as THREE from "three";
import { POOL_WATER_DEFAULTS } from "../config/poolWaterDefaults";

/** GLSL: gentle UV-space swell + mix with sim ripples (include inside fragment shader). */
export const POOL_WATER_BREEZE_GLSL = /* glsl */ `
vec3 sampleBreezeNormal(vec2 uv) {
  float phase = dot(uv, uWindDir) * uBreezeScale + uTime * uBreezeSpeed;
  float dh = cos(phase) * 0.85 + cos(phase * 0.47 + 1.3) * (0.47 * 0.15);
  float gradU = dh * uWindDir.x * uBreezeScale;
  float gradV = dh * uWindDir.y * uBreezeScale;
  float nx = clamp(gradU * uBreezeStrength, -uBreezeMaxSlope, uBreezeMaxSlope);
  float nz = clamp(gradV * uBreezeStrength, -uBreezeMaxSlope, uBreezeMaxSlope);
  return normalize(vec3(nx, 1.0, nz));
}

// High-frequency capillary detail — two crossed, scrolling octaves added ON TOP
// of the sim ripples (not mixed away) so the surface reads as real water rather
// than a smooth sheet. The GPU float sim gives clean normals to layer onto.
vec2 detailSlope(vec2 uv) {
  vec2 dir1 = uWindDir;
  vec2 dir2 = vec2(-uWindDir.y, uWindDir.x);
  float f = uBreezeScale * 3.0;
  float p1 = dot(uv, dir1) * f + uTime * uBreezeSpeed * 6.0;
  float p2 = dot(uv, dir2) * f * 1.37 - uTime * uBreezeSpeed * 4.3;
  return (dir1 * cos(p1) + dir2 * cos(p2)) * f;
}

vec3 mixSurfaceNormal(vec3 rippleN, vec2 uv) {
  vec3 breezeN = sampleBreezeNormal(uv);
  vec3 base = normalize(mix(rippleN, breezeN, uBreezeMix));
  vec2 sl = clamp(detailSlope(uv) * uBreezeStrength * 0.06, -uBreezeMaxSlope, uBreezeMaxSlope);
  return normalize(base + vec3(sl.x, 0.0, sl.y));
}
`;

export function getPoolWaterBreezeWindDir() {
  const p = POOL_WATER_DEFAULTS;
  return new THREE.Vector2(p.breezeDirectionX, p.breezeDirectionZ).normalize();
}
