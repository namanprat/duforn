import * as THREE from "three";
import { meshMatchesName, stripBakedSuffix } from "./sceneUtils";
import { useGlassControlsStore } from "../store/glass";
import type { GlassControls } from "./config/glassDefaults";

const GLASS_FRAME_TOKENS = ["beam", "frame", "mullion", "sill", "trim"];

function glassNameTokens(mesh: THREE.Mesh): string[] {
  const mat = mesh.material;
  const matName = Array.isArray(mat) ? mat[0]?.name : mat?.name;
  return [mesh.name, matName]
    .filter((name): name is string => typeof name === "string" && name.length > 0)
    .map((name) => stripBakedSuffix(name).toLowerCase());
}

/** Window panes from the GLB — excludes frames/beams (e.g. "window beams"). */
export function isGlassMesh(mesh: THREE.Mesh): boolean {
  if (!mesh.isMesh) return false;

  const tokens = glassNameTokens(mesh);
  if (tokens.length === 0) return false;

  if (tokens.some((token) => GLASS_FRAME_TOKENS.some((part) => token.includes(part)))) {
    return false;
  }

  return tokens.some(
    (token) =>
      meshMatchesName(token, "window") ||
      token === "glass" ||
      (token.includes("glass") && !token.includes("fiberglass")),
  );
}

// Live registry so the dev Glass panel can retune every pane at once.
const glassMaterials = new Set<THREE.MeshPhysicalMaterial>();

function applyControls(mat: THREE.MeshPhysicalMaterial, c: GlassControls): void {
  mat.color.set(c.color);
  mat.transmission = c.transmission;
  mat.roughness = c.roughness;
  mat.metalness = c.metalness;
  mat.ior = c.ior;
  mat.thickness = c.thickness;
  mat.envMapIntensity = c.envMapIntensity;
  mat.reflectivity = c.reflectivity;
  mat.opacity = c.opacity;
  mat.needsUpdate = true;
}

/** Retune every live glass pane from the current control values (dev GUI). */
export function applyGlassControls(controls: GlassControls): void {
  glassMaterials.forEach((mat) => applyControls(mat, controls));
}

// Keep live panes in sync with dev-GUI edits. No-op in prod (store never changes).
useGlassControlsStore.subscribe((state) => applyGlassControls(state.controls));

/**
 * Tinted, HDR-reflecting glass pane. Reflects scene.environment (main.hdr) so it
 * reads as real glass instead of an invisible dark hole; transmission lets the
 * interior/exterior show through. Tune live via the dev Glass panel.
 */
export function applySceneGlass(mesh: THREE.Mesh, _src?: THREE.MeshStandardMaterial): void {
  void _src;
  mesh.userData.isGlass = true;

  const mat = new THREE.MeshPhysicalMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
  applyControls(mat, useGlassControlsStore.getState().controls);
  glassMaterials.add(mat);

  mesh.material = mat;
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  mesh.renderOrder = 2;
}
