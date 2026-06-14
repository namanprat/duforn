import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useProjectBgModel } from "../models/gen/useProjectBg";
import { usePointerField } from "./usePointerField";
import { useProjectDetailSceneControlsStore } from "../store/projectScene";
import { PROJECT_DETAIL_BG_CAMERA_Z } from "./sceneConfig";
import { pickGpuBranchAsync } from "../lib/render";
import { getClampedPixelRatio } from "../lib/render/pixelRatio";
import { ProjectBgTrailCanvas } from "./bgTrail";
import { buildProjectBgMaterialsWebGl, buildProjectBgMaterialsWebGpu } from "./bgMaterials";
import { useLoadingStore } from "../store/loading";

const ORBIT_SPEED = 0.32;
const ORBIT_RADIUS = 0.42;
const POINTER_IDLE_MS = 1200;
// Soft out-of-focus background: render the offscreen pass cheap.
const BG_RENDER_SCALE = 0.75;
const BG_MAX_DPR = 1.5;

interface ProjectBgProps {
  onReady?: (ready: boolean) => void;
}

function getBgRenderDpr(gl: { getPixelRatio: () => number }): number {
  return Math.min(gl.getPixelRatio(), getClampedPixelRatio(BG_MAX_DPR));
}

export default function ProjectBg({ onReady }: ProjectBgProps) {
  const { gl } = useThree();
  const controls = useProjectDetailSceneControlsStore((state) => state.controls);
  const { pointerRef, step } = usePointerField();
  const { scene: gltfScene } = useProjectBgModel();

  const trailSize = controls.trail.size;
  const trailRef = useRef<ProjectBgTrailCanvas | null>(null);
  const trailTextureRef = useRef<THREE.CanvasTexture | null>(null);

  const virtualSceneRef = useRef<THREE.Scene | null>(null);
  const virtualCameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const clonedSceneRef = useRef<THREE.Object3D | null>(null);
  const renderTargetRef = useRef<THREE.RenderTarget | null>(null);
  const quadMaterialRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const [ready, setReady] = useState(false);
  const materialsRef = useRef<THREE.Material[]>([]);
  const prevSizeRef = useRef({ width: 0, height: 0 });
  const scrollCurrentRef = useRef(0);
  const orbitPointerRef = useRef(new THREE.Vector2(0, 0));
  const pointerActiveRef = useRef(false);
  const lastPointerMoveRef = useRef(0);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  // Build once per model/renderer — resizes are handled in useFrame, and
  // control tweaks are applied by the sync effect below without a rebuild.
  useEffect(() => {
    let cancelled = false;

    const projectBg = useProjectDetailSceneControlsStore.getState().controls.projectBg;
    const virtualScene = new THREE.Scene();
    const virtualCamera = new THREE.PerspectiveCamera(projectBg.cameraFov, 1, 0.1, 100);
    virtualCamera.position.set(0, 0, PROJECT_DETAIL_BG_CAMERA_Z + projectBg.cameraZOffset);
    virtualCamera.lookAt(0, 0, 0);

    const rt = new THREE.RenderTarget(1, 1);

    const trail = new ProjectBgTrailCanvas(trailSize, trailSize);
    trailRef.current = trail;
    const trailTex = new THREE.CanvasTexture(trail.canvas);
    trailTex.flipY = false;
    trailTextureRef.current = trailTex;

    const cloned = gltfScene.clone(true);

    async function init() {
      const built = await pickGpuBranchAsync(gl, {
        webgpu: () => buildProjectBgMaterialsWebGpu(cloned, trailTex),
        webgl: () => buildProjectBgMaterialsWebGl(cloned, trailTex),
      });
      if (cancelled) {
        built.materials.forEach((m: THREE.Material) => m.dispose());
        return;
      }

      virtualScene.add(cloned);
      clonedSceneRef.current = cloned;
      virtualSceneRef.current = virtualScene;
      virtualCameraRef.current = virtualCamera;
      renderTargetRef.current = rt;
      materialsRef.current = built.materials;
      prevSizeRef.current = { width: 0, height: 0 };
      setReady(true);
      onReadyRef.current?.(true);
    }

    void init();

    return () => {
      cancelled = true;
      setReady(false);
      onReadyRef.current?.(false);
      rt.dispose();
      materialsRef.current.forEach((m) => m.dispose());
      materialsRef.current = [];
      trailTextureRef.current?.dispose();
      trailTextureRef.current = null;
      trailRef.current = null;
      clonedSceneRef.current = null;
      virtualSceneRef.current = null;
      virtualCameraRef.current = null;
      renderTargetRef.current = null;
    };
  }, [gltfScene, gl, trailSize]);

  // Apply control values to the live objects (cheap mutations, no rebuild).
  useEffect(() => {
    const cloned = clonedSceneRef.current;
    const camera = virtualCameraRef.current;
    if (!cloned || !camera) return;

    cloned.position.set(controls.projectBg.x, controls.projectBg.y, controls.projectBg.z);
    cloned.scale.setScalar(controls.projectBg.scale * controls.projectBg.coverScale);
    cloned.rotation.z = THREE.MathUtils.degToRad(controls.projectBg.rotationZ);
    camera.fov = controls.projectBg.cameraFov;
    camera.position.set(0, 0, PROJECT_DETAIL_BG_CAMERA_Z + controls.projectBg.cameraZOffset);
    camera.updateProjectionMatrix();
  }, [
    ready,
    controls.projectBg.cameraFov,
    controls.projectBg.cameraZOffset,
    controls.projectBg.coverScale,
    controls.projectBg.rotationZ,
    controls.projectBg.scale,
    controls.projectBg.x,
    controls.projectBg.y,
    controls.projectBg.z,
  ]);

  useEffect(() => {
    const onPointerMove = () => {
      pointerActiveRef.current = true;
      lastPointerMoveRef.current = performance.now();
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, []);

  useFrame((state, delta) => {
    if (!ready) return;
    if (useLoadingStore.getState().phase !== "ready") return;

    const virtualScene = virtualSceneRef.current;
    const virtualCamera = virtualCameraRef.current;
    const renderTarget = renderTargetRef.current;
    if (!virtualScene || !virtualCamera || !renderTarget) return;

    const dt = Math.min(delta, 0.05);
    step(dt, controls.projectBgFallback.pointerLerp);

    const t = state.clock.elapsedTime;
    orbitPointerRef.current.set(
      Math.cos(t * ORBIT_SPEED) * ORBIT_RADIUS,
      Math.sin(t * ORBIT_SPEED) * ORBIT_RADIUS,
    );

    const pointerIdle =
      !pointerActiveRef.current || performance.now() - lastPointerMoveRef.current > POINTER_IDLE_MS;
    const activePointer = pointerIdle ? orbitPointerRef.current : pointerRef.current;

    // Lenis already updated this frame (unified loop), so scrollY is current.
    const scrollTarget = window.scrollY / Math.max(window.innerHeight, 1);
    const scrollLerp = 1 - Math.exp(-controls.projectBg.scrollLag * dt);
    scrollCurrentRef.current = THREE.MathUtils.lerp(
      scrollCurrentRef.current,
      scrollTarget,
      scrollLerp,
    );

    const trail = trailRef.current;
    const trailMap = trailTextureRef.current;
    if (trail && trailMap) {
      const px = (activePointer.x + 1) * 0.5 * trailSize;
      const py = (activePointer.y + 1) * 0.5 * trailSize;
      if (trail.update({ x: px, y: py })) {
        trailMap.needsUpdate = true;
      }
    }

    if (clonedSceneRef.current) {
      clonedSceneRef.current.position.set(
        controls.projectBg.x,
        controls.projectBg.y - scrollCurrentRef.current * controls.projectBg.scrollDrift,
        controls.projectBg.z,
      );
    }

    const { width, height } = state.size;
    if (width !== prevSizeRef.current.width || height !== prevSizeRef.current.height) {
      const dpr = getBgRenderDpr(gl);
      renderTarget.setSize(
        Math.max(1, Math.floor(width * dpr * BG_RENDER_SCALE)),
        Math.max(1, Math.floor(height * dpr * BG_RENDER_SCALE)),
      );
      virtualCamera.aspect = width / height;
      virtualCamera.updateProjectionMatrix();
      prevSizeRef.current = { width, height };
    }

    const prevTarget = gl.getRenderTarget();
    gl.setRenderTarget(renderTarget);
    gl.clear();
    gl.render(virtualScene, virtualCamera);
    gl.setRenderTarget(prevTarget);

    const quadMaterial = quadMaterialRef.current;
    if (quadMaterial && quadMaterial.map !== renderTarget.texture) {
      quadMaterial.map = renderTarget.texture;
      quadMaterial.opacity = 1;
      quadMaterial.needsUpdate = true;
    }

    if (meshRef.current) {
      meshRef.current.position.set(0, 0, -25);
      meshRef.current.scale.set(width, height, 1);
    }
  }, -1);

  if (!ready) return null;

  return (
    <mesh ref={meshRef} renderOrder={-5}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial ref={quadMaterialRef} transparent depthWrite={false} depthTest={false} />
    </mesh>
  );
}
