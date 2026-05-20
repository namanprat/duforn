// @ts-nocheck
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useMonitorModel } from "../../models/generated/useMonitorModel";
import * as THREE from "three";
import { pickGpuBranchAsync } from "../../lib/rendering";
import {
  buildNotFoundScreenMaterialWebGl,
  buildNotFoundScreenMaterialWebGpu,
} from "../../lib/notFound/notFoundScreenMaterials";
import { useWebglStore } from "../../store/webgl";
import {
  PARALLAX_MOTION_CONFIG,
  mapDeviceOrientationToParallax,
} from "../../../scripts/runtime/motion";

function createScreenGeometry(width, height, radius) {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;

  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);

  const geometry = new THREE.ShapeGeometry(shape);
  const positions = geometry.attributes.position;
  const uvs = new Float32Array(positions.count * 2);

  for (let i = 0; i < positions.count; i += 1) {
    uvs[i * 2] = (positions.getX(i) - x) / width;
    uvs[i * 2 + 1] = (positions.getY(i) - y) / height;
  }

  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  return geometry;
}

export default function NotFoundScene() {
  const groupRef = useRef(null);
  const screenSystemRef = useRef(null);
  const [screenReady, setScreenReady] = useState(false);
  const camera = useThree((state) => state.camera);
  const { gl, size } = useThree();
  const gyroEnabled = useWebglStore((state) => state.gyroEnabled);
  const orientationRef = useRef({ x: 0, y: 0, hasValue: false });
  const pointerRef = useRef({ x: 0, y: 0 });
  const reducedMotionRef = useRef(false);
  const { scene } = useMonitorModel();
  const imageTexture = useTexture("/default.jpg");

  const model = useMemo(() => {
    const cloned = scene.clone(true);
    const center = new THREE.Box3().setFromObject(cloned).getCenter(new THREE.Vector3());
    cloned.position.sub(center);
    return cloned;
  }, [scene]);

  const screenGeometry = useMemo(() => createScreenGeometry(1, 1, 0.03), []);

  useEffect(() => {
    imageTexture.colorSpace = THREE.SRGBColorSpace;
    imageTexture.minFilter = THREE.LinearFilter;
    imageTexture.magFilter = THREE.LinearFilter;
    imageTexture.needsUpdate = true;
  }, [imageTexture]);

  useEffect(() => {
    let cancelled = false;

    async function build() {
      const system = await pickGpuBranchAsync(gl, {
        webgpu: () => buildNotFoundScreenMaterialWebGpu(imageTexture),
        webgl: () => buildNotFoundScreenMaterialWebGl(imageTexture),
      });

      if (cancelled) {
        system.material.dispose();
        return;
      }

      const { image } = imageTexture;
      if (image?.width && image?.height) {
        system.uniforms.uImageAspect.value = image.width / image.height;
      }

      screenSystemRef.current = system;
      setScreenReady(true);
    }

    build();

    return () => {
      cancelled = true;
      setScreenReady(false);
      screenSystemRef.current?.material.dispose();
      screenSystemRef.current = null;
    };
  }, [gl, imageTexture]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyPreference = () => {
      reducedMotionRef.current = media.matches;
    };
    applyPreference();
    media.addEventListener("change", applyPreference);
    return () => media.removeEventListener("change", applyPreference);
  }, []);

  useEffect(() => {
    const onPointerMove = (event) => {
      pointerRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointerRef.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, []);

  useEffect(() => {
    if (!gyroEnabled) {
      orientationRef.current.hasValue = false;
      return;
    }

    const onDeviceOrientation = (event) => {
      const mapped = mapDeviceOrientationToParallax(event);
      if (!mapped) return;
      orientationRef.current.x = mapped.x;
      orientationRef.current.y = mapped.y;
      orientationRef.current.hasValue = true;
    };

    window.addEventListener("deviceorientation", onDeviceOrientation, { passive: true });
    return () => window.removeEventListener("deviceorientation", onDeviceOrientation);
  }, [gyroEnabled]);

  useEffect(() => {
    return () => {
      screenGeometry.dispose();
    };
  }, [screenGeometry]);

  useEffect(() => {
    if (!camera || !("isPerspectiveCamera" in camera) || !camera.isPerspectiveCamera) return;

    const box = new THREE.Box3().setFromObject(model);
    const modelSize = box.getSize(new THREE.Vector3());
    const modelCenter = box.getCenter(new THREE.Vector3());
    const fov = THREE.MathUtils.degToRad(camera.fov);
    const tanHalfFov = Math.tan(fov * 0.5);
    const safeAspect = Math.max(size.width / Math.max(size.height, 1), 0.1);
    const fitHeightDistance = modelSize.y / (2 * tanHalfFov);
    const fitWidthDistance = modelSize.x / (2 * tanHalfFov * safeAspect);
    const distance = Math.max(fitHeightDistance, fitWidthDistance) * 1.3;

    const targetY = modelCenter.y + modelSize.y * 0.05;
    camera.position.set(modelCenter.x, targetY, modelCenter.z + distance);
    camera.near = 0.1;
    camera.far = Math.max(50, distance * 8);
    camera.lookAt(modelCenter.x, targetY, modelCenter.z);
    camera.updateProjectionMatrix();
  }, [camera, model, size.height, size.width]);

  useFrame((state, delta) => {
    const system = screenSystemRef.current;
    if (system) {
      system.uniforms.uTime.value = state.clock.elapsedTime;
      system.uniforms.uResolutionY.value = size.height;
    }

    if (!groupRef.current) return;
    const prefersReducedMotion = reducedMotionRef.current;
    const amplitudeScale = prefersReducedMotion ? 0.08 : 1;
    const inputX =
      gyroEnabled && orientationRef.current.hasValue
        ? orientationRef.current.x
        : pointerRef.current.x;
    const inputY =
      gyroEnabled && orientationRef.current.hasValue
        ? orientationRef.current.y
        : pointerRef.current.y;
    const targetX = inputY * PARALLAX_MOTION_CONFIG.yRange * 0.35 * amplitudeScale;
    const targetY = inputX * PARALLAX_MOTION_CONFIG.angleRange * 0.9 * amplitudeScale;
    const motionLerp = prefersReducedMotion ? 3 : 5;
    groupRef.current.rotation.x = THREE.MathUtils.damp(
      groupRef.current.rotation.x,
      targetX,
      motionLerp,
      delta,
    );
    groupRef.current.rotation.y = THREE.MathUtils.damp(
      groupRef.current.rotation.y,
      targetY,
      motionLerp,
      delta,
    );
  });

  if (!screenReady || !screenSystemRef.current) {
    return (
      <>
        <color attach="background" args={["#b0b0b0"]} />
        <ambientLight intensity={5} />
        <directionalLight position={[15, 10, -5]} intensity={2.5} />
        <pointLight position={[-5, -2.5, 0]} intensity={5} distance={10} decay={0.3} />
        <group ref={groupRef}>
          <primitive object={model} />
        </group>
      </>
    );
  }

  return (
    <>
      <color attach="background" args={["#b0b0b0"]} />
      <ambientLight intensity={5} />
      <directionalLight position={[15, 10, -5]} intensity={2.5} />
      <pointLight position={[-5, -2.5, 0]} intensity={5} distance={10} decay={0.3} />

      <group ref={groupRef}>
        <primitive object={model} />
        <mesh
          geometry={screenGeometry}
          material={screenSystemRef.current.material}
          scale={[0.28, 0.235, 1]}
          position={[-0.008, 0.005, 0.041]}
          rotation={[-0.18, 0, 0]}
        />
      </group>
    </>
  );
}
