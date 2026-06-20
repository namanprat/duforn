// @ts-nocheck
/**
 * Caustics receivers — multiply the caustics RT into the baked look of the
 * GLB pool floor/wall meshes without replacing their visual appearance.
 *
 * - WebGPU: each receiver material is mirrored into a Mesh(Standard|Physical)
 *   NodeMaterial (maps preserved) whose colorNode multiplies the caustic
 *   factor into `materialColor` (color x map).
 * - WebGL: each receiver material is cloned and the same sampling is injected
 *   via onBeforeCompile after `#include <map_fragment>`.
 *
 * Factor: base * max(1 + (caustic.r - 1) * strength * caustic.g * belowMask, 0)
 * where belowMask fades the effect out above the water line.
 */
import * as THREE from "three";
import { pickGpuBranchAsync } from "../../../lib/render";
import { POOL_CAUSTICS_DEFAULTS } from "../config/poolWaterDefaults";
import { planarBoundsToUniform } from "../waterPlanarMapping";

function getMeshWorldBounds(mesh) {
  mesh.updateWorldMatrix(true, false);
  return new THREE.Box3().setFromObject(mesh);
}

function getXZOverlapArea(a, bounds) {
  const overlapX = Math.min(a.max.x, bounds.minX + bounds.width) - Math.max(a.min.x, bounds.minX);
  const overlapZ = Math.min(a.max.z, bounds.minZ + bounds.depth) - Math.max(a.min.z, bounds.minZ);
  return Math.max(0, overlapX) * Math.max(0, overlapZ);
}

/**
 * Names that always mark a mesh as a caustics receiver, regardless of the
 * geometric heuristics below (matched case/separator-insensitively against
 * the mesh, its material, and its ancestors — e.g. "PoolWalls", "pool_wall").
 */
const FORCED_RECEIVER_NAMES = ["poolwall", "poolfloor", "poolbasin"];

function normalizeName(name) {
  return typeof name === "string" ? name.toLowerCase().replace(/[^a-z0-9]/g, "") : "";
}

function isForcedReceiver(mesh) {
  const names = [normalizeName(mesh.name), normalizeName(mesh.material?.name)];
  for (let p = mesh.parent; p; p = p.parent) names.push(normalizeName(p.name));
  return names.some((n) => n && FORCED_RECEIVER_NAMES.some((f) => n.includes(f)));
}

/**
 * Receivers: meshes overlapping the pool footprint in XZ that reach below the
 * water line (pool floor, pool walls). Meshes matching FORCED_RECEIVER_NAMES
 * (e.g. "PoolWalls") are always included regardless of the geometric tests.
 */
export function findCausticsReceivers(root, waterMesh, bounds, waterY) {
  const meshes = [];
  const minOverlap = bounds.width * bounds.depth * 0.02;

  if (!root) return { meshes };

  root.traverse((o) => {
    if (!o.isMesh || o === waterMesh || o.userData?.isWater) return;

    if (!isForcedReceiver(o)) {
      const box = getMeshWorldBounds(o);
      if (getXZOverlapArea(box, bounds) < minOverlap) return;
      if (box.min.y >= waterY - 1e-4) return;
    }

    meshes.push(o);
  });

  return { meshes };
}

const STANDARD_PROPS = [
  "name",
  "map",
  "normalMap",
  "roughness",
  "roughnessMap",
  "metalness",
  "metalnessMap",
  "aoMap",
  "aoMapIntensity",
  "emissiveMap",
  "emissiveIntensity",
  "alphaMap",
  "alphaTest",
  "envMapIntensity",
  "side",
  "transparent",
  "opacity",
  "vertexColors",
  "flatShading",
];

const PHYSICAL_PROPS = [
  "clearcoat",
  "clearcoatRoughness",
  "clearcoatMap",
  "ior",
  "specularIntensity",
];

function copyStandardProps(targetMaterial, source) {
  for (const key of STANDARD_PROPS) {
    if (source[key] !== undefined) targetMaterial[key] = source[key];
  }
  if (source.color) targetMaterial.color.copy(source.color);
  if (source.emissive) targetMaterial.emissive.copy(source.emissive);
  if (source.normalScale) targetMaterial.normalScale.copy(source.normalScale);
}

