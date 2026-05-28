// @ts-nocheck
import * as THREE from "three";
import { POOL_SIM_DEFAULTS, POOL_WATER_DEFAULTS } from "../config/poolWaterDefaults";

function sunDirectionFromAngles(elevationDeg, azimuthDeg) {
  const elevation = THREE.MathUtils.degToRad(elevationDeg);
  const azimuth = THREE.MathUtils.degToRad(azimuthDeg);
  return new THREE.Vector3(
    Math.cos(elevation) * Math.sin(azimuth),
    Math.sin(elevation),
    Math.cos(elevation) * Math.cos(azimuth),
  ).normalize();
}

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

const FRAG = /* glsl */ `
  precision highp float;

  varying vec3 vWorldPos;
  varying vec2 vRippleUv;

  uniform sampler2D uHeightMap;
  uniform sampler2D uEnvMap;
  uniform float uHasEnv;
  uniform vec2 uSimRes;
  uniform float uNormalScale;
  uniform float uMaxSlope;
  uniform float uRippleStrength;
  uniform vec3 uShallowColor;
  uniform vec3 uDeepColor;
  uniform vec3 uDefaultReflection;
  uniform float uDepthFalloff;
  uniform float uWaterDepth;
  uniform float uWaterClarity;
  uniform float uFresnelPower;
  uniform float uFresnelNormalStrength;
  uniform float uOpacity;
  uniform vec3 uSunDir;
  uniform vec3 uSunColor;
  uniform float uSunIntensity;
  uniform float uSpecularShininess;
  uniform float uSubsurfaceIntensity;
  uniform float uSubsurfacePower;
  uniform vec3 uSubsurfaceColor;
  uniform float uRefractionStrength;
  uniform float uFogStartDistance;
  uniform float uFogEndDistance;
  uniform float uFogIntensity;
  uniform vec3 uFogColor;
  uniform float uFoamAmount;
  uniform float uFoamThreshold;

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

  vec2 equirectUV(vec3 dir) {
    float phi = atan(dir.z, dir.x);
    float theta = asin(clamp(dir.y, -1.0, 1.0));
    return vec2(phi * 0.1591 + 0.5, theta * 0.3183 + 0.5);
  }

  void main() {
    vec3 rippleN = sampleRippleNormal(vRippleUv);
    vec3 flatN = vec3(0.0, 1.0, 0.0);
    vec3 fresnelN = normalize(mix(flatN, rippleN, uFresnelNormalStrength));

    vec3 viewDir = normalize(cameraPosition - vWorldPos);
    float F0 = 0.02;
    float cosTheta = max(dot(viewDir, fresnelN), 0.0);
    float fresnel = F0 + (1.0 - F0) * pow(1.0 - cosTheta, uFresnelPower);

    float viewAngle = max(abs(viewDir.y), 0.15);
    float pathLength = uWaterDepth / viewAngle;
    float depthFactor = smoothstep(0.0, uDepthFalloff, pathLength);
    vec3 waterColor = mix(uShallowColor, uDeepColor, depthFactor);

    vec3 reflectDir = reflect(-viewDir, fresnelN);
    vec2 baseEnvUV = equirectUV(reflectDir);
    vec2 refractedUV = baseEnvUV + rippleN.xz * uRefractionStrength;
    vec3 envSample = texture2D(uEnvMap, refractedUV).rgb;
    vec3 reflectionColor = mix(uDefaultReflection, envSample, uHasEnv);

    vec3 finalColor = mix(waterColor, reflectionColor, fresnel);

    vec3 extinction = vec3(0.4, 0.12, 0.04) * uWaterClarity;
    float absorptionDepth = pathLength * 0.05;
    vec3 transmittance = exp(-extinction * absorptionDepth);
    finalColor *= transmittance;

    float backLight = max(dot(-uSunDir, viewDir), 0.0);
    float subsurface = pow(backLight, uSubsurfacePower) * uSubsurfaceIntensity;
    finalColor += uSubsurfaceColor * subsurface;

    vec3 halfVec = normalize(viewDir + uSunDir);
    float spec = pow(max(dot(fresnelN, halfVec), 0.0), uSpecularShininess);

    float horizontalTilt = abs(rippleN.x) + abs(rippleN.z);
    float foam = smoothstep(uFoamThreshold, uFoamThreshold + 0.15, horizontalTilt) * uFoamAmount;
    float foamMask = clamp(foam, 0.0, 1.0);
    finalColor += uSunColor * spec * uSunIntensity * (1.0 - foamMask);
    finalColor = mix(finalColor, vec3(1.0), foamMask);

    float distanceToCamera = length(cameraPosition - vWorldPos);
    float fogFactor = smoothstep(uFogStartDistance, uFogEndDistance, distanceToCamera) * uFogIntensity;
    finalColor = mix(finalColor, uFogColor, fogFactor);

    gl_FragColor = vec4(clamp(finalColor, 0.0, 1.0), uOpacity);
  }
`;

