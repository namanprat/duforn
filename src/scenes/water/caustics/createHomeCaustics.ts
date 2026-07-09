/**
 * Home-pool caustics — refracted-ray mesh splat (Evan Wallace style).
 *
 * A grid mesh (one cell per ~2 sim texels) is rendered into the caustics RT.
 * Each vertex refracts the scene sun through the sim surface normal and moves
 * to its floor-hit position in pool-UV space; the fragment shader compares
 * screen-space triangle area before/after (dFdx/dFdy) so compressed triangles
 * get bright. Additive blending lets converging rays overlap and accumulate —
 * that overlap is what produces the sharp HDR filament network of real pools.
 *
 * RT: r = intensity (flat water sums to ~1 = neutral).
 * Receivers apply `base * clamp(1 + (r - 1) * strength, 0, maxBoost)`.
 */
import * as THREE from "three";
import { POOL_CAUSTICS_DEFAULTS } from "../config/poolWaterDefaults";
import { halfFloatMinMagFilter } from "../halfFloatTextureFilter";
import { SCENE_SUN_DIR } from "../../lighting/sun";
import { planarBoundsToUniform, type WaterPlanarBounds } from "../waterPlanarMapping";

type WaterSimLike = {
  getHeightTexture(): THREE.Texture;
  getResolutionW(): number;
  getResolutionH(): number;
};

export function causticsLightDirFromAngles(
  elevationDeg = POOL_CAUSTICS_DEFAULTS.lightElevationDeg,
  azimuthDeg = POOL_CAUSTICS_DEFAULTS.lightAzimuthDeg,
) {
  const elevation = THREE.MathUtils.degToRad(elevationDeg);
  const azimuth = THREE.MathUtils.degToRad(azimuthDeg);
  return new THREE.Vector3(
    Math.cos(elevation) * Math.sin(azimuth),
    Math.sin(elevation),
    Math.cos(elevation) * Math.cos(azimuth),
  ).normalize();
}

/** Caustics sun matches the scene directional light (BakedScene shadow sun). */
export function causticsLightDirFromSceneSun() {
  return SCENE_SUN_DIR.clone();
}

// ponytail: single refraction bounce off a flat floor plane at uPoolDepth.
// Ceiling: no wall bounces / no per-receiver depth — upgrade to a depth-aware
// hit if the floor stops reading as flat.
const WEBGL_VERT = /* glsl */ `
  precision highp float;

  uniform sampler2D uHeightMap;
  uniform vec2 uSimRes;
  uniform vec4 uBounds;
  uniform float uPoolDepth;
  uniform vec3 uLightDir;
  uniform float uNormalScale;

  varying vec2 vOldUv;
  varying vec2 vNewUv;

  const float IOR_AIR = 1.0;
  const float IOR_WATER = 1.333;

  float decodeH(float r) { return (r - 0.5) * 2.0; }

  float sampleH(vec2 uvIn) {
    return decodeH(texture2D(uHeightMap, clamp(uvIn, 0.0, 1.0)).r);
  }

  vec3 sampleNormal(vec2 uvIn) {
    float texelU = 1.0 / max(uSimRes.x - 1.0, 1.0);
    float texelV = 1.0 / max(uSimRes.y - 1.0, 1.0);
    float hL = sampleH(uvIn + vec2(-texelU, 0.0));
    float hR = sampleH(uvIn + vec2( texelU, 0.0));
    float hU = sampleH(uvIn + vec2(0.0, -texelV));
    float hD = sampleH(uvIn + vec2(0.0,  texelV));
    float nx = (hL - hR) * 0.5 * uNormalScale;
    float nz = (hU - hD) * 0.5 * uNormalScale;
    return normalize(vec3(nx, 1.0, nz));
  }

  void main() {
    // Grid uv parameterizes the sim domain; sim v is flipped vs world-z fraction.
    vec2 simUv = uv;
    vec2 fracXZ = vec2(simUv.x, 1.0 - simUv.y);
    vOldUv = fracXZ;

    vec3 N = sampleNormal(simUv);
    vec3 I = -normalize(uLightDir);
    vec3 T = refract(I, N, IOR_AIR / IOR_WATER);
    if (dot(T, T) < 1e-6) {
      // TIR — throw the vertex off-screen so its triangles are clipped.
      vNewUv = fracXZ;
      gl_Position = vec4(2.0e3, 2.0e3, 2.0, 1.0);
      return;
    }

    // Surface world XZ → refracted ray → hit on floor plane at uPoolDepth below.
    vec2 worldXZ = uBounds.xy + fracXZ * uBounds.zw;
    float t = -uPoolDepth / min(T.y, -1e-3);
    vec2 hitXZ = worldXZ + T.xz * t;
    vNewUv = (hitXZ - uBounds.xy) / uBounds.zw;

    gl_Position = vec4(vNewUv * 2.0 - 1.0, 0.0, 1.0);
  }
`;

