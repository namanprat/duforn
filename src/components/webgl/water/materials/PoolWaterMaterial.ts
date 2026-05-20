// @ts-nocheck
/**
 * Pool water material — ocean-webgpu look on the GLB pool quad.
 *
 * Uses `MeshBasicNodeMaterial` (unlit, transparent, depthWrite=false) so the
 * pool floor stays visible through the water. Vertex displacement + normals
 * are sampled directly from the shallow-water `h` buffer (no storage textures —
 * see docs/TSL_WEBGPU.md → "Storage Textures - DOESN'T WORK YET").
 *
 * On WebGL the fallback path uses a dedicated ShaderMaterial with the same
 * ocean-webgpu-style shading as the WebGPU TSL path.
 */
import * as THREE from "three";
import { POOL_SIM_DEFAULTS, POOL_WATER_DEFAULTS } from "../config/poolWaterDefaults";
import { planarBoundsToUniform } from "../waterPlanarMapping";
import { isGpuShallowWaterSim } from "../compute/createPoolWaterSim";
import { createPoolWaterMaterialWebGl } from "./poolWaterMaterialWebGl";

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

async function createWebGPU({ sim, bounds, envMap, waterParams, useUvMapping }) {
  const { MeshBasicNodeMaterial } = await import("three/webgpu");
  const tsl = await import("three/tsl");
  const {
    Fn,
    float,
    int,
    vec2,
    vec3,
    vec4,
    uniform,
    texture,
    positionWorld,
    cameraPosition,
    dot,
    normalize,
    reflect,
    mix,
    clamp,
    pow,
    max,
    min,
    abs,
    floor,
    atan,
    asin,
    smoothstep,
    exp,
    transformNormalToView,
    uv,
  } = tsl;

  const p = { ...POOL_WATER_DEFAULTS, ...waterParams };
  const res = sim.getResolution();
  const hBuf = sim.getHeightBuffer();

  const uRes = uniform(res);
  const uPlanar = uniform(planarBoundsToUniform(bounds));
  const uNormalScale = uniform(POOL_SIM_DEFAULTS.normalScale);
  const uMaxSlope = uniform(POOL_SIM_DEFAULTS.maxSlope);
  const uRippleStrength = uniform(p.normalStrength);
  const shallowColor = uniform(new THREE.Color(p.shallowWaterColor));
  const deepColor = uniform(new THREE.Color(p.deepWaterColor));
  const defaultReflColor = uniform(new THREE.Color(p.defaultReflection));
  const depthFalloff = uniform(p.depthFalloff);
  const waterDepth = uniform(p.waterDepth);
  const waterClarity = uniform(p.waterClarity);
  const fresnelPower = uniform(p.fresnelPower);
  const fresnelNormalStrength = uniform(p.fresnelNormalStrength);
  const opacityUniform = uniform(p.opacity);
  const sunDir = uniform(sunDirectionFromAngles(35, 49));
  const sunColor = uniform(new THREE.Color(p.sunColor));
  const sunIntensity = uniform(p.sunSpecularIntensity);
  const specularShininess = uniform(p.specularShininess);
  const subsurfaceIntensity = uniform(p.subsurfaceIntensity);
  const subsurfacePower = uniform(p.subsurfacePower);
  const subsurfaceColor = uniform(new THREE.Color(p.subsurfaceColor));
  const refractionStrength = uniform(p.refractionStrength);
  const fogStartDistance = uniform(p.fogStartDistance);
  const fogEndDistance = uniform(p.fogEndDistance);
  const fogIntensity = uniform(p.fogIntensity);
  const fogColor = uniform(new THREE.Color(p.fogColor));
  const foamAmount = uniform(p.foamAmount);
  const foamThreshold = uniform(p.foamThreshold);
  const uHasEnv = uniform(envMap ? 1 : 0);
  const envTex = texture(envMap ?? new THREE.Texture());

  const material = new MeshBasicNodeMaterial();
  material.transparent = true;
  material.depthWrite = false;
  material.depthTest = true;
  material.side = THREE.FrontSide;

  // -- Buffer sampling helpers --------------------------------------------
  const clampPx = (px) => max(float(0), min(uRes.toFloat().sub(float(1)), px));
  const sampleH = (px, py) => {
    const cx = clampPx(px);
    const cy = clampPx(py);
    const idx = int(cy.mul(uRes.toFloat()).add(cx));
    return hBuf.element(idx);
  };

  const rippleUvFn = useUvMapping
    ? Fn(() => clamp(uv(), vec2(0, 0), vec2(1, 1)))
    : Fn(() => {
        const u = positionWorld.x.sub(uPlanar.x).div(uPlanar.z);
        const v = float(1).sub(positionWorld.z.sub(uPlanar.y).div(uPlanar.w));
        return clamp(vec2(u, v), vec2(0, 0), vec2(1, 1));
      });

  const sampleHBilinear = Fn(([uvIn]) => {
    const maxCoord = uRes.toFloat().sub(float(1));
    const coord = clamp(uvIn, vec2(0, 0), vec2(1, 1)).mul(maxCoord);
    const x0 = floor(coord.x);
    const y0 = floor(coord.y);
    const x1 = x0.add(float(1));
    const y1 = y0.add(float(1));
    const tx = coord.x.sub(x0);
    const ty = coord.y.sub(y0);

    const h00 = sampleH(x0, y0);
    const h10 = sampleH(x1, y0);
    const h01 = sampleH(x0, y1);
    const h11 = sampleH(x1, y1);
    const hx0 = mix(h00, h10, tx);
    const hx1 = mix(h01, h11, tx);
    return mix(hx0, hx1, ty);
  });

  const sampleRippleNormal = Fn(([uvIn]) => {
    const texel = float(1).div(max(uRes.toFloat().sub(float(1)), float(1)));
    // Smoothed central-difference gradient (Sobel-style) — samples at ±1 and
    // ±2 cells so the derived normal isn't pixel-stepped at higher grid sizes.
    const hL1 = sampleHBilinear(uvIn.add(vec2(texel.negate(), float(0))));
    const hL2 = sampleHBilinear(uvIn.add(vec2(texel.mul(float(2)).negate(), float(0))));
    const hR1 = sampleHBilinear(uvIn.add(vec2(texel, float(0))));
    const hR2 = sampleHBilinear(uvIn.add(vec2(texel.mul(float(2)), float(0))));
    const hU1 = sampleHBilinear(uvIn.add(vec2(float(0), texel.negate())));
    const hU2 = sampleHBilinear(uvIn.add(vec2(float(0), texel.mul(float(2)).negate())));
    const hD1 = sampleHBilinear(uvIn.add(vec2(float(0), texel)));
    const hD2 = sampleHBilinear(uvIn.add(vec2(float(0), texel.mul(float(2)))));
    // Weighted gradient: 2*near + 1*far on each side, divided by 6.
    const gradX = hL1
      .mul(float(2))
      .add(hL2)
      .sub(hR1.mul(float(2)))
      .sub(hR2)
      .mul(float(1 / 6));
    const gradZ = hU1
      .mul(float(2))
      .add(hU2)
      .sub(hD1.mul(float(2)))
      .sub(hD2)
      .mul(float(1 / 6));
    const nx = clamp(gradX.mul(uNormalScale), uMaxSlope.negate(), uMaxSlope);
    const nz = clamp(gradZ.mul(uNormalScale), uMaxSlope.negate(), uMaxSlope);
    return normalize(vec3(nx, float(1), nz));
  });

  // No vertex displacement — the pool quad stays flat to avoid DC drift of
  // the wave-equation field lifting the whole mesh. Ripples are normal-only.

  // -- Normal --------------------------------------------------------------
  material.normalNode = Fn(() => {
    const uvIn = rippleUvFn();
    const rippleN = sampleRippleNormal(uvIn);
    const flatN = vec3(0, 1, 0);
    const mixed = normalize(mix(flatN, rippleN, uRippleStrength));
    return transformNormalToView(mixed);
  })();

  // -- Color ---------------------------------------------------------------
  material.colorNode = Fn(() => {
    const uvIn = rippleUvFn();
    const rippleN = sampleRippleNormal(uvIn);
    const flatN = vec3(0, 1, 0);
    const fresnelN = normalize(mix(flatN, rippleN, fresnelNormalStrength));

    const viewDir = normalize(cameraPosition.sub(positionWorld));
    const F0 = float(0.02);
    const cosTheta = max(dot(viewDir, fresnelN), float(0));
    const fresnel = F0.add(
      float(1)
        .sub(F0)
        .mul(pow(float(1).sub(cosTheta), fresnelPower)),
    );

    const viewAngle = max(abs(viewDir.y), float(0.15));
    const pathLength = waterDepth.div(viewAngle);
    const depthFactor = smoothstep(float(0), depthFalloff, pathLength);
    const waterColor = mix(vec3(shallowColor), vec3(deepColor), depthFactor);

    const reflectDir = reflect(viewDir.negate(), fresnelN);
    const phi = atan(reflectDir.z, reflectDir.x);
    const theta = asin(clamp(reflectDir.y, float(-1), float(1)));
    const baseEnvUV = vec2(phi.mul(0.1591).add(0.5), theta.mul(0.3183).add(0.5));
    const refractedUV = baseEnvUV.add(vec2(rippleN.x, rippleN.z).mul(refractionStrength));
    const envSample = envTex.sample(refractedUV).xyz;
    const reflectionColor = mix(vec3(defaultReflColor), envSample, float(uHasEnv));

    let finalColor = mix(waterColor, reflectionColor, fresnel);

    // Beer's-law tint — red absorbed first, blue last (ocean-webgpu pattern).
    const extinction = vec3(
      float(0.4).mul(waterClarity),
      float(0.12).mul(waterClarity),
      float(0.04).mul(waterClarity),
    );
    const absorptionDepth = pathLength.mul(0.05);
    const transmittance = vec3(
      exp(extinction.x.negate().mul(absorptionDepth)),
      exp(extinction.y.negate().mul(absorptionDepth)),
      exp(extinction.z.negate().mul(absorptionDepth)),
    );
    finalColor = vec3(
      finalColor.x.mul(transmittance.x),
      finalColor.y.mul(transmittance.y),
      finalColor.z.mul(transmittance.z),
    );

    // Subsurface scattering — water glows when backlit (ocean-webgpu lines
    // 316-322). Backlight derived from sun direction vs view direction.
    const backLight = max(dot(sunDir.negate(), viewDir), float(0));
    const subsurface = pow(backLight, subsurfacePower).mul(subsurfaceIntensity);
    finalColor = finalColor.add(vec3(subsurfaceColor).mul(subsurface));

    // Tight sun specular (Blinn-Phong) — masked off where foam covers.
    const halfVec = normalize(viewDir.add(sunDir));
    const spec = pow(max(dot(fresnelN, halfVec), float(0)), specularShininess);

    // Foam — narrow band on near-breaking crests. smoothstep prevents the
    // white-out we hit earlier when ripples were tall.
    const horizontalTilt = abs(rippleN.x).add(abs(rippleN.z));
    const foam = smoothstep(foamThreshold, foamThreshold.add(float(0.15)), horizontalTilt).mul(
      foamAmount,
    );
    const foamMask = clamp(foam, float(0), float(1));
    const specMask = float(1).sub(foamMask);
    finalColor = finalColor.add(vec3(sunColor).mul(spec).mul(sunIntensity).mul(specMask));
    finalColor = mix(finalColor, vec3(1, 1, 1), foamMask);

    // Atmospheric fog for depth perception (ocean-webgpu lines 377-385).
    const distanceToCamera = cameraPosition.sub(positionWorld).length();
    const fogFactor = smoothstep(fogStartDistance, fogEndDistance, distanceToCamera).mul(
      fogIntensity,
    );
    finalColor = mix(finalColor, vec3(fogColor), fogFactor);

    return vec4(clamp(finalColor, float(0), float(1)), opacityUniform);
  })();

  return {
    material,
    setPlanarBounds(nextBounds) {
      uPlanar.value.copy(planarBoundsToUniform(nextBounds));
    },
    updateSun(elevation, azimuth) {
      sunDir.value.copy(sunDirectionFromAngles(elevation, azimuth));
    },
    updateWaterParams(next) {
      if (next.shallowWaterColor) shallowColor.value.set(next.shallowWaterColor);
      if (next.deepWaterColor) deepColor.value.set(next.deepWaterColor);
      if (next.depthFalloff != null) depthFalloff.value = next.depthFalloff;
      if (next.waterDepth != null) waterDepth.value = next.waterDepth;
      if (next.waterClarity != null) waterClarity.value = next.waterClarity;
      if (next.fresnelPower != null) fresnelPower.value = next.fresnelPower;
      if (next.fresnelNormalStrength != null)
        fresnelNormalStrength.value = next.fresnelNormalStrength;
      if (next.normalStrength != null) uRippleStrength.value = next.normalStrength;
      if (next.opacity != null) opacityUniform.value = next.opacity;
      if (next.sunSpecularIntensity != null) sunIntensity.value = next.sunSpecularIntensity;
      if (next.specularShininess != null) specularShininess.value = next.specularShininess;
      if (next.subsurfaceIntensity != null) subsurfaceIntensity.value = next.subsurfaceIntensity;
      if (next.subsurfacePower != null) subsurfacePower.value = next.subsurfacePower;
      if (next.subsurfaceColor) subsurfaceColor.value.set(next.subsurfaceColor);
      if (next.refractionStrength != null) refractionStrength.value = next.refractionStrength;
      if (next.fogStartDistance != null) fogStartDistance.value = next.fogStartDistance;
      if (next.fogEndDistance != null) fogEndDistance.value = next.fogEndDistance;
      if (next.fogIntensity != null) fogIntensity.value = next.fogIntensity;
      if (next.fogColor) fogColor.value.set(next.fogColor);
      if (next.foamAmount != null) foamAmount.value = next.foamAmount;
      if (next.foamThreshold != null) foamThreshold.value = next.foamThreshold;
    },
    dispose() {
      material.dispose?.();
    },
  };
}

function createWebGL({ sim, bounds, envMap, waterParams, useUvMapping }) {
  return createPoolWaterMaterialWebGl({ sim, bounds, envMap, waterParams, useUvMapping });
}

export async function createPoolWaterMaterial(_gl, { mesh, sim, bounds, envMap, waterParams }) {
  const source = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
  if (!source) throw new Error("[createPoolWaterMaterial] mesh has no material");
  const useUvMapping = Boolean(mesh.geometry?.getAttribute?.("uv"));

  if (isGpuShallowWaterSim(sim)) {
    return createWebGPU({ sim, bounds, envMap, waterParams, useUvMapping });
  }
  return createWebGL({ sim, bounds, envMap, waterParams, useUvMapping });
}
