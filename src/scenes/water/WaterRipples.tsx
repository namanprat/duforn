import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";
import { createPoolWaterSim } from "./compute/createPoolWaterSim";
import { createPoolWaterMaterial, type PoolWaterMaterialApi } from "./materials/createPoolWaterMaterial";
import { createHomeCaustics, type HomeCaustics } from "./caustics/createHomeCaustics";
import { applyCausticsReceivers, findCausticsReceivers, type CausticsReceivers } from "./caustics/applyCausticsReceivers";
import { boxToPlanarBounds, type WaterPlanarBounds } from "./waterPlanarMapping";
import {
  POOL_CAUSTICS_DEFAULTS,
  POOL_SIM_DEFAULTS,
  POOL_WATER_DEFAULTS,
  POOL_WATER_RENDER_ORDER,
} from "./config/poolWaterDefaults";
import {
  getPoolCausticsSizeForTier,
  getPoolSimResolutionForTier,
  getRenderQualityTier,
  prefersReducedMotion,
  uvToSimGrid,
} from "./waterSimUtils";
import type { PoolShallowWaterSimCPU } from "./compute/PoolShallowWaterSimCPU";

function buildStartupImpulseQueue(nw: number, nh: number) {
  const s = POOL_SIM_DEFAULTS.startupImpulseStrengthScale;
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

  const simRef = useRef<PoolShallowWaterSimCPU | null>(null);
  const materialApiRef = useRef<PoolWaterMaterialApi | null>(null);
  const causticsCtxRef = useRef<{ caustics: HomeCaustics; receivers: CausticsReceivers } | null>(null);
  const boundsRef = useRef<WaterPlanarBounds | null>(null);
  const previousMaterialRef = useRef<THREE.Material | null>(null);
  const lastSpawnTimeRef = useRef(0);
  const lastSpawnCellRef = useRef(new THREE.Vector2(-1, -1));
  const raycasterRef = useRef(new THREE.Raycaster());
  const ndcRef = useRef(new THREE.Vector2());
  const impulseQueueRef = useRef<{ gx: number; gy: number; strengthScale?: number }[]>([]);
  const matrixSnapshotRef = useRef<number[] | null>(null);
  const lastEnvRef = useRef<THREE.Texture | null>(null);

  const gridSize = getPoolSimResolutionForTier(qualityTier);
  const nwRef = useRef(gridSize);
  const nhRef = useRef(gridSize);

  const refreshBounds = () => {
    if (!mesh) return null;
    const box = meshWorldBox(mesh);
    const bounds = boxToPlanarBounds(box);
    boundsRef.current = bounds;
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

  useEffect(() => {
    if (!mesh || !gl) return undefined;

    previousMaterialRef.current = mesh.material as THREE.Material;
    mesh.frustumCulled = false;
    mesh.renderOrder = POOL_WATER_RENDER_ORDER;

    const bounds = refreshBounds();
    if (!bounds) return undefined;

    const waterY = meshWorldBox(mesh).max.y;
    const { nw, nh } = simDimsFromBounds(bounds, gridSize);
    nwRef.current = nw;
    nhRef.current = nh;

    const renderer = gl as THREE.WebGLRenderer;
    const sim = createPoolWaterSim(renderer, nw, nh);
    simRef.current = sim;

    const materialApi = createPoolWaterMaterial({ sim, bounds, envMap: scene.environment ?? null });
    materialApiRef.current = materialApi;
    mesh.material = materialApi.material;

    if (scene.environment) {
      lastEnvRef.current = scene.environment;
      materialApi.setEnvironment(scene.environment);
    }

    const modelRoot = sceneRoot;
    const { meshes: receiverMeshes } = findCausticsReceivers(modelRoot, mesh, bounds, waterY);
    if (receiverMeshes.length > 0) {
      const caustics = createHomeCaustics(renderer, {
        sim,
        bounds,
        size: getPoolCausticsSizeForTier(qualityTier),
      });
      const receivers = applyCausticsReceivers(renderer, {
        meshes: receiverMeshes,
        texture: caustics.texture,
        bounds,
        waterY,
      });
      causticsCtxRef.current = { caustics, receivers };
      refreshBounds();
    } else {
      console.warn("[WaterRipples] no caustics receiver meshes found under the pool");
    }

    impulseQueueRef.current = buildStartupImpulseQueue(nw, nh);

    return () => {
      causticsCtxRef.current?.receivers.restore();
      causticsCtxRef.current?.caustics.dispose();
      causticsCtxRef.current = null;
      materialApiRef.current?.dispose();
      materialApiRef.current = null;
      simRef.current?.dispose();
      simRef.current = null;
      impulseQueueRef.current = [];
      if (mesh && previousMaterialRef.current) {
        mesh.material = previousMaterialRef.current;
        mesh.renderOrder = 0;
      }
    };
  }, [mesh, gl, scene, gridSize, sceneRoot]);

  useEffect(() => {
    if (!mesh || !gl?.domElement) return undefined;

    const canvas = gl.domElement;
    const raycaster = raycasterRef.current;
    const ndc = ndcRef.current;

    const spawnImpulse = (event: PointerEvent) => {
      if (!simRef.current || prefersReducedMotion()) return;
      refreshBounds();

      const rect = canvas.getBoundingClientRect();
      ndc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      ndc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(ndc, camera);
      const hits = raycaster.intersectObject(mesh, false);
      if (!hits.length) return;

      const bounds = boundsRef.current;
      if (!bounds) return;

      const gridPoint = {
        gx: ((hits[0].point.x - bounds.minX) / bounds.width) * (nwRef.current - 1),
        gy: (1 - (hits[0].point.z - bounds.minZ) / bounds.depth) * (nhRef.current - 1),
      };

      const now = performance.now();
      if (now - lastSpawnTimeRef.current < POOL_SIM_DEFAULTS.pointerThrottleMs) return;
      const last = lastSpawnCellRef.current;
      const dx = gridPoint.gx - last.x;
      const dy = gridPoint.gy - last.y;
      const minSq = POOL_SIM_DEFAULTS.minCellDistance * POOL_SIM_DEFAULTS.minCellDistance;
      if (last.x >= 0 && dx * dx + dy * dy < minSq) return;

      lastSpawnTimeRef.current = now;
      lastSpawnCellRef.current.set(gridPoint.gx, gridPoint.gy);
      impulseQueueRef.current.push({ ...gridPoint, strengthScale: 1 });
    };

    window.addEventListener("pointermove", spawnImpulse, { passive: true });
    return () => window.removeEventListener("pointermove", spawnImpulse);
  }, [mesh, gl, camera]);

  useEffect(() => {
    if (!mesh) return undefined;
    const onResize = () => refreshBounds();
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, [mesh]);

  useFrame(() => {
    maybeRefreshBounds();

    const reducedMotion = prefersReducedMotion();
    const timeSeconds = performance.now() * 0.001;
    materialApiRef.current?.updateTime(timeSeconds, { reducedMotion });

    const sim = simRef.current;
    if (sim?.ready) {
      const queue = impulseQueueRef.current;
      if (queue.length > 0) {
        const next = queue.shift()!;
        sim.setImpulse(next.gx, next.gy, next.strengthScale);
      }
      sim.step({ substeps: POOL_SIM_DEFAULTS.substeps });
    }

    const w = POOL_WATER_DEFAULTS;
    const s = POOL_SIM_DEFAULTS;
    materialApiRef.current?.setParams({
      tintR: w.aboveWaterTint[0],
      tintG: w.aboveWaterTint[1],
      tintB: w.aboveWaterTint[2],
      fresnelBase: w.fresnelBase,
      fresnelPower: w.fresnelPower,
      fresnelNormalStrength: w.fresnelNormalStrength,
      waterClarity: w.waterClarity,
      waterDepth: w.waterDepth,
      exposure: w.exposure,
      opacity: w.opacity,
      envRefraction: w.envRefractionStrength,
      envReflection: w.hdrReflection,
      normalScale: s.normalScale,
      maxSlope: s.maxSlope,
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
        lightElevationDeg: c.lightElevationDeg,
        lightAzimuthDeg: c.lightAzimuthDeg,
      });
      if (c.enabled && !reducedMotion) ctx.caustics.update();
    }

    const env = scene.environment;
    if (env && env !== lastEnvRef.current) {
      materialApiRef.current?.setEnvironment(env);
      lastEnvRef.current = env;
    }
  });

  return null;
}
