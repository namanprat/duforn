import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { applyModelMaterialTuning, normalizeModelBounds } from "./sceneUtils.js";
import TestModel from "../../models/TestModel.jsx";
import { useTestSceneControlsStore } from "../../store/testSceneControls.js";
import {
  createTestWaterMaterial,
  isWaterSurface,
  updateTestWaterUniforms,
} from "./testWaterMaterial.js";

const TUNE = {
  roughnessScale: 0.9,
  metalnessScale: 1.1,
  envReflection: 1.5,
  clearcoat: 0.08,
  clearcoatRoughness: 0.2,
};

const RIPPLE_MAX = 4;
const SPAWN_DIST = 0.22;

function makeEmptyRipples() {
  return Array.from({ length: RIPPLE_MAX }, () => ({
    x: 0,
    z: 0,
    t: -100,
    strength: 0,
  }));
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

export default function TestScene() {
  const modelRootRef = useRef(null);
  const modelAdjustRef = useRef(null);
  const didInitRef = useRef(false);
  const waterMeshesRef = useRef([]);
  const sharedWaterMatRef = useRef(null);
  const pointerNdcRef = useRef(new THREE.Vector2(0, 0));
  const ripplesRef = useRef(makeEmptyRipples());
  const rippleWriteRef = useRef(0);
  const lastSpawnRef = useRef(new THREE.Vector2(1e9, 1e9));

  const { gl, camera } = useThree();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);

  const waterMaterial = useMemo(() => {
    const m = createTestWaterMaterial(gl);
    sharedWaterMatRef.current = m;
    return m;
  }, [gl]);

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

  useLayoutEffect(() => {
    const modelRoot = modelRootRef.current;
    if (!modelRoot || didInitRef.current) return;

    normalizeModelBounds(modelRoot);
    applyModelMaterialTuning(modelRoot, TUNE);
    swapWaterMaterials(modelRoot, waterMaterial);

    const waterTargets = [];
    modelRoot.traverse((child) => {
      if (!child.isMesh) return;
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      for (const mat of mats) {
        if (mat?.userData?.testWaterRipple) waterTargets.push(child);
      }
    });

    snapshotWaterBases(waterTargets);
    waterMeshesRef.current = waterTargets;
    didInitRef.current = true;
  }, [waterMaterial]);

  useFrame((state) => {
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
      raycaster.setFromCamera(pointerNdcRef.current, camera);
      const hits = raycaster.intersectObjects(waterMeshes, false);
      if (hits.length > 0) {
        const p = hits[0].point;
        const lx = lastSpawnRef.current.x;
        const lz = lastSpawnRef.current.y;
        const d = Math.hypot(p.x - lx, p.z - lz);
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

    const mat = sharedWaterMatRef.current;
    if (mat?.userData?.rippleUniforms) {
      updateTestWaterUniforms(mat, state.clock.elapsedTime, ripplesRef.current);
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
