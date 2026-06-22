import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";
import { createPoolWaterSim, type PoolWaterSim } from "./compute/createPoolWaterSim";
import { createPoolWaterMaterial, applyPoolWaterStaticParams, type PoolWaterMaterialApi } from "./materials/createPoolWaterMaterial";
import { createHomeCaustics, type HomeCaustics } from "./caustics/createHomeCaustics";
import { applyCausticsReceivers, findCausticsReceivers, type CausticsReceivers } from "./caustics/applyCausticsReceivers";
import { createWaterBackdrop, type WaterBackdrop } from "./WaterBackdrop";
import { createWaterPlanarReflection, type WaterPlanarReflection } from "./WaterPlanarReflection";
import { loadWaterReflectionCubemap } from "./materials/poolWaterReflection";
import { boxToPlanarBounds, type WaterPlanarBounds } from "./waterPlanarMapping";
import { planeAlignmentSnapshot, syncPoolWaterPlane } from "./createPoolWaterMesh";
import {
  POOL_CAUSTICS_DEFAULTS,
  POOL_SIM_DEFAULTS,
  POOL_WATER_DEFAULTS,
  POOL_WATER_RENDER_ORDER,
  WATER_DEBUG_HIGHLIGHT_PLANE,
} from "./config/poolWaterDefaults";
import {
  getPoolCausticsSizeForTier,
  getPoolSimResolutionForTier,
  getRenderQualityTier,
  uvToSimGrid,
} from "./waterSimUtils";
import { prefersReducedMotion } from "../../lib/prefersReducedMotion";

