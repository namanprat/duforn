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

vec3 mixSurfaceNormal(vec3 rippleN, vec2 uv) {
  vec3 breezeN = sampleBreezeNormal(uv);
  return normalize(mix(rippleN, breezeN, uBreezeMix));
}
`;

export function getPoolWaterBreezeWindDir() {
  const p = POOL_WATER_DEFAULTS;
  return new THREE.Vector2(p.breezeDirectionX, p.breezeDirectionZ).normalize();
}
