import React, { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { MeshBasicNodeMaterial } from "three/webgpu";
import { clamp, float, mix, sin, step, texture, uniform, uv, vec2, vec3 } from "three/tsl";
import { useWebglStore } from "../../store/webgl.js";
import {
  PARALLAX_MOTION_CONFIG,
  mapDeviceOrientationToParallax,
} from "../../../scripts/runtime/motion.js";

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
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);
  const gyroEnabled = useWebglStore((state) => state.gyroEnabled);
  const orientationRef = useRef({ x: 0, y: 0, hasValue: false });
  const pointerRef = useRef({ x: 0, y: 0 });
  const reducedMotionRef = useRef(false);
  const { scene } = useGLTF("/monitor.glb");
  const imageTexture = useTexture("/default.jpg");

  const model = useMemo(() => {
    const cloned = scene.clone(true);
    const center = new THREE.Box3().setFromObject(cloned).getCenter(new THREE.Vector3());
    cloned.position.sub(center);
    return cloned;
  }, [scene]);

  const screenGeometry = useMemo(() => createScreenGeometry(1, 1, 0.03), []);

  const timeUniform = useMemo(() => uniform(0), []);
  const imageAspectUniform = useMemo(() => uniform(1), []);
  const resolutionYUniform = useMemo(() => uniform(size.height), [size.height]);

  const screenMaterial = useMemo(() => {
    const material = new MeshBasicNodeMaterial();
    const baseUv = uv();
    const planeAspect = float(0.28 / 0.235);
    const imageAspect = imageAspectUniform;
    const branch = step(imageAspect, planeAspect);
    const one = float(1);

    const yScale = imageAspect.div(planeAspect);
    const xScale = planeAspect.div(imageAspect);
    const coveredUv = vec2(
      mix(baseUv.x.mul(xScale).add(one.sub(xScale).mul(0.5)), baseUv.x, branch),
      mix(baseUv.y, baseUv.y.mul(yScale).add(one.sub(yScale).mul(0.5)), branch),
    );

    const rgbShift = float(0.0025);
    const rUv = coveredUv.add(vec2(rgbShift, rgbShift));
    const bUv = coveredUv.add(vec2(rgbShift.mul(-1), float(0)));
    const source = texture(imageTexture, coveredUv).rgb;
    const red = texture(imageTexture, rUv).r;
    const blue = texture(imageTexture, bUv).b;
    const crtRgb = vec3(red, source.g, blue).mul(vec3(0.95, 1.05, 0.95));

    const scanline = sin(coveredUv.y.mul(resolutionYUniform).mul(1.5).add(timeUniform.mul(10)))
      .mul(0.2)
      .add(0.8);
    const vignette = coveredUv.x
      .mul(coveredUv.y)
      .mul(one.sub(coveredUv.x))
      .mul(one.sub(coveredUv.y))
      .mul(16)
      .pow(0.12);
    const crt = crtRgb.mul(scanline).mul(vignette);
    const boosted = clamp(crt.mul(1.08), vec3(0), vec3(1));

    material.colorNode = boosted;
    return material;
  }, [imageAspectUniform, imageTexture, resolutionYUniform, timeUniform]);

  useEffect(() => {
    imageTexture.colorSpace = THREE.SRGBColorSpace;
    imageTexture.minFilter = THREE.LinearFilter;
    imageTexture.magFilter = THREE.LinearFilter;
    imageTexture.needsUpdate = true;
    const { image } = imageTexture;
    if (image?.width && image?.height) {
      imageAspectUniform.value = image.width / image.height;
    }
  }, [imageAspectUniform, imageTexture]);

  useEffect(() => {
    resolutionYUniform.value = size.height;
  }, [resolutionYUniform, size.height]);

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
    const onDeviceOrientation = (event) => {
      if (!gyroEnabled) {
        orientationRef.current.hasValue = false;
        return;
      }
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
      screenMaterial.dispose();
    };
  }, [screenGeometry, screenMaterial]);

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

    // Keep a gentle top framing while ensuring the full monitor fits.
    const targetY = modelCenter.y + modelSize.y * 0.05;
    camera.position.set(modelCenter.x, targetY, modelCenter.z + distance);
    camera.near = 0.1;
    camera.far = Math.max(50, distance * 8);
    camera.lookAt(modelCenter.x, targetY, modelCenter.z);
    camera.updateProjectionMatrix();
  }, [camera, model, size.height, size.width]);

  useFrame((state, delta) => {
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
    timeUniform.value = state.clock.elapsedTime;
  });

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
          material={screenMaterial}
          scale={[0.28, 0.235, 1]}
          position={[-0.008, 0.005, 0.041]}
          rotation={[-0.18, 0, 0]}
        />
      </group>
    </>
  );
}

useGLTF.preload("/monitor.glb");
