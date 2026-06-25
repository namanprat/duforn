import * as THREE from "three";
import { findObjectByName } from "../sceneUtils";
import { POOL_PLANE_DEFAULTS } from "./config/poolWaterDefaults";
import { findWaterMesh } from "./findWaterMesh";

const WATER_EXACT_NAME = "Water";
const GENERATED_WATER_KEY = "__generatedPoolWater";

function meshWorldBox(mesh: THREE.Mesh) {
  mesh.updateWorldMatrix(true, false);
  return new THREE.Box3().setFromObject(mesh);
}

function poolShellPlacement(root: THREE.Object3D) {
  const poolShell = findObjectByName(root, "PoolWalls") as THREE.Mesh | null;
  if (!poolShell?.isMesh) return null;

  const box = meshWorldBox(poolShell);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const p = POOL_PLANE_DEFAULTS;

  const waterY = box.max.y - Math.min(size.y * p.rimDrop, p.rimDropMax) + p.offsetY;
  const worldPos = new THREE.Vector3(center.x + p.offsetX, waterY, center.z + p.offsetZ);
  root.updateWorldMatrix(true, false);
  root.worldToLocal(worldPos);

  return {
    width: Math.max(size.x * p.inset, 0.1),
    depth: Math.max(size.z * p.inset, 0.1),
    localPosition: worldPos,
    waterY,
    shellSize: size,
  };
}

function createGeneratedWaterMesh(root: THREE.Object3D): THREE.Mesh | null {
  const placement = poolShellPlacement(root);
  if (!placement) {
    if (import.meta.env.DEV) {
      console.warn("[ensurePoolWaterMesh] no Water mesh and no PoolWalls to infer from");
    }
    return null;
  }

  const geometry = new THREE.PlaneGeometry(placement.width, placement.depth, 1, 1);
  geometry.rotateX(-Math.PI / 2);

  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({ color: 0xffffff, visible: true }),
  );
  mesh.name = WATER_EXACT_NAME;
  mesh.userData.isWater = true;
  mesh.userData.generatedPoolWater = true;
  mesh.position.copy(placement.localPosition);
  root.add(mesh);

  root.userData[GENERATED_WATER_KEY] = mesh;
  if (import.meta.env.DEV) {
    console.info("[ensurePoolWaterMesh] generated Water plane from PoolWalls", {
      size: placement.shellSize.toArray(),
      waterY: placement.waterY,
      position: mesh.position.toArray(),
    });
  }
  return mesh;
}

/** Update generated plane geometry/position or nudge authored mesh from POOL_PLANE_DEFAULTS. */
export function syncPoolWaterPlane(mesh: THREE.Mesh, root: THREE.Object3D) {
  const p = POOL_PLANE_DEFAULTS;

  if (mesh.userData.generatedPoolWater) {
    const placement = poolShellPlacement(root);
    if (!placement) return;

    mesh.geometry.dispose();
    const geometry = new THREE.PlaneGeometry(placement.width, placement.depth, 1, 1);
    geometry.rotateX(-Math.PI / 2);
    mesh.geometry = geometry;
    mesh.position.copy(placement.localPosition);
    return;
  }

  if (!mesh.userData.__waterBasePosition) {
    mesh.userData.__waterBasePosition = mesh.position.clone();
  }
  const base = mesh.userData.__waterBasePosition as THREE.Vector3;
  mesh.position.set(base.x + p.offsetX, base.y + p.offsetY, base.z + p.offsetZ);
}

export function planeAlignmentSnapshot() {
  const p = POOL_PLANE_DEFAULTS;
  return `${p.inset}|${p.rimDrop}|${p.offsetX}|${p.offsetY}|${p.offsetZ}`;
}

/**
 * Resolve the pool water surface — authored liquid mesh when present, otherwise
 * a generated horizontal plane fitted to PoolWalls.
 */
export function ensurePoolWaterMesh(root: THREE.Object3D | null): THREE.Mesh | null {
  if (!root) return null;

  const cached = root.userData[GENERATED_WATER_KEY];
  if (cached instanceof THREE.Mesh) return cached;

  const authored = findWaterMesh(root);
  if (authored) {
    authored.userData.isWater = true;
    if (import.meta.env.DEV) {
      console.info("[ensurePoolWaterMesh] authored:", authored.name);
    }
    return authored;
  }

  return createGeneratedWaterMesh(root);
}

export function applyWaterDebugMaterial(mesh: THREE.Mesh) {
  mesh.material = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    side: THREE.DoubleSide,
    toneMapped: true,
    depthTest: true,
    depthWrite: true,
  });
  mesh.visible = true;
  mesh.frustumCulled = false;
  mesh.renderOrder = 999;
  if (import.meta.env.DEV) {
    console.info("[water debug] highlighted plane:", mesh.name, mesh.position.toArray());
  }
}
