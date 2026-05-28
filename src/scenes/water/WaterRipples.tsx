// @ts-nocheck
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { useWebglStore } from "../../store/webgl";
import { useLoadingStore } from "../../store/loading";
import { logWebGPUOnce } from "../../lib/gpu/debug";
import { getRendererType } from "../../lib/render";
import { createPoolWaterSim } from "./compute/createPoolWaterSim";
import { createPoolWaterMaterial } from "./materials/PoolWaterMaterial";
import { applyGroundCaustics } from "./materials/applyGroundCaustics";
import { boxToPlanarBounds } from "./waterPlanarMapping";
import { findGroundMesh } from "./findWaterMesh";
import { POOL_SIM_DEFAULTS, POOL_WATER_RENDER_ORDER } from "./config/poolWaterDefaults";
import { getPoolSimResolutionForTier, uvToSimGrid } from "./waterSimUtils";

function prefersReducedMotion() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

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

function meshPlanarBounds(mesh) {
  mesh.updateWorldMatrix(true, false);
  return boxToPlanarBounds(new THREE.Box3().setFromObject(mesh));
}

/**
 * Shallow-water ripples + ocean-style pool material on the GLB water mesh.
 *
 * The host Canvas runs in frameloop="never"; this loop calls `advance(t)` so
 * R3F's clock tracks real time, keeping CameraRig's parallax/drift smooth.
 */
export default function WaterRipples({ mesh }) {
  const { gl, camera, scene, advance } = useThree();
  const qualityTier = useWebglStore((s) => s.qualityProfile?.tier ?? "desktop");
  const loadingPhase = useLoadingStore((s) => s.phase);

  const simRef = useRef(null);
  const materialApiRef = useRef(null);
  const groundCausticsRef = useRef(null);
  const boundsRef = useRef(null);
  const previousMaterialRef = useRef(null);
  const lastSpawnTimeRef = useRef(0);
  const lastSpawnCellRef = useRef(new THREE.Vector2(-1, -1));
  const lastBreezeImpulseRef = useRef(0);
  const breezePhaseRef = useRef(Math.random());
  const raycasterRef = useRef(new THREE.Raycaster());
  const ndcRef = useRef(new THREE.Vector2());
  const impulseQueueRef = useRef([]);

  const gridSize = getPoolSimResolutionForTier(qualityTier);
  const nwRef = useRef(gridSize);
  const nhRef = useRef(gridSize);

  const enqueueImpulse = (gx, gy, strengthScale = 1) => {
    impulseQueueRef.current.push({ gx, gy, strengthScale });
  };

  // Coherent "breeze": three impulses staggered along +U with phase-staggered
  // Y, propagated by the wave equation into a traveling ruffle.
  const enqueueBreezeImpulse = (now) => {
    const inset = POOL_SIM_DEFAULTS.breezeYInset;
    const phase = breezePhaseRef.current;
    const wrap = (x) => ((x % 1) + 1) % 1;
    const uvs = [
      [wrap(phase), THREE.MathUtils.lerp(inset, 1 - inset, (Math.sin(phase * 11.7) + 1) / 2)],
      [wrap(phase + 0.33), THREE.MathUtils.lerp(inset, 1 - inset, (Math.cos(phase * 7.3) + 1) / 2)],
      [
        wrap(phase + 0.66),
        THREE.MathUtils.lerp(inset, 1 - inset, (Math.sin(phase * 5.1 + 1.3) + 1) / 2),
      ],
    ];
    for (const [u, v] of uvs) {
      const { gx, gy } = uvToSimGrid({ x: u, y: v }, nwRef.current, nhRef.current);
      enqueueImpulse(gx, gy, POOL_SIM_DEFAULTS.breezeStrength);
    }
    breezePhaseRef.current = wrap(phase + POOL_SIM_DEFAULTS.breezeStep);
    lastBreezeImpulseRef.current = now;
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
    const bounds = meshPlanarBounds(mesh);
    boundsRef.current = bounds;
    materialApiRef.current?.setPlanarBounds?.(bounds);
    groundCausticsRef.current?.setPlanarBounds?.(bounds);
    return bounds;
  };

  useEffect(() => {
    if (!mesh || !gl) return undefined;

    let cancelled = false;
    previousMaterialRef.current = mesh.material;
    mesh.frustumCulled = false;
    mesh.renderOrder = POOL_WATER_RENDER_ORDER;
    lastBreezeImpulseRef.current = performance.now();

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
        impulseQueueRef.current = buildStartupImpulseQueue(nw, nh);

        const groundMesh = findGroundMesh(scene, mesh);
        if (groundMesh) {
          groundCausticsRef.current = applyGroundCaustics({
            mesh: groundMesh,
            sim,
            bounds,
            renderer: gl,
          });
        }

        logWebGPUOnce("pool-water-ready", "WaterRipples", "Pool shallow water ready", {
          meshName: mesh.name,
          bounds,
          rendererType: getRendererType(gl),
          gridSize: `${nw}×${nh}`,
        });
      } catch (err) {
        console.error("[WaterRipples] failed to build pool water", err);
      }
    })();

    return () => {
      cancelled = true;
      groundCausticsRef.current?.dispose?.();
      groundCausticsRef.current = null;
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

  useEffect(() => {
    if (!gl || loadingPhase !== "ready") return undefined;

    let running = true;
    let simBusy = false;
    let frameIndex = 0;

    const maybeStepSim = (now) => {
      const sim = simRef.current;
      if (!sim?.ready || simBusy) return;

      const reducedMotion = prefersReducedMotion();
      if (
        !reducedMotion &&
        now - lastBreezeImpulseRef.current > POOL_SIM_DEFAULTS.breezeIntervalMs
      ) {
        enqueueBreezeImpulse(now);
      }

      const queue = impulseQueueRef.current;
      if (queue.length > 0) {
        const next = queue.shift();
        sim.setImpulse(next.gx, next.gy, next.strengthScale);
      }

      simBusy = true;
      sim
        .stepAsync({ substeps: POOL_SIM_DEFAULTS.substeps })
        .catch((err) => console.error("[WaterRipples] sim step failed", err))
        .finally(() => {
          simBusy = false;
        });
    };

    const tick = (timestampMs) => {
      if (!running) return;
      if (useLoadingStore.getState().phase !== "ready") return;

      const t = typeof timestampMs === "number" ? timestampMs : performance.now();
      advance(t);
      materialApiRef.current?.updateTime?.(t * 0.001);
      groundCausticsRef.current?.updateTime?.(t * 0.001);
      gl.render(scene, camera);
      // Half-rate sim: ripples stay alive while freeing GPU for camera + render.
      if ((frameIndex++ & 1) === 0) maybeStepSim(t);
    };

    gl.setAnimationLoop(tick);
    return () => {
      running = false;
      gl.setAnimationLoop(null);
    };
  }, [gl, scene, camera, advance, loadingPhase]);

  return null;
}
