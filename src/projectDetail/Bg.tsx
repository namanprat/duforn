// @ts-nocheck
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useProjectBgModel } from "../models/generated/useProjectBgModel";
import { usePointerField } from "./usePointerField";
import { useProjectDetailSceneControlsStore } from "../store/projectDetailSceneControls";
import { PROJECT_DETAIL_BG_CAMERA_Z } from "./sceneConfig";
import { pickGpuBranchAsync } from "../lib/rendering";
import { getClampedPixelRatio } from "../lib/rendering/canvasPixelRatio";
import { ProjectBgTrailCanvas } from "./bgTrail";
import { buildProjectBgMaterialsWebGl, buildProjectBgMaterialsWebGpu } from "./bgMaterials";

export default function ProjectBg({ renderScale = 1 }) {
  const { gl, size } = useThree();
  const controls = useProjectDetailSceneControlsStore((state) => state.controls);
  const { pointerRef, step } = usePointerField();
  const { scene: gltfScene } = useProjectBgModel();
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);

  const trailSize = controls.trail.size;
  const trailRef = useRef(null);
  const trailTextureRef = useRef(null);

  const virtualSceneRef = useRef(null);
  const virtualCameraRef = useRef(null);
  const clonedSceneRef = useRef(null);
  const renderTargetRef = useRef(null);
  const quadMaterialRef = useRef(null);
  const meshRef = useRef(null);
  const [ready, setReady] = useState(false);
  const materialsRef = useRef([]);
  const uMouseWorldRef = useRef(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const pointerNdcRef = useRef(new THREE.Vector2());
  const mouseHitRef = useRef(new THREE.Vector3());
  const mousePlaneRef = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0));
  const prevSizeRef = useRef({ width: 0, height: 0 });
  const scrollTargetRef = useRef(0);
  const scrollCurrentRef = useRef(0);
  const mobileOrbitPointerRef = useRef(new THREE.Vector2(0, 0));

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return undefined;

    const mediaQuery = window.matchMedia("(pointer: coarse)");
    const sync = () => setIsCoarsePointer(mediaQuery.matches);
    sync();
    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const virtualScene = new THREE.Scene();
    const virtualCamera = new THREE.PerspectiveCamera(
      controls.projectBg.cameraFov,
      size.width / size.height,
      0.1,
      100,
    );
    virtualCamera.position.set(0, 0, PROJECT_DETAIL_BG_CAMERA_Z + controls.projectBg.cameraZOffset);
    virtualCamera.lookAt(0, 0, 0);

    const dpr = Math.min(gl.getPixelRatio(), getClampedPixelRatio(2));
    const rt = new THREE.RenderTarget(
      Math.max(1, Math.floor(size.width * dpr * renderScale)),
      Math.max(1, Math.floor(size.height * dpr * renderScale)),
    );

    const trail = new ProjectBgTrailCanvas(trailSize, trailSize);
    trailRef.current = trail;
    const trailTex = new THREE.CanvasTexture(trail.canvas);
    trailTex.flipY = false;
    trailTextureRef.current = trailTex;

    const cloned = gltfScene.clone(true);
    cloned.position.set(controls.projectBg.x, controls.projectBg.y, controls.projectBg.z);
    cloned.scale.setScalar(controls.projectBg.scale);
    cloned.rotation.z = THREE.MathUtils.degToRad(controls.projectBg.rotationZ);

    async function init() {
      uMouseWorldRef.current = null;
      let mats = [];

      const built = await pickGpuBranchAsync(gl, {
        webgpu: () => buildProjectBgMaterialsWebGpu(cloned, trailTex),
        webgl: () => buildProjectBgMaterialsWebGl(cloned, trailTex),
      });
      if (cancelled) {
        built.materials.forEach((m) => m.dispose());
        return;
      }
      mats = built.materials;
      uMouseWorldRef.current = built.uMouseWorld;

      virtualScene.add(cloned);
      clonedSceneRef.current = cloned;
      virtualSceneRef.current = virtualScene;
      virtualCameraRef.current = virtualCamera;
      renderTargetRef.current = rt;
      materialsRef.current = mats;
      prevSizeRef.current = { width: size.width, height: size.height };
      setReady(true);
    }

    void init();

    return () => {
      cancelled = true;
      setReady(false);
      rt.dispose();
      materialsRef.current.forEach((m) => m.dispose());
      materialsRef.current = [];
      trailTextureRef.current?.dispose?.();
      trailTextureRef.current = null;
      trailRef.current = null;
      clonedSceneRef.current = null;
      virtualSceneRef.current = null;
      virtualCameraRef.current = null;
      renderTargetRef.current = null;
    };
  }, [
    gltfScene,
    gl,
    size.height,
    size.width,
    trailSize,
    controls.projectBg.cameraFov,
    controls.projectBg.cameraZOffset,
    controls.projectBg.rotationZ,
    controls.projectBg.scale,
    controls.projectBg.x,
    controls.projectBg.y,
    controls.projectBg.z,
    renderScale,
  ]);

  useEffect(() => {
    const updateScrollTarget = () => {
      const viewportHeight = Math.max(window.innerHeight, 1);
      scrollTargetRef.current = window.scrollY / viewportHeight;
    };

    updateScrollTarget();
    window.addEventListener("scroll", updateScrollTarget, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollTarget);
  }, []);

  useEffect(() => {
    const cloned = clonedSceneRef.current;
    const camera = virtualCameraRef.current;
    if (!cloned || !camera) return;

    cloned.position.set(controls.projectBg.x, controls.projectBg.y, controls.projectBg.z);
    cloned.scale.setScalar(controls.projectBg.scale * controls.projectBg.coverScale);
    cloned.rotation.z = THREE.MathUtils.degToRad(controls.projectBg.rotationZ);
    camera.fov = controls.projectBg.cameraFov;
    camera.position.set(0, 0, PROJECT_DETAIL_BG_CAMERA_Z + controls.projectBg.cameraZOffset);
    camera.aspect = size.width / size.height;
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [
    controls.projectBg.cameraFov,
    controls.projectBg.cameraZOffset,
    controls.projectBg.coverScale,
    controls.projectBg.rotationZ,
    controls.projectBg.scale,
    controls.projectBg.scrollDrift,
    controls.projectBg.scrollLag,
    controls.projectBg.x,
    controls.projectBg.y,
    controls.projectBg.z,
    size.height,
    size.width,
  ]);

  useFrame((state, delta) => {
    if (!ready) return;

    const virtualScene = virtualSceneRef.current;
    const virtualCamera = virtualCameraRef.current;
    const renderTarget = renderTargetRef.current;
    if (!virtualScene || !virtualCamera || !renderTarget) return;

    const dt = Math.min(delta, 0.05);
    const mobileOrbitSpeed = 0.32;
    const mobileOrbitRadius = 0.42;
    const t = state.clock.elapsedTime;
    if (isCoarsePointer) {
      mobileOrbitPointerRef.current.set(
        Math.cos(t * mobileOrbitSpeed) * mobileOrbitRadius,
        Math.sin(t * mobileOrbitSpeed) * mobileOrbitRadius,
      );
    } else {
      step(dt, controls.projectBgFallback.pointerLerp);
    }
    const activePointer = isCoarsePointer ? mobileOrbitPointerRef.current : pointerRef.current;
    const scrollLerp = 1 - Math.exp(-controls.projectBg.scrollLag * dt);
    scrollCurrentRef.current = THREE.MathUtils.lerp(
      scrollCurrentRef.current,
      scrollTargetRef.current,
      scrollLerp,
    );

    const trail = trailRef.current;
    const trailMap = trailTextureRef.current;
    if (trail && trailMap) {
      const px = (activePointer.x + 1) * 0.5 * trailSize;
      const py = (activePointer.y + 1) * 0.5 * trailSize;
      trail.update({ x: px, y: py });
      trailMap.needsUpdate = true;
    }

    const mouseU = uMouseWorldRef.current;
    const vCam = virtualCameraRef.current;
    if (mouseU && vCam) {
      pointerNdcRef.current.copy(activePointer);
      raycasterRef.current.setFromCamera(pointerNdcRef.current, vCam);
      if (raycasterRef.current.ray.intersectPlane(mousePlaneRef.current, mouseHitRef.current)) {
        mouseU.value?.copy?.(mouseHitRef.current);
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
      const dpr = Math.min(gl.getPixelRatio(), getClampedPixelRatio(2));
      renderTarget.setSize(
        Math.max(1, Math.floor(width * dpr * renderScale)),
        Math.max(1, Math.floor(height * dpr * renderScale)),
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

    if (quadMaterialRef.current) {
      quadMaterialRef.current.map = renderTarget.texture;
      if (quadMaterialRef.current.opacity !== 1) {
        quadMaterialRef.current.opacity = 1;
      }
      quadMaterialRef.current.needsUpdate = true;
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
