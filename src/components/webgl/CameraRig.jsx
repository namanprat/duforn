import { useFrame, useThree } from "@react-three/fiber";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { useWebglStore } from "../../store/webgl.js";
import {
  PARALLAX_MOTION_CONFIG,
  mapDeviceOrientationToParallax,
} from "../../../scripts/runtime/motion.js";

/**
 * Orbital parallax camera shared by home, contact, and work canvases.
 *
 * Mouse / gyro input drives a smooth orbit around the scene center.
 * Subtle handheld drift adds cinematic feel.
 *
 * @param {number[]} [orbitCenter=[0,-1,-5]]      xyz center of the orbit
 * @param {boolean}  [enableContactOffset=true]    animate orbit shift on contact page
 */
export default function CameraRig({ orbitCenter = [0, -1, -5], enableContactOffset = true }) {
  const activePage = useWebglStore((state) => state.activePage);
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

  // Input listeners
  useEffect(() => {
    const onMouseMove = (event) => {
      const mx = (event.clientX / window.innerWidth) * 2 - 1;
      const my = -(event.clientY / window.innerHeight) * 2 + 1;
      target.current.angle = Math.PI / 2 + mx * PARALLAX_MOTION_CONFIG.angleRange;
      target.current.y = -my * PARALLAX_MOTION_CONFIG.yRange;
      target.current.tilt = mx * PARALLAX_MOTION_CONFIG.tiltRange;
    };

    const onDeviceOrientation = (event) => {
      if (!window.gyroEnabled) return;
      const mapped = mapDeviceOrientationToParallax(event);
      if (!mapped) return;
      target.current.angle = Math.PI / 2 + mapped.x * PARALLAX_MOTION_CONFIG.angleRange;
      target.current.y = mapped.y * PARALLAX_MOTION_CONFIG.yRange * 1.1;
      target.current.tilt = mapped.x * PARALLAX_MOTION_CONFIG.tiltRange;
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("deviceorientation", onDeviceOrientation, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("deviceorientation", onDeviceOrientation);
    };
  }, []);

  useFrame((state, delta) => {
    const safeDelta = Math.min(delta, 0.1);
    const fpsFactor = Math.min((safeDelta * 1000) / 16.666, 3.0);
    const lerpFactor = Math.min(PARALLAX_MOTION_CONFIG.lerp * fpsFactor, 1.0);

    current.current.angle += (target.current.angle - current.current.angle) * lerpFactor;
    current.current.y += (target.current.y - current.current.y) * lerpFactor;
    current.current.tilt += (target.current.tilt - current.current.tilt) * lerpFactor;

    const [ocx, ocy, ocz] = orbitCenter;
    const cx = orbitOffset.current.x + ocx;
    const cy = orbitOffset.current.y + ocy;
    const cz = orbitOffset.current.z + ocz;

    const { orbitRadius } = PARALLAX_MOTION_CONFIG;
    let camX = cx + Math.cos(current.current.angle) * orbitRadius;
    let camZ = cz + Math.sin(current.current.angle) * orbitRadius;
    let camY = cy + current.current.y + 1;

    // Handheld camera drift
    const dt = state.clock.elapsedTime;
    camX += Math.sin(dt * 0.7) * 0.015 + Math.sin(dt * 1.3) * 0.01;
    camY += Math.sin(dt * 0.5) * 0.015 + Math.cos(dt * 1.1) * 0.01;
    camZ += Math.cos(dt * 0.6) * 0.01;

    camera.position.set(camX, camY, camZ);
    camera.lookAt(cx, cy, cz);
    camera.rotation.z += current.current.tilt;
  });

  return null;
}
