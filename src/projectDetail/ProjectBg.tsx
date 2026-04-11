// @ts-nocheck
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { gltfLoaderOptions } from "../models/gltfLoaderOptions";
import { GLTF_URL_PROJECT_BG } from "../models/gltfUrls";
import { usePointerField } from "./usePointerField";
import { useTrailTexture } from "./useTrailTexture";
import { useProjectDetailSceneControlsStore } from "../store/projectDetailSceneControls";
import { PROJECT_DETAIL_BG_CAMERA_Z } from "./projectDetailSceneConfig";
import { isWebGPURenderer } from "../components/webgl/createWebGPURenderer";

async function buildProjectBgMaterials(clonedScene, trailTexture) {
  const tsl = await import("three/tsl");
  const { NodeMaterial } = await import("three/webgpu");
  const {
    Fn,
    float,
    vec2,
    vec3,
    vec4,
    mix,
    smoothstep,
    clamp,
    dot,
    normalize,
    pow,
    texture,
    uv,
    screenUV,
    positionLocal,
    cameraProjectionMatrix,
    modelViewMatrix,
    varying,
    mx_noise_float,
  } = tsl;

  const sRGBTransferOETF = Fn(([color]) => {
    const a = color.pow(0.41666).mul(1.055).sub(0.055);
    const b = color.mul(12.92);
    const factor = color.lessThanEqual(0.0031308);
    return mix(a, b, factor);
  });

  const materials = [];

  clonedScene.traverse((child) => {
    if (!child.isMesh) return;

    const baseMap = child.material.map;
    const emissiveMap = child.material.emissiveMap;
    if (!baseMap || !emissiveMap) return;

    const material = new NodeMaterial();
    const uvscreen = varying(vec2(0, 0));
    material.positionNode = Fn(() => {
      const pos = positionLocal;
      const ndc = cameraProjectionMatrix.mul(modelViewMatrix).mul(vec4(pos, 1));
      uvscreen.assign(ndc.xy.div(ndc.w).add(1).div(2));
      uvscreen.y = uvscreen.y.oneMinus();

      const extrude = texture(trailTexture, uvscreen).r;
      pos.z.mulAssign(mix(0.03, 1, extrude));

      return pos;
    })();

    material.colorNode = Fn(() => {
      const tt1 = sRGBTransferOETF(texture(baseMap, uv()));
      const tt2 = sRGBTransferOETF(texture(emissiveMap, uv()));
      const extrude = texture(trailTexture, screenUV).r;

      let final_ = tt2.b;
      final_ = mix(final_, tt2.g, smoothstep(0, 0.2, extrude));
      final_ = mix(final_, tt2.r, smoothstep(0.2, 0.4, extrude));
      final_ = mix(final_, tt1.b, smoothstep(0.4, 0.6, extrude));
      final_ = mix(final_, tt1.g, smoothstep(0.6, 0.8, extrude));
      final_ = mix(final_, tt1.r, smoothstep(0.8, 1, extrude));

      // Bas-relief lighting: approximate a heightfield normal from the trail mask in screen-space.
      // The underlying model is meant to read like marble/stone, so we push contrast via a soft rim
      // and a tight specular lobe.
      const eps = float(0.0022);
      const hC = texture(trailTexture, uvscreen).r;
      const hX = texture(trailTexture, uvscreen.add(vec2(eps, 0))).r;
      const hY = texture(trailTexture, uvscreen.add(vec2(0, eps))).r;
      const grad = vec2(hX.sub(hC), hY.sub(hC));
      const normal = normalize(vec3(grad.x.mul(-2.6), grad.y.mul(-2.6), float(1.0)));
      const lightDir = normalize(vec3(0.35, 0.55, 0.95));
      const diff = clamp(dot(normal, lightDir), 0, 1);
      const viewDir = vec3(0, 0, 1);
      const halfDir = normalize(lightDir.add(viewDir));
      const spec = pow(clamp(dot(normal, halfDir), 0, 1), float(36.0)).mul(0.28);
      const rim = pow(float(1.0).sub(clamp(dot(normal, viewDir), 0, 1)), float(2.2)).mul(0.12);

      // Marble micro-variation: subtle veining tied to UV and relief height.
      const veinNoise = mx_noise_float(vec3(uv().mul(6.2), hC.mul(2.0)));
      const veins = smoothstep(0.35, 0.8, veinNoise).mul(0.06);
      const base = vec3(final_).add(vec3(veins));

      const lit = base.mul(mix(0.72, 1.15, diff)).add(vec3(spec.add(rim)));
      return vec4(lit, 1);
    })();

    child.material = material;
    materials.push(material);
  });

  return materials;
}

