// @ts-nocheck
/**
 * Pool water material — ocean-style look on the GLB pool quad.
 *
 * MeshBasicNodeMaterial (unlit, transparent, depthWrite=false) so the pool
 * floor stays visible. Vertex displacement is omitted; the surface stays flat
 * and ripples are normal-only, sampled from the wave-equation height buffer.
 */
import * as THREE from "three";
import { POOL_SIM_DEFAULTS, POOL_WATER_DEFAULTS } from "../config/poolWaterDefaults";
import { planarBoundsToUniform } from "../waterPlanarMapping";
import { isGpuShallowWaterSim } from "../compute/createPoolWaterSim";
import { createPoolWaterMaterialWebGl } from "./poolWaterMaterialWebGl";
import { createPoolWaterBreezeTSL, getPoolWaterBreezeWindDir } from "./poolWaterBreeze";

function sunDirectionFromAngles(elevationDeg, azimuthDeg) {
  const elevation = THREE.MathUtils.degToRad(elevationDeg);
  const azimuth = THREE.MathUtils.degToRad(azimuthDeg);
  return new THREE.Vector3(
    Math.cos(elevation) * Math.sin(azimuth),
    Math.sin(elevation),
    Math.cos(elevation) * Math.cos(azimuth),
  ).normalize();
}

