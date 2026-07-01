import * as THREE from "three";
import type { GLTF } from "three-stdlib";
import { ProjectBgTrailCanvas } from "./bgTrail";
import { buildProjectBgMaterials } from "./bgMaterials";
import { PROJECT_BG, PROJECT_BG_TRAIL_SIZE, PROJECT_DETAIL_BG_CAMERA_Z } from "./sceneConfig";
import { getLenis } from "../lib/lenis-scroll";

export const PROJECT_BG_MODEL_URL = "/models/project-bg.glb";
export const BG_RENDER_SCALE = 0.75;
const ORBIT_SPEED = 0.32;
const ORBIT_RADIUS = 0.42;
const POINTER_IDLE_MS = 1200;

export type ProjectBgPipeline = {
  virtualScene: THREE.Scene;
  virtualCamera: THREE.PerspectiveCamera;
  renderTarget: THREE.WebGLRenderTarget;
  trail: ProjectBgTrailCanvas;
  trailTexture: THREE.CanvasTexture;
  clonedScene: THREE.Object3D;
  materials: THREE.Material[];
  scrollCurrent: number;
  orbitPointer: THREE.Vector2;
  pointerActive: boolean;
  lastPointerMove: number;
  prevSize: { width: number; height: number };
};

export function createProjectBgPipeline(gltfScene: GLTF["scene"]): ProjectBgPipeline {
  const virtualScene = new THREE.Scene();
  const virtualCamera = new THREE.PerspectiveCamera(PROJECT_BG.cameraFov, 1, 0.1, 100);
  virtualCamera.position.set(0, 0, PROJECT_DETAIL_BG_CAMERA_Z + PROJECT_BG.cameraZOffset);
  virtualCamera.lookAt(0, 0, 0);

  const renderTarget = new THREE.WebGLRenderTarget(1, 1);
  const trail = new ProjectBgTrailCanvas(PROJECT_BG_TRAIL_SIZE, PROJECT_BG_TRAIL_SIZE);
  const trailTexture = new THREE.CanvasTexture(trail.canvas);
  trailTexture.flipY = false;

  const cloned = gltfScene.clone(true);
  const built = buildProjectBgMaterials(cloned, trailTexture);
  virtualScene.add(cloned);

  cloned.position.set(PROJECT_BG.x, PROJECT_BG.y, PROJECT_BG.z);
  const s = PROJECT_BG.scale * PROJECT_BG.coverScale;
  cloned.scale.set(s, -s, s);
  cloned.rotation.z = THREE.MathUtils.degToRad(PROJECT_BG.rotationZ);
  virtualCamera.fov = PROJECT_BG.cameraFov;
  virtualCamera.updateProjectionMatrix();

  return {
    virtualScene,
    virtualCamera,
    renderTarget,
    trail,
    trailTexture,
    clonedScene: cloned,
    materials: built.materials,
    scrollCurrent: 0,
    orbitPointer: new THREE.Vector2(0, 0),
    pointerActive: false,
    lastPointerMove: 0,
    prevSize: { width: 0, height: 0 },
  };
}

export function disposeProjectBgPipeline(pipeline: ProjectBgPipeline): void {
  pipeline.renderTarget.dispose();
  pipeline.materials.forEach((m) => m.dispose());
  pipeline.trailTexture.dispose();
}

type TickOpts = {
  gl: THREE.WebGLRenderer;
  width: number;
  height: number;
  elapsedTime: number;
  delta: number;
  pointer: THREE.Vector2;
  stepPointer: (dt: number, lerp: number) => void;
};

export function tickProjectBgPipeline(pipeline: ProjectBgPipeline, opts: TickOpts): void {
  const { gl, width, height, elapsedTime, delta, pointer, stepPointer } = opts;
  const dt = Math.min(delta, 0.05);
  stepPointer(dt, 7);

  pipeline.orbitPointer.set(
    Math.cos(elapsedTime * ORBIT_SPEED) * ORBIT_RADIUS,
    -Math.sin(elapsedTime * ORBIT_SPEED) * ORBIT_RADIUS,
  );

  const pointerIdle =
    !pipeline.pointerActive || performance.now() - pipeline.lastPointerMove > POINTER_IDLE_MS;
  const activePointer = pointerIdle ? pipeline.orbitPointer : pointer;

  const scrollY = getLenis()?.scroll ?? window.scrollY;
  const scrollTarget = scrollY / Math.max(window.innerHeight, 1);
  const scrollLerp = 1 - Math.exp(-PROJECT_BG.scrollLag * dt);
  pipeline.scrollCurrent = THREE.MathUtils.lerp(pipeline.scrollCurrent, scrollTarget, scrollLerp);

  const px = (activePointer.x + 1) * 0.5 * PROJECT_BG_TRAIL_SIZE;
  const py = (1 - activePointer.y) * 0.5 * PROJECT_BG_TRAIL_SIZE;
  if (pipeline.trail.update({ x: px, y: py })) {
    pipeline.trailTexture.needsUpdate = true;
  }

  pipeline.clonedScene.position.set(
    PROJECT_BG.x,
    PROJECT_BG.y + pipeline.scrollCurrent * PROJECT_BG.scrollDrift,
    PROJECT_BG.z,
  );

  if (width !== pipeline.prevSize.width || height !== pipeline.prevSize.height) {
    const dpr = Math.min(gl.getPixelRatio(), 2);
    pipeline.renderTarget.setSize(
      Math.max(1, Math.floor(width * dpr * BG_RENDER_SCALE)),
      Math.max(1, Math.floor(height * dpr * BG_RENDER_SCALE)),
    );
    pipeline.virtualCamera.aspect = width / height;
    pipeline.virtualCamera.updateProjectionMatrix();
    pipeline.prevSize = { width, height };
  }

  const prevTarget = gl.getRenderTarget();
  gl.setRenderTarget(pipeline.renderTarget);
  gl.clear();
  gl.render(pipeline.virtualScene, pipeline.virtualCamera);
  gl.setRenderTarget(prevTarget);
}
