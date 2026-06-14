// @ts-nocheck
/**
 * Pool water material — webgl-water (Evan Wallace) look on the GLB pool quad.
 *
 * WebGPU path: the surface samples the viewport backdrop (the already-rendered
 * pool basin) with a ripple-refracted screen UV, tints it with the webgl-water
 * above-water color, and Fresnel-mixes it with scene IBL (same HDR as the GLB).
 */
import * as THREE from "three";
import { POOL_SIM_DEFAULTS, POOL_WATER_DEFAULTS } from "../config/poolWaterDefaults";
import { planarBoundsToUniform } from "../waterPlanarMapping";
import { isGpuShallowWaterSim } from "../compute/createPoolWaterSim";
import { createPoolWaterMaterialWebGl } from "./poolWaterMaterialWebGl";
import { createPoolWaterBreezeTSL, getPoolWaterBreezeWindDir } from "./poolWaterBreeze";

function createDummyEnvTexture() {
  const tex = new THREE.DataTexture(new Uint8Array([125, 151, 168, 255]), 1, 1);
  tex.needsUpdate = true;
  return tex;
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
    uniformTexture,
    positionWorld,
    cameraPosition,
    screenUV,
    viewportOpaqueMipTexture,
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
  const uAboveTint = uniform(new THREE.Vector3(...p.aboveWaterTint));
  const defaultReflColor = uniform(new THREE.Color(p.defaultReflection));
  const waterDepth = uniform(p.waterDepth);
  const waterClarity = uniform(p.waterClarity);
  const uFresnelBase = uniform(p.fresnelBase);
  const fresnelPower = uniform(p.fresnelPower);
  const fresnelNormalStrength = uniform(p.fresnelNormalStrength);
  const uRefractionOffset = uniform(p.refractionOffset);
  const envRefractionStrength = uniform(p.envRefractionStrength);
  const uExposure = uniform(p.exposure);
  const uTime = uniform(0);
  const uBreezeStrength = uniform(p.breezeStrength);
  const uBreezeScale = uniform(p.breezeScale);
  const uBreezeSpeed = uniform(p.breezeSpeed);
  const uWindDir = uniform(getPoolWaterBreezeWindDir());
  const uBreezeMix = uniform(p.breezeMix);
  const uBreezeMaxSlope = uniform(p.breezeMaxSlope);
  const uHasEnv = uniform(envMap ? 1 : 0);
  const uEnvReflection = uniform(1);

  let currentEnvMap = envMap ?? null;
  const dummyEnv = createDummyEnvTexture();
  const envTex = uniformTexture(currentEnvMap ?? dummyEnv);

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
    const cosTheta = max(dot(viewDir, fresnelN), float(0));
    const fresnel = mix(uFresnelBase, float(1), pow(float(1).sub(cosTheta), fresnelPower));

    const refrUV = clamp(
      screenUV.add(vec2(surfaceN.x, surfaceN.z).mul(uRefractionOffset)),
      vec2(0.001, 0.001),
      vec2(0.999, 0.999),
    );
    const backdrop = viewportOpaqueMipTexture(refrUV).rgb;

    const viewAngle = max(abs(viewDir.y), float(0.15));
    const pathLength = waterDepth.div(viewAngle);
    const absorptionDepth = pathLength.mul(0.05);
    const extinction = vec3(0.4, 0.12, 0.04).mul(waterClarity);
    const transmittance = exp(extinction.negate().mul(absorptionDepth));
    const refractedColor = backdrop.mul(vec3(uAboveTint)).mul(transmittance);

    const reflectDir = reflect(viewDir.negate(), fresnelN);
    const phi = atan(reflectDir.z, reflectDir.x);
    const theta = asin(clamp(reflectDir.y, float(-1), float(1)));
    const baseEnvUV = vec2(phi.mul(0.1591).add(0.5), theta.mul(0.3183).add(0.5));
    const envUV = baseEnvUV.add(vec2(surfaceN.x, surfaceN.z).mul(envRefractionStrength));
    const envSample = envTex.sample(envUV).xyz;
    const envOn = float(uHasEnv).mul(uEnvReflection);
    const reflectionColor = mix(vec3(defaultReflColor), envSample, envOn);

    const finalColor = mix(refractedColor, reflectionColor, fresnel);

    return vec4(clamp(finalColor.mul(uExposure), float(0), float(4)), float(1));
  })();

  const syncHasEnv = () => {
    uHasEnv.value = currentEnvMap ? 1 : 0;
  };

  return {
    material,
    setPlanarBounds(next) {
      uPlanar.value.copy(planarBoundsToUniform(next));
    },
    setEnvironment(tex) {
      if (!tex || tex === currentEnvMap) return;
      currentEnvMap = tex;
      envTex.value = tex;
      syncHasEnv();
    },
    updateTime(t, { reducedMotion = false } = {}) {
      uTime.value = t;
      const off = reducedMotion ? 0 : 1;
      uBreezeStrength.value = p.breezeStrength * off;
      uBreezeMix.value = p.breezeMix * off;
    },
    setParams(next = {}) {
      if (next.tintR !== undefined) uAboveTint.value.x = next.tintR;
      if (next.tintG !== undefined) uAboveTint.value.y = next.tintG;
      if (next.tintB !== undefined) uAboveTint.value.z = next.tintB;
      if (next.fresnelBase !== undefined) uFresnelBase.value = next.fresnelBase;
      if (next.refractionOffset !== undefined) uRefractionOffset.value = next.refractionOffset;
      if (next.waterClarity !== undefined) waterClarity.value = next.waterClarity;
      if (next.exposure !== undefined) uExposure.value = next.exposure;
      if (next.envReflection !== undefined) {
        uEnvReflection.value = next.envReflection ? 1 : 0;
      }
    },
    dispose() {
      material.dispose?.();
      if (!envMap) dummyEnv.dispose();
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
