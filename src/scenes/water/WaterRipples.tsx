import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";
import { createPoolWaterSim, type PoolWaterSim } from "./compute/createPoolWaterSim";
import {
  createPoolWaterMaterialWebGl as createPoolWaterMaterial,
  applyPoolWaterStaticParams,
  type PoolWaterMaterialApi,
} from "./materials/poolWaterMaterialWebGl";
import { createHomeCaustics, type HomeCaustics } from "./caustics/createHomeCaustics";
import { applyCausticsReceivers, findCausticsReceivers, type CausticsReceivers } from "./caustics/applyCausticsReceivers";
import { createWaterBackdrop, type WaterBackdrop } from "./WaterBackdrop";
import { createWaterPlanarReflection, type WaterPlanarReflection } from "./WaterPlanarReflection";
import { loadWaterReflectionCubemap } from "./materials/poolWaterReflection";
import { boxToPlanarBounds, type WaterPlanarBounds } from "./waterPlanarMapping";
import { planeAlignmentSnapshot, syncPoolWaterPlane } from "./createPoolWaterMesh";
import {
  getWaterQuality,
  POOL_CAUSTICS_DEFAULTS,
  POOL_SIM_DEFAULTS,
  POOL_WATER_DEFAULTS,
  POOL_WATER_RENDER_ORDER,
  WATER_BASIN_LAYER,
  WATER_DEBUG_HIGHLIGHT_PLANE,
} from "./config/poolWaterDefaults";
import { prefersReducedMotion } from "../../lib/prefersReducedMotion";

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
  onReady?: () => void;
};

export default function WaterRipples({ mesh, sceneRoot, onReady }: WaterRipplesProps) {
  const { gl, camera, scene } = useThree();

  const simRef = useRef<PoolWaterSim | null>(null);
  const materialApiRef = useRef<PoolWaterMaterialApi | null>(null);
  const causticsCtxRef = useRef<{ caustics: HomeCaustics; receivers: CausticsReceivers } | null>(null);
  const backdropRef = useRef<WaterBackdrop | null>(null);
  const planarRef = useRef<WaterPlanarReflection | null>(null);
  const waterYRef = useRef(0);
  const reflectionMatrixRef = useRef(new THREE.Matrix4());
  const drawSizeRef = useRef(new THREE.Vector2());
  const frustumRef = useRef(new THREE.Frustum());
  const frustumMatrixRef = useRef(new THREE.Matrix4());
  const waterSphereRef = useRef(new THREE.Sphere());
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
  const basinMeshesRef = useRef<THREE.Object3D[]>([]);
  const passFrameRef = useRef(0);
  const waterVisibleRef = useRef(true);
  const readyReportedRef = useRef(false);

  const reportReady = () => {
    if (readyReportedRef.current) return;
    readyReportedRef.current = true;
    onReady?.();
  };

  const waterQuality = getWaterQuality();
  const gridSize = waterQuality.simRes;
  const causticsSize = waterQuality.causticsSize;
  const waterPassInterval = waterQuality.passInterval;
  const waterBackdropInterval = waterQuality.backdropInterval;
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

  const hitToGrid = (hit: THREE.Intersection) => {
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

    if (WATER_DEBUG_HIGHLIGHT_PLANE) {
      reportReady();
      return undefined;
    }

    const bounds = refreshBounds();
    if (!bounds) {
      reportReady();
      return undefined;
    }

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
        applyPoolWaterStaticParams(materialApi, { gl: renderer });
        // Boot gate: shaders exist; cubemap/caustics can finish during compile.
        reportReady();

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
        // Tag basin meshes onto the backdrop layer (additive — they keep layer 0
        // for the normal frame). The backdrop camera renders only this layer.
        for (const rm of receiverMeshes) {
          rm.traverse((o) => o.layers.enable(WATER_BASIN_LAYER));
        }
        basinMeshesRef.current = receiverMeshes;
        if (receiverMeshes.length > 0 && causticsSize > 0) {
          // Real pool depth for the refracted-ray floor projection.
          let basinMinY = waterY;
          const rmBox = new THREE.Box3();
          for (const rm of receiverMeshes) {
            rm.updateWorldMatrix(true, false);
            rmBox.setFromObject(rm);
            basinMinY = Math.min(basinMinY, rmBox.min.y);
          }
          const caustics = createHomeCaustics(renderer, {
            sim,
            bounds,
            size: causticsSize,
            poolDepth: waterY - basinMinY,
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
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error("[WaterRipples] failed to build pool water", err);
        }
        reportReady();
      }
    })();

    return () => {
      cancelled = true;
      for (const rm of basinMeshesRef.current) {
        rm.traverse((o) => o.layers.disable(WATER_BASIN_LAYER));
      }
      basinMeshesRef.current = [];
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

      const rect = canvas.getBoundingClientRect();
      ndc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      ndc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(ndc, camera);
      const hits = raycaster.intersectObject(mesh, false);
      if (!hits.length) return;

      const gridPoint = hitToGrid(hits[0]);
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
      queueImpulseAtEvent(event, 1.15);
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

    // Skip the two full-scene reflection/backdrop passes when the pool is not in
    // view — by far the cheapest big win when the camera is elsewhere.
    mesh.updateWorldMatrix(true, false);
    if (!mesh.geometry.boundingSphere) mesh.geometry.computeBoundingSphere();
    let visible = true;
    if (mesh.geometry.boundingSphere) {
      waterSphereRef.current.copy(mesh.geometry.boundingSphere).applyMatrix4(mesh.matrixWorld);
      frustumMatrixRef.current.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
      frustumRef.current.setFromProjectionMatrix(frustumMatrixRef.current);
      visible = frustumRef.current.intersectsSphere(waterSphereRef.current);
    }
    waterVisibleRef.current = visible;
    if (!visible) return;

    const frame = passFrameRef.current++;

    // Basin backdrop — amortize on lower tiers (still every frame on tier 3).
    if (backdrop && frame % waterBackdropInterval === 0) {
      backdrop.resize();
      const size = gl.getDrawingBufferSize(drawSizeRef.current);
      materialApiRef.current?.setResolution(size.x, size.y);
      backdrop.render(scene, camera);
    }

    // Planar reflection is heavier — amortize to every Nth frame.
    if (frame % waterPassInterval !== 0) return;

    if (planar) {
      planar.resize();
      planar.render(scene, camera, mesh, waterYRef.current);
      materialApiRef.current?.setReflectionMatrix(planar.getTextureMatrix(reflectionMatrixRef.current));
    }
  }, -1);

  useFrame(() => {
    if (!waterVisibleRef.current) return;

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
      // GPU sim ping-pongs targets, so the live height texture changes each step.
      materialApiRef.current?.setHeightTexture(sim.getHeightTexture());
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
        edgeFade: c.edgeFade,
        chromaShift: c.chromaShift,
        maxBoost: c.maxBoost,
      });
      ctx.caustics.setParams({
        normalScale: c.normalScale,
      });
      if (c.enabled) ctx.caustics.update();
    }
  });

  return null;
}
