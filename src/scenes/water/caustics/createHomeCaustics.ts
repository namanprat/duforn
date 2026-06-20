/**
 * Home-pool caustics pass — WebGL Laplacian curvature caustics.
 *
 * RT channels: r = intensity (1 = neutral), g = edge-fade mask.
 * Receivers apply `base * (1 + (r - 1) * strength * g)`.
 */
import * as THREE from "three";
import { POOL_CAUSTICS_DEFAULTS } from "../config/poolWaterDefaults";
import type { PoolShallowWaterSimCPU } from "../compute/PoolShallowWaterSimCPU";
import type { WaterPlanarBounds } from "../waterPlanarMapping";

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

const WEBGL_VERT = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = position.xy * 0.5 + 0.5;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const WEBGL_FRAG = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform sampler2D uHeightMap;
  uniform vec2 uSimRes;
  uniform float uDepth;
  uniform vec3 uLightDir;
  uniform float uNormalScale;
  uniform float uMaxIntensity;
  uniform float uEdgeFade;
  uniform float uGain;

  float decodeH(float r) { return (r - 0.5) * 2.0; }

  float sampleHBilinear(vec2 uvIn) {
    return decodeH(texture2D(uHeightMap, clamp(uvIn, 0.0, 1.0)).r);
  }

  void main() {
    vec2 simUv = vec2(vUv.x, 1.0 - vUv.y);
    vec2 s = simUv + vec2(uLightDir.x, uLightDir.z) * uDepth;

    float texelU = 1.0 / max(uSimRes.x - 1.0, 1.0);
    float texelV = 1.0 / max(uSimRes.y - 1.0, 1.0);
    float h  = sampleHBilinear(s);
    float hL = sampleHBilinear(s + vec2(-texelU, 0.0));
    float hR = sampleHBilinear(s + vec2( texelU, 0.0));
    float hU = sampleHBilinear(s + vec2(0.0, -texelV));
    float hD = sampleHBilinear(s + vec2(0.0,  texelV));

    float lap = (hL + hR + hU + hD - 4.0 * h) * uNormalScale;
    float intensity = clamp(1.0 + uGain * (-lap), 0.0, uMaxIntensity);

    float fx = smoothstep(0.0, uEdgeFade, min(vUv.x, 1.0 - vUv.x));
    float fy = smoothstep(0.0, uEdgeFade, min(vUv.y, 1.0 - vUv.y));
    float edge = fx * fy;

    gl_FragColor = vec4(mix(1.0, intensity, edge), edge, 0.0, 1.0);
  }
`;

export type HomeCaustics = ReturnType<typeof createHomeCaustics>;

export function createHomeCaustics(
  renderer: THREE.WebGLRenderer,
  {
    sim,
    size,
  }: {
    sim: PoolShallowWaterSimCPU;
    bounds: WaterPlanarBounds;
    size: number;
  },
) {
  const d = POOL_CAUSTICS_DEFAULTS;

  const target = new THREE.WebGLRenderTarget(size, size, {
    type: THREE.HalfFloatType,
    format: THREE.RGBAFormat,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    wrapS: THREE.ClampToEdgeWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
    depthBuffer: false,
    generateMipmaps: false,
  });

  const uniforms = {
    uHeightMap: { value: sim.getHeightTexture() },
    uSimRes: { value: new THREE.Vector2(sim.getResolutionW(), sim.getResolutionH()) },
    uDepth: { value: d.depth },
    uLightDir: { value: causticsLightDirFromAngles() },
    uNormalScale: { value: d.normalScale },
    uMaxIntensity: { value: d.maxIntensity },
    uEdgeFade: { value: d.edgeFade },
    uGain: { value: d.gain },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: WEBGL_VERT,
    fragmentShader: WEBGL_FRAG,
    depthTest: false,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  const geometry = new THREE.PlaneGeometry(2, 2);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  const scene = new THREE.Scene();
  scene.add(mesh);
  const camera = new THREE.OrthographicCamera();

  return {
    get texture() {
      return target.texture;
    },
    target,
    setBounds() {},
    setParams(next: {
      normalScale?: number;
      depth?: number;
      maxIntensity?: number;
      gain?: number;
      edgeFade?: number;
      lightElevationDeg?: number;
      lightAzimuthDeg?: number;
    } = {}) {
      if (next.normalScale !== undefined) uniforms.uNormalScale.value = next.normalScale;
      if (next.depth !== undefined) uniforms.uDepth.value = next.depth;
      if (next.maxIntensity !== undefined) uniforms.uMaxIntensity.value = next.maxIntensity;
      if (next.gain !== undefined) uniforms.uGain.value = next.gain;
      if (next.edgeFade !== undefined) uniforms.uEdgeFade.value = next.edgeFade;
      if (next.lightElevationDeg !== undefined || next.lightAzimuthDeg !== undefined) {
        uniforms.uLightDir.value.copy(
          causticsLightDirFromAngles(next.lightElevationDeg, next.lightAzimuthDeg),
        );
      }
    },
    update() {
      uniforms.uHeightMap.value = sim.getHeightTexture();
      const prevTarget = renderer.getRenderTarget();
      renderer.setRenderTarget(target);
      renderer.render(scene, camera);
      renderer.setRenderTarget(prevTarget);
    },
    dispose() {
      target.dispose();
      geometry.dispose();
      material.dispose();
    },
  };
}