async function createWebGPUReceivers({ meshes, texture: causticTexture, bounds, waterY }) {
  const { MeshStandardNodeMaterial, MeshPhysicalNodeMaterial } = await import("three/webgpu");
  const {
    Fn,
    float,
    vec2,
    uniform,
    texture,
    positionWorld,
    clamp,
    smoothstep,
    max,
    materialColor,
  } = await import("three/tsl");

  const d = POOL_CAUSTICS_DEFAULTS;
  const uBounds = uniform(planarBoundsToUniform(bounds));
  const uWaterY = uniform(waterY);
  const uStrength = uniform(d.strength);
  const uDepthFade = uniform(d.depthFade);
  const uEnabled = uniform(d.enabled ? 1 : 0);
  const causticTex = texture(causticTexture);

  const causticFactor = Fn(() => {
    const cu = positionWorld.x.sub(uBounds.x).div(uBounds.z);
    const cv = positionWorld.z.sub(uBounds.y).div(uBounds.w);
    const cUv = clamp(vec2(cu, cv), vec2(0, 0), vec2(1, 1));
    const c = causticTex.sample(cUv);
    const below = float(1).sub(smoothstep(uWaterY.sub(uDepthFade), uWaterY, positionWorld.y));
    const k = c.x.sub(float(1)).mul(uStrength).mul(c.y).mul(below).mul(uEnabled);
    return max(float(1).add(k), float(0));
  });

  const patched = [];
  for (const mesh of meshes) {
    const source = Array.isArray(mesh.material) ? null : mesh.material;
    if (!source) continue;

    const nodeMaterial = source.isMeshPhysicalMaterial
      ? new MeshPhysicalNodeMaterial()
      : new MeshStandardNodeMaterial();
    copyStandardProps(nodeMaterial, source);
    if (source.isMeshPhysicalMaterial) {
      for (const key of PHYSICAL_PROPS) {
        if (source[key] !== undefined) nodeMaterial[key] = source[key];
      }
    }
    nodeMaterial.colorNode = materialColor.mul(causticFactor());

    patched.push({ mesh, original: source, replacement: nodeMaterial });
    mesh.material = nodeMaterial;
  }

  return {
    setBounds(next) {
      uBounds.value.copy(planarBoundsToUniform(next));
    },
    setWaterY(nextWaterY) {
      uWaterY.value = nextWaterY;
    },
    setParams({ strength, enabled, depthFade } = {}) {
      if (strength !== undefined) uStrength.value = strength;
      if (enabled !== undefined) uEnabled.value = enabled ? 1 : 0;
      if (depthFade !== undefined) uDepthFade.value = depthFade;
    },
    restore() {
      for (const { mesh, original, replacement } of patched) {
        mesh.material = original;
        replacement.dispose?.();
      }
      patched.length = 0;
    },
  };
}

const FRAG_DECLARATIONS = /* glsl */ `
varying vec3 vCausticWorld;
uniform sampler2D uCausticTex;
uniform vec4 uCausticBounds;
uniform float uCausticWaterY;
uniform float uCausticStrength;
uniform float uCausticDepthFade;
uniform float uCausticEnabled;
`;

const FRAG_APPLY = /* glsl */ `
{
  vec2 cUv = clamp(
    vec2(
      (vCausticWorld.x - uCausticBounds.x) / uCausticBounds.z,
      (vCausticWorld.z - uCausticBounds.y) / uCausticBounds.w
    ),
    0.0,
    1.0
  );
  vec4 cSample = texture2D(uCausticTex, cUv);
  float cBelow = 1.0 - smoothstep(uCausticWaterY - uCausticDepthFade, uCausticWaterY, vCausticWorld.y);
  float cK = (cSample.r - 1.0) * uCausticStrength * cSample.g * cBelow * uCausticEnabled;
  diffuseColor.rgb *= max(1.0 + cK, 0.0);
}
`;

function createWebGLReceivers({ meshes, texture: causticTexture, bounds, waterY }) {
  const d = POOL_CAUSTICS_DEFAULTS;

  // Shared uniform objects so per-frame updates touch every patched material.
  const shared = {
    uCausticTex: { value: causticTexture },
    uCausticBounds: { value: planarBoundsToUniform(bounds) },
    uCausticWaterY: { value: waterY },
    uCausticStrength: { value: d.strength },
    uCausticDepthFade: { value: d.depthFade },
    uCausticEnabled: { value: d.enabled ? 1 : 0 },
  };

  const patched = [];
  for (const mesh of meshes) {
    const source = Array.isArray(mesh.material) ? null : mesh.material;
    if (!source) continue;

    const clone = source.clone();
    clone.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, shared);
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", "#include <common>\nvarying vec3 vCausticWorld;")
        .replace(
          "#include <begin_vertex>",
          "#include <begin_vertex>\nvCausticWorld = (modelMatrix * vec4(position, 1.0)).xyz;",
        );
      shader.fragmentShader = shader.fragmentShader
        .replace("#include <common>", `#include <common>\n${FRAG_DECLARATIONS}`)
        .replace("#include <map_fragment>", `#include <map_fragment>\n${FRAG_APPLY}`);
    };
    clone.customProgramCacheKey = () => "pool-caustics-receiver";

    patched.push({ mesh, original: source, replacement: clone });
    mesh.material = clone;
  }

  return {
    setBounds(next) {
      shared.uCausticBounds.value.copy(planarBoundsToUniform(next));
    },
    setWaterY(nextWaterY) {
      shared.uCausticWaterY.value = nextWaterY;
    },
    setParams({ strength, enabled, depthFade } = {}) {
      if (strength !== undefined) shared.uCausticStrength.value = strength;
      if (enabled !== undefined) shared.uCausticEnabled.value = enabled ? 1 : 0;
      if (depthFade !== undefined) shared.uCausticDepthFade.value = depthFade;
    },
    restore() {
      for (const { mesh, original, replacement } of patched) {
        mesh.material = original;
        replacement.dispose?.();
      }
      patched.length = 0;
    },
  };
}

/**
 * @param gl active renderer
 * @param opts { meshes, texture, bounds, waterY }
 */
export async function applyCausticsReceivers(gl, opts) {
  return pickGpuBranchAsync(gl, {
    webgpu: () => createWebGPUReceivers(opts),
    webgl: () => createWebGLReceivers(opts),
  });
}
