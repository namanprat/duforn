// @ts-nocheck
import { useFrame, useThree } from "@react-three/fiber";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { useWebglStore } from "../../store/webgl";
import {
  PARALLAX_MOTION_CONFIG,
  mapDeviceOrientationToParallax,
} from "../../../scripts/runtime/motion";

/**
 * Orbital parallax camera shared by home, contact, and work canvases.
 *
 * Pointer / gyro input drives a smooth orbit around the scene center.
 * Subtle handheld drift adds cinematic feel.
 *
 * @param {number[]} [orbitCenter=[0,-1,-5]]      xyz center of the orbit
 * @param {boolean}  [enableContactOffset=true]    animate orbit shift on contact page
 * @param {number}   [parallaxScale=1]              multiply pointer/gyro parallax (lower = calmer)
 * @param {number}   [handheldDriftScale=1]        multiply subtle idle camera drift (0 = off)
 * @param {number}   [orbitRadius]                 override PARALLAX_MOTION_CONFIG.orbitRadius when set
 */
export default function CameraRig({
  orbitCenter = [0, -1, -5],
  enableContactOffset = true,
  parallaxScale = 1,
  parallaxAngleScale = 1,
  parallaxLerp,
  handheldDriftScale = 1,
  orbitRadius: orbitRadiusProp,
  locked = false,
}) {
  const activePage = useWebglStore((state) => state.activePage);
  const gyroEnabled = useWebglStore((state) => state.gyroEnabled);
  const { camera } = useThree();

  const orbitOffset = useRef({ x: 0, y: 0, z: 0 });
  const current = useRef({ angle: Math.PI / 2, y: 0, tilt: 0 });
  const target = useRef({ angle: Math.PI / 2, y: 0, tilt: 0 });

  // Contact page orbit shift
  useEffect(() => {
    if (!enableContactOffset) return;

    const contactTarget = activePage === "contact" ? { x: -2, y: 0, z: 0 } : { x: 0, y: 0, z: 0 };

    gsap.to(orbitOffset.current, {
      x: contactTarget.x,
      y: contactTarget.y,
      z: contactTarget.z,
      duration: 1.8,
      ease: "power3.inOut",
    });
  }, [activePage, enableContactOffset]);

  useEffect(() => {
    const onPointerMove = (event) => {
      const mx = (event.clientX / window.innerWidth) * 2 - 1;
      const my = -(event.clientY / window.innerHeight) * 2 + 1;
      const ps = parallaxScale;
      const pa = parallaxAngleScale;
      target.current.angle = Math.PI / 2 + mx * PARALLAX_MOTION_CONFIG.angleRange * ps * pa;
      target.current.y = -my * PARALLAX_MOTION_CONFIG.yRange * ps;
      target.current.tilt = mx * PARALLAX_MOTION_CONFIG.tiltRange * ps * pa;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, [parallaxScale, parallaxAngleScale]);

  useEffect(() => {
    if (!gyroEnabled) return;

    const onDeviceOrientation = (event) => {
      const mapped = mapDeviceOrientationToParallax(event);
      if (!mapped) return;
      const ps = parallaxScale;
      const pa = parallaxAngleScale;
      target.current.angle = Math.PI / 2 + mapped.x * PARALLAX_MOTION_CONFIG.angleRange * ps * pa;
      target.current.y = mapped.y * PARALLAX_MOTION_CONFIG.yRange * 1.1 * ps;
      target.current.tilt = mapped.x * PARALLAX_MOTION_CONFIG.tiltRange * ps * pa;
    };

    window.addEventListener("deviceorientation", onDeviceOrientation, { passive: true });
    return () => window.removeEventListener("deviceorientation", onDeviceOrientation);
  }, [gyroEnabled, parallaxScale, parallaxAngleScale]);

  useFrame((state, delta) => {
    if (locked) return;

    const safeDelta = Math.min(delta, 0.1);
    const fpsFactor = Math.min((safeDelta * 1000) / 16.666, 3.0);
    const baseLerp =
      typeof parallaxLerp === "number" && Number.isFinite(parallaxLerp)
        ? parallaxLerp
        : PARALLAX_MOTION_CONFIG.lerp;
    const lerpFactor = Math.min(baseLerp * fpsFactor, 1.0);

    current.current.angle += (target.current.angle - current.current.angle) * lerpFactor;
    current.current.y += (target.current.y - current.current.y) * lerpFactor;
    current.current.tilt += (target.current.tilt - current.current.tilt) * lerpFactor;

    const [ocx, ocy, ocz] = orbitCenter;
    const cx = orbitOffset.current.x + ocx;
    const cy = orbitOffset.current.y + ocy;
    const cz = orbitOffset.current.z + ocz;

    const orbitRadius =
      typeof orbitRadiusProp === "number" && Number.isFinite(orbitRadiusProp)
        ? orbitRadiusProp
        : PARALLAX_MOTION_CONFIG.orbitRadius;
    let camX = cx + Math.cos(current.current.angle) * orbitRadius;
    let camZ = cz + Math.sin(current.current.angle) * orbitRadius;
    let camY = cy + current.current.y + 1;

    // Handheld camera drift
    const dt = state.clock.elapsedTime;
    const hd = handheldDriftScale;
    camX += (Math.sin(dt * 0.7) * 0.015 + Math.sin(dt * 1.3) * 0.01) * hd;
    camY += (Math.sin(dt * 0.5) * 0.015 + Math.cos(dt * 1.1) * 0.01) * hd;
    camZ += Math.cos(dt * 0.6) * 0.01 * hd;

    camera.position.set(camX, camY, camZ);
    camera.lookAt(cx, cy, cz);
    camera.rotation.z += current.current.tilt;
  });

  return null;
}
