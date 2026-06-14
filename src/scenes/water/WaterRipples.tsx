// @ts-nocheck
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";
import { useLoadingStore } from "../../store/loading";
import { logWebGPUOnce } from "../../lib/gpu/debug";
import { getRendererType } from "../../lib/render";
import { createPoolWaterSim } from "./compute/createPoolWaterSim";
import { createPoolWaterMaterial } from "./materials/PoolWaterMaterial";
import { createHomeCaustics } from "./caustics/createHomeCaustics";
import { applyCausticsReceivers, findCausticsReceivers } from "./caustics/applyCausticsReceivers";
import { boxToPlanarBounds } from "./waterPlanarMapping";
import {
  POOL_CAUSTICS_DEFAULTS,
  POOL_SIM_DEFAULTS,
  POOL_WATER_RENDER_ORDER,
} from "./config/poolWaterDefaults";
import {
  getPoolCausticsSizeForTier,
  getPoolSimResolutionForTier,
  getRenderQualityTier,
  prefersReducedMotion,
  uvToSimGrid,
} from "./waterSimUtils";
import { useHomeSceneControlsStore } from "../../store/homeScene";

function buildStartupImpulseQueue(nw, nh) {
  const s = POOL_SIM_DEFAULTS.startupImpulseStrengthScale * 1.25;
  return [
    { uv: new THREE.Vector2(0.36, 0.42), strengthScale: s },
    { uv: new THREE.Vector2(0.62, 0.35), strengthScale: s * 0.9 },
    { uv: new THREE.Vector2(0.48, 0.58), strengthScale: s * 1.05 },
    { uv: new THREE.Vector2(0.71, 0.63), strengthScale: s * 0.85 },
    { uv: new THREE.Vector2(0.27, 0.68), strengthScale: s * 0.95 },
    { uv: new THREE.Vector2(0.82, 0.5), strengthScale: s * 0.88 },
  ].map(({ uv, strengthScale }) => ({
    ...uvToSimGrid(uv, nw, nh),
    strengthScale,
  }));
}

/** Non-square sim grid sized so cells are physically square. */
function simDimsFromBounds(bounds, baseGridSize) {
  const sqrtAspect = Math.sqrt(bounds.width / bounds.depth);
  return {
    nw: Math.max(32, Math.round(baseGridSize * sqrtAspect)),
    nh: Math.max(32, Math.round(baseGridSize / sqrtAspect)),
  };
}

function meshWorldBox(mesh) {
  mesh.updateWorldMatrix(true, false);
  return new THREE.Box3().setFromObject(mesh);
}

/**
 * Shallow-water ripples + ocean-style pool material on the GLB water mesh,
 * plus a refracted-light caustics pass multiplied into the pool basin meshes.
 *
 * The host Canvas runs in frameloop="never"; this loop calls `advance(t)` so
 * R3F's clock tracks real time, keeping CameraRig's parallax/drift smooth.
 */
