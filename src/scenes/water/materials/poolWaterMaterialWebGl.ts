/**
 * WebGL pool water — gradient normals + backdrop refraction + planar reflections + env sky.
 */
import * as THREE from "three";
import { POOL_SIM_DEFAULTS, POOL_WATER_DEFAULTS } from "../config/poolWaterDefaults";
import { SCENE_SUN_DIR } from "../../lighting/sun";
import type { WaterPlanarBounds } from "../waterPlanarMapping";
import { POOL_WATER_BREEZE_GLSL, getPoolWaterBreezeWindDir } from "./poolWaterBreeze";

type WaterSimLike = {
  getHeightTexture(): THREE.Texture;
  getResolutionW(): number;
  getResolutionH(): number;
};

export type PoolWaterMaterialApi = ReturnType<typeof createPoolWaterMaterialWebGl>;

const VERT = /* glsl */ `
  uniform vec4 uPlanar;
  uniform sampler2D uHeightMap;
  uniform float uDisplacementScale;
  varying vec3 vWorldPos;
  varying vec2 vRippleUv;

  float decodeH(float r) { return (r - 0.5) * 2.0; }

  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    float u = (worldPos.x - uPlanar.x) / uPlanar.z;
    float v = 1.0 - (worldPos.z - uPlanar.y) / uPlanar.w;
    vRippleUv = clamp(vec2(u, v), 0.0, 1.0);
    float h = decodeH(texture2D(uHeightMap, vRippleUv).r);
    worldPos.y += h * uDisplacementScale;
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const FRAG =
  /* glsl */ `
  precision highp float;

  varying vec3 vWorldPos;
  varying vec2 vRippleUv;

  uniform sampler2D uHeightMap;
  uniform sampler2D uBackdrop;
  uniform sampler2D uPlanarReflection;
  uniform sampler2D uEnvMap;
  uniform vec2 uResolution;
  uniform float uHasEnvCube;
  uniform float uHasPlanarReflection;
  uniform float uHdrBlend;
  uniform float uPlanarSkyFill;
  uniform float uEnvIntensity;
  uniform float uRefractionOffset;
  uniform float uReflectionDistortion;
  uniform mat4 uReflectionMatrix;
  uniform vec2 uSimRes;
  uniform float uNormalScale;
  uniform float uMaxSlope;
  uniform float uRippleStrength;
  uniform vec3 uAboveTint;
  uniform float uWaterDepth;
  uniform float uWaterClarity;
  uniform float uFresnelBase;
  uniform float uFresnelPower;
  uniform float uFresnelNormalStrength;
  uniform float uOpacity;
  uniform float uExposure;
  uniform float uReflectionRoughness;
  uniform float uChromaticAberration;
  uniform float uSunGlintStrength;
  uniform vec3 uSunDir;
  uniform float uSunStrength;
  uniform float uSunShininess;
  uniform vec3 uSunColor;
  uniform float uTime;
  uniform float uBreezeStrength;
  uniform float uBreezeScale;
  uniform float uBreezeSpeed;
  uniform vec2 uWindDir;
  uniform float uBreezeMix;
  uniform float uBreezeMaxSlope;

  float decodeH(float r) { return (r - 0.5) * 2.0; }

  vec2 equirectUv(vec3 dir) {
    vec2 uv = vec2(atan(dir.z, dir.x), asin(clamp(dir.y, -1.0, 1.0)));
    uv *= vec2(0.159154943, 0.318309886);
    uv += 0.5;
    return uv;
  }

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
    float fresnel = uFresnelBase + (1.0 - uFresnelBase) * pow(1.0 - cosTheta, uFresnelPower);

    float viewAngle = max(abs(viewDir.y), 0.12);
    float pathLength = uWaterDepth / viewAngle;
    vec3 extinction = vec3(0.45, 0.14, 0.05) * uWaterClarity;
    vec3 transmittance = exp(-extinction * pathLength * 0.05);

    vec2 screenUV = gl_FragCoord.xy / uResolution;
    float chroma = uChromaticAberration * 0.012;
    vec2 refrBase = screenUV + surfaceN.xz * uRefractionOffset;
    vec3 backdrop;
    backdrop.r = texture2D(uBackdrop, clamp(refrBase + surfaceN.xz * chroma, vec2(0.001), vec2(0.999))).r;
    backdrop.g = texture2D(uBackdrop, clamp(refrBase, vec2(0.001), vec2(0.999))).g;
    backdrop.b = texture2D(uBackdrop, clamp(refrBase - surfaceN.xz * chroma, vec2(0.001), vec2(0.999))).b;
    vec3 refractedColor = backdrop * uAboveTint * transmittance;

    vec3 reflectDir = reflect(-viewDir, fresnelN);
    vec3 sunDirN = normalize(uSunDir);

    vec3 reflectionColor = vec3(0.0);
    if (uHasPlanarReflection > 0.5) {
      vec3 distortedPos = vWorldPos + vec3(surfaceN.x, 0.0, surfaceN.z) * uReflectionDistortion;
      vec4 reflectCoord = uReflectionMatrix * vec4(distortedPos, 1.0);
      reflectionColor = texture2DProj(uPlanarReflection, reflectCoord).rgb;
    }

    if (uHasEnvCube > 0.5) {
      vec3 roughDir = normalize(reflectDir + vec3(surfaceN.x, 0.0, surfaceN.z) * uReflectionRoughness);
      vec3 cubeReflection = texture2D(uEnvMap, equirectUv(roughDir)).rgb * uEnvIntensity;
      float sunSpec = pow(max(dot(roughDir, sunDirN), 0.0), uSunShininess);
      cubeReflection += sunSpec * uSunStrength * uSunColor;
      float skyWeight = smoothstep(0.0, 0.2, reflectDir.y);
      float skyMix = skyWeight * uPlanarSkyFill * uHdrBlend;
      reflectionColor = mix(reflectionColor, cubeReflection, skyMix);
    }

    vec3 finalColor = mix(refractedColor, reflectionColor, fresnel);

    float rippleSpec = pow(max(dot(normalize(reflect(-viewDir, surfaceN)), sunDirN), 0.0), uSunShininess * 0.32);
    float sunGlint = pow(max(dot(reflectDir, sunDirN), 0.0), uSunShininess);
    finalColor += (rippleSpec * 0.65 + sunGlint * 0.35) * uSunGlintStrength * uSunColor * mix(0.35, 1.0, fresnel);

    float alpha = clamp(mix(uOpacity, 1.0, fresnel), 0.0, 1.0);
    gl_FragColor = vec4(finalColor * uExposure, alpha);
  }
