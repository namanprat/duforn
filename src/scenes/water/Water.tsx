import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useLocation } from "react-router-dom";
import * as THREE from "three";
import { HDRLoader } from "three/addons/loaders/HDRLoader.js";
import { WaterSim } from "./WaterSim";
import { createWaterSurfaceMaterial } from "./surfaceMaterial";
import { createCausticsPass, patchCausticsReceivers, WATER_LIGHT_DIR } from "./caustics";
import { createPoolWaterMesh, findCausticsReceiverMeshes, getWaterBounds } from "./pool";
import { worldPointToSimUv } from "./waterPlanarMapping";
import { getRouteNamespace } from "../../lib/route";

const HDR_URL = "/main.hdr";

function poolDepthFromReceivers(meshes: THREE.Mesh[], waterY: number): number {
  let minY = waterY;
  const box = new THREE.Box3();
  for (const mesh of meshes) {
    mesh.updateWorldMatrix(true, false);
    box.setFromObject(mesh);
    if (box.min.y < minY) minY = box.min.y;
  }
  return Math.max(waterY - minY, 0.1);
}

type WaterProps = {
  sceneRoot: THREE.Object3D;
};

const STARTUP_DROPS = [
  [0.35, 0.4],
  [0.62, 0.55],
  [0.48, 0.72],
] as const;

export default function Water({ sceneRoot }: WaterProps) {
  const location = useLocation();
  const { gl, camera } = useThree();
  const activePage = getRouteNamespace(location.pathname);

  const simRef = useRef<WaterSim | null>(null);
  const surfaceRef = useRef<ReturnType<typeof createWaterSurfaceMaterial> | null>(null);
  const causticsRef = useRef<ReturnType<typeof createCausticsPass> | null>(null);
  const receiversRef = useRef<ReturnType<typeof patchCausticsReceivers> | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const boundsRef = useRef<ReturnType<typeof getWaterBounds> | null>(null);
  const lastDropRef = useRef(0);
  const raycaster = useRef(new THREE.Raycaster());
  const pointer = useRef(new THREE.Vector2());

  const syncBounds = () => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const next = getWaterBounds(mesh);
    boundsRef.current = next;
    surfaceRef.current?.setBounds(next.bounds);
    receiversRef.current?.setBounds(next.bounds);
    receiversRef.current?.setWaterY(next.waterY);
  };

  useEffect(() => {
    const waterMesh = createPoolWaterMesh(sceneRoot);
    if (!waterMesh) {
      console.warn("[Water] PoolWalls mesh not found — cannot create water plane");
      return undefined;
    }

    meshRef.current = waterMesh;

    const { bounds, waterY } = getWaterBounds(waterMesh);
    boundsRef.current = { bounds, waterY };

    const sim = new WaterSim(gl);
    simRef.current = sim;

    const surface = createWaterSurfaceMaterial(sim, bounds, WATER_LIGHT_DIR);
    surfaceRef.current = surface;
    waterMesh.material = surface.material;

    for (const [u, v] of STARTUP_DROPS) sim.addDrop(u, v);
    sim.step();
    sim.updateNormals();

    const receivers = findCausticsReceiverMeshes(sceneRoot, waterMesh, bounds, waterY);
    if (receivers.length > 0) {
      const causticsSize = window.matchMedia?.("(pointer: coarse)").matches ? 256 : 512;
      const caustics = createCausticsPass(gl, sim, causticsSize);
      causticsRef.current = caustics;
      const poolDepth = poolDepthFromReceivers(receivers, waterY);
      receiversRef.current = patchCausticsReceivers(
        receivers,
        caustics.texture,
        bounds,
        waterY,
        poolDepth,
      );
    }

    // Reflection cubemap built from the scene HDR (sampled directly in the surface
    // shader as a samplerCube, like Evan's sky). Async — applied when ready.
    let cubeTarget: THREE.WebGLCubeRenderTarget | null = null;
    let cancelled = false;
    new HDRLoader().load(
      HDR_URL,
      (hdr) => {
        if (cancelled) {
          hdr.dispose();
          return;
        }
        hdr.mapping = THREE.EquirectangularReflectionMapping;
        cubeTarget = new THREE.WebGLCubeRenderTarget(256).fromEquirectangularTexture(gl, hdr);
        hdr.dispose();
        surfaceRef.current?.setSky(cubeTarget.texture);
      },
      undefined,
      (err) => console.warn("[Water] HDR cubemap load failed; using fallback reflection", err),
    );

    return () => {
      cancelled = true;
      receiversRef.current?.restore();
      causticsRef.current?.dispose();
      surfaceRef.current?.dispose();
      simRef.current?.dispose();
      cubeTarget?.dispose();
      waterMesh.geometry.dispose();
      sceneRoot.remove(waterMesh);
      meshRef.current = null;
      const circle = sceneRoot.getObjectByName("Circle");
      if (circle) circle.visible = true;
    };
  }, [sceneRoot, gl]);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || activePage === "contact") return undefined;

    const onMove = (e: PointerEvent) => {
      const sim = simRef.current;
      const canvas = gl.domElement;
      if (!sim || !boundsRef.current) return;

      const rect = canvas.getBoundingClientRect();
      pointer.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.current.setFromCamera(pointer.current, camera);

      syncBounds();
      const hits = raycaster.current.intersectObject(mesh, false);
      if (!hits.length) return;

      const now = performance.now();
      if (now - lastDropRef.current < 40) return;
      lastDropRef.current = now;

      const { u, v } = worldPointToSimUv(hits[0].point, boundsRef.current.bounds);
      sim.addDrop(u, v);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [gl, camera, activePage]);

  useFrame(() => {
    const sim = simRef.current;
    if (!sim) return;
    syncBounds();
    sim.step();
    sim.updateNormals();
    causticsRef.current?.update();
  });

  return null;
}
