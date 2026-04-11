// @ts-nocheck
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { HeightfieldWaterSim } from "../../lib/water/heightfieldWaterSim";
import { getWebGPUDeviceFromRenderer } from "../../lib/water/webgpuRendererDevice";
import { applyModelMaterialTuning, normalizeModelBounds } from "./sceneUtils";
import { isWebGPURenderer } from "./createWebGPURenderer";
import TestModel from "../../models/TestModel";
import { useTestSceneControlsStore } from "../../store/testSceneControls";
import {
  createHeightfieldWebGPUWaterMaterial,
  createWebGLTestWaterMaterial,
  isWaterSurface,
  updateTestWaterUniforms,
} from "./testWaterMaterial";

const TUNE = {
  roughnessScale: 0.9,
  metalnessScale: 1.1,
  envReflection: 1.5,
  clearcoat: 0.08,
  clearcoatRoughness: 0.2,
};

const RIPPLE_MAX = 4;
const SPAWN_DIST = 0.22;
const SIM_SIZE = 512;
const HEIGHTFIELD_STEPS = 6;
const TILES_URL = "/textures/water-pool-tiles.jpg";

function makeEmptyRipples() {
  return Array.from({ length: RIPPLE_MAX }, () => ({
    x: 0,
    z: 0,
    t: -100,
    strength: 0,
  }));
}

function findGltfWaterMeshes(root) {
  const out = [];
  root.traverse((child) => {
    if (!child.isMesh) return;
    const mats = Array.isArray(child.material) ? child.material : [child.material];
    for (const mat of mats) {
      if (isWaterSurface(child, mat)) {
        out.push(child);
        return;
      }
    }
  });
  return out;
}

function swapWaterMaterials(root, waterMaterial) {
  const toDispose = new Set();
  root.traverse((child) => {
    if (!child.isMesh) return;

    const replace = (mat) => {
      if (!mat || !isWaterSurface(child, mat)) return mat;
      toDispose.add(mat);
      return waterMaterial;
    };

    if (Array.isArray(child.material)) {
      child.material = child.material.map(replace);
    } else {
      child.material = replace(child.material);
    }

    const mats = [].concat(child.material);
    if (mats.some((m) => m?.userData?.testWaterRipple)) {
      child.renderOrder = 10;
    }
  });
  toDispose.forEach((m) => {
    try {
      m.dispose();
    } catch {
      /* ignore */
    }
  });
}

function snapshotWaterBases(meshes) {
  for (const mesh of meshes) {
    if (mesh.userData._testWaterBasePos) continue;
    mesh.userData._testWaterBasePos = mesh.position.clone();
    mesh.userData._testWaterBaseScale = mesh.scale.clone();
  }
}

function computeWaterWorldXZBox(meshes) {
  const box = new THREE.Box3();
  for (const mesh of meshes) {
    mesh.updateWorldMatrix(true, false);
    if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
    const b = mesh.geometry.boundingBox.clone();
    b.applyMatrix4(mesh.matrixWorld);
    box.union(b);
  }
  return box;
}

function worldXZToSim(wx, wz, box) {
  const u = (wx - box.min.x) / Math.max(box.max.x - box.min.x, 1e-6);
  const v = (wz - box.min.z) / Math.max(box.max.z - box.min.z, 1e-6);
  return { x: u * 2 - 1, y: (1 - v) * 2 - 1 };
}