async function createWebGPU({ sim, bounds, envMap }) {
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
  } = tsl;

  const p = POOL_WATER_DEFAULTS;
  const nw = sim.getResolutionW();
  const nh = sim.getResolutionH();
  const hBuf = sim.getHeightBuffer();

  const uResW = uniform(nw);
  const uResH = uniform(nh);
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
  const uTime = uniform(0);
  const uBreezeStrength = uniform(p.breezeStrength);
  const uBreezeScale = uniform(p.breezeScale);
  const uBreezeSpeed = uniform(p.breezeSpeed);
  const uWindDir = uniform(getPoolWaterBreezeWindDir());
  const uBreezeMix = uniform(p.breezeMix);
  const uBreezeMaxSlope = uniform(p.breezeMaxSlope);
  const uHasEnv = uniform(envMap ? 1 : 0);
  const envTex = texture(envMap ?? new THREE.Texture());

  const material = new MeshBasicNodeMaterial();
  material.transparent = true;
  material.depthWrite = false;
  material.depthTest = true;
  material.side = THREE.DoubleSide;

  const clampW = (px) => max(float(0), min(uResW.toFloat().sub(float(1)), px));
  const clampH = (py) => max(float(0), min(uResH.toFloat().sub(float(1)), py));
  const sampleH = (px, py) => {
    const cx = clampW(px);
    const cy = clampH(py);
    const idx = int(cy.mul(uResW.toFloat()).add(cx));
    return hBuf.element(idx);
  };

  const rippleUvFn = Fn(() => {
    const u = positionWorld.x.sub(uPlanar.x).div(uPlanar.z);
    const v = float(1).sub(positionWorld.z.sub(uPlanar.y).div(uPlanar.w));
    return clamp(vec2(u, v), vec2(0, 0), vec2(1, 1));
  });

  const sampleHBilinear = Fn(([uvIn]) => {
    const maxW = uResW.toFloat().sub(float(1));
    const maxH = uResH.toFloat().sub(float(1));
    const cx = clamp(uvIn.x, float(0), float(1)).mul(maxW);
    const cy = clamp(uvIn.y, float(0), float(1)).mul(maxH);
    const x0 = floor(cx);
    const y0 = floor(cy);
    const x1 = x0.add(float(1));
    const y1 = y0.add(float(1));
    const tx = cx.sub(x0);
    const ty = cy.sub(y0);

    const h00 = sampleH(x0, y0);
    const h10 = sampleH(x1, y0);
    const h01 = sampleH(x0, y1);
    const h11 = sampleH(x1, y1);
    return mix(mix(h00, h10, tx), mix(h01, h11, tx), ty);
  });

  const sampleRippleNormal = Fn(([uvIn]) => {
    const texelU = float(1).div(max(uResW.toFloat().sub(float(1)), float(1)));
    const texelV = float(1).div(max(uResH.toFloat().sub(float(1)), float(1)));
    const hL = sampleHBilinear(uvIn.add(vec2(texelU.negate(), float(0))));
    const hR = sampleHBilinear(uvIn.add(vec2(texelU, float(0))));
    const hU = sampleHBilinear(uvIn.add(vec2(float(0), texelV.negate())));
    const hD = sampleHBilinear(uvIn.add(vec2(float(0), texelV)));
    const gradX = hL.sub(hR).mul(float(0.5));
    const gradZ = hU.sub(hD).mul(float(0.5));
    const nx = clamp(gradX.mul(uNormalScale), uMaxSlope.negate(), uMaxSlope);
    const nz = clamp(gradZ.mul(uNormalScale), uMaxSlope.negate(), uMaxSlope);
    return normalize(vec3(nx, float(1), nz));
  });

  const { mixSurfaceNormals } = createPoolWaterBreezeTSL(tsl, {
    uTime,
    uBreezeStrength,
    uBreezeScale,
    uBreezeSpeed,
    uWindDir,
    uBreezeMix,
    uBreezeMaxSlope,
  });

  const uv = rippleUvFn();
  const rippleN = sampleRippleNormal(uv);
  const surfaceN = mixSurfaceNormals(rippleN, uv);

  material.normalNode = Fn(() => {
    const flatN = vec3(0, 1, 0);
    return transformNormalToView(normalize(mix(flatN, surfaceN, uRippleStrength)));
  })();

  material.colorNode = Fn(() => {
    const flatN = vec3(0, 1, 0);
    const fresnelN = normalize(mix(flatN, surfaceN, fresnelNormalStrength));

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
    const refractedUV = baseEnvUV.add(vec2(surfaceN.x, surfaceN.z).mul(refractionStrength));
    const envSample = envTex.sample(refractedUV).xyz;
    const reflectionColor = mix(vec3(defaultReflColor), envSample, float(uHasEnv));

    let finalColor = mix(waterColor, reflectionColor, fresnel);

    // Beer's-law tint: red absorbed first, blue last.
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

    const backLight = max(dot(sunDir.negate(), viewDir), float(0));
    const subsurface = pow(backLight, subsurfacePower).mul(subsurfaceIntensity);
    finalColor = finalColor.add(vec3(subsurfaceColor).mul(subsurface));

    const halfVec = normalize(viewDir.add(sunDir));
    const spec = pow(max(dot(rippleN, halfVec), float(0)), specularShininess);

    const horizontalTilt = abs(rippleN.x).add(abs(rippleN.z));
    const foam = smoothstep(foamThreshold, foamThreshold.add(float(0.15)), horizontalTilt).mul(
      foamAmount,
    );
    const foamMask = clamp(foam, float(0), float(1));
    finalColor = finalColor.add(
      vec3(sunColor).mul(spec).mul(sunIntensity).mul(float(1).sub(foamMask)),
    );
    finalColor = mix(finalColor, vec3(1, 1, 1), foamMask);

    const distanceToCamera = cameraPosition.sub(positionWorld).length();
    const fogFactor = smoothstep(fogStartDistance, fogEndDistance, distanceToCamera).mul(
      fogIntensity,
    );
    finalColor = mix(finalColor, vec3(fogColor), fogFactor);

    return vec4(clamp(finalColor, float(0), float(1)), opacityUniform);
  })();

  return {
    material,
    setPlanarBounds(next) {
      uPlanar.value.copy(planarBoundsToUniform(next));
    },
    updateTime(t, { reducedMotion = false } = {}) {
      uTime.value = t;
      const off = reducedMotion ? 0 : 1;
      uBreezeStrength.value = p.breezeStrength * off;
      uBreezeMix.value = p.breezeMix * off;
    },
    dispose() {
      material.dispose?.();
    },
  };
}

export async function createPoolWaterMaterial(_gl, { mesh, sim, bounds, envMap }) {
  const source = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
  if (!source) throw new Error("[createPoolWaterMaterial] mesh has no material");

  if (isGpuShallowWaterSim(sim)) {
    return createWebGPU({ sim, bounds, envMap });
  }
  return createPoolWaterMaterialWebGl({ sim, bounds, envMap });
}