function buildStartupImpulseQueue(nw: number, nh: number) {
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

function simDimsFromBounds(bounds: WaterPlanarBounds, baseGridSize: number) {
  const sqrtAspect = Math.sqrt(bounds.width / bounds.depth);
  return {
    nw: Math.max(32, Math.round(baseGridSize * sqrtAspect)),
    nh: Math.max(32, Math.round(baseGridSize / sqrtAspect)),
  };
}

function meshWorldBox(mesh: THREE.Mesh) {
  mesh.updateWorldMatrix(true, false);
  return new THREE.Box3().setFromObject(mesh);
}

type WaterRipplesProps = {
  mesh: THREE.Mesh;
  sceneRoot: THREE.Object3D;
};

export default function WaterRipples({ mesh, sceneRoot }: WaterRipplesProps) {
  const { gl, camera, scene } = useThree();
  const qualityTier = getRenderQualityTier();

  const simRef = useRef<PoolWaterSim | null>(null);
  const materialApiRef = useRef<PoolWaterMaterialApi | null>(null);
  const causticsCtxRef = useRef<{ caustics: HomeCaustics; receivers: CausticsReceivers } | null>(null);
  const backdropRef = useRef<WaterBackdrop | null>(null);
  const planarRef = useRef<WaterPlanarReflection | null>(null);
  const waterYRef = useRef(0);
  const reflectionMatrixRef = useRef(new THREE.Matrix4());
  const drawSizeRef = useRef(new THREE.Vector2());
  const boundsRef = useRef<WaterPlanarBounds | null>(null);
  const previousMaterialRef = useRef<THREE.Material | null>(null);
  const lastSpawnTimeRef = useRef(0);
  const lastSpawnCellRef = useRef(new THREE.Vector2(-1, -1));
  const raycasterRef = useRef(new THREE.Raycaster());
  const ndcRef = useRef(new THREE.Vector2());
  const impulseQueueRef = useRef<{ gx: number; gy: number; strengthScale?: number }[]>([]);
  const matrixSnapshotRef = useRef<number[] | null>(null);
  const reflectionCubeRef = useRef<THREE.Texture | null>(null);
  const planeSnapshotRef = useRef(planeAlignmentSnapshot());

  const gridSize = getPoolSimResolutionForTier(qualityTier);
  const nwRef = useRef(gridSize);
  const nhRef = useRef(gridSize);

  const refreshBounds = () => {
    if (!mesh) return null;
    const box = meshWorldBox(mesh);
    const bounds = boxToPlanarBounds(box);
    boundsRef.current = bounds;
    waterYRef.current = box.max.y;
    materialApiRef.current?.setPlanarBounds(bounds);
    matrixSnapshotRef.current = mesh.matrixWorld.elements.slice();

    const ctx = causticsCtxRef.current;
    if (ctx) {
      ctx.caustics.setBounds();
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

  const queueImpulseFromHit = (hit: THREE.Intersection) => {
    const bounds = boundsRef.current ?? refreshBounds();
    if (!bounds) return null;
    return {
      gx: ((hit.point.x - bounds.minX) / bounds.width) * (nwRef.current - 1),
      gy: (1 - (hit.point.z - bounds.minZ) / bounds.depth) * (nhRef.current - 1),
    };
  };

  useEffect(() => {
    if (!mesh || !gl) return undefined;

    let cancelled = false;
    previousMaterialRef.current = mesh.material as THREE.Material;
    mesh.visible = true;
    mesh.frustumCulled = false;
    mesh.renderOrder = POOL_WATER_RENDER_ORDER;
    mesh.userData.isWater = true;

    if (WATER_DEBUG_HIGHLIGHT_PLANE) return undefined;

    const bounds = refreshBounds();
    if (!bounds) return undefined;

    const waterY = meshWorldBox(mesh).max.y;
    const { nw, nh } = simDimsFromBounds(bounds, gridSize);
    nwRef.current = nw;
    nhRef.current = nh;

    const renderer = gl as THREE.WebGLRenderer;
    const backdrop = createWaterBackdrop(renderer);
    const planar = createWaterPlanarReflection(renderer);
    backdropRef.current = backdrop;
    planarRef.current = planar;

    (async () => {
      try {
        const sim = await createPoolWaterSim(renderer, nw, nh);
        if (cancelled) {
          sim.dispose();
          return;
        }
        simRef.current = sim;

        const materialApi = createPoolWaterMaterial({
          sim,
          bounds,
        });
        if (cancelled) {
          materialApi.dispose();
          sim.dispose();
          return;
        }

        materialApiRef.current = materialApi;
        mesh.material = materialApi.material;
        materialApi.setBackdrop(backdrop.texture);
        materialApi.setPlanarReflection(planar.texture);
        applyPoolWaterStaticParams(materialApi);

        const reflectionCube = await loadWaterReflectionCubemap(renderer);
        if (cancelled) {
          reflectionCube?.dispose();
          return;
        }
        if (reflectionCube) {
          reflectionCubeRef.current = reflectionCube;
          materialApi.setReflectionCubemap(reflectionCube);
        }

        const { meshes: receiverMeshes } = findCausticsReceivers(sceneRoot, mesh, bounds, waterY);
        if (receiverMeshes.length > 0) {
          const caustics = createHomeCaustics(renderer, {
            sim,
            bounds,
            size: getPoolCausticsSizeForTier(qualityTier),
          });
          if (cancelled) {
            caustics.dispose();
            return;
          }

          const receivers = applyCausticsReceivers(renderer, {
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
          refreshBounds();

          if (import.meta.env.DEV) {
            console.info("[WaterRipples] pool water ready", {
              waterMesh: mesh.name,
              grid: `${nw}×${nh}`,
              reflectionCubemap: Boolean(reflectionCube),
              causticsReceivers: receiverMeshes.length,
              receiverNames: receiverMeshes.map((m) => m.name),
            });
          }
        } else if (import.meta.env.DEV) {
          console.warn("[WaterRipples] no caustics receiver meshes found under the pool");
        }

        impulseQueueRef.current = buildStartupImpulseQueue(nw, nh);
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error("[WaterRipples] failed to build pool water", err);
        }
      }
    })();

    return () => {
      cancelled = true;
      causticsCtxRef.current?.receivers.restore();
      causticsCtxRef.current?.caustics.dispose();
      causticsCtxRef.current = null;
      materialApiRef.current?.dispose();
      materialApiRef.current = null;
      backdropRef.current?.dispose();
      backdropRef.current = null;
      planarRef.current?.dispose();
      planarRef.current = null;
      reflectionCubeRef.current?.dispose();
      reflectionCubeRef.current = null;
      simRef.current?.dispose();
      simRef.current = null;
      impulseQueueRef.current = [];
      if (mesh && previousMaterialRef.current) {
        mesh.material = previousMaterialRef.current;
        mesh.renderOrder = 0;
        delete mesh.userData.isWater;
      }
    };
  }, [mesh, gl, gridSize, sceneRoot]);

  useEffect(() => {
    if (!mesh || !gl?.domElement) return undefined;

    const canvas = gl.domElement;
    const raycaster = raycasterRef.current;
    const ndc = ndcRef.current;

    const queueImpulseAtEvent = (event: PointerEvent, strengthScale = 1) => {
      if (!simRef.current || prefersReducedMotion()) return;
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
      impulseQueueRef.current.push({ ...gridPoint, strengthScale });
    };

    const onPointerMove = (event: PointerEvent) => {
      queueImpulseAtEvent(event, 1);
    };
    const onPointerDown = (event: PointerEvent) => {
      lastSpawnTimeRef.current = 0;
      lastSpawnCellRef.current.set(-1, -1);
      queueImpulseAtEvent(event, 1.2);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [mesh, gl, camera]);

  useEffect(() => {
    if (!mesh) return undefined;
    const onResize = () => refreshBounds();
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, [mesh]);

  useFrame(() => {
    const backdrop = backdropRef.current;
    const planar = planarRef.current;
    if (backdrop) {
      backdrop.resize();
      const size = gl.getDrawingBufferSize(drawSizeRef.current);
      materialApiRef.current?.setResolution(size.x, size.y);
      backdrop.render(scene, camera, mesh);
    }
    if (planar) {
      planar.resize();
      planar.render(scene, camera, mesh, waterYRef.current);
      materialApiRef.current?.setReflectionMatrix(planar.getTextureMatrix(reflectionMatrixRef.current));
    }
  }, -1);

  useFrame(() => {
    maybeRefreshBounds();

    const reducedMotion = prefersReducedMotion();
    const timeSeconds = performance.now() * 0.001;
    materialApiRef.current?.updateTime(timeSeconds, { reducedMotion });

    const planeSnap = planeAlignmentSnapshot();
    if (planeSnap !== planeSnapshotRef.current) {
      planeSnapshotRef.current = planeSnap;
      syncPoolWaterPlane(mesh, sceneRoot);
      refreshBounds();
    }

    const sim = simRef.current;
    if (sim?.ready) {
      const queue = impulseQueueRef.current;
      const maxImpulses = POOL_SIM_DEFAULTS.pointerImpulsesPerFrame;
      for (let i = 0; i < maxImpulses && queue.length > 0; i++) {
        const next = queue.shift()!;
        sim.setImpulse(next.gx, next.gy, next.strengthScale);
      }
      sim.step({ substeps: POOL_SIM_DEFAULTS.substeps });
    }

    materialApiRef.current?.setParams({
      exposure: POOL_WATER_DEFAULTS.exposure,
      hdrBlend: POOL_WATER_DEFAULTS.hdrBlend,
      planarSkyFill: POOL_WATER_DEFAULTS.planarSkyFill,
    });

    const c = POOL_CAUSTICS_DEFAULTS;
    const ctx = causticsCtxRef.current;
    if (ctx) {
      ctx.receivers.setParams({
        strength: c.strength,
        enabled: c.enabled,
        depthFade: c.depthFade,
      });
      ctx.caustics.setParams({
        normalScale: c.normalScale,
        depth: c.depth,
        maxIntensity: c.maxIntensity,
        gain: c.gain,
        edgeFade: c.edgeFade,
      });
      if (c.enabled) ctx.caustics.update();
    }
  });

  return null;
}
