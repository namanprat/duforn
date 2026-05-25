// @ts-nocheck
import * as THREE from "three";
import { POOL_SIM_DEFAULTS, POOL_WATER_DEFAULTS } from "../config/poolWaterDefaults";

function sunDirectionFromAngles(elevationDeg, azimuthDeg, target = new THREE.Vector3()) {
  const elevation = THREE.MathUtils.degToRad(elevationDeg);
  const azimuth = THREE.MathUtils.degToRad(azimuthDeg);
  target.set(
    Math.cos(elevation) * Math.sin(azimuth),
    Math.sin(elevation),
    Math.cos(elevation) * Math.cos(azimuth),
  );
  return target.normalize();
}

const VERT_UV = /* glsl */ `
  varying vec3 vWorldPos;
  varying vec3 vWorldNormal;
  varying vec2 vRippleUv;

  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vRippleUv = clamp(uv, 0.0, 1.0);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const VERT_PLANAR = /* glsl */ `
  uniform vec4 uPlanar;
  varying vec3 vWorldPos;
  varying vec3 vWorldNormal;
  varying vec2 vRippleUv;

  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    float u = (worldPos.x - uPlanar.x) / uPlanar.z;
    float v = 1.0 - (worldPos.z - uPlanar.y) / uPlanar.w;
    vRippleUv = clamp(vec2(u, v), 0.0, 1.0);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const FRAG = /* glsl */ `
  precision highp float;

  varying vec3 vWorldPos;
  varying vec3 vWorldNormal;
  varying vec2 vRippleUv;

  uniform sampler2D uHeightMap;
  uniform sampler2D uEnvMap;
  uniform float uHasEnv;
  uniform float uSimRes;
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
  uniform float uTime;
  uniform float uCausticsIntensity;
  uniform float uCausticsScale;
  uniform float uCausticsSpeed;
  uniform vec3 uCausticsColor;

  float decodeH(float r) { return (r - 0.5) * 2.0; }

  float sampleHBilinear(vec2 uvIn) {
    float maxCoord = uSimRes - 1.0;
    vec2 coord = clamp(uvIn, 0.0, 1.0) * maxCoord;
    vec2 i0 = floor(coord);
    vec2 i1 = min(i0 + 1.0, vec2(maxCoord));
    vec2 t = coord - i0;
    vec2 uv00 = (i0 + 0.5) / uSimRes;
    vec2 uv10 = (vec2(i1.x, i0.y) + 0.5) / uSimRes;
    vec2 uv01 = (vec2(i0.x, i1.y) + 0.5) / uSimRes;
    vec2 uv11 = (i1 + 0.5) / uSimRes;
    float h00 = decodeH(texture2D(uHeightMap, uv00).r);
    float h10 = decodeH(texture2D(uHeightMap, uv10).r);
    float h01 = decodeH(texture2D(uHeightMap, uv01).r);
    float h11 = decodeH(texture2D(uHeightMap, uv11).r);
    float hx0 = mix(h00, h10, t.x);
    float hx1 = mix(h01, h11, t.x);
    return mix(hx0, hx1, t.y);
  }

  vec3 sampleRippleNormal(vec2 uvIn) {
    // 4-tap central-difference normal — cheaper than the prior 8-tap Sobel.
    float texel = 1.0 / max(uSimRes - 1.0, 1.0);
    float hL = sampleHBilinear(uvIn + vec2(-texel, 0.0));
    float hR = sampleHBilinear(uvIn + vec2( texel, 0.0));
    float hU = sampleHBilinear(uvIn + vec2(0.0, -texel));
    float hD = sampleHBilinear(uvIn + vec2(0.0,  texel));
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
    vec3 mixedN = normalize(mix(flatN, rippleN, uRippleStrength));
    vec3 fresnelN = normalize(mix(flatN, rippleN, uFresnelNormalStrength));

    vec3 viewDir = normalize(cameraPosition - vWorldPos);
    float F0 = 0.02;
    float cosTheta = max(dot(viewDir, fresnelN), 0.0);
    float fresnel = F0 + (1.0 - F0) * pow(1.0 - cosTheta, uFresnelPower);

    float viewAngle = max(abs(viewDir.y), 0.15);
    float pathLength = uWaterDepth / viewAngle;
    float depthFactor = smoothstep(0.0, uDepthFalloff, pathLength);
    vec3 waterColor = mix(uShallowColor, uDeepColor, depthFactor);

    // Caustics are projected onto the Ground mesh (see applyGroundCaustics) —
    // no longer baked into the water surface tint.

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
    float specMask = 1.0 - foamMask;
    finalColor += uSunColor * spec * uSunIntensity * specMask;
    finalColor = mix(finalColor, vec3(1.0), foamMask);

    float distanceToCamera = length(cameraPosition - vWorldPos);
    float fogFactor = smoothstep(uFogStartDistance, uFogEndDistance, distanceToCamera) * uFogIntensity;
    finalColor = mix(finalColor, uFogColor, fogFactor);

    gl_FragColor = vec4(clamp(finalColor, 0.0, 1.0), uOpacity);
  }
`;

