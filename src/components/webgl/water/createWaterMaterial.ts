// @ts-nocheck
import * as THREE from "three";
import { generateJONSWAPWaves, type WaveParams } from "./jonswapWaves";
import { DEFAULT_WATER_SIM_SIZE } from "./waterHeightfieldSim";

export const WAVE_COUNT = 10;

export type WaterUniforms = {
  uTime: { value: number };
  uWindDir: { value: THREE.Vector2 };
  uChopAmp: { value: number };
  uChopFreq: { value: number };
  uChopSpeed: { value: number };
  uShallowColor: { value: THREE.Color };
  uDeepColor: { value: THREE.Color };
  uSkyColor: { value: THREE.Color };
  uSpecularColor: { value: THREE.Color };
  uSSSColor: { value: THREE.Color };
  uSSSStrength: { value: number };
  uFoamColor: { value: THREE.Color };
  uFoamThreshold: { value: number };
  uFoamSoftness: { value: number };
  uFoamScale: { value: number };
  uLightDir: { value: THREE.Vector3 };
  uSSRStride: { value: number };
  uSSRDepthBias: { value: number };
  uSSRRoughness: { value: number };
  uSSRBorderFade: { value: number };
  uHeightfield: { value: THREE.Texture };
  uHeightScale: { value: number };
  uHeightTexel: { value: number };
  uHeightNormalScale: { value: number };
};

const SSR_STEPS = 48;

export function createHeightfieldPlaceholderTexture() {
  const data = new Float32Array(4);
  return new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat, THREE.HalfFloatType);
}