export default function WaterRipples({ mesh, modelRef }) {
  const { gl, camera, scene } = useThree();
  const qualityTier = getRenderQualityTier();

  const simRef = useRef(null);
  const materialApiRef = useRef(null);
  const boundsRef = useRef(null);
  const previousMaterialRef = useRef(null);
  const lastSpawnTimeRef = useRef(0);
  const lastSpawnCellRef = useRef(new THREE.Vector2(-1, -1));
  const raycasterRef = useRef(new THREE.Raycaster());
  const ndcRef = useRef(new THREE.Vector2());
  const impulseQueueRef = useRef([]);
  const simBusyRef = useRef(false);
  const simBusySinceRef = useRef(0);
  const matrixSnapshotRef = useRef(null);
  const causticsCtxRef = useRef(null);
  const lastEnvRef = useRef(null);

  const gridSize = getPoolSimResolutionForTier(qualityTier);
  const nwRef = useRef(gridSize);
  const nhRef = useRef(gridSize);

  const enqueueImpulse = (gx, gy, strengthScale = 1) => {
    impulseQueueRef.current.push({ gx, gy, strengthScale });
  };

  const queueImpulseFromHit = (hit) => {
    // World-space bounds: the shader uses planar projection (not mesh UVs).
    // Use nwRef/nhRef (actual non-square grid) — using base gridSize for an
    // elongated pool would push gy past the valid range.
    const bounds = boundsRef.current ?? refreshBounds();
    if (!bounds) return null;
    return {
      gx: ((hit.point.x - bounds.minX) / bounds.width) * (nwRef.current - 1),
      gy: (1 - (hit.point.z - bounds.minZ) / bounds.depth) * (nhRef.current - 1),
    };
  };

  const refreshBounds = () => {
    if (!mesh) return null;
    const box = meshWorldBox(mesh);
    const bounds = boxToPlanarBounds(box);
    boundsRef.current = bounds;
    materialApiRef.current?.setPlanarBounds?.(bounds);
    matrixSnapshotRef.current = mesh.matrixWorld.elements.slice();

    const ctx = causticsCtxRef.current;
    if (ctx) {
      ctx.caustics.setBounds(bounds);
      ctx.receivers.setBounds(bounds);
      ctx.receivers.setWaterY(box.max.y);
    }
    return bounds;
  };

  const maybeRefreshBounds = () => {
    if (!mesh) return;
    mesh.updateWorldMatrix(true, false);
    const elements = mesh.matrixWorld.elements;
    const prev = matrixSnapshotRef.current;
    if (!prev) {
      refreshBounds();
      return;
    }
    for (let i = 0; i < 16; i++) {
      if (prev[i] !== elements[i]) {
        refreshBounds();
        return;
      }
    }
  };

  useEffect(() => {
    if (!mesh || !gl) return undefined;

    let cancelled = false;
    previousMaterialRef.current = mesh.material;
    mesh.frustumCulled = false;
    mesh.renderOrder = POOL_WATER_RENDER_ORDER;

    const bounds = refreshBounds();
    const { nw, nh } = simDimsFromBounds(bounds, gridSize);
    nwRef.current = nw;
    nhRef.current = nh;

    (async () => {
      try {
        const sim = await createPoolWaterSim(gl, nw, nh);
        if (cancelled) {
          sim.dispose?.();
          return;
        }
        simRef.current = sim;

        const envMap = scene.environment ?? null;
        const materialApi = await createPoolWaterMaterial(gl, { mesh, sim, bounds, envMap });
        if (cancelled) {
          materialApi.dispose();
          sim.dispose?.();
          return;
        }

        materialApiRef.current = materialApi;
        mesh.material = materialApi.material;
        if (scene.environment) {
          lastEnvRef.current = scene.environment;
          materialApi.setEnvironment?.(scene.environment);
        }
        impulseQueueRef.current = buildStartupImpulseQueue(nw, nh);

        // Caustics: refract light through the rippled surface onto the GLB
        // pool basin (floor + walls), multiplied into their baked materials.
        const modelRoot = modelRef?.current ?? null;
        const waterY = meshWorldBox(mesh).max.y;
        const { meshes: receiverMeshes } = findCausticsReceivers(modelRoot, mesh, bounds, waterY);
        if (receiverMeshes.length > 0) {
          const caustics = await createHomeCaustics(gl, {
            sim,
            bounds,
            size: getPoolCausticsSizeForTier(qualityTier),
          });
          if (cancelled) {
            caustics.dispose();
            return;
          }
          const receivers = await applyCausticsReceivers(gl, {
            meshes: receiverMeshes,
            texture: caustics.texture,
            bounds,
            waterY,
          });
          if (cancelled) {
            receivers.restore();
            caustics.dispose();
            return;
          }
          causticsCtxRef.current = { caustics, receivers };
          // The model transform usually settles while this async init runs;
          // re-push current world bounds or the receivers keep the stale
          // mount-time bounds and sample the RT border (edge mask 0) forever.
          refreshBounds();
        } else {
          console.warn("[WaterRipples] no caustics receiver meshes found under the pool");
        }

        logWebGPUOnce("pool-water-ready", "WaterRipples", "Pool shallow water ready", {
          meshName: mesh.name,
          bounds,
          rendererType: getRendererType(gl),
          gridSize: `${nw}×${nh}`,
          causticsReceivers: receiverMeshes.length,
          causticsReceiverNames: receiverMeshes.map((m) => m.name),
        });
      } catch (err) {
        console.error("[WaterRipples] failed to build pool water", err);
      }
    })();

    return () => {
      cancelled = true;
      causticsCtxRef.current?.receivers.restore();
      causticsCtxRef.current?.caustics.dispose();
      causticsCtxRef.current = null;
      materialApiRef.current?.dispose();
      materialApiRef.current = null;
      simRef.current?.dispose?.();
      simRef.current = null;
      impulseQueueRef.current = [];
      if (mesh && previousMaterialRef.current) {
        mesh.material = previousMaterialRef.current;
        mesh.renderOrder = 0;
      }
    };
  }, [mesh, gl, scene, gridSize]);

  useEffect(() => {
    if (!mesh || !gl?.domElement) return undefined;

    const canvas = gl.domElement;
    const raycaster = raycasterRef.current;
    const ndc = ndcRef.current;

    const spawnImpulse = (event) => {
      if (!simRef.current || prefersReducedMotion()) return;

      // Model scale/position are applied in Main's useFrame after mount; bounds
      // must match the mesh's current world matrix or grid coords miss the pool.
      refreshBounds();

      const rect = canvas.getBoundingClientRect();
      ndc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      ndc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(ndc, camera);
      const hits = raycaster.intersectObject(mesh, false);
      if (!hits.length) return;

      const gridPoint = queueImpulseFromHit(hits[0]);
      if (!gridPoint) return;

      const now = performance.now();
      if (now - lastSpawnTimeRef.current < POOL_SIM_DEFAULTS.pointerThrottleMs) return;
      const last = lastSpawnCellRef.current;
      const dx = gridPoint.gx - last.x;
      const dy = gridPoint.gy - last.y;
      const minSq = POOL_SIM_DEFAULTS.minCellDistance * POOL_SIM_DEFAULTS.minCellDistance;
      if (last.x >= 0 && dx * dx + dy * dy < minSq) return;

      lastSpawnTimeRef.current = now;
      lastSpawnCellRef.current.set(gridPoint.gx, gridPoint.gy);
      enqueueImpulse(gridPoint.gx, gridPoint.gy);
    };

    window.addEventListener("pointermove", spawnImpulse, { passive: true });
    return () => window.removeEventListener("pointermove", spawnImpulse);
  }, [mesh, gl, camera, gridSize]);

  useEffect(() => {
    if (!mesh) return undefined;
    const onResize = () => refreshBounds();
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, [mesh]);

  // The unified canvas (`frameloop="never"`) owns the single
  // `advance` + `gl.render` loop (see UnifiedCanvasFrameLoop). This component
  // only advances the water sim + material clock per frame; rendering is the
  // unified loop's job. useFrame runs when the unified loop calls `advance(t)`.
  const maybeStepSim = () => {
    const sim = simRef.current;
    if (!sim?.ready) return;
    if (simBusyRef.current) {
      // Watchdog: a stepAsync promise that never settles (hung computeAsync
      // during tab-background throttling / HMR) would otherwise gate stepping
      // forever — the sim freezes and ripples/caustics stop reacting.
      if (performance.now() - simBusySinceRef.current < 1500) return;
      console.warn("[WaterRipples] sim step watchdog: lost step promise, resuming");
    }

    const queue = impulseQueueRef.current;
    if (queue.length > 0) {
      const next = queue.shift();
      sim.setImpulse(next.gx, next.gy, next.strengthScale);
    }

    simBusyRef.current = true;
    simBusySinceRef.current = performance.now();
    sim
      .stepAsync({ substeps: POOL_SIM_DEFAULTS.substeps })
      .catch((err) => console.error("[WaterRipples] sim step failed", err))
      .finally(() => {
        simBusyRef.current = false;
      });
  };

  useFrame(() => {
    if (useLoadingStore.getState().phase !== "ready") return;
    maybeRefreshBounds();
    const timeSeconds = performance.now() * 0.001;
    materialApiRef.current?.updateTime?.(timeSeconds, {
      reducedMotion: prefersReducedMotion(),
    });
    maybeStepSim();

    const env = scene.environment;
    if (env && env !== lastEnvRef.current) {
      materialApiRef.current?.setEnvironment?.(env);
      lastEnvRef.current = env;
    }

    const controls = useHomeSceneControlsStore.getState().controls;
    if (controls.water) {
      materialApiRef.current?.setParams?.({
        ...controls.water,
        envReflection: controls.env?.skybox ?? true,
      });
    }

    const ctx = causticsCtxRef.current;
    if (ctx) {
      const c = useHomeSceneControlsStore.getState().controls.caustics ?? POOL_CAUSTICS_DEFAULTS;
      ctx.receivers.setParams({ strength: c.strength, enabled: c.enabled });
      ctx.caustics.setParams({
        normalScale: c.normalScale,
        depth: c.depth,
        maxIntensity: c.maxIntensity,
        gain: c.gain,
      });
      if (c.enabled) ctx.caustics.update(prefersReducedMotion() ? 0 : timeSeconds);
    }
  });

  return null;
}
