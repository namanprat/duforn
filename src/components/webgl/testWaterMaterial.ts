// @ts-nocheck
import * as THREE from "three";
import { isWebGPURenderer } from "./createWebGPURenderer";

/** Matches Blender `waterMaterial` or similar exported names. */
export function isWaterMaterialName(name) {
  if (!name || typeof name !== "string") return false;
  const n = name.trim().toLowerCase();
  return n === "watermaterial" || n === "water" || n.includes("water");
}

/** GLTF sometimes omits material names; fall back to mesh node name. */
export function isWaterSurface(mesh, material) {
  if (material && isWaterMaterialName(material.name)) return true;
  const mn = (mesh?.name || "").toLowerCase();
  return mn.includes("water") && !mn.includes("waterfall");
}

const VERT = /* glsl */ `
varying vec3 vWorldPosition;
varying vec3 vWorldNormal;
varying vec2 vUv;

void main() {
  vUv = uv;
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPos.xyz;
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAG = /* glsl */ `
precision highp float;

#define MOD2 vec2(4.438975, 3.972973)

varying vec3 vWorldPosition;
varying vec3 vWorldNormal;
varying vec2 vUv;

uniform float uTime;
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform vec3 uWaterDeep;
uniform vec3 uWaterShallow;
uniform vec4 uRipple0;
uniform vec4 uRipple1;
uniform vec4 uRipple2;
uniform vec4 uRipple3;

float Hash(float p) {
  vec2 p2 = fract(vec2(p) * MOD2);
  p2 += dot(p2.yx, p2.xy + 19.19);
  return fract(p2.x * p2.y);
}

vec2 Hash2(float p) {
  vec3 p3 = fract(vec3(p) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 19.19);
  return fract((p3.xx + p3.yz) * p3.zy);
}

float SmoothNoise(vec2 o) {
  vec2 p = floor(o);
  vec2 f = fract(o);
  float n = p.x + p.y * 57.0;
  float a = Hash(n + 0.0);
  float b = Hash(n + 1.0);
  float c = Hash(n + 57.0);
  float d = Hash(n + 58.0);
  vec2 f2 = f * f;
  vec2 f3 = f2 * f;
  vec2 t = 3.0 * f2 - 2.0 * f3;
  float u = t.x;
  float v = t.y;
  return a + (b - a) * u + (c - a) * v + (a - b + d - c) * u * v;
}

vec3 SmoothNoiseDXY(vec2 o) {
  vec2 p = floor(o);
  vec2 f = fract(o);
  float n = p.x + p.y * 57.0;
  float a = Hash(n + 0.0);
  float b = Hash(n + 1.0);
  float c = Hash(n + 57.0);
  float d = Hash(n + 58.0);
  vec2 f2 = f * f;
  vec2 f3 = f2 * f;
  vec2 t = 3.0 * f2 - 2.0 * f3;
  vec2 dt = 6.0 * f - 6.0 * f2;
  float u = t.x;
  float v = t.y;
  float du = dt.x;
  float dv = dt.y;
  float res = a + (b - a) * u + (c - a) * v + (a - b + d - c) * u * v;
  float dx = (b - a) * du + (a - b + d - c) * du * v;
  float dy = (c - a) * dv + (a - b + d - c) * u * dv;
  return vec3(dx, dy, res);
}

vec3 FBM_DXY(vec2 p, vec2 flow, float ps, float df) {
  vec3 acc = vec3(0.0);
  float tot = 0.0;
  float a = 1.0;
  for (int i = 0; i < 4; i++) {
    p += flow;
    flow *= -0.75;
    vec3 v = SmoothNoiseDXY(p);
    acc += v * a;
    p += v.xy * df;
    p *= 2.0;
    tot += a;
    a *= ps;
  }
  return acc / max(tot, 1e-4);
}

