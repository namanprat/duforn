// @ts-nocheck
import { useFrame, useThree } from "@react-three/fiber";
import React, { useEffect, useRef } from "react";
import { useWebglStore } from "../store/webgl";
import { cameraBasePoseRef } from "../lib/theatre/pose";
import { normalizeViewportPoint } from "../lib/viewport/stableViewport";
import {
  PARALLAX_MOTION_CONFIG,
  mapDeviceOrientationToParallax,
} from "../../scripts/runtime/motion";

/**
 * Orbital parallax camera for the shared room scene.
 * Theatre drives the base orbit pose; pointer / gyro add a smooth wobble on top.
 */
export default function CameraRig({
  parallaxScale = 1,
  parallaxAngleScale = 1,
  parallaxLerp,
  handheldDriftScale = 1,
  locked = false,
}) {
  const gyroEnabled = useWebglStore((state) => state.gyroEnabled);
  const { camera } = useThree();

  const current = useRef({ angle: 0, y: 0, tilt: 0 });
  const pointerTarget = useRef({ angle: 0, y: 0, tilt: 0 });
  const gyroTarget = useRef({ angle: 0, y: 0, tilt: 0 });
  const gyroHasValue = useRef(false);
  const smoothedDeltaRef = useRef(1 / 60);
  const lastFovRef = useRef(null);

  const applyParallaxInput = (targetRef, x, y) => {
    const ps = parallaxScale;
    const pa = parallaxAngleScale;
    targetRef.current.angle = x * PARALLAX_MOTION_CONFIG.angleRange * ps * pa;
    targetRef.current.y = y * PARALLAX_MOTION_CONFIG.yRange * ps;
    targetRef.current.tilt = x * PARALLAX_MOTION_CONFIG.tiltRange * ps * pa;
  };

  useEffect(() => {
    const onPointerMove = (event) => {
      const { x, y } = normalizeViewportPoint(event.clientX, event.clientY);
      applyParallaxInput(pointerTarget, x, -y);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, [parallaxScale, parallaxAngleScale]);

  useEffect(() => {
    if (!gyroEnabled) {
      gyroHasValue.current = false;
      return;
    }

    const onDeviceOrientation = (event) => {
      const mapped = mapDeviceOrientationToParallax(event);
      if (!mapped) return;
      const ps = parallaxScale;
      const pa = parallaxAngleScale;
      gyroTarget.current.angle = mapped.x * PARALLAX_MOTION_CONFIG.angleRange * ps * pa;
      gyroTarget.current.y = mapped.y * PARALLAX_MOTION_CONFIG.yRange * 1.1 * ps;
      gyroTarget.current.tilt = mapped.x * PARALLAX_MOTION_CONFIG.tiltRange * ps * pa;
      gyroHasValue.current = true;
    };

    window.addEventListener("deviceorientation", onDeviceOrientation, { passive: true });
    return () => window.removeEventListener("deviceorientation", onDeviceOrientation);
  }, [gyroEnabled, parallaxScale, parallaxAngleScale]);

  useFrame((state, delta) => {
    if (locked) return;

    const base = cameraBasePoseRef.current;
    const activeTarget =
      gyroEnabled && gyroHasValue.current ? gyroTarget.current : pointerTarget.current;

    const rawDelta = Math.min(Math.max(delta, 1 / 120), 0.1);
    const smoothedDelta = smoothedDeltaRef.current + (rawDelta - smoothedDeltaRef.current) * 0.22;
    smoothedDeltaRef.current = Math.min(Math.max(smoothedDelta, 1 / 120), 1 / 30);
    const fpsFactor = Math.min((smoothedDeltaRef.current * 1000) / 16.666, 3.0);
    const baseLerp =
      typeof parallaxLerp === "number" && Number.isFinite(parallaxLerp)
        ? parallaxLerp
        : PARALLAX_MOTION_CONFIG.lerp;
    const lerpFactor = Math.min(baseLerp * fpsFactor, 1.0);

    current.current.angle += (activeTarget.angle - current.current.angle) * lerpFactor;
    current.current.y += (activeTarget.y - current.current.y) * lerpFactor;
    current.current.tilt += (activeTarget.tilt - current.current.tilt) * lerpFactor;

    const cx = base.orbitCenterX;
    const cy = base.orbitCenterY;
    const cz = base.orbitCenterZ;
    const orbitRadius = base.orbitRadius;
    const baseAngleRad = ((base.orbitAngleDeg ?? 90) * Math.PI) / 180;
    const totalAngle = baseAngleRad + current.current.angle;

    let camX = cx + Math.cos(totalAngle) * orbitRadius;
    let camZ = cz + Math.sin(totalAngle) * orbitRadius;
    let camY = cy + current.current.y + base.cameraHeight;

    const dt = state.clock.elapsedTime;
    const hd = handheldDriftScale;
    camX += (Math.sin(dt * 0.7) * 0.015 + Math.sin(dt * 1.3) * 0.01) * hd;
    camY += (Math.sin(dt * 0.5) * 0.015 + Math.cos(dt * 1.1) * 0.01) * hd;
    camZ += Math.cos(dt * 0.6) * 0.01 * hd;

    if (lastFovRef.current !== base.fov) {
      camera.fov = base.fov;
      camera.updateProjectionMatrix();
      lastFovRef.current = base.fov;
    }

    // Apply lookAt with optional yaw/pitch offset for theatre-driven rotation.
    const lookYaw = ((base.lookAtYawDeg ?? 0) * Math.PI) / 180;
    const lookPitch = ((base.lookAtPitchDeg ?? 0) * Math.PI) / 180;
    const forwardX = cx - camX;
    const forwardZ = cz - camZ;
    const forwardLen = Math.hypot(forwardX, forwardZ) || 1;
    const baseLookAngle = Math.atan2(forwardZ, forwardX) + lookYaw;
    const lookTargetX = camX + Math.cos(baseLookAngle) * forwardLen;
    const lookTargetZ = camZ + Math.sin(baseLookAngle) * forwardLen;
    const lookTargetY = cy + Math.tan(lookPitch) * forwardLen;

    camera.position.set(camX, camY, camZ);
    camera.lookAt(lookTargetX, lookTargetY, lookTargetZ);
    camera.rotation.z += current.current.tilt;
  });

  return null;
}