const WEBGL_FRAG = /* glsl */ `
  precision highp float;

  varying vec2 vOldUv;
  varying vec2 vNewUv;

  void main() {
    float oldArea = length(dFdx(vOldUv)) * length(dFdy(vOldUv));
    float newArea = length(dFdx(vNewUv)) * length(dFdy(vNewUv));
    // Unclamped HDR — half-float RT + additive overlap builds the filaments.
    gl_FragColor = vec4(oldArea / max(newArea, 1e-6), 0.0, 0.0, 1.0);
  }
`;

export type HomeCaustics = ReturnType<typeof createHomeCaustics>;

export function createHomeCaustics(
  renderer: THREE.WebGLRenderer,
  {
    sim,
    bounds,
    size,
    poolDepth = 1,
  }: {
    sim: WaterSimLike;
    bounds: WaterPlanarBounds;
    size: number;
    poolDepth?: number;
  },
) {
  const d = POOL_CAUSTICS_DEFAULTS;

  const filter = halfFloatMinMagFilter(renderer);
  const target = new THREE.WebGLRenderTarget(size, size, {
    type: THREE.HalfFloatType,
    format: THREE.RGBAFormat,
    minFilter: filter,
    magFilter: filter,
    wrapS: THREE.ClampToEdgeWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
    depthBuffer: false,
    generateMipmaps: false,
  });

  const uniforms = {
    uHeightMap: { value: sim.getHeightTexture() },
    uSimRes: { value: new THREE.Vector2(sim.getResolutionW(), sim.getResolutionH()) },
    uBounds: { value: planarBoundsToUniform(bounds) },
    uPoolDepth: { value: Math.max(poolDepth, 0.05) },
    uLightDir: { value: causticsLightDirFromSceneSun() },
    uNormalScale: { value: d.normalScale },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: WEBGL_VERT,
    fragmentShader: WEBGL_FRAG,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    depthWrite: false,
    // Folding triangles flip winding — both faces must splat.
    side: THREE.DoubleSide,
  });

  const grid = Math.max(32, Math.min(320, Math.round(sim.getResolutionW() / 2)));
  const geometry = new THREE.PlaneGeometry(2, 2, grid, grid);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  const scene = new THREE.Scene();
  scene.add(mesh);
  const camera = new THREE.OrthographicCamera();

  const prevClearColor = new THREE.Color();

  const renderPass = () => {
    uniforms.uHeightMap.value = sim.getHeightTexture();
    const prevTarget = renderer.getRenderTarget();
    renderer.getClearColor(prevClearColor);
    const prevClearAlpha = renderer.getClearAlpha();
    renderer.setClearColor(0x000000, 1);
    renderer.setRenderTarget(target);
    renderer.clear(true, false, false);
    renderer.render(scene, camera);
    renderer.setRenderTarget(prevTarget);
    renderer.setClearColor(prevClearColor, prevClearAlpha);
  };

  renderPass();

  return {
    get texture() {
      return target.texture;
    },
    target,
    setBounds(next: WaterPlanarBounds) {
      uniforms.uBounds.value.copy(planarBoundsToUniform(next));
    },
    setParams(
      next: {
        normalScale?: number;
        poolDepth?: number;
        lightElevationDeg?: number;
        lightAzimuthDeg?: number;
      } = {},
    ) {
      if (next.normalScale !== undefined) uniforms.uNormalScale.value = next.normalScale;
      if (next.poolDepth !== undefined) uniforms.uPoolDepth.value = Math.max(next.poolDepth, 0.05);
      if (next.lightElevationDeg !== undefined || next.lightAzimuthDeg !== undefined) {
        uniforms.uLightDir.value.copy(
          causticsLightDirFromAngles(next.lightElevationDeg, next.lightAzimuthDeg),
        );
      } else {
        uniforms.uLightDir.value.copy(causticsLightDirFromSceneSun());
      }
    },
    update() {
      renderPass();
    },
    dispose() {
      target.dispose();
      geometry.dispose();
      material.dispose();
    },
  };
}
