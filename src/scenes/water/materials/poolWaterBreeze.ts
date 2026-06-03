// @ts-nocheck
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

/**
 * TSL breeze normals (UV-space swell). Returns mixSurfaceNormals(rippleN, uv).
 */
export function createPoolWaterBreezeTSL(tsl, uniforms) {
  const { Fn, float, vec3, dot, cos, clamp, normalize, mix } = tsl;
  const {
    uTime,
    uBreezeStrength,
    uBreezeScale,
    uBreezeSpeed,
    uWindDir,
    uBreezeMix,
    uBreezeMaxSlope,
  } = uniforms;

  const sampleBreezeNormal = Fn(([uvIn]) => {
    const phase = dot(uvIn, uWindDir).mul(uBreezeScale).add(uTime.mul(uBreezeSpeed));
    const dh = cos(phase)
      .mul(0.85)
      .add(cos(phase.mul(0.47).add(1.3)).mul(float(0.47 * 0.15)));
    const gradU = dh.mul(uWindDir.x).mul(uBreezeScale);
    const gradV = dh.mul(uWindDir.y).mul(uBreezeScale);
    const nx = clamp(gradU.mul(uBreezeStrength), uBreezeMaxSlope.negate(), uBreezeMaxSlope);
    const nz = clamp(gradV.mul(uBreezeStrength), uBreezeMaxSlope.negate(), uBreezeMaxSlope);
    return normalize(vec3(nx, float(1), nz));
  });

  const mixSurfaceNormals = Fn(([rippleN, uvIn]) => {
    const breezeN = sampleBreezeNormal(uvIn);
    return normalize(mix(rippleN, breezeN, uBreezeMix));
  });

  return { sampleBreezeNormal, mixSurfaceNormals };
}