vec4 SampleFlowingNormal(vec2 xz, vec2 flowRate, float foam, float time) {
  vec2 fw = max(abs(dFdx(xz)), abs(dFdy(xz)));
  float fFilter = max(fw.x, fw.y);
  float fScale = 1.0 / (1.0 + fFilter * fFilter * 2000.0);
  float fGradientAscent = 0.25 + (foam * -1.5);
  vec2 vUV = xz * 0.35;
  vec2 vFlow = flowRate * 0.6;
  float t0 = fract(time * 0.08);
  float t1 = fract(time * 0.08 + 0.5);
  float i0 = floor(time * 0.08);
  float i1 = floor(time * 0.08 + 0.5);
  vec2 vUV0 = vUV + Hash2(i0);
  vec2 vUV1 = vUV + Hash2(i1);
  vec3 dxy0 = FBM_DXY(vUV0 * 20.0, vFlow * (t0 - 0.5) * 20.0, 0.75 + foam * 0.25, fGradientAscent);
  vec3 dxy1 = FBM_DXY(vUV1 * 20.0, vFlow * (t1 - 0.5) * 20.0, 0.75 + foam * 0.25, fGradientAscent);
  float w = abs(t0 - 0.5) * 2.0;
  vec3 dxy = mix(dxy0, dxy1, w);
  fScale *= max(0.25, 1.0 - foam * 5.0);
  float fMag = 2.5 / (1.0 + dot(flowRate, flowRate) * 5.0);
  vec3 blended = mix(vec3(0.0, 1.0, 0.0), normalize(vec3(dxy.x, fMag, dxy.y)), fScale);
  return vec4(normalize(blended), dxy.z * fScale);
}

vec2 FlowField(vec2 xz) {
  return vec2(0.35, sin(xz.x * 0.15) * 0.12);
}

float RippleDeform(vec4 r, vec2 xz) {
  if (r.w <= 0.001) return 0.0;
  float d = distance(xz, r.xy);
  float age = uTime - r.z;
  if (age < 0.0 || age > 6.0) return 0.0;
  float wave = sin(d * 18.0 - age * 7.0);
  return wave * exp(-d * 0.65) * exp(-age * 0.45) * r.w;
}

float TotalRipple(vec2 xz) {
  return RippleDeform(uRipple0, xz) + RippleDeform(uRipple1, xz) + RippleDeform(uRipple2, xz) +
    RippleDeform(uRipple3, xz);
}

vec3 SkyColour(vec3 dir) {
  float t = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);
  vec3 up = vec3(0.1, 0.5, 1.0) * 1.1;
  vec3 down = vec3(1.0, 0.92, 0.82) * 0.42;
  vec3 base = mix(down, up, t);
  float sunDot = dot(normalize(uSunDir), dir);
  float glow = clamp(sunDot * 0.5 + 0.5, 0.0, 1.0);
  base += uSunColor * (1.0 - pow(0.5, glow * 2.0)) * 0.35;
  return base;
}

