// @ts-nocheck
import * as THREE from "three";
import { POOL_SIM_DEFAULTS, POOL_WATER_DEFAULTS } from "../config/poolWaterDefaults";
import { isWebGPURenderer } from "../../../lib/render/type";

/**
 * Patch the Ground material to receive projected caustics from the water sim.
 *
 * The water mesh is a flat quad above the Ground. We sample (or simulate) a
 * thin-band caustic pattern and add it additively to the Ground's outgoing
 * light — but only inside the water's planar XZ footprint.
 *
 * - WebGL path: standard MeshStandardMaterial → onBeforeCompile + GLSL,
 *   sampling the sim height texture to bend caustics with ripples.
 * - WebGPU path: WebGPURenderer auto-wraps standard materials with a node
 *   material at render time. We set `material.emissiveNode` (TSL) so the
 *   pattern adds to the lit color. The height-buffer-based ripple bend is
 *   omitted here (the buffer is a storage buffer, not a sampler texture);
 *   the procedural pattern still reads as proper floor caustics.
 */
export function applyGroundCaustics({ mesh, sim, bounds, waterParams, renderer }) {
  if (!mesh?.material) return null;

  const p = { ...POOL_WATER_DEFAULTS, ...waterParams };
  const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  const previousState = materials.map((m) => ({
    material: m,
    onBeforeCompile: m.onBeforeCompile,
    customProgramCacheKey: m.customProgramCacheKey,
    emissiveNode: m.emissiveNode,
  }));

  if (isWebGPURenderer(renderer)) {
    return applyWebGPU({ materials, previousState, bounds, p });
  }
  return applyWebGL({ materials, previousState, sim, bounds, p });
}

// ----------------------------- WebGL path ----------------------------------