export default function TestScene() {
  const modelRootRef = useRef(null);
  const modelAdjustRef = useRef(null);
  const didInitRef = useRef(false);
  const waterMeshesRef = useRef([]);
  const waterSimBoxRef = useRef(null);
  const sharedWaterMatRef = useRef(null);
  const pointerNdcRef = useRef(new THREE.Vector2(0, 0));
  const ripplesRef = useRef(makeEmptyRipples());
  const rippleWriteRef = useRef(0);
  const lastSpawnRef = useRef(new THREE.Vector2(1e9, 1e9));
  const heightfieldSimRef = useRef(null);
  const lastAppliedWaterMatRef = useRef(null);

  const { gl, camera, scene } = useThree();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const isWG = isWebGPURenderer(gl);

  const shaderMat = useMemo(() => createWebGLTestWaterMaterial(), []);
  const [gpuWaterMat, setGpuWaterMat] = useState(null);
  const [tilesTexture, setTilesTexture] = useState(null);
  const waterMaterial = isWG ? gpuWaterMat : shaderMat;

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(
      TILES_URL,
      (tex) => {
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.needsUpdate = true;
        setTilesTexture(tex);
      },
      undefined,
      () => {
        console.warn("[TestScene] Failed to load", TILES_URL);
      },
    );
    return () => {
      setTilesTexture((t) => {
        t?.dispose?.();
        return null;
      });
    };
  }, []);

  useEffect(() => {
    if (!isWG || !tilesTexture) return undefined;

    let cancelled = false;

    (async () => {
      try {
        await gl.init();
      } catch {
        return;
      }
      const device = getWebGPUDeviceFromRenderer(gl);
      if (!device || cancelled) return;

      if (!heightfieldSimRef.current) {
        heightfieldSimRef.current = new HeightfieldWaterSim(device, SIM_SIZE, SIM_SIZE);
      }
      const sim = heightfieldSimRef.current;

      try {
        const mat = await createHeightfieldWebGPUWaterMaterial(
          sim.displayTexture,
          SIM_SIZE,
          SIM_SIZE,
          {
            tilesTexture,
            envMap: scene.environment ?? null,
            lightDirection: new THREE.Vector3(4.2, 7.5, 6.2).normalize(),
          },
        );
        if (cancelled) {
          mat.dispose?.();
          mat.userData?.testWaterSimTexture?.dispose?.();
          return;
        }
        setGpuWaterMat((prev) => {
          if (prev && prev !== mat) {
            try {
              prev.userData?.testWaterSimTexture?.dispose?.();
              prev.dispose?.();
            } catch {
              /* ignore */
            }
          }
          return mat;
        });
      } catch (e) {
        console.warn("[TestScene] WebGPU heightfield water failed:", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [gl, isWG, tilesTexture, scene.environment]);

  useEffect(() => {
    if (!isWG) return undefined;
    return () => {
      heightfieldSimRef.current?.dispose();
      heightfieldSimRef.current = null;
      setGpuWaterMat((prev) => {
        if (prev) {
          try {
            prev.userData?.testWaterSimTexture?.dispose?.();
            prev.dispose?.();
          } catch {
            /* ignore */
          }
        }
        return null;
      });
    };
  }, [isWG]);

  useLayoutEffect(() => {
    const onMove = (e) => {
      pointerNdcRef.current.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -((e.clientY / window.innerHeight) * 2 - 1),
      );
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  function tryInitWater() {
    const root = modelRootRef.current;
    const wm = sharedWaterMatRef.current;
    if (!root || !wm) return false;

    if (didInitRef.current) {
      if (lastAppliedWaterMatRef.current === wm) return true;
      lastAppliedWaterMatRef.current = wm;
      swapWaterMaterials(root, wm);
      if (waterMeshesRef.current.length) {
        waterSimBoxRef.current = computeWaterWorldXZBox(waterMeshesRef.current);
      }
      return true;
    }

    const preSwap = findGltfWaterMeshes(root);
    if (preSwap.length === 0) return false;

    normalizeModelBounds(root);
    applyModelMaterialTuning(root, TUNE);
    swapWaterMaterials(root, wm);

    const waterTargets = [];
    root.traverse((child) => {
      if (!child.isMesh) return;
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      for (const mat of mats) {
        if (mat?.userData?.testWaterRipple) waterTargets.push(child);
      }
    });

    snapshotWaterBases(waterTargets);
    waterMeshesRef.current = waterTargets;
    waterSimBoxRef.current = computeWaterWorldXZBox(waterTargets);
    didInitRef.current = true;
    lastAppliedWaterMatRef.current = wm;
    return true;
  }

  useLayoutEffect(() => {
    sharedWaterMatRef.current = waterMaterial;
    tryInitWater();
  }, [waterMaterial]);

  useFrame((state) => {
    tryInitWater();

    const { model, water } = useTestSceneControlsStore.getState().controls;

    const adjust = modelAdjustRef.current;
    if (adjust) {
      adjust.position.set(model.x, model.y, model.z);
      const s = Math.max(1e-4, model.scale);
      adjust.scale.setScalar(s);
    }

    for (const mesh of waterMeshesRef.current) {
      const bp = mesh.userData._testWaterBasePos;
      const bs = mesh.userData._testWaterBaseScale;
      if (!bp || !bs) continue;
      mesh.position.set(bp.x + water.x, bp.y + water.y, bp.z + water.z);
      const ws = Math.max(1e-4, water.scale);
      mesh.scale.set(bs.x * ws, bs.y * ws, bs.z * ws);
    }

    const waterMeshes = waterMeshesRef.current;
    if (waterMeshes.length) {
      waterSimBoxRef.current = computeWaterWorldXZBox(waterMeshes);
    }

    const box = waterSimBoxRef.current;
    const sim = heightfieldSimRef.current;
    const mat = sharedWaterMatRef.current;

    if (mat?.userData?.testWaterHeightfield && sim) {
      const drops = [];
      if (waterMeshes.length && box) {
        raycaster.setFromCamera(pointerNdcRef.current, camera);
        const hits = raycaster.intersectObjects(waterMeshes, false);
        if (hits.length > 0) {
          const p = hits[0].point;
          const d = Math.hypot(p.x - lastSpawnRef.current.x, p.z - lastSpawnRef.current.y);
          if (d > SPAWN_DIST) {
            drops.push({ ...worldXZToSim(p.x, p.z, box), radius: 0.03, strength: 0.01 });
            lastSpawnRef.current.set(p.x, p.z);
          }
        }
      }
      sim.tick({ drops, stepCount: HEIGHTFIELD_STEPS });
    } else if (waterMeshes.length && box) {
      raycaster.setFromCamera(pointerNdcRef.current, camera);
      const hits = raycaster.intersectObjects(waterMeshes, false);
      if (hits.length > 0) {
        const p = hits[0].point;
        const d = Math.hypot(p.x - lastSpawnRef.current.x, p.z - lastSpawnRef.current.y);
        if (d > SPAWN_DIST) {
          const i = rippleWriteRef.current % RIPPLE_MAX;
          ripplesRef.current[i] = {
            x: p.x,
            z: p.z,
            t: state.clock.elapsedTime,
            strength: 1,
          };
          rippleWriteRef.current = i + 1;
          lastSpawnRef.current.set(p.x, p.z);
        }
      }
    }

    if (mat?.userData?.rippleUniforms) {
      updateTestWaterUniforms(mat, state.clock.elapsedTime, ripplesRef.current);
    }

    const poolU = mat?.userData?.testWaterPoolUniforms;
    if (poolU && box) {
      poolU.uBoundsMinXZ.value.set(box.min.x, box.min.z);
      poolU.uBoundsRangeXZ.value.set(
        Math.max(box.max.x - box.min.x, 1e-4),
        Math.max(box.max.z - box.min.z, 1e-4),
      );
      poolU.uFloorY.value = box.min.y - 0.12;
      poolU.uBoxMin.value.set(box.min.x - 1.2, box.min.y - 3.5, box.min.z - 1.2);
      poolU.uBoxMax.value.set(box.max.x + 1.2, box.max.y + 2.5, box.max.z + 1.2);
      poolU.uHasEnv.value = scene.environment ? 1 : 0;
    }
  });

  return (
    <group position={[0, -1, -5]}>
      <directionalLight
        position={[4.2, 7.5, 6.2]}
        intensity={3.25}
        color={0xffffff}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-normalBias={0.02}
        shadow-bias={-0.0001}
      >
        <orthographicCamera attach="shadow-camera" args={[-7, 7, 7, -7, 1, 30]} />
      </directionalLight>
      <ambientLight intensity={0.18} color="#fff5ff" />
      <directionalLight position={[-3, 3, 2]} intensity={0.8} color="#c8c0ff" />
      <directionalLight position={[0, 2, -8]} intensity={1.2} color="#ffe8d0" />
      <spotLight
        position={[2, 5, -3]}
        intensity={0.6}
        color="#e0e8ff"
        angle={Math.PI / 6}
        penumbra={0.8}
        target-position={[0, 0, 0]}
      />
      <group ref={modelRootRef}>
        <group ref={modelAdjustRef}>
          <TestModel />
        </group>
      </group>
    </group>
  );
}
