// @ts-nocheck
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useWebglStore } from "../store/webgl";
import { cameraBasePoseRef, cameraTransitionRef, DEFAULT_CAMERA_BASE_POSE } from "../lib/cam/pose";
import {
  ROOM_POSES,
  ROOM_TRANSITION_SECONDS,
  isRoomNamespace,
  prefersReducedMotion,
} from "../lib/cam/roomPoses";
import { setArrivedRoom } from "../lib/cam/arrival";
import { getMainCameraPose } from "../store/homeScene";

const POSE_KEYS = Object.keys(DEFAULT_CAMERA_BASE_POSE);

// Main-room pose as baseline so CameraRig isn't at origin before RoomCam mounts.
Object.assign(cameraBasePoseRef.current, ROOM_POSES.main);

function getTargetPose(room) {
  if (room === "main") {
    return { ...DEFAULT_CAMERA_BASE_POSE, ...getMainCameraPose() };
  }
  return ROOM_POSES[room];
}

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
/**
 * Lead-in for the arrival signal: fire `setArrivedRoom` this many seconds
 * before the tween actually finishes, so text/button reveals start ahead of
 * the final camera settle (perceived as a snappier choreography).
 */
const ARRIVAL_LEAD_SECONDS = 0.2;

export default function RoomCam() {
  const activePage = useWebglStore((state) => state.activePage);
  const prevRoomRef = useRef(null);
  const tweenRef = useRef(null);
  const arrivalCallRef = useRef(null);

  useEffect(() => {
    if (!isRoomNamespace(activePage)) return;

    const next = activePage;
    const prev = prevRoomRef.current;
    const targetPose = getTargetPose(next);

    if (tweenRef.current) {
      tweenRef.current.kill();
      tweenRef.current = null;
      cameraTransitionRef.current = false;
    }
    if (arrivalCallRef.current) {
      arrivalCallRef.current.kill();
      arrivalCallRef.current = null;
    }

    // Same room (e.g. component remounted but route didn't change) — keep the
    // existing arrival signal so subscribers don't get stuck waiting.
    if (prev === next) return;

    // Route really changed → arrival signal is stale until we land again.
    setArrivedRoom(null);

    // First mount or reduced motion: snap without tween.
    if (prev == null || prefersReducedMotion()) {
      cameraTransitionRef.current = false;
      snapTo(targetPose);
      prevRoomRef.current = next;
      setArrivedRoom(next);
      return;
    }

    cameraTransitionRef.current = true;
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
        cameraTransitionRef.current = false;
        // Backup arrival in case the lead-in delayedCall was killed/missed.
        if (arrivalCallRef.current) {
          arrivalCallRef.current.kill();
          arrivalCallRef.current = null;
        }
        setArrivedRoom(next);
      },
    });

    // Lead arrival by `ARRIVAL_LEAD_SECONDS` so reveals start before settle.
    const leadDelay = Math.max(0, ROOM_TRANSITION_SECONDS - ARRIVAL_LEAD_SECONDS);
    arrivalCallRef.current = gsap.delayedCall(leadDelay, () => {
      arrivalCallRef.current = null;
      setArrivedRoom(next);
    });

    prevRoomRef.current = next;
  }, [activePage]);

  useEffect(() => {
    return () => {
      tweenRef.current?.kill();
      tweenRef.current = null;
      arrivalCallRef.current?.kill();
      arrivalCallRef.current = null;
      cameraTransitionRef.current = false;
      prevRoomRef.current = null;
    };
  }, []);

  return null;
}
