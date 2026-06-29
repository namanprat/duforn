import * as THREE from "three";
import { meshMatchesName, stripBakedSuffix } from "./sceneUtils";

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

function readBakedMap(src?: THREE.MeshStandardMaterial) {
  const baked = src?.emissiveMap || src?.map || null;
  if (baked) baked.colorSpace = THREE.SRGBColorSpace;
  return baked;
}

/** Near-black pane: interior bake + transmission behind it — no HDR / exterior env. */
export function applySceneGlass(mesh: THREE.Mesh, src?: THREE.MeshStandardMaterial): void {
  const baked = readBakedMap(src);

  mesh.userData.isGlass = true;
  mesh.material = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#030303"),
    emissiveMap: baked,
    emissive: new THREE.Color(0.42, 0.44, 0.4),
    metalness: 0,
    roughness: 0.14,
    transmission: 0.9,
    thickness: 0.22,
    ior: 1.5,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    envMap: null,
    envMapIntensity: 0,
    specularIntensity: 0.12,
    clearcoat: 0,
    toneMapped: false,
  });
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  mesh.renderOrder = 2;
}
