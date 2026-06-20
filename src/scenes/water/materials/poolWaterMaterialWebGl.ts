/**
 * WebGL pool water — tinted-transparency approximation of the webgl-water look.
 * Fresnel-mixes refracted pool floor with scene IBL reflection.
 */
import * as THREE from "three";
import { POOL_SIM_DEFAULTS, POOL_WATER_DEFAULTS } from "../config/poolWaterDefaults";
import type { PoolShallowWaterSimCPU } from "../compute/PoolShallowWaterSimCPU";
import type { WaterPlanarBounds } from "../waterPlanarMapping";
import { POOL_WATER_BREEZE_GLSL, getPoolWaterBreezeWindDir } from "./poolWaterBreeze";

const VERT = /* glsl */ `
  uniform vec4 uPlanar;
  varying vec3 vWorldPos;
  varying vec2 vRippleUv;

  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    float u = (worldPos.x - uPlanar.x) / uPlanar.z;
    float v = 1.0 - (worldPos.z - uPlanar.y) / uPlanar.w;
    vRippleUv = clamp(vec2(u, v), 0.0, 1.0);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const FRAG =
  /* glsl */ `
  precision highp float;

  varying vec3 vWorldPos;
  varying vec2 vRippleUv;

  uniform sampler2D uHeightMap;
  uniform samplerCube uEnvMap;
  uniform float uHasEnv;
  uniform float uEnvReflection;
  uniform vec2 uSimRes;
  uniform float uNormalScale;
  uniform float uMaxSlope;
  uniform float uRippleStrength;
  uniform vec3 uAboveTint;
  uniform vec3 uDefaultReflection;
  uniform float uWaterDepth;
  uniform float uWaterClarity;
  uniform float uFresnelBase;
  uniform float uFresnelPower;
  uniform float uFresnelNormalStrength;
  uniform float uOpacity;
  uniform float uExposure;
  uniform float uEnvRefraction;
  uniform float uTime;
  uniform float uBreezeStrength;
  uniform float uBreezeScale;
  uniform float uBreezeSpeed;
  uniform vec2 uWindDir;
  uniform float uBreezeMix;
  uniform float uBreezeMaxSlope;

  float decodeH(float r) { return (r - 0.5) * 2.0; }

  float sampleHBilinear(vec2 uvIn) {
    return decodeH(texture2D(uHeightMap, clamp(uvIn, 0.0, 1.0)).r);
  }

  vec3 sampleRippleNormal(vec2 uvIn) {
    float texelU = 1.0 / max(uSimRes.x - 1.0, 1.0);
    float texelV = 1.0 / max(uSimRes.y - 1.0, 1.0);
    float hL = sampleHBilinear(uvIn + vec2(-texelU, 0.0));
    float hR = sampleHBilinear(uvIn + vec2( texelU, 0.0));
    float hU = sampleHBilinear(uvIn + vec2(0.0, -texelV));
    float hD = sampleHBilinear(uvIn + vec2(0.0,  texelV));
    float gradX = (hL - hR) * 0.5;
    float gradZ = (hU - hD) * 0.5;
    float nx = clamp(gradX * uNormalScale, -uMaxSlope, uMaxSlope);
    float nz = clamp(gradZ * uNormalScale, -uMaxSlope, uMaxSlope);
    return normalize(vec3(nx, 1.0, nz));
  }

  ` +
  POOL_WATER_BREEZE_GLSL +
  /* glsl */ `

  void main() {
    vec3 rippleN = sampleRippleNormal(vRippleUv);
    vec3 surfaceN = mixSurfaceNormal(rippleN, vRippleUv);
    vec3 flatN = vec3(0.0, 1.0, 0.0);
    vec3 fresnelN = normalize(mix(flatN, surfaceN, uFresnelNormalStrength));

    vec3 viewDir = normalize(cameraPosition - vWorldPos);
    float cosTheta = max(dot(viewDir, fresnelN), 0.0);
    float fresnel = mix(uFresnelBase, 1.0, pow(1.0 - cosTheta, uFresnelPower));

    float viewAngle = max(abs(viewDir.y), 0.15);
    float pathLength = uWaterDepth / viewAngle;
    vec3 extinction = vec3(0.4, 0.12, 0.04) * uWaterClarity;
    vec3 transmittance = exp(-extinction * pathLength * 0.05);
    vec3 refractedColor = uAboveTint * transmittance;

    vec3 reflectDir = reflect(-viewDir, fresnelN);
    vec3 envSample = textureCube(uEnvMap, reflectDir).rgb;
    float envOn = uHasEnv * uEnvReflection;
    vec3 reflectionColor = mix(uDefaultReflection, envSample, envOn);

    vec3 finalColor = mix(refractedColor, reflectionColor, fresnel);

    float alpha = clamp(mix(uOpacity, 1.0, fresnel), 0.0, 1.0);
    gl_FragColor = vec4(clamp(finalColor * uExposure, 0.0, 1.0), alpha);
  }
