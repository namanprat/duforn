import { useEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { findObjectByName, meshMatchesName, normalizeModelBounds } from "./sceneUtils";
import { applySceneGlass, isGlassMesh } from "./sceneGlass";
import { SCENE_SUN_DIR } from "./lighting/sun";
import { ensurePoolWaterMesh, applyWaterDebugMaterial } from "./water/createPoolWaterMesh";
import WaterRipples from "./water/WaterRipples";
import { WATER_DEBUG_HIGHLIGHT_PLANE } from "./water/config/poolWaterDefaults";
import { getQualityProfile } from "../lib/qualityProfile";

const MODEL_URL = "/main_scene.glb";
const MODEL_SCALE = 13;
// The full patio deck/floor — kept lit (MeshStandard) so it receives the sun's
// cast shadows, while the rest of the scene stays baked-unlit.
const FLOOR_NAME = "tiles";
/** Baked wood platform under the work strip — must receive shadows too. */
const WORK_PLATFORM_NAMES = ["Floor_Mid", "floor"] as const;
/** Work strip anchor — keep inside the ortho shadow frustum. */
const WORK_SHADOW_ANCHOR = new THREE.Vector3(32, 0, 52);
const SHADOW_FRUSTUM_EXTRA_PAD = 22;

// Low, raking sun (points *toward* the light) so the back structures throw long
// shadows across the open pool deck. Low y = long shadows.
const SHADOW_SUN_DIR = SCENE_SUN_DIR;

type ShadowSetup = {
  /** World-space sun position (the directional light sits here). */
  sunPos: THREE.Vector3;
  /** World-space point the sun aims at (deck center). */
  target: THREE.Vector3;
  /** Half-extent of the ortho shadow camera (world units). */
  orthoHalf: number;
  shadowFar: number;
  /** Floor/deck catcher placement (world units). */
  catcherY: number;
  catcherW: number;
  catcherD: number;
};

function computeShadowSetup(scene: THREE.Object3D, size: THREE.Vector3): ShadowSetup {
  const w = size.x * MODEL_SCALE;
  const h = size.y * MODEL_SCALE;
  const d = size.z * MODEL_SCALE;

  // Deck level ≈ top of the pool walls (the rim the floor sits at). The model is
  // recentred to min.y = 0 (pool basin bottom), so the deck is well above 0.
  let deckLocalTop = size.y * 0.18;
  const poolWalls = findObjectByName(scene, "PoolWalls");
  if (poolWalls) {
    const box = new THREE.Box3().setFromObject(poolWalls);
    if (Number.isFinite(box.max.y)) deckLocalTop = box.max.y;
  }
  const catcherY = deckLocalTop * MODEL_SCALE + 0.05;

  // Tight ortho frustum around the deck receiver — not the full scene span.
  let deckHalfX = w * 0.45;
  let deckHalfZ = d * 0.45;
  const tiles = findObjectByName(scene, FLOOR_NAME);
  if (tiles) {
    const deckBox = new THREE.Box3().setFromObject(tiles);
    if (Number.isFinite(deckBox.max.x)) {
      deckHalfX = ((deckBox.max.x - deckBox.min.x) * MODEL_SCALE) * 0.5;
      deckHalfZ = ((deckBox.max.z - deckBox.min.z) * MODEL_SCALE) * 0.5;
    }
  }
  const deckHalf = Math.max(deckHalfX, deckHalfZ);
  const target = new THREE.Vector3(0, catcherY, 0);

  const span = Math.max(w, d);
  const dist = span * 1.2 + h;
  const sunPos = target.clone().add(SHADOW_SUN_DIR.clone().multiplyScalar(dist));

  // Deck footprint + back/window casters + raking shadow stretch from the low sun.
  // The beam shadows in the loaded GLB land outside the tight deck-only box.
  const rakingPad = h * 1.15;
  const workPad = Math.max(Math.abs(WORK_SHADOW_ANCHOR.x), Math.abs(WORK_SHADOW_ANCHOR.z));
  const scenePad = Math.max(w, d) * 0.62;
  const orthoHalf = Math.max(
    deckHalf * 1.45 + rakingPad,
    workPad + SHADOW_FRUSTUM_EXTRA_PAD,
    scenePad,
  );

  return {
    sunPos,
    target,
    orthoHalf,
    shadowFar: dist + orthoHalf * 2.2,
    catcherY,
    catcherW: deckHalfX * 2,
    catcherD: deckHalfZ * 2,
  };
}

function createShadowReceiverMaterial(src: THREE.MeshStandardMaterial) {
  const baked = src.emissiveMap || src.map || null;
  const mat = new THREE.MeshStandardMaterial({ roughness: 0.95, metalness: 0 });
  if (baked) {
    baked.colorSpace = THREE.SRGBColorSpace;
    mat.map = baked;
  } else {
    mat.color =
      src.emissive && src.emissive.getHex() !== 0
        ? src.emissive.clone()
        : (src.color && src.color.clone()) || new THREE.Color("#808080");
  }
  mat.side = THREE.DoubleSide;
  mat.envMapIntensity = 0.35;
  return mat;
}

export default function BakedScene({
  enableWater = true,
  visible = true,
  onScenePrepared,
  onWaterReady,
}: {
  enableWater?: boolean;
  visible?: boolean;
  onScenePrepared?: () => void;
  onWaterReady?: () => void;
}) {
  const { scene } = useGLTF(MODEL_URL, true);
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const modelRef = useRef<THREE.Group>(null);
  const shadowMapSize = getQualityProfile().shadowMapSize;

  const { root, shadow } = useMemo(() => {
    if (scene.userData.__bakedPrepared) {
      return { root: scene, shadow: scene.userData.__shadow as ShadowSetup };
    }
    scene.userData.__bakedPrepared = true;

    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;

      const srcMat = mesh.material as THREE.MeshStandardMaterial;
      const matName = Array.isArray(srcMat) ? srcMat[0]?.name : srcMat?.name;
      if (meshMatchesName(mesh.name, "Water") || meshMatchesName(matName, "Water")) {
        mesh.userData.isWater = true;
        return;
      }

      if (isGlassMesh(mesh)) {
        applySceneGlass(mesh, srcMat);
        return;
      }

      // Unbaked foliage (ivy cards + leafy planters): a Combined bake self-shadows
      // these to black, so they keep their original textured material and stay LIT
      // here with a hard cutout alpha — instead of flattening to unlit MeshBasic,
      // which made leaves render as flat opaque quads.
      if (/planter|leaf|ivy/i.test(matName || "")) {
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const raw of mats) {
          const m = raw as THREE.MeshStandardMaterial;
          if (!m) continue;
          if (m.map) m.map.colorSpace = THREE.SRGBColorSpace;
          m.alphaTest = 0.5; // hard cutout — no transparency sort artifacts
          m.transparent = false;
          m.metalness = 0;
          m.side = THREE.DoubleSide;
          m.needsUpdate = true;
        }
        mesh.castShadow = true;
        mesh.receiveShadow = false;
        return;
      }

      if (meshMatchesName(mesh.name, FLOOR_NAME)) {
        // Lit floor so the sun's shadows read on it. Baked texture as albedo,
        // lit by the scene HDR (ambient) + the directional sun (shadow-casting).
        const fsrc = mesh.material as THREE.MeshStandardMaterial;
        mesh.material = createShadowReceiverMaterial(fsrc);
        mesh.castShadow = false;
        mesh.receiveShadow = true;
        return;
      }

      if (WORK_PLATFORM_NAMES.some((name) => meshMatchesName(mesh.name, name))) {
        const src = mesh.material as THREE.MeshStandardMaterial;
        mesh.material = createShadowReceiverMaterial(src);
        mesh.castShadow = false;
        mesh.receiveShadow = true;
        return;
      }

      // Baked lightmap surfaces stay UNLIT (MeshBasic). The GLB textures already
      // contain the baked lighting (stored as emissiveMap), so showing them at
      // full brightness preserves the authored look — and keeps glowing light
      // fixtures glowing and the interior bright enough to read THROUGH the glass.
      // (Relighting these as MeshStandard albedo double-darkens: kills the lights
      // and makes the glass look opaque. True relight needs albedo-only rebakes.)
      const src = mesh.material as THREE.MeshStandardMaterial;
      const baked = src.emissiveMap || src.map || null;
      const basic = new THREE.MeshBasicMaterial();
      if (baked) {
        baked.colorSpace = THREE.SRGBColorSpace;
        basic.map = baked;
      } else {
        basic.color =
          src.emissive && src.emissive.getHex() !== 0
            ? src.emissive.clone()
            : (src.color && src.color.clone()) || new THREE.Color("#808080");
      }
      basic.toneMapped = false;
      basic.side = THREE.DoubleSide;
      mesh.material = basic;
      // Still casts into the shadow map (depth pass) so geometry throws shadows
      // onto the lit floor; can't receive shadows itself (baked look untouched).
      mesh.castShadow = true;
      mesh.receiveShadow = false;
    });

    const { size } = normalizeModelBounds(scene);
    const shadowSetup = computeShadowSetup(scene, size);
    scene.userData.__shadow = shadowSetup;
    return { root: scene, shadow: shadowSetup };
  }, [scene]);

  // Pool water surface — authored "Water" mesh or generated plane from PoolWalls.
  const waterMesh = useMemo(() => ensurePoolWaterMesh(root), [root]);

  useEffect(() => {
    if (!waterMesh || !WATER_DEBUG_HIGHLIGHT_PLANE) return undefined;
    const previous = waterMesh.material;
    applyWaterDebugMaterial(waterMesh);
    return () => {
      waterMesh.material = previous;
      waterMesh.renderOrder = 0;
    };
  }, [waterMesh]);

  // Aim the sun at the deck center; size its ortho shadow frustum to the deck.
  useEffect(() => {
    const light = lightRef.current;
    if (!light) return;
    light.target.position.copy(shadow.target);
    light.target.updateMatrixWorld();
    const cam = light.shadow.camera;
    cam.left = -shadow.orthoHalf;
    cam.right = shadow.orthoHalf;
    cam.top = shadow.orthoHalf;
    cam.bottom = -shadow.orthoHalf;
    cam.near = 0.5;
    cam.far = shadow.shadowFar;
    cam.updateProjectionMatrix();
    light.shadow.radius = 2.5;
    light.shadow.bias = -0.00015;
    light.shadow.normalBias = 0.12;
  }, [shadow]);

  useEffect(() => {
    onScenePrepared?.();
  }, [onScenePrepared, root]);

  useEffect(() => {
    if (!onWaterReady) return;
    if (!enableWater || !waterMesh || WATER_DEBUG_HIGHLIGHT_PLANE) {
      onWaterReady();
    }
  }, [enableWater, onWaterReady, waterMesh]);

  return (
    <group visible={visible}>
      <group ref={modelRef} scale={MODEL_SCALE}>
        <primitive object={root} />
      </group>

      {waterMesh && enableWater && !WATER_DEBUG_HIGHLIGHT_PLANE ? (
        <WaterRipples mesh={waterMesh} sceneRoot={root} onReady={onWaterReady} />
      ) : null}

      {/* Low raking sun: lights the deck and casts the long shadows onto it. */}
      <directionalLight
        ref={lightRef}
        intensity={3.6}
        position={shadow.sunPos}
        castShadow
        shadow-mapSize-width={shadowMapSize}
        shadow-mapSize-height={shadowMapSize}
        shadow-radius={2.5}
        shadow-bias={-0.00015}
        shadow-normalBias={0.12}
      />
    </group>
  );
}

useGLTF.preload(MODEL_URL);
