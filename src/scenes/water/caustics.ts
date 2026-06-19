import * as THREE from "three";
import type { WaterSim } from "./WaterSim";
import { planarBoundsToUniform, type WaterPlanarBounds } from "./waterPlanarMapping";

/**
 * Caustics, ported from Evan Wallace's WebGL Water (renderer.js `causticsShader`).
 *
 * A subdivided plane is splatted into an RT: each vertex reads the rippled water
 * height + normal, refracts the sun ray through the surface, and projects both
 * the rest position and the displaced position onto the pool floor. The fragment
 * shader compares the projected triangle areas via screen-space derivatives —
 * where the refracted sheet of light compresses (concave crests focusing), the
 * triangle shrinks and the texel brightens; where it spreads, it dims. This is
 * the real refracted-light caustic, not a height-Laplacian approximation.
 *
 * Everything runs in Evan's normalized pool cube: xz in [-1, 1], floor at y = -1,
 * surface rest at y = 0. The water sim is sampled at simUV = xy * 0.5 + 0.5.
 *
 * RT channels: r = intensity (1 = neutral flat water), g = edge-fade mask.
 * Receivers apply: base * max(1 + (r - 1) * strength * g * below, 0).
 */

const DEFAULT_CAUSTICS_SIZE = 512;
const PLANE_DETAIL = 200; // matches Evan's waterMesh detail
const IOR_AIR = 1.0;
const IOR_WATER = 1.333;

// Evan's sun direction, normalized. Shared by caustics + the surface glint.
export const WATER_LIGHT_DIR = new THREE.Vector3(2.0, 2.0, -1.0).normalize();

const CAUSTICS_VERT = /* glsl */ `
const float IOR_AIR = 1.0;
const float IOR_WATER = 1.333;

out vec3 oldPos;
out vec3 newPos;
out float vEdge;

uniform sampler2D uWater;
uniform vec3 uLight;
uniform float uNormalScale;

vec2 intersectCube(vec3 origin, vec3 ray, vec3 cubeMin, vec3 cubeMax) {
  vec3 tMin = (cubeMin - origin) / ray;
  vec3 tMax = (cubeMax - origin) / ray;
  vec3 t1 = min(tMin, tMax);
  vec3 t2 = max(tMin, tMax);
  float tNear = max(max(t1.x, t1.y), t1.z);
  float tFar = min(min(t2.x, t2.y), t2.z);
  return vec2(tNear, tFar);
}

// Project a point along a ray onto the pool floor plane (y = -1).
vec3 project(vec3 origin, vec3 ray, vec3 refractedLight) {
  vec2 tcube = intersectCube(origin, ray, vec3(-1.0, -1.0, -1.0), vec3(1.0, 2.0, 1.0));
  origin += ray * tcube.y;
  float tplane = (-origin.y - 1.0) / refractedLight.y;
  return origin + refractedLight * tplane;
}

void main() {
  // position.xy spans [-1, 1] for the PlaneGeometry; treat it as normalized xz.
  vec2 grid = position.xy;
  vec2 simUv = grid * 0.5 + 0.5;

  vec4 info = texture(uWater, simUv);
  info.ba *= uNormalScale;
  vec3 normal = vec3(info.b, sqrt(max(1.0 - dot(info.ba, info.ba), 0.0)), info.a);

  vec3 refractedLight = refract(-uLight, vec3(0.0, 1.0, 0.0), IOR_AIR / IOR_WATER);
  vec3 ray = refract(-uLight, normal, IOR_AIR / IOR_WATER);

  // grid.x -> x, grid.y -> z (Evan's gl_Vertex.xzy), height added along y.
  vec3 base = vec3(grid.x, 0.0, grid.y);
  oldPos = project(base, refractedLight, refractedLight);
  newPos = project(base + vec3(0.0, info.r, 0.0), ray, refractedLight);

  // Fade the outer rim so clamped sampling outside the pool stays neutral.
  vec2 d = min(simUv, 1.0 - simUv);
  vEdge = smoothstep(0.0, 0.06, min(d.x, d.y));

  gl_Position = vec4(0.75 * (newPos.xz + refractedLight.xz / refractedLight.y), 0.0, 1.0);
}
`;

const CAUSTICS_FRAG = /* glsl */ `
precision highp float;
in vec3 oldPos;
in vec3 newPos;
in float vEdge;
out vec4 fragColor;

uniform float uGain;
uniform float uMaxIntensity;

void main() {
  // If the projected triangle shrinks it gets brighter, and vice versa.
  float oldArea = length(dFdx(oldPos)) * length(dFdy(oldPos));
  float newArea = length(dFdx(newPos)) * length(dFdy(newPos));
  float ratio = oldArea / max(newArea, 1e-6);

  // Centered at 1 for flat water; uGain controls contrast of the webs.
  float intensity = clamp(1.0 + (ratio - 1.0) * uGain, 0.0, uMaxIntensity);
  fragColor = vec4(intensity, vEdge, 0.0, 1.0);
}
`;

export type CausticsPass = {
  texture: THREE.Texture;
  update(): void;
  setParams(next: { gain?: number; maxIntensity?: number; normalScale?: number }): void;
  dispose(): void;
};