export function createPoolWaterMaterialWebGl({ sim, bounds, envMap, waterParams, useUvMapping }) {
  const p = { ...POOL_WATER_DEFAULTS, ...waterParams };
  const heightTex = sim.getHeightTexture();
  const res = sim.getResolution();
  const sunDir = sunDirectionFromAngles(35, 49);

  const dummyEnv = envMap ?? new THREE.DataTexture(new Uint8Array([125, 151, 168, 255]), 1, 1);
  if (!envMap) {
    dummyEnv.needsUpdate = true;
  }

  const uniforms = {
    uHeightMap: { value: heightTex },
    uEnvMap: { value: envMap ?? dummyEnv },
    uHasEnv: { value: envMap ? 1 : 0 },
    uPlanar: {
      value: new THREE.Vector4(bounds.minX, bounds.minZ, bounds.width, bounds.depth),
    },
    uSimRes: { value: res },
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
    uSunDir: { value: sunDir },
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
    uTime: { value: 0 },
    uCausticsIntensity: { value: p.causticsIntensity },
    uCausticsScale: { value: p.causticsScale },
    uCausticsSpeed: { value: p.causticsSpeed },
    uCausticsColor: { value: new THREE.Color(p.causticsColor) },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: useUvMapping ? VERT_UV : VERT_PLANAR,
    fragmentShader: FRAG,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    side: THREE.FrontSide,
  });

  return {
    material,
    setPlanarBounds(nextBounds) {
      uniforms.uPlanar.value.set(
        nextBounds.minX,
        nextBounds.minZ,
        nextBounds.width,
        nextBounds.depth,
      );
    },
    updateSun(elevation, azimuth) {
      sunDirectionFromAngles(elevation, azimuth, uniforms.uSunDir.value);
    },
    updateWaterParams(next) {
      if (next.shallowWaterColor) uniforms.uShallowColor.value.set(next.shallowWaterColor);
      if (next.deepWaterColor) uniforms.uDeepColor.value.set(next.deepWaterColor);
      if (next.depthFalloff != null) uniforms.uDepthFalloff.value = next.depthFalloff;
      if (next.waterDepth != null) uniforms.uWaterDepth.value = next.waterDepth;
      if (next.waterClarity != null) uniforms.uWaterClarity.value = next.waterClarity;
      if (next.fresnelPower != null) uniforms.uFresnelPower.value = next.fresnelPower;
      if (next.fresnelNormalStrength != null)
        uniforms.uFresnelNormalStrength.value = next.fresnelNormalStrength;
      if (next.normalStrength != null) uniforms.uRippleStrength.value = next.normalStrength;
      if (next.opacity != null) uniforms.uOpacity.value = next.opacity;
      if (next.sunSpecularIntensity != null)
        uniforms.uSunIntensity.value = next.sunSpecularIntensity;
      if (next.specularShininess != null)
        uniforms.uSpecularShininess.value = next.specularShininess;
      if (next.subsurfaceIntensity != null)
        uniforms.uSubsurfaceIntensity.value = next.subsurfaceIntensity;
      if (next.subsurfacePower != null) uniforms.uSubsurfacePower.value = next.subsurfacePower;
      if (next.subsurfaceColor) uniforms.uSubsurfaceColor.value.set(next.subsurfaceColor);
      if (next.refractionStrength != null)
        uniforms.uRefractionStrength.value = next.refractionStrength;
      if (next.fogStartDistance != null) uniforms.uFogStartDistance.value = next.fogStartDistance;
      if (next.fogEndDistance != null) uniforms.uFogEndDistance.value = next.fogEndDistance;
      if (next.fogIntensity != null) uniforms.uFogIntensity.value = next.fogIntensity;
      if (next.fogColor) uniforms.uFogColor.value.set(next.fogColor);
      if (next.foamAmount != null) uniforms.uFoamAmount.value = next.foamAmount;
      if (next.foamThreshold != null) uniforms.uFoamThreshold.value = next.foamThreshold;
      if (next.causticsIntensity != null)
        uniforms.uCausticsIntensity.value = next.causticsIntensity;
      if (next.causticsScale != null) uniforms.uCausticsScale.value = next.causticsScale;
      if (next.causticsSpeed != null) uniforms.uCausticsSpeed.value = next.causticsSpeed;
      if (next.causticsColor) uniforms.uCausticsColor.value.set(next.causticsColor);
    },
    updateTime(t) {
      uniforms.uTime.value = t;
    },
    dispose() {
      material.dispose();
      if (!envMap) dummyEnv.dispose();
    },
  };
}