function applyWebGL({ materials, previousState, sim, bounds, p }) {
  if (typeof sim?.getHeightTexture !== "function") {
    // Sim doesn't expose a sampler — likely a renderer/sim mismatch. Bail
    // loudly so it's visible in the console during development.
    console.warn("[applyGroundCaustics] WebGL sim missing getHeightTexture; skipping");
    return null;
  }

  const heightTex = sim.getHeightTexture();
  const res = sim.getResolution();

  const uniforms = {
    uHeightMap: { value: heightTex },
    uSimRes: { value: res },
    uPlanar: {
      value: new THREE.Vector4(bounds.minX, bounds.minZ, bounds.width, bounds.depth),
    },
    uTime: { value: 0 },
    uCausticsScale: { value: p.causticsScale },
    uCausticsSpeed: { value: p.causticsSpeed },
    uCausticsIntensity: { value: p.causticsIntensity },
    uCausticsColor: { value: new THREE.Color(p.causticsColor) },
    uNormalScale: { value: POOL_SIM_DEFAULTS.normalScale },
    uMaxSlope: { value: POOL_SIM_DEFAULTS.maxSlope },
  };

  for (const m of materials) {
    m.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms);

      shader.vertexShader = shader.vertexShader.replace(
        "#include <common>",
        /* glsl */ `
        #include <common>
        varying vec3 vGroundWorldPos;
        `,
      );
      shader.vertexShader = shader.vertexShader.replace(
        "#include <worldpos_vertex>",
        /* glsl */ `
        #include <worldpos_vertex>
        vGroundWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
        `,
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <common>",
        /* glsl */ `
        #include <common>
        varying vec3 vGroundWorldPos;
        uniform sampler2D uHeightMap;
        uniform float uSimRes;
        uniform vec4 uPlanar;
        uniform float uTime;
        uniform float uCausticsScale;
        uniform float uCausticsSpeed;
        uniform float uCausticsIntensity;
        uniform vec3 uCausticsColor;
        uniform float uNormalScale;
        uniform float uMaxSlope;

        float groundDecodeH(float r) { return (r - 0.5) * 2.0; }

        float groundSampleH(vec2 uvIn) {
          float maxCoord = uSimRes - 1.0;
          vec2 coord = clamp(uvIn, 0.0, 1.0) * maxCoord;
          vec2 i0 = floor(coord);
          vec2 i1 = min(i0 + 1.0, vec2(maxCoord));
          vec2 t = coord - i0;
          vec2 uv00 = (i0 + 0.5) / uSimRes;
          vec2 uv10 = (vec2(i1.x, i0.y) + 0.5) / uSimRes;
          vec2 uv01 = (vec2(i0.x, i1.y) + 0.5) / uSimRes;
          vec2 uv11 = (i1 + 0.5) / uSimRes;
          float h00 = groundDecodeH(texture2D(uHeightMap, uv00).r);
          float h10 = groundDecodeH(texture2D(uHeightMap, uv10).r);
          float h01 = groundDecodeH(texture2D(uHeightMap, uv01).r);
          float h11 = groundDecodeH(texture2D(uHeightMap, uv11).r);
          float hx0 = mix(h00, h10, t.x);
          float hx1 = mix(h01, h11, t.x);
          return mix(hx0, hx1, t.y);
        }

        vec3 groundRippleNormal(vec2 uvIn) {
          float texel = 1.0 / max(uSimRes - 1.0, 1.0);
          float hL = groundSampleH(uvIn + vec2(-texel, 0.0));
          float hR = groundSampleH(uvIn + vec2( texel, 0.0));
          float hU = groundSampleH(uvIn + vec2(0.0, -texel));
          float hD = groundSampleH(uvIn + vec2(0.0,  texel));
          float gradX = (hL - hR) * 0.5;
          float gradZ = (hU - hD) * 0.5;
          float nx = clamp(gradX * uNormalScale, -uMaxSlope, uMaxSlope);
          float nz = clamp(gradZ * uNormalScale, -uMaxSlope, uMaxSlope);
          return normalize(vec3(nx, 1.0, nz));
        }

        float groundThinBand(float x) {
          return pow(1.0 - abs(sin(x)), 8.0);
        }

        float groundCausticsPattern(vec2 uv, float t) {
          vec2 p = uv * uCausticsScale;
          float tt = t * uCausticsSpeed;
          vec2 warp = vec2(
            sin(p.y * 1.3 + tt * 1.1),
            cos(p.x * 1.1 - tt * 0.9)
          ) * 0.35;
          vec2 q = p + warp;
          float a = groundThinBand(q.x + q.y * 0.7 + tt);
          float b = groundThinBand(q.x * 0.9 - q.y + tt * 0.8);
          return a * b * 2.5;
        }
        `,
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <opaque_fragment>",
        /* glsl */ `
        {
          vec2 uvWater = vec2(
            (vGroundWorldPos.x - uPlanar.x) / uPlanar.z,
            1.0 - (vGroundWorldPos.z - uPlanar.y) / uPlanar.w
          );
          float inX = step(0.0, uvWater.x) * step(uvWater.x, 1.0);
          float inY = step(0.0, uvWater.y) * step(uvWater.y, 1.0);
          float inside = inX * inY;
          vec3 rippleN = groundRippleNormal(uvWater);
          vec2 causticsUv = uvWater + rippleN.xz * 0.15;
          float caustics = groundCausticsPattern(causticsUv, uTime);
          outgoingLight += uCausticsColor * caustics * uCausticsIntensity * inside;
        }
        #include <opaque_fragment>
        `,
      );
    };

    m.customProgramCacheKey = () => "ground-caustics";
    m.needsUpdate = true;
  }

  return {
    uniforms,
    updateTime(t) {
      uniforms.uTime.value = t;
    },
    setPlanarBounds(nextBounds) {
      uniforms.uPlanar.value.set(
        nextBounds.minX,
        nextBounds.minZ,
        nextBounds.width,
        nextBounds.depth,
      );
    },
    updateCausticsParams(next) {
      if (next.causticsIntensity != null)
        uniforms.uCausticsIntensity.value = next.causticsIntensity;
      if (next.causticsScale != null) uniforms.uCausticsScale.value = next.causticsScale;
      if (next.causticsSpeed != null) uniforms.uCausticsSpeed.value = next.causticsSpeed;
      if (next.causticsColor) uniforms.uCausticsColor.value.set(next.causticsColor);
    },
    dispose() {
      for (const state of previousState) {
        state.material.onBeforeCompile = state.onBeforeCompile ?? (() => {});
        state.material.customProgramCacheKey = state.customProgramCacheKey ?? (() => "");
        state.material.needsUpdate = true;
      }
    },
  };
}

