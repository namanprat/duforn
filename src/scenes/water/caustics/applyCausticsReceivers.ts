/**
 * Caustics receivers — multiply the caustics RT into the baked look of the
 * GLB pool floor/wall meshes without replacing their visual appearance.
 */
import * as THREE from "three";
import { meshMatchesName, stripBakedSuffix } from "../../sceneUtils";
import { POOL_CAUSTICS_DEFAULTS } from "../config/poolWaterDefaults";
import { planarBoundsToUniform, type WaterPlanarBounds } from "../waterPlanarMapping";

/** Always receive caustics regardless of height (pool shell + deck floor). */
const FORCE_RECEIVER_EXACT = ["PoolWalls", "tiles"];

const RECEIVER_ALLOWLIST = ["poolfloor", "poolbasin", "poolwall", "pooltile"];

const RECEIVER_EXCLUDE_EXACT = ["Water", "window"];

function getMeshWorldBounds(mesh: THREE.Mesh) {
  mesh.updateWorldMatrix(true, false);
  return new THREE.Box3().setFromObject(mesh);
}

function getXZOverlapArea(a: THREE.Box3, bounds: WaterPlanarBounds) {
  const overlapX = Math.min(a.max.x, bounds.minX + bounds.width) - Math.max(a.min.x, bounds.minX);
  const overlapZ = Math.min(a.max.z, bounds.minZ + bounds.depth) - Math.max(a.min.z, bounds.minZ);
  return Math.max(0, overlapX) * Math.max(0, overlapZ);
}

function normalizeName(name: unknown) {
  return typeof name === "string"
    ? stripBakedSuffix(name).toLowerCase().replace(/[^a-z0-9]/g, "")
    : "";
}

function meshNameTokens(mesh: THREE.Mesh) {
  const mat = mesh.material;
  const matName = Array.isArray(mat) ? mat[0]?.name : mat?.name;
  const names = [normalizeName(mesh.name), normalizeName(matName)];
  for (let p = mesh.parent; p; p = p.parent) names.push(normalizeName(p.name));
  return names.filter(Boolean);
}

function isForcedReceiver(mesh: THREE.Mesh) {
  if (FORCE_RECEIVER_EXACT.some((n) => meshMatchesName(mesh.name, n))) return true;
  const tokens = meshNameTokens(mesh);
  return tokens.some((n) => RECEIVER_ALLOWLIST.some((allow) => n.includes(allow)));
}

function isExcludedReceiver(mesh: THREE.Mesh) {
  if (mesh.userData?.isWater) return true;
  if (RECEIVER_EXCLUDE_EXACT.some((n) => meshMatchesName(mesh.name, n))) return true;
  const tokens = meshNameTokens(mesh);
  if (tokens.some((n) => n.includes("window") || n.includes("glass"))) return true;
  // Exact "water" token only — not "poolwalls".
  if (tokens.some((n) => n === "water")) return true;
  return false;
}

function isBelowWater(box: THREE.Box3, waterY: number) {
  return box.min.y < waterY - 1e-4;
}

/** Pool floor/walls; PoolWalls + tiles always included. */
export function findCausticsReceivers(
  root: THREE.Object3D | null,
  waterMesh: THREE.Mesh,
  bounds: WaterPlanarBounds,
  waterY: number,
) {
  const meshes: THREE.Mesh[] = [];
  const minOverlap = bounds.width * bounds.depth * 0.02;

  if (!root) return { meshes };

  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh || mesh === waterMesh) return;
    if (isExcludedReceiver(mesh)) return;

    if (FORCE_RECEIVER_EXACT.some((n) => meshMatchesName(mesh.name, n))) {
      meshes.push(mesh);
      return;
    }

    const box = getMeshWorldBounds(mesh);
    if (!isBelowWater(box, waterY)) return;

    if (isForcedReceiver(mesh)) {
      meshes.push(mesh);
      return;
    }

    if (getXZOverlapArea(box, bounds) < minOverlap) return;
    meshes.push(mesh);
  });

  return { meshes };
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
  outgoingLight *= max(1.0 + cK, 0.0);
}
`;

function injectCausticsShader(shader: THREE.WebGLProgramParametersWithUniforms) {
  shader.vertexShader = shader.vertexShader
    .replace("#include <common>", "#include <common>\nvarying vec3 vCausticWorld;")
    .replace(
      "#include <begin_vertex>",
      "#include <begin_vertex>\nvCausticWorld = (modelMatrix * vec4(position, 1.0)).xyz;",
    );

  shader.fragmentShader = shader.fragmentShader
    .replace("#include <common>", `#include <common>\n${FRAG_DECLARATIONS}`);

  if (shader.fragmentShader.includes("#include <opaque_fragment>")) {
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <opaque_fragment>",
      `${FRAG_APPLY}\n#include <opaque_fragment>`,
    );
    return;
  }

  const legacyHook = shader.fragmentShader.includes("#include <map_fragment>")
    ? "#include <map_fragment>"
    : "#include <dithering_fragment>";
  shader.fragmentShader = shader.fragmentShader.replace(
    legacyHook,
    `${legacyHook}\n${FRAG_APPLY.replace(/outgoingLight/g, "diffuseColor.rgb")}`,
  );
}

type ReceiverParams = { strength?: number; enabled?: boolean; depthFade?: number };

export type CausticsReceivers = {
  setBounds: (next: WaterPlanarBounds) => void;
  setWaterY: (nextWaterY: number) => void;
  setParams: (next?: ReceiverParams) => void;
  restore: () => void;
};

export function applyCausticsReceivers(
  _gl: THREE.WebGLRenderer,
  {
    meshes,
    texture: causticTexture,
    bounds,
    waterY,
  }: {
    meshes: THREE.Mesh[];
    texture: THREE.Texture;
    bounds: WaterPlanarBounds;
    waterY: number;
  },
): CausticsReceivers {
  const d = POOL_CAUSTICS_DEFAULTS;

  const shared = {
    uCausticTex: { value: causticTexture },
    uCausticBounds: { value: planarBoundsToUniform(bounds) },
    uCausticWaterY: { value: waterY },
    uCausticStrength: { value: d.strength },
    uCausticDepthFade: { value: d.depthFade },
    uCausticEnabled: { value: d.enabled ? 1 : 0 },
  };

  const patched: { mesh: THREE.Mesh; original: THREE.Material; replacement: THREE.Material }[] = [];
  for (const mesh of meshes) {
    const source = Array.isArray(mesh.material) ? null : mesh.material;
    if (!source) continue;

    const clone = source.clone();
    clone.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, shared);
      injectCausticsShader(shader);
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
    setParams({ strength, enabled, depthFade }: ReceiverParams = {}) {
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
