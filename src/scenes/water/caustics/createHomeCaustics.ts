// @ts-nocheck
/**
 * Home-pool caustics pass — dual path (WebGPU TSL primary, WebGL GLSL fallback).
 *
 * A fullscreen quad covering the pool's planar bounds samples the rippled water
 * height field and derives caustic intensity from the surface *curvature*
 * (discrete Laplacian) at the point where the sun ray refracts down onto each
 * floor texel: concave (focusing) crests concentrate light into bright webs,
 * convex troughs dim. The sample point is sheared along the sun's horizontal
 * direction by `depth` so the webs land displaced under the light.
 *
 * This is purely ripple-driven — when the sim settles flat the curvature → 0
 * and the field goes neutral (intensity 1), so the caustics track exactly what
 * the water surface does on top. No analytic idle swell.
 *
 * RT channels: r = intensity (1 = neutral), g = edge-fade mask.
 * Receivers apply `base * (1 + (r - 1) * strength * g)`.
 */
import * as THREE from "three";
import { pickGpuBranchAsync } from "../../../lib/render";
import { POOL_CAUSTICS_DEFAULTS } from "../config/poolWaterDefaults";

function causticsLightDirFromAngles(
  elevationDeg = POOL_CAUSTICS_DEFAULTS.lightElevationDeg,
  azimuthDeg = POOL_CAUSTICS_DEFAULTS.lightAzimuthDeg,
) {
  const elevation = THREE.MathUtils.degToRad(elevationDeg);
  const azimuth = THREE.MathUtils.degToRad(azimuthDeg);
  // Points *toward* the light (same convention as the water material sunDir).
  return new THREE.Vector3(
    Math.cos(elevation) * Math.sin(azimuth),
    Math.sin(elevation),
    Math.cos(elevation) * Math.cos(azimuth),
  ).normalize();
}