// ----------------------------- WebGPU path ---------------------------------
// Async because we need to lazy-load `three/tsl` to avoid pulling it into the
// WebGL bundle.

function applyWebGPU({ materials, previousState, bounds, p }) {
  // State the WebGPU branch will populate after the async TSL import lands.
  const state = {
    timeUniform: null,
    intensityUniform: null,
    scaleUniform: null,
    speedUniform: null,
    colorUniform: null,
    planarUniform: null,
  };
  let disposed = false;

  (async () => {
    const tsl = await import("three/tsl");
    if (disposed) return;
    const { Fn, uniform, positionWorld, vec2, vec3, vec4, float, sin, cos, abs, pow, step, mix } =
      tsl;

    const uTime = uniform(0);
    const uIntensity = uniform(p.causticsIntensity);
    const uScale = uniform(p.causticsScale);
    const uSpeed = uniform(p.causticsSpeed);
    const uColor = uniform(new THREE.Color(p.causticsColor));
    const uPlanar = uniform(
      new THREE.Vector4(bounds.minX, bounds.minZ, bounds.width, bounds.depth),
    );

    state.timeUniform = uTime;
    state.intensityUniform = uIntensity;
    state.scaleUniform = uScale;
    state.speedUniform = uSpeed;
    state.colorUniform = uColor;
    state.planarUniform = uPlanar;

    const thinBand = Fn(([x]) => pow(float(1).sub(abs(sin(x))), float(8)));

    const causticsNode = Fn(() => {
      const uvWater = vec2(
        positionWorld.x.sub(uPlanar.x).div(uPlanar.z),
        float(1).sub(positionWorld.z.sub(uPlanar.y).div(uPlanar.w)),
      );
      const inX = step(float(0), uvWater.x).mul(step(uvWater.x, float(1)));
      const inY = step(float(0), uvWater.y).mul(step(uvWater.y, float(1)));
      const inside = inX.mul(inY);

      const pp = uvWater.mul(uScale);
      const tt = uTime.mul(uSpeed);
      const warp = vec2(
        sin(pp.y.mul(float(1.3)).add(tt.mul(float(1.1)))).mul(float(0.35)),
        cos(pp.x.mul(float(1.1)).sub(tt.mul(float(0.9)))).mul(float(0.35)),
      );
      const q = pp.add(warp);
      const a = thinBand(q.x.add(q.y.mul(float(0.7))).add(tt));
      const b = thinBand(
        q.x
          .mul(float(0.9))
          .sub(q.y)
          .add(tt.mul(float(0.8))),
      );
      const pattern = a.mul(b).mul(float(2.5));

      return vec3(uColor).mul(pattern).mul(uIntensity).mul(inside);
    });

    for (const m of materials) {
      m.emissiveNode = causticsNode();
      m.needsUpdate = true;
    }
  })().catch((err) => {
    console.error("[applyGroundCaustics] WebGPU TSL import failed", err);
  });

  return {
    uniforms: state,
    updateTime(t) {
      if (state.timeUniform) state.timeUniform.value = t;
    },
    setPlanarBounds(nextBounds) {
      if (state.planarUniform) {
        state.planarUniform.value.set(
          nextBounds.minX,
          nextBounds.minZ,
          nextBounds.width,
          nextBounds.depth,
        );
      }
    },
    updateCausticsParams(next) {
      if (state.intensityUniform && next.causticsIntensity != null)
        state.intensityUniform.value = next.causticsIntensity;
      if (state.scaleUniform && next.causticsScale != null)
        state.scaleUniform.value = next.causticsScale;
      if (state.speedUniform && next.causticsSpeed != null)
        state.speedUniform.value = next.causticsSpeed;
      if (state.colorUniform && next.causticsColor)
        state.colorUniform.value.set(next.causticsColor);
    },
    dispose() {
      disposed = true;
      for (const ps of previousState) {
        ps.material.emissiveNode = ps.emissiveNode ?? null;
        ps.material.needsUpdate = true;
      }
    },
  };
}
