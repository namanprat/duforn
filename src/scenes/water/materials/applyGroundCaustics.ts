// @ts-nocheck
import * as THREE from "three";
import { POOL_SIM_DEFAULTS, POOL_WATER_DEFAULTS } from "../config/poolWaterDefaults";
import { isWebGPURenderer } from "../../../lib/render/type";

/**
 * Add a thin-band caustic pattern to the Ground material's outgoing light,
 * masked to the water's planar XZ footprint.
 *
 * WebGL: MeshStandardMaterial → onBeforeCompile + GLSL, sampling the sim
 * height texture to bend caustics with ripples.
 * WebGPU: WebGPURenderer auto-wraps standard materials; we set
 * `material.emissiveNode` (TSL). Ripple bend is omitted (storage buffer can't
 * be sampled as a texture); the procedural pattern still reads as caustics.
 */
export function applyGroundCaustics({ mesh, sim, bounds, renderer }) {
  if (!mesh?.material) return null;

  const p = POOL_WATER_DEFAULTS;
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

function applyWebGL({ materials, previousState, sim, bounds, p }) {
  if (typeof sim?.getHeightTexture !== "function") {
    console.warn("[applyGroundCaustics] WebGL sim missing getHeightTexture; skipping");
    return null;
  }

  const uniforms = {
    uHeightMap: { value: sim.getHeightTexture() },
    uSimRes: { value: new THREE.Vector2(sim.getResolutionW(), sim.getResolutionH()) },
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
        uniform vec2 uSimRes;
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
          return groundDecodeH(texture2D(uHeightMap, clamp(uvIn, 0.0, 1.0)).r);
        }

        vec3 groundRippleNormal(vec2 uvIn) {
          float texelU = 1.0 / max(uSimRes.x - 1.0, 1.0);
          float texelV = 1.0 / max(uSimRes.y - 1.0, 1.0);
          float hL = groundSampleH(uvIn + vec2(-texelU, 0.0));
          float hR = groundSampleH(uvIn + vec2( texelU, 0.0));
          float hU = groundSampleH(uvIn + vec2(0.0, -texelV));
          float hD = groundSampleH(uvIn + vec2(0.0,  texelV));
          float gradX = (hL - hR) * 0.5;
          float gradZ = (hU - hD) * 0.5;
          float nx = clamp(gradX * uNormalScale, -uMaxSlope, uMaxSlope);
          float nz = clamp(gradZ * uNormalScale, -uMaxSlope, uMaxSlope);
          return normalize(vec3(nx, 1.0, nz));
        }

        float groundThinBand(float x) { return pow(1.0 - abs(sin(x)), 8.0); }

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
          float inside = step(0.0, uvWater.x) * step(uvWater.x, 1.0)
                       * step(0.0, uvWater.y) * step(uvWater.y, 1.0);
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
    updateTime(t) {
      uniforms.uTime.value = t;
    },
    setPlanarBounds(next) {
      uniforms.uPlanar.value.set(next.minX, next.minZ, next.width, next.depth);
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

function applyWebGPU({ materials, previousState, bounds, p }) {
  const state = { timeUniform: null, planarUniform: null };
  let disposed = false;

  (async () => {
    const tsl = await import("three/tsl");
    if (disposed) return;
    const { Fn, uniform, positionWorld, vec2, vec3, float, sin, cos, abs, pow, step } = tsl;

    const uTime = uniform(0);
    const uIntensity = uniform(p.causticsIntensity);
    const uScale = uniform(p.causticsScale);
    const uSpeed = uniform(p.causticsSpeed);
    const uColor = uniform(new THREE.Color(p.causticsColor));
    const uPlanar = uniform(
      new THREE.Vector4(bounds.minX, bounds.minZ, bounds.width, bounds.depth),
    );

    state.timeUniform = uTime;
    state.planarUniform = uPlanar;

    const thinBand = Fn(([x]) => pow(float(1).sub(abs(sin(x))), float(8)));

    const causticsNode = Fn(() => {
      const uvWater = vec2(
        positionWorld.x.sub(uPlanar.x).div(uPlanar.z),
        float(1).sub(positionWorld.z.sub(uPlanar.y).div(uPlanar.w)),
      );
      const inside = step(float(0), uvWater.x)
        .mul(step(uvWater.x, float(1)))
        .mul(step(float(0), uvWater.y))
        .mul(step(uvWater.y, float(1)));

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
    updateTime(t) {
      if (state.timeUniform) state.timeUniform.value = t;
    },
    setPlanarBounds(next) {
      if (state.planarUniform) {
        state.planarUniform.value.set(next.minX, next.minZ, next.width, next.depth);
      }
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
