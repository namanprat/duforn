import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { PerspectiveCamera } from "three";
import { cameraBasePoseRef, cameraTransitionRef } from "./cam/pose";
import { prefersReducedMotion } from "../lib/prefersReducedMotion";

/**
 * Pointer parallax tuning. Reworked from v1 to feel gentler and more damped:
 * smaller swing, slower ease, and the camera eases back to center when the
 * pointer leaves the window.
 */
const PARALLAX = Object.freeze({
  angleRange: 0.14,
  yRange: 0.18,
  tiltRange: 0.02,
  lerp: 0.028,
});

/** Subtle idle sinusoidal drift (ported from v1 handheld feel). */
const HANDHELD_DRIFT = Object.freeze({
  xAmp1: 0.015,
  xFreq1: 0.7,
  xAmp2: 0.01,
  xFreq2: 1.3,
  yAmp1: 0.015,
  yFreq1: 0.5,
  yAmp2: 0.01,
  yFreq2: 1.1,
  zAmp: 0.01,
  zFreq: 0.6,
});

interface CameraRigProps {
  parallaxScale?: number;
  parallaxAngleScale?: number;
  handheldDriftScale?: number;
  locked?: boolean;
}

/** Normalize a screen point to [-1, 1] on each axis (origin at viewport center). */
function normalizePoint(clientX: number, clientY: number): { x: number; y: number } {
  const w = window.innerWidth || 1;
  const h = window.innerHeight || 1;
  return {
    x: (clientX / w) * 2 - 1,
    y: (clientY / h) * 2 - 1,
  };
}

/**
 * Orbital parallax camera. RoomCam drives the base orbit pose
 * (`cameraBasePoseRef`); pointer movement adds a smooth wobble on top.
 */
export default function CameraRig({
  parallaxScale = 1,
  parallaxAngleScale = 1,
  handheldDriftScale = 1,
  locked = false,
}: CameraRigProps) {
  const { camera } = useThree();

  const current = useRef({ angle: 0, y: 0, tilt: 0 });
  const pointerTarget = useRef({ angle: 0, y: 0, tilt: 0 });
  const smoothedDeltaRef = useRef(1 / 60);
  const lastFovRef = useRef<number | null>(null);

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      const { x, y } = normalizePoint(event.clientX, event.clientY);
      const t = pointerTarget.current;
      t.angle = x * PARALLAX.angleRange * parallaxScale * parallaxAngleScale;
      t.y = y * PARALLAX.yRange * parallaxScale;
      t.tilt = x * PARALLAX.tiltRange * parallaxScale * parallaxAngleScale;
    };

    // Ease back to center when the pointer leaves the window or focus is lost.
    const recenter = () => {
      const t = pointerTarget.current;
      t.angle = 0;
      t.y = 0;
      t.tilt = 0;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("mouseleave", recenter);
    window.addEventListener("blur", recenter);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("mouseleave", recenter);
      window.removeEventListener("blur", recenter);
    };
  }, [parallaxScale, parallaxAngleScale]);

  useFrame((state, delta) => {
    if (locked) return;

    const base = cameraBasePoseRef.current;
    const target = pointerTarget.current;

    const rawDelta = Math.min(Math.max(delta, 1 / 120), 0.1);
    const smoothedDelta = smoothedDeltaRef.current + (rawDelta - smoothedDeltaRef.current) * 0.22;
    smoothedDeltaRef.current = Math.min(Math.max(smoothedDelta, 1 / 120), 1 / 30);
    const fpsFactor = Math.min((smoothedDeltaRef.current * 1000) / 16.666, 3.0);
    const lerpFactor = Math.min(PARALLAX.lerp * fpsFactor, 1.0);

    const cur = current.current;
    cur.angle += (target.angle - cur.angle) * lerpFactor;
    cur.y += (target.y - cur.y) * lerpFactor;
    cur.tilt += (target.tilt - cur.tilt) * lerpFactor;

    const cx = base.orbitCenterX;
    const cy = base.orbitCenterY;
    const cz = base.orbitCenterZ;
    const orbitRadius = base.orbitRadius;
    const baseAngleRad = ((base.orbitAngleDeg ?? 90) * Math.PI) / 180;
    const totalAngle = baseAngleRad + cur.angle;

    let camX = cx + Math.cos(totalAngle) * orbitRadius;
    let camZ = cz + Math.sin(totalAngle) * orbitRadius;
    let camY = cy + cur.y + base.cameraHeight;

    const driftEnabled =
      handheldDriftScale > 0 && !prefersReducedMotion() && !cameraTransitionRef.current;
    if (driftEnabled) {
      const dt = state.clock.elapsedTime;
      const hd = handheldDriftScale;
      const d = HANDHELD_DRIFT;
      camX += (Math.sin(dt * d.xFreq1) * d.xAmp1 + Math.sin(dt * d.xFreq2) * d.xAmp2) * hd;
      camY += (Math.sin(dt * d.yFreq1) * d.yAmp1 + Math.cos(dt * d.yFreq2) * d.yAmp2) * hd;
      camZ += Math.cos(dt * d.zFreq) * d.zAmp * hd;
    }

    const cam = camera as PerspectiveCamera;
    if (lastFovRef.current !== base.fov) {
      cam.fov = base.fov;
      cam.updateProjectionMatrix();
      lastFovRef.current = base.fov;
    }

    const lookYaw = ((base.lookAtYawDeg ?? 0) * Math.PI) / 180;
    const lookPitch = ((base.lookAtPitchDeg ?? 0) * Math.PI) / 180;
    const forwardX = cx - camX;
    const forwardZ = cz - camZ;
    const forwardLen = Math.hypot(forwardX, forwardZ) || 1;
    const baseLookAngle = Math.atan2(forwardZ, forwardX) + lookYaw;
    const lookTargetX = camX + Math.cos(baseLookAngle) * forwardLen;
    const lookTargetZ = camZ + Math.sin(baseLookAngle) * forwardLen;
    const lookTargetY = cy + Math.tan(lookPitch) * forwardLen;

    cam.position.set(camX, camY, camZ);
    cam.lookAt(lookTargetX, lookTargetY, lookTargetZ);
    cam.rotation.z += cur.tilt;
  }, -1);

  return null;
}