export function createCausticsPass(
  renderer: THREE.WebGLRenderer,
  sim: WaterSim,
  size = DEFAULT_CAUSTICS_SIZE,
): CausticsPass {
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
    uWater: { value: sim.texture },
    uLight: { value: WATER_LIGHT_DIR.clone() },
    uNormalScale: { value: 0.5 },
    uGain: { value: 0.2 },
    uMaxIntensity: { value: 4.0 },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: CAUSTICS_VERT,
    fragmentShader: CAUSTICS_FRAG,
    glslVersion: THREE.GLSL3,
    depthTest: false,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2, PLANE_DETAIL, PLANE_DETAIL), material);
  mesh.frustumCulled = false;
  const scene = new THREE.Scene();
  scene.add(mesh);
  const camera = new THREE.Camera();

  const prevClear = new THREE.Color();

  return {
    texture: target.texture,
    update() {
      uniforms.uWater.value = sim.texture;
      const prevTarget = renderer.getRenderTarget();
      renderer.getClearColor(prevClear);
      const prevAlpha = renderer.getClearAlpha();
      renderer.setRenderTarget(target);
      renderer.setClearColor(0x000000, 1);
      renderer.clear();
      renderer.render(scene, camera);
      renderer.setRenderTarget(prevTarget);
      renderer.setClearColor(prevClear, prevAlpha);
    },
    setParams(next) {
      if (next.gain !== undefined) uniforms.uGain.value = next.gain;
      if (next.maxIntensity !== undefined) uniforms.uMaxIntensity.value = next.maxIntensity;
      if (next.normalScale !== undefined) uniforms.uNormalScale.value = next.normalScale;
    },
    dispose() {
      target.dispose();
      mesh.geometry.dispose();
      material.dispose();
    },
  };
}

// --- Receivers: multiply the caustics RT into the baked pool floor/walls ------

const DECL = /* glsl */ `
varying vec3 vCausticWorld;
uniform sampler2D uCausticTex;
uniform vec4 uBounds;       // minX, minZ, width, depth
uniform vec3 uLightDir;     // same sun dir as the caustics pass
uniform float uWaterY;
uniform float uPoolDepth;   // world-space pool depth (waterY - floorY)
uniform float uStrength;
`;

const APPLY = /* glsl */ `
{
  // World -> normalized pool cube (xz in [-1,1], y in [-1,0] from surface to floor),
  // matching the caustics RT frame (Evan's gl_Vertex.xzy with simUv = xy*0.5+0.5).
  float su = (vCausticWorld.x - uBounds.x) / uBounds.z;        // [0,1]
  float sv = 1.0 - (vCausticWorld.z - uBounds.y) / uBounds.w;  // [0,1]
  vec3 pNorm = vec3(su * 2.0 - 1.0, 0.0, sv * 2.0 - 1.0);
  pNorm.y = clamp((vCausticWorld.y - uWaterY) / max(uPoolDepth, 1e-4), -1.0, 0.0);

  vec3 refractedLight = refract(-uLightDir, vec3(0.0, 1.0, 0.0), 1.0 / 1.333);
  vec2 cClip = 0.75 * (pNorm.xz - pNorm.y * refractedLight.xz / refractedLight.y);
  vec2 cUv = clamp(cClip * 0.5 + 0.5, 0.0, 1.0);

  vec4 c = texture2D(uCausticTex, cUv);
  float below = 1.0 - smoothstep(uWaterY - uPoolDepth, uWaterY, vCausticWorld.y);
  diffuseColor.rgb *= max(1.0 + (c.r - 1.0) * uStrength * c.g * below, 0.0);
}
`;

export function patchCausticsReceivers(
  meshes: THREE.Mesh[],
  causticTex: THREE.Texture,
  bounds: WaterPlanarBounds,
  waterY: number,
  poolDepth: number,
) {
  const shared = {
    uCausticTex: { value: causticTex },
    uBounds: { value: planarBoundsToUniform(bounds) },
    uLightDir: { value: WATER_LIGHT_DIR.clone() },
    uWaterY: { value: waterY },
    uPoolDepth: { value: Math.max(poolDepth, 1e-4) },
    uStrength: { value: 0.6 },
  };

  const patched: { mesh: THREE.Mesh; original: THREE.Material; clone: THREE.Material }[] = [];

  for (const mesh of meshes) {
    const src = Array.isArray(mesh.material) ? null : mesh.material;
    if (!src) continue;

    const clone = src.clone();
    clone.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, shared);
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", "#include <common>\nvarying vec3 vCausticWorld;")
        .replace(
          "#include <begin_vertex>",
          "#include <begin_vertex>\nvCausticWorld = (modelMatrix * vec4(position, 1.0)).xyz;",
        );
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <common>",
        `#include <common>\n${DECL}`,
      );
      if (shader.fragmentShader.includes("#include <map_fragment>")) {
        shader.fragmentShader = shader.fragmentShader.replace(
          "#include <map_fragment>",
          `#include <map_fragment>\n${APPLY}`,
        );
      } else {
        shader.fragmentShader = shader.fragmentShader.replace(
          "#include <color_fragment>",
          `#include <color_fragment>\n${APPLY}`,
        );
      }
    };
    clone.customProgramCacheKey = () => "pool-caustics";

    patched.push({ mesh, original: src, clone });
    mesh.material = clone;
  }

  return {
    setBounds(b: WaterPlanarBounds) {
      shared.uBounds.value.copy(planarBoundsToUniform(b));
    },
    setWaterY(y: number) {
      shared.uWaterY.value = y;
    },
    setStrength(s: number) {
      shared.uStrength.value = s;
    },
    restore() {
      for (const p of patched) {
        p.mesh.material = p.original;
        p.clone.dispose();
      }
      patched.length = 0;
    },
  };
}
