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

  // Deck footprint + rim casters + raking shadow stretch from the low sun.
  const rakingPad = h * 0.5;
  const orthoHalf = deckHalf * 1.2 + rakingPad;

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

      if (meshMatchesName(mesh.name, FLOOR_NAME)) {
        // Lit floor so the sun's shadows read on it. Baked texture as albedo,
        // lit by the scene HDR (ambient) + the directional sun (shadow-casting).
        const fsrc = mesh.material as THREE.MeshStandardMaterial;
        const fbaked = fsrc.emissiveMap || fsrc.map || null;
        const std = new THREE.MeshStandardMaterial({ roughness: 0.95, metalness: 0 });
        if (fbaked) {
          fbaked.colorSpace = THREE.SRGBColorSpace;
          std.map = fbaked;
        }
        std.side = THREE.DoubleSide;
        // Low ambient fill so shadowed regions go dark enough to read.
        std.envMapIntensity = 0.35;
        mesh.material = std;
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
    light.shadow.bias = -0.00025;
    light.shadow.normalBias = 0.35;
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
        shadow-bias={-0.00025}
        shadow-normalBias={0.35}
      />
    </group>
  );
}

useGLTF.preload(MODEL_URL);
