// @ts-nocheck
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useWebglStore } from "../store/webgl";
import { cameraBasePoseRef, DEFAULT_CAMERA_BASE_POSE } from "../lib/cam/pose";
import {
  ROOM_POSES,
  ROOM_TRANSITION_SECONDS,
  isRoomNamespace,
  prefersReducedMotion,
} from "../lib/cam/roomPoses";

const POSE_KEYS = Object.keys(DEFAULT_CAMERA_BASE_POSE);

function snapTo(target) {
  for (const key of POSE_KEYS) {
    if (target[key] != null) cameraBasePoseRef.current[key] = target[key];
  }
}

/**
 * GSAP-driven camera pose orchestrator. Replaces the prior Theatre.js setup:
 * each room defines a static pose in `ROOM_POSES`, and route changes tween
 * `cameraBasePoseRef.current` to the new pose with an inOut ease. CameraRig
 * reads from `cameraBasePoseRef.current` every frame.
 */
export default function RoomCam() {
  const activePage = useWebglStore((state) => state.activePage);
  const prevRoomRef = useRef(null);
  const tweenRef = useRef(null);

  useEffect(() => {
    if (!isRoomNamespace(activePage)) return;

    const next = activePage;
    const prev = prevRoomRef.current;
    const targetPose = ROOM_POSES[next];

    if (tweenRef.current) {
      tweenRef.current.kill();
      tweenRef.current = null;
    }

    // First mount, or reduced motion: snap without tween.
    if (prev == null || prefersReducedMotion()) {
      snapTo(targetPose);
      prevRoomRef.current = next;
      return;
    }

    if (prev === next) return;

    tweenRef.current = gsap.to(cameraBasePoseRef.current, {
      orbitCenterX: targetPose.orbitCenterX,
      orbitCenterY: targetPose.orbitCenterY,
      orbitCenterZ: targetPose.orbitCenterZ,
      orbitRadius: targetPose.orbitRadius,
      cameraHeight: targetPose.cameraHeight,
      fov: targetPose.fov,
      orbitAngleDeg: targetPose.orbitAngleDeg,
      lookAtYawDeg: targetPose.lookAtYawDeg,
      lookAtPitchDeg: targetPose.lookAtPitchDeg,
      duration: ROOM_TRANSITION_SECONDS,
      ease: "power3.inOut",
      overwrite: true,
      onComplete: () => {
        tweenRef.current = null;
      },
    });

    prevRoomRef.current = next;
  }, [activePage]);

  useEffect(() => {
    return () => {
      tweenRef.current?.kill();
      tweenRef.current = null;
      prevRoomRef.current = null;
    };
  }, []);

  return null;
}