export function createPoolWaterMaterialWebGl({ sim, bounds, envMap }) {
  const p = POOL_WATER_DEFAULTS;
  const heightTex = sim.getHeightTexture();
  const dummyEnv = envMap ?? new THREE.DataTexture(new Uint8Array([125, 151, 168, 255]), 1, 1);
  if (!envMap) dummyEnv.needsUpdate = true;

  const uniforms = {
    uHeightMap: { value: heightTex },
    uEnvMap: { value: envMap ?? dummyEnv },
    uHasEnv: { value: envMap ? 1 : 0 },
    uPlanar: {
      value: new THREE.Vector4(bounds.minX, bounds.minZ, bounds.width, bounds.depth),
    },
    uSimRes: { value: new THREE.Vector2(sim.getResolutionW(), sim.getResolutionH()) },
    uNormalScale: { value: POOL_SIM_DEFAULTS.normalScale },
    uMaxSlope: { value: POOL_SIM_DEFAULTS.maxSlope },
    uRippleStrength: { value: p.normalStrength },
    uShallowColor: { value: new THREE.Color(p.shallowWaterColor) },
    uDeepColor: { value: new THREE.Color(p.deepWaterColor) },
    uDefaultReflection: { value: new THREE.Color(p.defaultReflection) },
    uDepthFalloff: { value: p.depthFalloff },
    uWaterDepth: { value: p.waterDepth },
    uWaterClarity: { value: p.waterClarity },
    uFresnelPower: { value: p.fresnelPower },
    uFresnelNormalStrength: { value: p.fresnelNormalStrength },
    uOpacity: { value: p.opacity },
    uSunDir: { value: sunDirectionFromAngles(35, 49) },
    uSunColor: { value: new THREE.Color(p.sunColor) },
    uSunIntensity: { value: p.sunSpecularIntensity },
    uSpecularShininess: { value: p.specularShininess },
    uSubsurfaceIntensity: { value: p.subsurfaceIntensity },
    uSubsurfacePower: { value: p.subsurfacePower },
    uSubsurfaceColor: { value: new THREE.Color(p.subsurfaceColor) },
    uRefractionStrength: { value: p.refractionStrength },
    uFogStartDistance: { value: p.fogStartDistance },
    uFogEndDistance: { value: p.fogEndDistance },
    uFogIntensity: { value: p.fogIntensity },
    uFogColor: { value: new THREE.Color(p.fogColor) },
    uFoamAmount: { value: p.foamAmount },
    uFoamThreshold: { value: p.foamThreshold },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    side: THREE.FrontSide,
  });

  return {
    material,
    setPlanarBounds(next) {
      uniforms.uPlanar.value.set(next.minX, next.minZ, next.width, next.depth);
    },
    updateTime() {},
    dispose() {
      material.dispose();
      if (!envMap) dummyEnv.dispose();
    },
  };
}
