// @ts-nocheck
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { useWebglStore } from "../../../store/webgl";
import { useLoadingStore } from "../../../store/loading";
import { logWebGPUOnce } from "../../../lib/webgpu/debugWebGPU";
import { getRendererType } from "../../../lib/rendering";
import { createPoolWaterSim } from "./compute/createPoolWaterSim";
import { createPoolWaterMaterial } from "./materials/PoolWaterMaterial";
import { boxToPlanarBounds } from "./waterPlanarMapping";
import { getWaterPlanarBounds } from "./findWaterMesh";
import { POOL_SIM_DEFAULTS, POOL_WATER_RENDER_ORDER } from "./config/poolWaterDefaults";
import { getPoolSimResolutionForTier, uvToSimGrid } from "./waterSimUtils";
import { tickTheatreRafDriver } from "../../../lib/theatre/theatreRafDriver";
function prefersReducedMotion() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function buildStartupImpulseQueue(gridSize) {
  const s = POOL_SIM_DEFAULTS.startupImpulseStrengthScale * 1.25;
  return [
    { uv: new THREE.Vector2(0.36, 0.42), strengthScale: s },
    { uv: new THREE.Vector2(0.62, 0.35), strengthScale: s * 0.9 },
    { uv: new THREE.Vector2(0.48, 0.58), strengthScale: s * 1.05 },
    { uv: new THREE.Vector2(0.71, 0.63), strengthScale: s * 0.85 },
    { uv: new THREE.Vector2(0.27, 0.68), strengthScale: s * 0.95 },
    { uv: new THREE.Vector2(0.82, 0.5), strengthScale: s * 0.88 },
  ].map(({ uv, strengthScale }) => ({
    ...uvToSimGrid(uv, gridSize),
    strengthScale,
  }));
}

/**
 * Shallow-water ripples + ocean-style pool material on the main GLB water mesh.
 *
 * The host Canvas runs in frameloop="never" (UnifiedCanvas, WebGPU compute
 * ordering). The animation loop here calls `advance(wallClockMs)` so R3F's
 * clock tracks real time — handheld drift / parallax in CameraRig stay smooth.
 */
