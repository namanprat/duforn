import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { usePointerField } from "./usePointerField";
import { ProjectBgTrailCanvas } from "./bgTrail";
import { buildProjectBgMaterials } from "./bgMaterials";
import { PROJECT_BG, PROJECT_BG_TRAIL_SIZE, PROJECT_DETAIL_BG_CAMERA_Z } from "./sceneConfig";
import { getLenis } from "../lib/lenis-scroll";

const MODEL_URL = "/models/project-bg.glb";
const ORBIT_SPEED = 0.32;
const ORBIT_RADIUS = 0.42;
const POINTER_IDLE_MS = 1200;
const BG_RENDER_SCALE = 0.75;

type ProjectBgProps = {
  onReady?: (ready: boolean) => void;
};

export default function ProjectBg({ onReady }: ProjectBgProps) {
  const { gl } = useThree();
  const { scene: gltfScene } = useGLTF(MODEL_URL);
  const { pointerRef, step } = usePointerField();

  const trailRef = useRef<ProjectBgTrailCanvas | null>(null);
  const trailTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const virtualSceneRef = useRef<THREE.Scene | null>(null);
  const virtualCameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const clonedSceneRef = useRef<THREE.Object3D | null>(null);
  const renderTargetRef = useRef<THREE.WebGLRenderTarget | null>(null);
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

  useEffect(() => {
    const virtualScene = new THREE.Scene();
    const virtualCamera = new THREE.PerspectiveCamera(PROJECT_BG.cameraFov, 1, 0.1, 100);
    virtualCamera.position.set(0, 0, PROJECT_DETAIL_BG_CAMERA_Z + PROJECT_BG.cameraZOffset);
    virtualCamera.lookAt(0, 0, 0);

    const rt = new THREE.WebGLRenderTarget(1, 1);
    const trail = new ProjectBgTrailCanvas(PROJECT_BG_TRAIL_SIZE, PROJECT_BG_TRAIL_SIZE);
    trailRef.current = trail;
    const trailTex = new THREE.CanvasTexture(trail.canvas);
    trailTex.flipY = false;
    trailTextureRef.current = trailTex;

    const cloned = gltfScene.clone(true);
    const built = buildProjectBgMaterials(cloned, trailTex);

    virtualScene.add(cloned);
    clonedSceneRef.current = cloned;
    virtualSceneRef.current = virtualScene;
    virtualCameraRef.current = virtualCamera;
    renderTargetRef.current = rt;
    materialsRef.current = built.materials;
    prevSizeRef.current = { width: 0, height: 0 };
    setReady(true);
    onReadyRef.current?.(true);

    return () => {
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
  }, [gltfScene]);

  useEffect(() => {
    const cloned = clonedSceneRef.current;
    const camera = virtualCameraRef.current;
    if (!cloned || !camera) return;

    cloned.position.set(PROJECT_BG.x, PROJECT_BG.y, PROJECT_BG.z);
    const s = PROJECT_BG.scale * PROJECT_BG.coverScale;
    cloned.scale.set(s, -s, s);
    cloned.rotation.z = THREE.MathUtils.degToRad(PROJECT_BG.rotationZ);
    camera.fov = PROJECT_BG.cameraFov;
    camera.position.set(0, 0, PROJECT_DETAIL_BG_CAMERA_Z + PROJECT_BG.cameraZOffset);
    camera.updateProjectionMatrix();
  }, [ready]);

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

    const virtualScene = virtualSceneRef.current;
    const virtualCamera = virtualCameraRef.current;
    const renderTarget = renderTargetRef.current;
    if (!virtualScene || !virtualCamera || !renderTarget) return;

    const dt = Math.min(delta, 0.05);
    step(dt, 7);

    const t = state.clock.elapsedTime;
    orbitPointerRef.current.set(
      Math.cos(t * ORBIT_SPEED) * ORBIT_RADIUS,
      -Math.sin(t * ORBIT_SPEED) * ORBIT_RADIUS,
    );

    const pointerIdle =
      !pointerActiveRef.current || performance.now() - lastPointerMoveRef.current > POINTER_IDLE_MS;
    const activePointer = pointerIdle ? orbitPointerRef.current : pointerRef.current;

    const scrollY = getLenis()?.scroll ?? window.scrollY;
    const scrollTarget = scrollY / Math.max(window.innerHeight, 1);
    const scrollLerp = 1 - Math.exp(-PROJECT_BG.scrollLag * dt);
    scrollCurrentRef.current = THREE.MathUtils.lerp(
      scrollCurrentRef.current,
      scrollTarget,
      scrollLerp,
    );

    const trail = trailRef.current;
    const trailMap = trailTextureRef.current;
    if (trail && trailMap) {
      const px = (activePointer.x + 1) * 0.5 * PROJECT_BG_TRAIL_SIZE;
      const py = (1 - activePointer.y) * 0.5 * PROJECT_BG_TRAIL_SIZE;
      if (trail.update({ x: px, y: py })) {
        trailMap.needsUpdate = true;
      }
    }

    if (clonedSceneRef.current) {
      clonedSceneRef.current.position.set(
        PROJECT_BG.x,
        PROJECT_BG.y + scrollCurrentRef.current * PROJECT_BG.scrollDrift,
        PROJECT_BG.z,
      );
    }

    const { width, height } = state.size;
    if (width !== prevSizeRef.current.width || height !== prevSizeRef.current.height) {
      const dpr = Math.min(gl.getPixelRatio(), 1.5);
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
  });

  if (!ready) return null;

  return (
    <mesh ref={meshRef} renderOrder={-5}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial ref={quadMaterialRef} transparent depthWrite={false} depthTest={false} />
    </mesh>
  );
}

useGLTF.preload(MODEL_URL);