async function createWebGPU(renderer, { sim, size }) {
  const { MeshBasicNodeMaterial } = await import("three/webgpu");
  const tsl = await import("three/tsl");
  const {
    Fn,
    float,
    int,
    vec2,
    vec4,
    uniform,
    positionLocal,
    max,
    min,
    clamp,
    mix,
    floor,
    smoothstep,
  } = tsl;

  const d = POOL_CAUSTICS_DEFAULTS;
  const nw = sim.getResolutionW();
  const nh = sim.getResolutionH();
  const hBuf = sim.getHeightBuffer();

  const uResW = uniform(nw);
  const uResH = uniform(nh);
  const uDepth = uniform(d.depth);
  const uLightDir = uniform(causticsLightDirFromAngles());
  const uNormalScale = uniform(d.normalScale);
  const uMaxIntensity = uniform(d.maxIntensity);
  const uEdgeFade = uniform(d.edgeFade);
  const uGain = uniform(d.gain);

  const target = new THREE.RenderTarget(size, size, {
    type: THREE.HalfFloatType,
    format: THREE.RGBAFormat,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    wrapS: THREE.ClampToEdgeWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
    depthBuffer: false,
    generateMipmaps: false,
  });

  const clampW = (px) => max(float(0), min(uResW.toFloat().sub(float(1)), px));
  const clampH = (py) => max(float(0), min(uResH.toFloat().sub(float(1)), py));
  const sampleH = (px, py) => {
    const idx = int(clampH(py).mul(uResW.toFloat()).add(clampW(px)));
    return hBuf.element(idx);
  };

  const sampleHBilinear = Fn(([uvIn]) => {
    const maxW = uResW.toFloat().sub(float(1));
    const maxH = uResH.toFloat().sub(float(1));
    const cx = clamp(uvIn.x, float(0), float(1)).mul(maxW);
    const cy = clamp(uvIn.y, float(0), float(1)).mul(maxH);
    const x0 = floor(cx);
    const y0 = floor(cy);
    const tx = cx.sub(x0);
    const ty = cy.sub(y0);

    const h00 = sampleH(x0, y0);
    const h10 = sampleH(x0.add(float(1)), y0);
    const h01 = sampleH(x0, y0.add(float(1)));
    const h11 = sampleH(x0.add(float(1)), y0.add(float(1)));
    return mix(mix(h00, h10, tx), mix(h01, h11, tx), ty);
  });

  const material = new MeshBasicNodeMaterial({ side: THREE.DoubleSide });
  material.depthTest = false;
  material.depthWrite = false;

  // Fullscreen quad — positionLocal.xy already spans [-1, 1].
  material.vertexNode = vec4(positionLocal.x, positionLocal.y, float(0), float(1));

  material.colorNode = Fn(() => {
    const uv = positionLocal.xy.mul(0.5).add(0.5).toVar();
    // WebGPU fullscreen-quad RT skips three's Y-flip; receivers sample (u, v) in
    // world XZ — no 1-v here (WebGL GLSL path keeps the flip below).
    const simUv = vec2(uv.x, uv.y);

    // Shear the sample point along the sun's horizontal direction by depth so
    // the focused webs land displaced under the light (floor projection).
    const lightShear = vec2(uLightDir.x, uLightDir.z).mul(uDepth);
    const s = simUv.add(lightShear);

    const texelU = float(1).div(max(uResW.toFloat().sub(float(1)), float(1)));
    const texelV = float(1).div(max(uResH.toFloat().sub(float(1)), float(1)));
    const h = sampleHBilinear(s);
    const hL = sampleHBilinear(s.add(vec2(texelU.negate(), float(0))));
    const hR = sampleHBilinear(s.add(vec2(texelU, float(0))));
    const hU = sampleHBilinear(s.add(vec2(float(0), texelV.negate())));
    const hD = sampleHBilinear(s.add(vec2(float(0), texelV)));

    // Discrete Laplacian = surface curvature. Concave crests (negative
    // Laplacian) focus light into bright webs; convex troughs dim. Purely
    // ripple-driven — flat water → lap 0 → neutral. The second difference is
    // tiny, so normalScale carries a large gain (web sharpness); `gain` is the
    // overall contrast on top.
    const lap = hL
      .add(hR)
      .add(hU)
      .add(hD)
      .sub(h.mul(float(4)))
      .mul(uNormalScale);
    const intensity = clamp(float(1).add(uGain.mul(lap.negate())), float(0), uMaxIntensity);

    const fx = smoothstep(float(0), uEdgeFade, min(uv.x, float(1).sub(uv.x)));
    const fy = smoothstep(float(0), uEdgeFade, min(uv.y, float(1).sub(uv.y)));
    const edge = fx.mul(fy);

    // Neutralize toward 1 at the border so clamped sampling outside the pool
    // footprint never smears bright/dark bands onto surrounding meshes.
    return vec4(mix(float(1), intensity, edge), edge, float(0), float(1));
  })();

  const geometry = new THREE.PlaneGeometry(2, 2);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  const scene = new THREE.Scene();
  scene.add(mesh);
  const camera = new THREE.OrthographicCamera();

  const prevClearColor = new THREE.Color();

  return {
    get texture() {
      return target.texture;
    },
    target,
    setBounds() {
      // Caustics are generated in normalized pool-uv space (isotropic); the
      // world→UV mapping lives in the receivers, so bounds need no update here.
    },
    setParams(next = {}) {
      if (next.normalScale !== undefined) uNormalScale.value = next.normalScale;
      if (next.depth !== undefined) uDepth.value = next.depth;
      if (next.maxIntensity !== undefined) uMaxIntensity.value = next.maxIntensity;
      if (next.gain !== undefined) uGain.value = next.gain;
    },
    update() {
      // Save/restore the bound target (don't force null): this runs inside
      // `advance()`, before the post pipeline presents. Re-binding the swapchain
      // mid-frame races the post pass's present and strobes the whole screen.
      const prevTarget = renderer.getRenderTarget();
      renderer.getClearColor(prevClearColor);
      const prevAlpha = renderer.getClearAlpha();
      renderer.setRenderTarget(target);
      renderer.setClearColor(0xffffff, 1);
      renderer.clear();
      renderer.render(scene, camera);
      renderer.setRenderTarget(prevTarget);
      renderer.setClearColor(prevClearColor, prevAlpha);
    },
    dispose() {
      target.dispose();
      geometry.dispose();
      material.dispose();
    },
  };
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
    // Sim grid convention: v = 1 - (worldZ - minZ) / depth.
    vec2 simUv = vec2(vUv.x, 1.0 - vUv.y);

    // Shear the sample point along the sun's horizontal direction by depth so
    // the focused webs land displaced under the light (floor projection).
    vec2 s = simUv + vec2(uLightDir.x, uLightDir.z) * uDepth;

    float texelU = 1.0 / max(uSimRes.x - 1.0, 1.0);
    float texelV = 1.0 / max(uSimRes.y - 1.0, 1.0);
    float h  = sampleHBilinear(s);
    float hL = sampleHBilinear(s + vec2(-texelU, 0.0));
    float hR = sampleHBilinear(s + vec2( texelU, 0.0));
    float hU = sampleHBilinear(s + vec2(0.0, -texelV));
    float hD = sampleHBilinear(s + vec2(0.0,  texelV));

    // Discrete Laplacian = surface curvature. Concave crests (negative
    // Laplacian) focus light into bright webs; convex troughs dim. Purely
    // ripple-driven — flat water → lap 0 → neutral.
    float lap = (hL + hR + hU + hD - 4.0 * h) * uNormalScale;
    float intensity = clamp(1.0 + uGain * (-lap), 0.0, uMaxIntensity);

    float fx = smoothstep(0.0, uEdgeFade, min(vUv.x, 1.0 - vUv.x));
    float fy = smoothstep(0.0, uEdgeFade, min(vUv.y, 1.0 - vUv.y));
    float edge = fx * fy;

    gl_FragColor = vec4(mix(1.0, intensity, edge), edge, 0.0, 1.0);
  }
`;

function createWebGL(renderer, { sim, size }) {
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
    setBounds() {
      // Caustics are generated in normalized pool-uv space (isotropic); the
      // world→UV mapping lives in the receivers, so bounds need no update here.
    },
    setParams(next = {}) {
      if (next.normalScale !== undefined) uniforms.uNormalScale.value = next.normalScale;
      if (next.depth !== undefined) uniforms.uDepth.value = next.depth;
      if (next.maxIntensity !== undefined) uniforms.uMaxIntensity.value = next.maxIntensity;
      if (next.gain !== undefined) uniforms.uGain.value = next.gain;
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

/**
 * @param gl active renderer (WebGPURenderer or WebGLRenderer)
 * @param opts { sim, bounds, size }
 */
export async function createHomeCaustics(gl, opts) {
  return pickGpuBranchAsync(gl, {
    webgpu: () => createWebGPU(gl, opts),
    webgl: () => createWebGL(gl, opts),
  });
}