export async function createWaterMaterial(
  waveOpts = {},
  {
    heightfieldTexture = createHeightfieldPlaceholderTexture(),
    simSize = DEFAULT_WATER_SIM_SIZE,
  } = {},
) {
  const { MeshBasicNodeMaterial } = await import("three/webgpu");
  const tsl = await import("three/tsl");
  const {
    Fn,
    float,
    vec2,
    vec3,
    vec4,
    uniform,
    varying,
    positionLocal,
    uv,
    modelWorldMatrix,
    normalize,
    cross,
    dot,
    max,
    min,
    mix,
    pow,
    clamp,
    smoothstep,
    sin,
    cos,
    mx_noise_float,
    texture,
    reflect,
    Loop,
    Break,
    Continue,
    If,
    log2,
    or,
  } = tsl;
  const tslCameraPosition = tsl.cameraPosition;
  const positionView = tsl.positionView;
  const cameraProjectionMatrix = tsl.cameraProjectionMatrix;
  const cameraNear = tsl.cameraNear;
  const cameraFar = tsl.cameraFar;
  const viewZToPerspectiveDepth = tsl.viewZToPerspectiveDepth;
  const viewportDepthTexture = tsl.viewportDepthTexture;
  const viewportOpaqueMipTexture = tsl.viewportOpaqueMipTexture;
  const screenSize = tsl.screenSize;
  const textureBicubicLevel = tsl.textureBicubicLevel;
  const transformNormalToView = tsl.transformNormalToView;

  const waves: WaveParams[] = generateJONSWAPWaves({ count: WAVE_COUNT, ...waveOpts });

  const uHeightfield = uniform(heightfieldTexture);
  const uHeightScale = uniform(0.12);
  const uHeightTexel = uniform(1 / simSize);
  const uHeightNormalScale = uniform(0.42);

  const uniforms = {
    uTime: uniform(0),
    uWindDir: uniform(new THREE.Vector2(Math.cos(0.4), Math.sin(0.4))),
    uChopAmp: uniform(0.04),
    uChopFreq: uniform(6.0),
    uChopSpeed: uniform(0.6),
    uShallowColor: uniform(new THREE.Color(0.32, 0.62, 0.66)),
    uDeepColor: uniform(new THREE.Color(0.04, 0.12, 0.18)),
    uSkyColor: uniform(new THREE.Color(0.78, 0.88, 0.95)),
    uSpecularColor: uniform(new THREE.Color(1.0, 1.0, 0.95)),
    uSSSColor: uniform(new THREE.Color(0.35, 0.95, 0.85)),
    uSSSStrength: uniform(1.2),
    uFoamColor: uniform(new THREE.Color(1.0, 1.0, 1.0)),
    uFoamThreshold: uniform(0.45),
    uFoamSoftness: uniform(0.25),
    uFoamScale: uniform(8.0),
    uLightDir: uniform(new THREE.Vector3(0.4, 0.85, 0.5)),
    uSSRStride: uniform(0.026),
    uSSRDepthBias: uniform(0.0015),
    uSSRRoughness: uniform(0.1),
    uSSRBorderFade: uniform(0.04),
    uHeightfield,
    uHeightScale,
    uHeightTexel,
    uHeightNormalScale,
  };

  const waveUniforms = waves.map((w) => ({
    dir: uniform(new THREE.Vector2(w.dir[0], w.dir[1])),
    k: uniform(w.k),
    omega: uniform(w.omega),
    amp: uniform(w.amp),
    phase: uniform(w.phase),
    steepness: uniform(w.steepness),
  }));

  const vWorldPos = varying(vec3(0), "vWaterWorldPos");
  const vAnalyticNormal = varying(vec3(0, 1, 0), "vWaterAnalyticNormal");
  const vNormalView = varying(vec3(0, 0, 1), "vWaterNormalView");
  const vJacobian = varying(float(1), "vWaterJacobian");
  const vWaveHeight = varying(float(0), "vWaterWaveHeight");

  const vertexFn = Fn(() => {
    const pos = positionLocal.toVar();
    const time = uniforms.uTime;

    const dispX = float(0).toVar();
    const dispY = float(0).toVar();
    const dispZ = float(0).toVar();
    const dXdx = float(1).toVar();
    const dXdz = float(0).toVar();
    const dZdx = float(0).toVar();
    const dZdz = float(1).toVar();
    const dYdx = float(0).toVar();
    const dYdz = float(0).toVar();

    for (let i = 0; i < waves.length; i++) {
      const w = waveUniforms[i];
      const dirX = w.dir.x;
      const dirZ = w.dir.y;
      const phase = w.k
        .mul(positionLocal.x.mul(dirX).add(positionLocal.z.mul(dirZ)))
        .sub(w.omega.mul(time))
        .add(w.phase);
      const sinP = sin(phase);
      const cosP = cos(phase);
      const qOverK = w.steepness.mul(w.amp);
      dispX.addAssign(qOverK.mul(dirX).mul(cosP));
      dispZ.addAssign(qOverK.mul(dirZ).mul(cosP));
      dispY.addAssign(w.amp.mul(sinP));
      const dPhaseDx = w.k.mul(dirX);
      const dPhaseDz = w.k.mul(dirZ);
      dXdx.addAssign(qOverK.mul(dirX).mul(sinP.negate()).mul(dPhaseDx));
      dXdz.addAssign(qOverK.mul(dirX).mul(sinP.negate()).mul(dPhaseDz));
      dZdx.addAssign(qOverK.mul(dirZ).mul(sinP.negate()).mul(dPhaseDx));
      dZdz.addAssign(qOverK.mul(dirZ).mul(sinP.negate()).mul(dPhaseDz));
      dYdx.addAssign(w.amp.mul(cosP).mul(dPhaseDx));
      dYdz.addAssign(w.amp.mul(cosP).mul(dPhaseDz));
    }

    const n1 = mx_noise_float(
      vec3(
        positionLocal.x.mul(uniforms.uChopFreq),
        positionLocal.z.mul(uniforms.uChopFreq),
        time.mul(uniforms.uChopSpeed),
      ),
    );
    const n2 = mx_noise_float(
      vec3(
        positionLocal.x.mul(uniforms.uChopFreq.mul(2.3)).add(7.3),
        positionLocal.z.mul(uniforms.uChopFreq.mul(2.3)),
        time.mul(uniforms.uChopSpeed.mul(1.4)),
      ),
    );
    const chop = n1.mul(0.6).add(n2.mul(0.4)).mul(uniforms.uChopAmp);
    dispY.addAssign(chop);

    const uvCoord = uv();
    const du = uniforms.uHeightTexel;
    const hC = texture(uHeightfield, uvCoord).r.mul(uniforms.uHeightScale);
    const hPx = texture(uHeightfield, uvCoord.add(vec2(du, float(0)))).r.mul(uniforms.uHeightScale);
    const hMx = texture(uHeightfield, uvCoord.sub(vec2(du, float(0)))).r.mul(uniforms.uHeightScale);
    const hPz = texture(uHeightfield, uvCoord.add(vec2(float(0), du))).r.mul(uniforms.uHeightScale);
    const hMz = texture(uHeightfield, uvCoord.sub(vec2(float(0), du))).r.mul(uniforms.uHeightScale);
    dispY.addAssign(hC);
    const nScale = uniforms.uHeightNormalScale;
    const denom = du.mul(2);
    dYdx.addAssign(hPx.sub(hMx).mul(nScale).div(denom));
    dYdz.addAssign(hPz.sub(hMz).mul(nScale).div(denom));

    pos.x.addAssign(dispX.negate());
    pos.z.addAssign(dispZ.negate());
    pos.y.addAssign(dispY);

    const tangent = vec3(float(1).add(dXdx), dYdx, dZdx);
    const bitangent = vec3(dXdz, dYdz, float(1).add(dZdz));
    const analyticNormal = normalize(cross(bitangent, tangent));

    const J = float(1).add(dXdx).mul(float(1).add(dZdz)).sub(dXdz.mul(dZdx));

    vWorldPos.assign(modelWorldMatrix.mul(vec4(pos, 1)).xyz);
    vAnalyticNormal.assign(analyticNormal);
    vNormalView.assign(normalize(transformNormalToView(analyticNormal)));
    vJacobian.assign(J);
    vWaveHeight.assign(dispY);

    return pos;
  });

  const projectViewToUv = Fn(([viewP]) => {
    const clip = cameraProjectionMatrix.mul(vec4(viewP, 1));
    const ndc = clip.xy.div(clip.w);
    return vec2(ndc.x.mul(0.5).add(0.5), ndc.y.mul(0.5).negate().add(0.5));
  });

  const fragmentFn = Fn(() => {
    const worldPos = vWorldPos;
    const analyticNormal = normalize(vAnalyticNormal);
    const Nv = normalize(vNormalView);

    const viewDir = normalize(tslCameraPosition.sub(worldPos));
    const NdotV = max(float(0.001), dot(analyticNormal, viewDir));
    const fresnel = pow(float(1).sub(NdotV), float(5));

    const Iview = normalize(positionView);
    const Rview = reflect(Iview, Nv).normalize();

    const hit = float(0).toVar();
    const hitUv = vec2(0, 0).toVar();
    const p = positionView.toVar();
    const stride = uniforms.uSSRStride;

    Loop(SSR_STEPS, () => {
      If(hit.greaterThan(0.5), () => Continue());

      p.addAssign(Rview.mul(stride));

      const clipP = cameraProjectionMatrix.mul(vec4(p, 1));
      If(clipP.w.lessThanEqual(float(0.001)), () => Break());

      const suv = projectViewToUv(p);
      If(
        or(
          suv.x.lessThan(float(0)),
          suv.x.greaterThan(float(1)),
          suv.y.lessThan(float(0)),
          suv.y.greaterThan(float(1)),
        ),
        () => Break(),
      );

      const bufD = viewportDepthTexture(suv).r;
      // Depth buffer stores perspective depth (same as viewZToPerspectiveDepth), not clip z/w.
      const rayPerspDepth = viewZToPerspectiveDepth(p.z, cameraNear, cameraFar);
      If(rayPerspDepth.greaterThan(bufD.add(uniforms.uSSRDepthBias)), () => {
        hit.assign(1);
        hitUv.assign(suv);
        Break();
      });
    });

    const border = uniforms.uSSRBorderFade;
    const edgeX = min(hitUv.x, float(1).sub(hitUv.x));
    const edgeY = min(hitUv.y, float(1).sub(hitUv.y));
    const edge = min(edgeX, edgeY);
    const borderMask = smoothstep(float(0), border, edge);

    const lod = max(float(0), log2(screenSize.x).mul(uniforms.uSSRRoughness));
    const opaqueSample = viewportOpaqueMipTexture(hitUv);
    const ssrRgb = textureBicubicLevel(opaqueSample, lod).rgb;
    const ssrWeight = hit.mul(borderMask);

    const lightDir = normalize(uniforms.uLightDir);
    const NdotL = max(float(0), dot(analyticNormal, lightDir));

    const heightTone = clamp(vWaveHeight.mul(0.6).add(0.5), float(0), float(1));
    const depthMix = mix(uniforms.uDeepColor, uniforms.uShallowColor, heightTone);

    const reflectionColor = mix(uniforms.uSkyColor, ssrRgb, ssrWeight);
    const baseColor = mix(depthMix, reflectionColor, fresnel);

    const back = max(float(0), dot(analyticNormal.negate(), lightDir));
    const sssTerm = pow(back, float(3))
      .mul(max(float(0), vWaveHeight))
      .mul(uniforms.uSSSStrength);
    const sss = uniforms.uSSSColor.mul(sssTerm);

    const halfVec = normalize(viewDir.add(lightDir));
    const NdotH = max(float(0), dot(analyticNormal, halfVec));
    const spec = uniforms.uSpecularColor.mul(pow(NdotH, float(180))).mul(0.7);

    const lightWrap = NdotL.mul(0.4).add(0.6);
    const litColor = baseColor.mul(lightWrap).add(sss).add(spec);

    const foamMaskJ = float(1).sub(
      smoothstep(
        uniforms.uFoamThreshold,
        uniforms.uFoamThreshold.add(uniforms.uFoamSoftness),
        vJacobian,
      ),
    );
    const foamNoise = mx_noise_float(
      vec3(
        worldPos.x.mul(uniforms.uFoamScale),
        worldPos.z.mul(uniforms.uFoamScale),
        uniforms.uTime.mul(0.4),
      ),
    )
      .mul(0.5)
      .add(0.5);
    const crestFoam = smoothstep(float(0.6), float(0.95), heightTone).mul(foamNoise);
    const foamMask = clamp(foamMaskJ.mul(foamNoise).add(crestFoam.mul(0.4)), float(0), float(1));
    const finalColor = mix(litColor, uniforms.uFoamColor, foamMask);

    return vec4(finalColor, float(1));
  });

  const mat = new MeshBasicNodeMaterial({
    transparent: true,
    opacity: 1,
    depthWrite: true,
    side: THREE.DoubleSide,
    fog: false,
  });
  mat.positionNode = vertexFn();
  mat.fragmentNode = fragmentFn();
  mat.userData.isWaterTSLMaterial = true;

  return { material: mat, uniforms, waves };
}