`;

function createDummyEnvCube() {
  const data = new Uint8Array([125, 151, 168, 255]);
  const faces = [data, data, data, data, data, data];
  const tex = new THREE.CubeTexture(faces);
  tex.needsUpdate = true;
  return tex;
}

export type PoolWaterMaterialApi = ReturnType<typeof createPoolWaterMaterialWebGl>;

export function createPoolWaterMaterialWebGl({
  sim,
  bounds,
  envMap,
}: {
  sim: PoolShallowWaterSimCPU;
  bounds: WaterPlanarBounds;
  envMap?: THREE.Texture | null;
}) {
  const p = POOL_WATER_DEFAULTS;
  const heightTex = sim.getHeightTexture();
  const dummyEnv = createDummyEnvCube();
  let currentEnvMap = envMap ?? null;

  const uniforms = {
    uHeightMap: { value: heightTex },
    uEnvMap: { value: currentEnvMap ?? dummyEnv },
    uHasEnv: { value: currentEnvMap ? 1 : 0 },
    uEnvReflection: { value: p.hdrReflection ? 1 : 0 },
    uPlanar: {
      value: new THREE.Vector4(bounds.minX, bounds.minZ, bounds.width, bounds.depth),
    },
    uSimRes: { value: new THREE.Vector2(sim.getResolutionW(), sim.getResolutionH()) },
    uNormalScale: { value: POOL_SIM_DEFAULTS.normalScale },
    uMaxSlope: { value: POOL_SIM_DEFAULTS.maxSlope },
    uRippleStrength: { value: p.normalStrength },
    uAboveTint: { value: new THREE.Vector3(...p.aboveWaterTint) },
    uDefaultReflection: { value: new THREE.Color(p.defaultReflection) },
    uWaterDepth: { value: p.waterDepth },
    uWaterClarity: { value: p.waterClarity },
    uFresnelBase: { value: p.fresnelBase },
    uFresnelPower: { value: p.fresnelPower },
    uFresnelNormalStrength: { value: p.fresnelNormalStrength },
    uOpacity: { value: p.opacity },
    uExposure: { value: p.exposure },
    uEnvRefraction: { value: p.envRefractionStrength },
    uTime: { value: 0 },
    uBreezeStrength: { value: p.breezeStrength },
    uBreezeScale: { value: p.breezeScale },
    uBreezeSpeed: { value: p.breezeSpeed },
    uWindDir: { value: getPoolWaterBreezeWindDir() },
    uBreezeMix: { value: p.breezeMix },
    uBreezeMaxSlope: { value: p.breezeMaxSlope },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    side: THREE.DoubleSide,
  });

  return {
    material,
    setPlanarBounds(next: WaterPlanarBounds) {
      uniforms.uPlanar.value.set(next.minX, next.minZ, next.width, next.depth);
    },
    setEnvironment(tex: THREE.Texture) {
      if (!tex || tex === currentEnvMap) return;
      currentEnvMap = tex;
      uniforms.uEnvMap.value = tex;
      uniforms.uHasEnv.value = 1;
    },
    updateTime(t: number, { reducedMotion = false } = {}) {
      uniforms.uTime.value = t;
      const off = reducedMotion ? 0 : 1;
      uniforms.uBreezeStrength.value = POOL_WATER_DEFAULTS.breezeStrength * off;
      uniforms.uBreezeMix.value = POOL_WATER_DEFAULTS.breezeMix * off;
      uniforms.uBreezeScale.value = POOL_WATER_DEFAULTS.breezeScale;
      uniforms.uBreezeSpeed.value = POOL_WATER_DEFAULTS.breezeSpeed;
      uniforms.uWindDir.value.copy(getPoolWaterBreezeWindDir());
    },
    setParams(next: {
      tintR?: number;
      tintG?: number;
      tintB?: number;
      fresnelBase?: number;
      fresnelPower?: number;
      fresnelNormalStrength?: number;
      waterClarity?: number;
      waterDepth?: number;
      exposure?: number;
      opacity?: number;
      envRefraction?: number;
      envReflection?: boolean;
      normalScale?: number;
      maxSlope?: number;
    } = {}) {
      if (next.tintR !== undefined) uniforms.uAboveTint.value.x = next.tintR;
      if (next.tintG !== undefined) uniforms.uAboveTint.value.y = next.tintG;
      if (next.tintB !== undefined) uniforms.uAboveTint.value.z = next.tintB;
      if (next.fresnelBase !== undefined) uniforms.uFresnelBase.value = next.fresnelBase;
      if (next.fresnelPower !== undefined) uniforms.uFresnelPower.value = next.fresnelPower;
      if (next.fresnelNormalStrength !== undefined) {
        uniforms.uFresnelNormalStrength.value = next.fresnelNormalStrength;
      }
      if (next.waterClarity !== undefined) uniforms.uWaterClarity.value = next.waterClarity;
      if (next.waterDepth !== undefined) uniforms.uWaterDepth.value = next.waterDepth;
      if (next.exposure !== undefined) uniforms.uExposure.value = next.exposure;
      if (next.opacity !== undefined) uniforms.uOpacity.value = next.opacity;
      if (next.envRefraction !== undefined) uniforms.uEnvRefraction.value = next.envRefraction;
      if (next.normalScale !== undefined) uniforms.uNormalScale.value = next.normalScale;
      if (next.maxSlope !== undefined) uniforms.uMaxSlope.value = next.maxSlope;
      if (next.envReflection !== undefined) {
        uniforms.uEnvReflection.value = next.envReflection ? 1 : 0;
      }
    },
    dispose() {
      material.dispose();
      if (!envMap) dummyEnv.dispose();
    },
  };
}