export default function ProjectBg() {
  const { gl, size } = useThree();
  const controls = useProjectDetailSceneControlsStore((state) => state.controls);
  const { pointerRef, step } = usePointerField();
  const { trailTextureRef, updateTrail } = useTrailTexture({
    width: controls.trail.size,
    height: controls.trail.size,
    fadeAlpha: controls.trail.fadeAlpha,
    blurPx: controls.trail.blurPx,
    radiusFactor: controls.trail.radiusFactor,
    gradientScale: controls.trail.gradientScale,
    smudgeStrength: controls.trail.smudgeStrength,
    smudgeBlurPx: controls.trail.smudgeBlurPx,
    roughness: controls.trail.roughness,
    stampAlpha: controls.trail.stampAlpha,
  });

  const { scene: gltfScene } = useGLTF(GLTF_URL_PROJECT_BG, gltfLoaderOptions);

  const buildMaterials = useMemo(() => (scene, trail) => buildProjectBgMaterials(scene, trail), []);

  const virtualSceneRef = useRef(null);
  const virtualCameraRef = useRef(null);
  const clonedSceneRef = useRef(null);
  const renderTargetRef = useRef(null);
  const quadMaterialRef = useRef(null);
  const meshRef = useRef(null);
  const [ready, setReady] = useState(false);
  const materialsRef = useRef([]);
  const prevSizeRef = useRef({ width: 0, height: 0 });
  const scrollTargetRef = useRef(0);
  const scrollCurrentRef = useRef(0);

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

    const rt = new THREE.WebGLRenderTarget(
      Math.max(1, Math.floor(size.width * Math.min(window.devicePixelRatio || 1, 2))),
      Math.max(1, Math.floor(size.height * Math.min(window.devicePixelRatio || 1, 2))),
    );

    const cloned = gltfScene.clone(true);
    cloned.position.set(controls.projectBg.x, controls.projectBg.y, controls.projectBg.z);
    cloned.scale.setScalar(controls.projectBg.scale);
    cloned.rotation.z = THREE.MathUtils.degToRad(controls.projectBg.rotationZ);

    async function init() {
      const trail = trailTextureRef.current;
      if (!trail) return;

      let mats = [];
      if (isWebGPURenderer(gl)) {
        mats = await buildMaterials(cloned, trail);
        if (cancelled) {
          mats.forEach((m) => m.dispose());
          return;
        }
      }

      virtualScene.add(cloned);
      clonedSceneRef.current = cloned;
      virtualSceneRef.current = virtualScene;
      virtualCameraRef.current = virtualCamera;
      renderTargetRef.current = rt;
      materialsRef.current = mats;
      prevSizeRef.current = { width: size.width, height: size.height };
      setReady(true);
    }

    init();

    return () => {
      cancelled = true;
      setReady(false);
      rt.dispose();
      materialsRef.current.forEach((m) => m.dispose());
      materialsRef.current = [];
      clonedSceneRef.current = null;
      virtualSceneRef.current = null;
      virtualCameraRef.current = null;
      renderTargetRef.current = null;
    };
  }, [
    gltfScene,
    gl,
    buildMaterials,
    trailTextureRef,
    size.height,
    size.width,
    controls.trail.size,
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

    const dt = Math.min(delta, 0.05);
    step(dt, controls.projectBgFallback.pointerLerp);
    const scrollLerp = 1 - Math.exp(-controls.projectBg.scrollLag * dt);
    scrollCurrentRef.current = THREE.MathUtils.lerp(
      scrollCurrentRef.current,
      scrollTargetRef.current,
      scrollLerp,
    );

    const px = (pointerRef.current.x + 1) * 0.5 * controls.trail.size;
    const py = (pointerRef.current.y + 1) * 0.5 * controls.trail.size;
    updateTrail({ x: px, y: py });

    if (clonedSceneRef.current) {
      clonedSceneRef.current.position.set(
        controls.projectBg.x,
        controls.projectBg.y - scrollCurrentRef.current * controls.projectBg.scrollDrift,
        controls.projectBg.z,
      );
    }

    const { width, height } = state.size;
    if (width !== prevSizeRef.current.width || height !== prevSizeRef.current.height) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      renderTargetRef.current.setSize(
        Math.max(1, Math.floor(width * dpr)),
        Math.max(1, Math.floor(height * dpr)),
      );
      virtualCameraRef.current.aspect = width / height;
      virtualCameraRef.current.updateProjectionMatrix();
      prevSizeRef.current = { width, height };
    }

    const prevTarget = gl.getRenderTarget();
    gl.setRenderTarget(renderTargetRef.current);
    gl.clear();
    gl.render(virtualSceneRef.current, virtualCameraRef.current);
    gl.setRenderTarget(prevTarget);

    if (quadMaterialRef.current) {
      quadMaterialRef.current.map = renderTargetRef.current.texture;
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
