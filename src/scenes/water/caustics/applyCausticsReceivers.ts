/**
 * Caustics receivers — multiply the caustics RT into the baked look of the
 * GLB pool floor/wall meshes without replacing their visual appearance.
 */
import * as THREE from "three";
import { POOL_CAUSTICS_DEFAULTS } from "../config/poolWaterDefaults";
import { planarBoundsToUniform, type WaterPlanarBounds } from "../waterPlanarMapping";

const FORCED_RECEIVER_NAMES = ["poolwall", "poolfloor", "poolbasin"];

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
  return typeof name === "string" ? name.toLowerCase().replace(/[^a-z0-9]/g, "") : "";
}

function isForcedReceiver(mesh: THREE.Mesh) {
  const mat = mesh.material;
  const matName = Array.isArray(mat) ? mat[0]?.name : mat?.name;
  const names = [normalizeName(mesh.name), normalizeName(matName)];
  for (let p = mesh.parent; p; p = p.parent) names.push(normalizeName(p.name));
  return names.some((n) => n && FORCED_RECEIVER_NAMES.some((f) => n.includes(f)));
}

/** Receivers overlapping the pool footprint in XZ, plus forced names (e.g. PoolWalls). */
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
    if (!mesh.isMesh || mesh === waterMesh || mesh.userData?.isWater) return;

    if (!isForcedReceiver(mesh)) {
      const box = getMeshWorldBounds(mesh);
      if (getXZOverlapArea(box, bounds) < minOverlap) return;
      if (box.min.y >= waterY - 1e-4) return;
    }

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
  diffuseColor.rgb *= max(1.0 + cK, 0.0);
}
`;

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