`;

function createDummyEnvTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#9eb4c4";
    ctx.fillRect(0, 0, 1, 1);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

/** Push static tuned values from poolWaterDefaults (called once at material init). */
export function applyPoolWaterStaticParams(api: PoolWaterMaterialApi, { reducedMotion = false } = {}) {
  const w = POOL_WATER_DEFAULTS;
  const s = POOL_SIM_DEFAULTS;
  const breezeOff = reducedMotion ? 0 : 1;
  api.setParams({
    tintR: w.aboveWaterTint[0],
    tintG: w.aboveWaterTint[1],
    tintB: w.aboveWaterTint[2],
    fresnelBase: w.fresnelBase,
    fresnelPower: w.fresnelPower,
    fresnelNormalStrength: w.fresnelNormalStrength,
    waterClarity: w.waterClarity,
    waterDepth: w.waterDepth,
    opacity: w.opacity,
    exposure: w.exposure,
    refractionOffset: w.refractionOffset,
    reflectionDistortion: w.reflectionDistortion,
    envIntensity: w.envIntensity,
    hdrBlend: w.hdrBlend,
    planarSkyFill: w.planarSkyFill,
    reflectionRoughness: w.reflectionRoughness,
    chromaticAberration: w.chromaticAberration,
    sunGlintStrength: w.sunGlintStrength,
    normalScale: s.normalScale,
    maxSlope: s.maxSlope,
    displacementScale: w.displacementScale,
    rippleStrength: w.normalStrength,
    breezeStrength: w.breezeStrength * breezeOff,
    breezeMix: w.breezeMix * breezeOff,
    breezeScale: w.breezeScale,
    breezeSpeed: w.breezeSpeed,
    breezeMaxSlope: w.breezeMaxSlope,
    sunStrength: w.sunStrength,
    sunShininess: w.sunShininess,
    sunColor: w.sunColor,
  });
}

export function createPoolWaterMaterialWebGl({
  sim,
  bounds,
}: {
  sim: WaterSimLike;
  bounds: WaterPlanarBounds;
}) {
  const p = POOL_WATER_DEFAULTS;
  const heightTex = sim.getHeightTexture();
  const dummyEnv = createDummyEnvTexture();
  let reflectionEnv: THREE.Texture | null = null;

  const uniforms = {
    uHeightMap: { value: heightTex },
    uBackdrop: { value: null as THREE.Texture | null },
    uPlanarReflection: { value: null as THREE.Texture | null },
    uEnvMap: { value: dummyEnv },
    uHasEnvCube: { value: 0 },
    uHasPlanarReflection: { value: 0 },
    uHdrBlend: { value: p.hdrBlend },
    uPlanarSkyFill: { value: p.planarSkyFill },
    uEnvIntensity: { value: p.envIntensity },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uRefractionOffset: { value: p.refractionOffset },
    uReflectionDistortion: { value: p.reflectionDistortion },
    uReflectionMatrix: { value: new THREE.Matrix4() },
    uDisplacementScale: { value: p.displacementScale },
    uPlanar: {
      value: new THREE.Vector4(bounds.minX, bounds.minZ, bounds.width, bounds.depth),
    },
    uSimRes: { value: new THREE.Vector2(sim.getResolutionW(), sim.getResolutionH()) },
    uNormalScale: { value: POOL_SIM_DEFAULTS.normalScale },
    uMaxSlope: { value: POOL_SIM_DEFAULTS.maxSlope },
    uRippleStrength: { value: p.normalStrength },
    uAboveTint: { value: new THREE.Vector3(...p.aboveWaterTint) },
    uWaterDepth: { value: p.waterDepth },
    uWaterClarity: { value: p.waterClarity },
    uFresnelBase: { value: p.fresnelBase },
    uFresnelPower: { value: p.fresnelPower },
    uFresnelNormalStrength: { value: p.fresnelNormalStrength },
    uOpacity: { value: p.opacity },
    uExposure: { value: p.exposure },
    uReflectionRoughness: { value: p.reflectionRoughness },
    uChromaticAberration: { value: p.chromaticAberration },
    uSunGlintStrength: { value: p.sunGlintStrength },
    uSunDir: { value: SCENE_SUN_DIR.clone() },
    uSunStrength: { value: p.sunStrength },
    uSunShininess: { value: p.sunShininess },
    uSunColor: { value: new THREE.Color(p.sunColor) },
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
    setBackdrop(tex: THREE.Texture) {
      uniforms.uBackdrop.value = tex;
    },
    setPlanarReflection(tex: THREE.Texture | null) {
      uniforms.uPlanarReflection.value = tex;
      uniforms.uHasPlanarReflection.value = tex ? 1 : 0;
    },
    setReflectionMatrix(matrix: THREE.Matrix4) {
      uniforms.uReflectionMatrix.value.copy(matrix);
    },
    setReflectionCubemap(tex: THREE.Texture | null) {
      if (!tex || tex === reflectionEnv) return;
      reflectionEnv = tex;
      uniforms.uEnvMap.value = tex;
      uniforms.uHasEnvCube.value = 1;
    },
    setResolution(width: number, height: number) {
      uniforms.uResolution.value.set(Math.max(1, width), Math.max(1, height));
    },
    updateTime(t: number, { reducedMotion = false } = {}) {
      uniforms.uTime.value = t;
      uniforms.uWindDir.value.copy(getPoolWaterBreezeWindDir());
      const off = reducedMotion ? 0 : 1;
      uniforms.uBreezeStrength.value = POOL_WATER_DEFAULTS.breezeStrength * off;
      uniforms.uBreezeMix.value = POOL_WATER_DEFAULTS.breezeMix * off;
    },
    setParams(
      next: {
        tintR?: number;
        tintG?: number;
        tintB?: number;
        fresnelBase?: number;
        fresnelPower?: number;
        fresnelNormalStrength?: number;
        waterClarity?: number;
        waterDepth?: number;
        opacity?: number;
        exposure?: number;
        refractionOffset?: number;
        reflectionDistortion?: number;
        envIntensity?: number;
        hdrBlend?: number;
        planarSkyFill?: number;
        reflectionRoughness?: number;
        chromaticAberration?: number;
        sunGlintStrength?: number;
        normalScale?: number;
        maxSlope?: number;
        displacementScale?: number;
        rippleStrength?: number;
        breezeStrength?: number;
        breezeMix?: number;
        breezeScale?: number;
        breezeSpeed?: number;
        breezeMaxSlope?: number;
        sunStrength?: number;
        sunShininess?: number;
        sunColor?: string;
      } = {},
    ) {
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
      if (next.opacity !== undefined) uniforms.uOpacity.value = next.opacity;
      if (next.exposure !== undefined) uniforms.uExposure.value = next.exposure;
      if (next.refractionOffset !== undefined) uniforms.uRefractionOffset.value = next.refractionOffset;
      if (next.reflectionDistortion !== undefined) uniforms.uReflectionDistortion.value = next.reflectionDistortion;
      if (next.envIntensity !== undefined) uniforms.uEnvIntensity.value = next.envIntensity;
      if (next.hdrBlend !== undefined) uniforms.uHdrBlend.value = next.hdrBlend;
      if (next.planarSkyFill !== undefined) uniforms.uPlanarSkyFill.value = next.planarSkyFill;
      if (next.reflectionRoughness !== undefined) uniforms.uReflectionRoughness.value = next.reflectionRoughness;
      if (next.chromaticAberration !== undefined) uniforms.uChromaticAberration.value = next.chromaticAberration;
      if (next.sunGlintStrength !== undefined) uniforms.uSunGlintStrength.value = next.sunGlintStrength;
      if (next.normalScale !== undefined) uniforms.uNormalScale.value = next.normalScale;
      if (next.maxSlope !== undefined) uniforms.uMaxSlope.value = next.maxSlope;
      if (next.displacementScale !== undefined) uniforms.uDisplacementScale.value = next.displacementScale;
      if (next.rippleStrength !== undefined) uniforms.uRippleStrength.value = next.rippleStrength;
      if (next.breezeStrength !== undefined) uniforms.uBreezeStrength.value = next.breezeStrength;
      if (next.breezeMix !== undefined) uniforms.uBreezeMix.value = next.breezeMix;
      if (next.breezeScale !== undefined) uniforms.uBreezeScale.value = next.breezeScale;
      if (next.breezeSpeed !== undefined) uniforms.uBreezeSpeed.value = next.breezeSpeed;
      if (next.breezeMaxSlope !== undefined) uniforms.uBreezeMaxSlope.value = next.breezeMaxSlope;
      if (next.sunStrength !== undefined) uniforms.uSunStrength.value = next.sunStrength;
      if (next.sunShininess !== undefined) uniforms.uSunShininess.value = next.sunShininess;
      if (next.sunColor !== undefined) uniforms.uSunColor.value.set(next.sunColor);
    },
    dispose() {
      material.dispose();
      if (!reflectionEnv) dummyEnv.dispose();
    },
  };
}