void main() {
  vec2 xz = vWorldPosition.xz;
  vec2 flow = FlowField(xz);
  float foamHint = SmoothNoise(xz * 0.08 + uTime * 0.02) * 0.35;
  vec4 wn = SampleFlowingNormal(xz, flow, foamHint, uTime);
  vec3 N = wn.xyz;

  float rSum = TotalRipple(xz);
  vec2 e = vec2(0.018, 0.0);
  float dx = TotalRipple(xz + e.xy) - TotalRipple(xz - e.xy);
  float dy = TotalRipple(xz + e.yx) - TotalRipple(xz - e.yx);
  N = normalize(N + vec3(-dx * 2.8, rSum * 2.4, -dy * 2.8));

  vec3 V = normalize(cameraPosition - vWorldPosition);
  vec3 L = normalize(uSunDir);
  float NdotL = max(dot(N, L), 0.0);
  float NdotV = max(dot(N, V), 0.0);
  vec3 H = normalize(L + V);
  float spec = pow(max(dot(N, H), 0.0), 96.0) * 0.55;

  vec3 R = reflect(-V, N);
  vec3 env = SkyColour(R);
  float fresnel = pow(1.0 - NdotV, 4.0) * 0.85 + 0.08;

  float depthFac = clamp(0.35 + foamHint * 0.4 + wn.w * 0.15, 0.0, 1.0);
  vec3 waterCol = mix(uWaterDeep, uWaterShallow, depthFac);

  vec3 diffuse = waterCol * (uSunColor * NdotL * 0.55 + vec3(0.18, 0.22, 0.28));
  vec3 specCol = uSunColor * spec;
  vec3 outRgb = diffuse * (1.0 - fresnel * 0.5) + env * fresnel + specCol;

  float foam = clamp(wn.w * 2.5 + abs(rSum) * 0.4, 0.0, 1.0);
  outRgb = mix(outRgb, vec3(0.92, 0.95, 1.0), foam * 0.22);

  gl_FragColor = vec4(outRgb, 0.94);
}
`;

function makeRippleUniforms() {
  return {
    uTime: { value: 0 },
    uSunDir: { value: new THREE.Vector3(-1, 0.7, 0.25).normalize() },
    uSunColor: { value: new THREE.Vector3(1, 0.85, 0.5).multiplyScalar(1.8) },
    uWaterDeep: { value: new THREE.Vector3(0.02, 0.08, 0.12) },
    uWaterShallow: { value: new THREE.Vector3(0.06, 0.22, 0.28) },
    uRipple0: { value: new THREE.Vector4(-1e9, -1e9, -1, 0) },
    uRipple1: { value: new THREE.Vector4(-1e9, -1e9, -1, 0) },
    uRipple2: { value: new THREE.Vector4(-1e9, -1e9, -1, 0) },
    uRipple3: { value: new THREE.Vector4(-1e9, -1e9, -1, 0) },
  };
}

/** WebGL-only: procedural water + ripple uniforms. */
export function createWebGLTestWaterMaterial() {
  const uniforms = makeRippleUniforms();
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    depthWrite: true,
    side: THREE.DoubleSide,
    extensions: { derivatives: true },
  });
  mat.userData.testWaterRipple = true;
  mat.userData.rippleUniforms = uniforms;
  return mat;
}

/**
 * WebGPU: heightfield sim + pool-style shading ported from webgpu-water `surface-above.frag.wgsl`
 * (UV refinement, BA normal, Fresnel, reflect→env, refract→tiles + fake caustics). No sphere path.
 *
 * @param {GPUTexture} displayGPUTexture
 * @param {number} width
 * @param {number} height
 * @param {object} [opts]
 * @param {THREE.Texture} opts.tilesTexture
 * @param {THREE.CubeTexture | null} [opts.envMap]
 * @param {THREE.Vector2} [opts.boundsMinXZ]
 * @param {THREE.Vector2} [opts.boundsRangeXZ]
 * @param {number} [opts.floorY]
 * @param {THREE.Vector3} [opts.boxMin]
 * @param {THREE.Vector3} [opts.boxMax]
 * @param {THREE.Vector3} [opts.lightDirection]
 * @param {number} [opts.heightScale]
 * @param {number} [opts.ior]
 * @param {number} [opts.fresnelMin]
 * @param {number} [opts.tileRepeat]
 */
export async function createHeightfieldWebGPUWaterMaterial(
  displayGPUTexture,
  width,
  height,
  opts = {},
) {
  const {
    tilesTexture,
    envMap = null,
    boundsMinXZ = new THREE.Vector2(-1, -1),
    boundsRangeXZ = new THREE.Vector2(2, 2),
    floorY = -1.5,
    boxMin = new THREE.Vector3(-6, -4, -8),
    boxMax = new THREE.Vector3(6, 3, 4),
    lightDirection = new THREE.Vector3(4.2, 7.5, 6.2).normalize(),
    heightScale = 0.14,
    ior = 1.333,
    fresnelMin = 0.02,
    tileRepeat = 3.0,
  } = opts;

  if (!tilesTexture) {
    throw new Error("createHeightfieldWebGPUWaterMaterial: tilesTexture is required");
  }

  const { MeshBasicNodeMaterial } = await import("three/webgpu");
  const {
    Fn,
    float,
    vec2,
    vec3,
    vec4,
    uniform,
    texture,
    cubeTexture,
    positionLocal,
    positionWorld,
    modelWorldMatrix,
    modelWorldMatrixInverse,
    cameraPosition,
    negate,
    select,
    max,
    pow,
    clamp,
    sqrt,
    dot,
    length,
    normalize,
    reflect,
    refract,
    sign,
    mix,
    step,
  } = await import("three/tsl");

  const simTexture = new THREE.ExternalTexture(displayGPUTexture);
  simTexture.sourceTexture = displayGPUTexture;
  simTexture.colorSpace = THREE.NoColorSpace;
  simTexture.wrapS = THREE.ClampToEdgeWrapping;
  simTexture.wrapT = THREE.ClampToEdgeWrapping;
  simTexture.minFilter = THREE.LinearFilter;
  simTexture.magFilter = THREE.LinearFilter;
  simTexture.generateMipmaps = false;
  simTexture.flipY = false;
  simTexture.image = { width, height, data: null };

  const uBoundsMinXZ = uniform(boundsMinXZ);
  const uBoundsRangeXZ = uniform(boundsRangeXZ);
  const uFloorY = uniform(floorY);
  const uBoxMin = uniform(boxMin);
  const uBoxMax = uniform(boxMax);
  const uLightDir = uniform(lightDirection.clone().normalize());
  const uHeightScale = uniform(heightScale);
  const uIor = uniform(ior);
  const uFresnelMin = uniform(fresnelMin);
  const uTileRepeat = uniform(tileRepeat);
  const uHasEnv = uniform(envMap ? 1 : 0);

  const sampleSim = (uvNode) => texture(simTexture, uvNode);

  const worldPosUndisplaced = modelWorldMatrix.mul(vec4(positionLocal, float(1))).xyz;
  const simUvBase = vec2(
    worldPosUndisplaced.x
      .sub(uBoundsMinXZ.x)
      .div(max(uBoundsRangeXZ.x, float(1e-4)))
      .clamp(float(0), float(1)),
    float(1)
      .sub(worldPosUndisplaced.z.sub(uBoundsMinXZ.y).div(max(uBoundsRangeXZ.y, float(1e-4))))
      .clamp(float(0), float(1)),
  );

  const hSample = sampleSim(simUvBase).r.mul(uHeightScale);
  const worldPos = worldPosUndisplaced.add(vec3(float(0), hSample, float(0)));
  const localDisplaced = modelWorldMatrixInverse.mul(vec4(worldPos, float(1))).xyz;

  const mat = new MeshBasicNodeMaterial({
    transparent: false,
    depthWrite: true,
    side: THREE.DoubleSide,
  });

  mat.positionNode = localDisplaced;

  const envCubeNode = envMap ? cubeTexture(envMap) : null;

  mat.colorNode = Fn(() => {
    const wPos = positionWorld;

    let uvRef = vec2(
      wPos.x
        .sub(uBoundsMinXZ.x)
        .div(max(uBoundsRangeXZ.x, float(1e-4)))
        .clamp(float(0), float(1)),
      float(1)
        .sub(wPos.z.sub(uBoundsMinXZ.y).div(max(uBoundsRangeXZ.y, float(1e-4))))
        .clamp(float(0), float(1)),
    );

    let info = sampleSim(uvRef);
    const refine = float(0.005);
    uvRef = uvRef.add(vec2(info.b, info.a).mul(refine));
    info = sampleSim(uvRef);
    uvRef = uvRef.add(vec2(info.b, info.a).mul(refine));
    info = sampleSim(uvRef);
    uvRef = uvRef.add(vec2(info.b, info.a).mul(refine));
    info = sampleSim(uvRef);
    uvRef = uvRef.add(vec2(info.b, info.a).mul(refine));
    info = sampleSim(uvRef);
    uvRef = uvRef.add(vec2(info.b, info.a).mul(refine));
    info = sampleSim(uvRef);

    const ba = vec2(info.b, info.a);
    const ny = sqrt(max(float(0), float(1).sub(dot(ba, ba))));
    const Nobj = normalize(vec3(info.b, ny, info.a));
    const N = normalize(modelWorldMatrix.mul(vec4(Nobj, float(0))).xyz);

    const incoming = wPos.sub(cameraPosition).normalize();
    const reflected = reflect(incoming, N);
    const refractedRaw = refract(incoming, N, float(1).div(uIor));
    const refracted = select(
      length(refractedRaw).greaterThan(float(1e-5)),
      refractedRaw,
      reflected,
    );

    const fresnel = mix(
      uFresnelMin,
      float(1),
      pow(clamp(float(1).sub(dot(N, negate(incoming))), float(0), float(1)), float(3)),
    );

    const skyFallback = (dir) =>
      mix(
        vec3(0.12, 0.22, 0.55),
        vec3(1.0, 0.94, 0.88),
        clamp(dir.y.mul(float(0.5)).add(float(0.5)), float(0), float(1)),
      );

    const envSampleRgb = (dir) => {
      const d = normalize(dir);
      const sky = skyFallback(d);
      if (!envCubeNode) return sky;
      return mix(sky, envCubeNode.sample(d).rgb, uHasEnv);
    };

    const sunSpec = (ray) =>
      pow(clamp(dot(uLightDir, normalize(ray)), float(0), float(1)), float(5000)).mul(
        vec3(10, 8, 6),
      );

    const rayColor = (origin, ray) => {
      const ry = ray.y;
      const eps = sign(ry).mul(float(1e-4)).add(float(1e-4));
      const tF = uFloorY.sub(origin.y).div(ry.add(eps));
      const hit = origin.add(ray.mul(tF));
      const tileUv = hit.xz.mul(uTileRepeat);
      const tileCol = texture(tilesTexture, tileUv).rgb;
      const caustUv = float(0.75)
        .mul(hit.xz.sub(hit.y.mul(ray.xz.div(ry.add(sign(ry).mul(float(1e-4)))))))
        .mul(float(0.5))
        .add(float(0.5));
      const caustFac = sampleSim(caustUv).r.mul(float(4)).mul(float(0.35)).add(float(0.65));
      const inPool = step(uBoxMin.x, hit.x)
        .mul(step(hit.x, uBoxMax.x))
        .mul(step(uBoxMin.z, hit.z))
        .mul(step(hit.z, uBoxMax.z))
        .mul(step(float(0), tF));
      const underTint = vec3(0.25, 1.0, 1.25);
      const floorLit = tileCol.mul(caustFac).mul(underTint);
      const floorDark = vec3(0.03, 0.06, 0.1);
      const downCol = mix(floorDark, floorLit, inPool);

      const upCol = envSampleRgb(ray).add(sunSpec(ray));

      return select(ry.lessThan(float(0)), downCol, upCol);
    };

    const reflectedColor = rayColor(wPos, reflected);
    const refractedColor = rayColor(wPos, refracted);
    const rgb = mix(refractedColor, reflectedColor, fresnel);
    return vec4(rgb, float(1));
  })();

  mat.userData.testWaterRipple = true;
  mat.userData.testWaterWebGPU = true;
  mat.userData.testWaterHeightfield = true;
  mat.userData.testWaterSimTexture = simTexture;
  mat.userData.testWaterPoolUniforms = {
    uBoundsMinXZ,
    uBoundsRangeXZ,
    uFloorY,
    uBoxMin,
    uBoxMax,
    uLightDir,
    uHeightScale,
    uIor,
    uFresnelMin,
    uTileRepeat,
    uHasEnv,
  };

  return mat;
}

/**
 * @param {import("three").WebGLRenderer | import("three").WebGPURenderer} renderer
 */
export function createTestWaterMaterial(renderer) {
  if (isWebGPURenderer(renderer)) {
    const m = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x0c3550),
      metalness: 0,
      roughness: 0.14,
      transmission: 0.78,
      thickness: 1.4,
      transparent: true,
      opacity: 0.93,
      ior: 1.333,
      envMapIntensity: 1.35,
      clearcoat: 0.22,
      clearcoatRoughness: 0.18,
    });
    m.userData.testWaterRipple = true;
    m.userData.testWaterWebGPU = true;
    return m;
  }

  return createWebGLTestWaterMaterial();
}

export function updateTestWaterUniforms(material, elapsed, ripples) {
  if (!material?.userData?.rippleUniforms) return;
  const u = material.userData.rippleUniforms;
  u.uTime.value = elapsed;
  const slots = [u.uRipple0, u.uRipple1, u.uRipple2, u.uRipple3];
  for (let i = 0; i < 4; i++) {
    const r = ripples[i];
    if (!r || r.strength <= 0.01) {
      slots[i].value.set(-1e9, -1e9, -1, 0);
    } else {
      slots[i].value.set(r.x, r.z, r.t, r.strength);
    }
  }
}