export default function WaterRipples({ mesh }) {
  const { gl, camera, scene, advance } = useThree();
  const qualityTier = useWebglStore((s) => s.qualityProfile?.tier ?? "desktop");
  const loadingPhase = useLoadingStore((s) => s.phase);

  const simRef = useRef(null);
  const materialApiRef = useRef(null);
  const boundsRef = useRef(null);
  const previousMaterialRef = useRef(null);
  const lastSpawnTimeRef = useRef(0);
  const lastSpawnCellRef = useRef(new THREE.Vector2(-1, -1));
  const lastBreezeImpulseRef = useRef(0);
  const breezePhaseRef = useRef(Math.random());
  const breezeStrengthRef = useRef(POOL_SIM_DEFAULTS.breezeStrength);
  const breezeIntervalRef = useRef(POOL_SIM_DEFAULTS.breezeIntervalMs);
  const raycasterRef = useRef(new THREE.Raycaster());
  const ndcRef = useRef(new THREE.Vector2());
  const impulseQueueRef = useRef([]);

  const gridSize = getPoolSimResolutionForTier(qualityTier);

  const enqueueImpulse = (gx, gy, strengthScale = 1) => {
    impulseQueueRef.current.push({ gx, gy, strengthScale });
  };

  // Coherent "breeze" — emits two small impulses along the wind direction (+U
  // in water UV) with phase-staggered Y, advancing each tick so the wave
  // equation propagates them as a traveling ruffle. Replaces the old random
  // ambient drops.
  const enqueueBreezeImpulse = (now) => {
    const strengthScale = breezeStrengthRef.current;
    if (strengthScale <= 0) {
      lastBreezeImpulseRef.current = now;
      return;
    }
    const inset = POOL_SIM_DEFAULTS.breezeYInset;
    const phase = breezePhaseRef.current;
    // Three impulses staggered along the wind axis (+U) and across Y so the
    // wave equation propagates a coherent traveling ruffle. Inset keeps them
    // clear of the absorbing edge band.
    const wrap = (x) => ((x % 1) + 1) % 1;
    const uvs = [
      new THREE.Vector2(
        wrap(phase),
        THREE.MathUtils.lerp(inset, 1 - inset, (Math.sin(phase * 11.7) + 1) / 2),
      ),
      new THREE.Vector2(
        wrap(phase + 0.33),
        THREE.MathUtils.lerp(inset, 1 - inset, (Math.cos(phase * 7.3) + 1) / 2),
      ),
      new THREE.Vector2(
        wrap(phase + 0.66),
        THREE.MathUtils.lerp(inset, 1 - inset, (Math.sin(phase * 5.1 + 1.3) + 1) / 2),
      ),
    ];
    for (const uv of uvs) {
      const { gx, gy } = uvToSimGrid(uv, gridSize);
      enqueueImpulse(gx, gy, strengthScale);
    }
    breezePhaseRef.current = wrap(phase + POOL_SIM_DEFAULTS.breezeStep);
    lastBreezeImpulseRef.current = now;
  };

  const queueImpulseFromHit = (hit) => {
    if (hit.uv) {
      const { gx, gy } = uvToSimGrid(hit.uv, gridSize);
      return { gx, gy };
    }

    const bounds = boundsRef.current ?? refreshBounds();
    if (!bounds) return null;

    return {
      gx: ((hit.point.x - bounds.minX) / bounds.width) * (gridSize - 1),
      gy: (1 - (hit.point.z - bounds.minZ) / bounds.depth) * (gridSize - 1),
    };
  };

  const refreshBounds = () => {
    if (!mesh) return null;
    const box = getWaterPlanarBounds(mesh);
    const bounds = boxToPlanarBounds(box);
    boundsRef.current = bounds;
    materialApiRef.current?.setPlanarBounds?.(bounds);
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

    (async () => {
      try {
        const sim = await createPoolWaterSim(gl, gridSize, gridSize);
        if (cancelled) {
          sim.dispose?.();
          return;
        }
        simRef.current = sim;

        const envMap = scene.environment ?? null;
        const materialApi = await createPoolWaterMaterial(gl, {
          mesh,
          sim,
          bounds,
          envMap,
        });
        if (cancelled) {
          materialApi.dispose();
          sim.dispose?.();
          return;
        }

        materialApiRef.current = materialApi;
        mesh.material = materialApi.material;
        impulseQueueRef.current = buildStartupImpulseQueue(gridSize);

        logWebGPUOnce("pool-water-ready", "WaterRipples", "Pool shallow water ready", {
          meshName: mesh.name,
          bounds,
          rendererType: getRendererType(gl),
          gridSize,
        });
      } catch (err) {
        console.error("[WaterRipples] failed to build pool water", err);
      }
    })();

    return () => {
      cancelled = true;
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
      if (!simRef.current) return;
      if (prefersReducedMotion()) return;

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
      if (
        last.x >= 0 &&
        dx * dx + dy * dy < POOL_SIM_DEFAULTS.minCellDistance * POOL_SIM_DEFAULTS.minCellDistance
      ) {
        return;
      }

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
    const renderer = gl;

    let running = true;
    let simBusy = false;
    let frameIndex = 0;

    const maybeStepSim = (now) => {
      const sim = simRef.current;
      if (!sim?.ready || simBusy) return;

      const queue = impulseQueueRef.current;
      const reducedMotion = prefersReducedMotion();

      // Breeze runs continuously (not gated on idle) so the surface always has a gentle ruffle.
      if (!reducedMotion && now - lastBreezeImpulseRef.current > breezeIntervalRef.current) {
        enqueueBreezeImpulse(now);
      }

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

    // setAnimationLoop callback receives a DOMHighResTimeStamp (same monotonic
    // as rAF). Feeding it to advance() keeps R3F's clock on wall time so
    // CameraRig's parallax + drift stay smooth.
    const tick = (timestampMs) => {
      if (!running) return;
      if (useLoadingStore.getState().phase !== "ready") return;

      const t = typeof timestampMs === "number" ? timestampMs : performance.now();
      // Keep Theatre camera timeline on the same clock as R3F advance/render.
      tickTheatreRafDriver(t);
      advance(t);
      materialApiRef.current?.updateTime?.(t * 0.001);
      renderer.render(scene, camera);
      // Half-rate sim keeps ripples alive while freeing GPU for camera + render.
      if ((frameIndex++ & 1) === 0) maybeStepSim(t);
    };

    renderer.setAnimationLoop(tick);
    return () => {
      running = false;
      renderer.setAnimationLoop(null);
    };
  }, [gl, scene, camera, advance, loadingPhase]);

  return null;
}
