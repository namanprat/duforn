import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { useWebglStore, type RoomNamespace } from "../store/webgl";
import { cameraBasePoseRef, cameraTransitionRef, POSE_KEYS } from "./cam/pose";
import {
  ROOM_POSES,
  ROOM_TRANSITION_SECONDS,
  prefersReducedMotion,
  posesEqual,
} from "./cam/roomPoses";
import { setArrivedRoom } from "../lib/cam/arrival";
import { getRouteNamespace } from "../lib/route";

const ARRIVAL_LEAD_SECONDS = 0.2;

function resolveInitialRoom(): RoomNamespace {
  if (typeof window !== "undefined") {
    const ns = getRouteNamespace(window.location.pathname);
    if (ns !== "projectDetail") return ns;
  }
  const page = useWebglStore.getState().activePage;
  return page === "projectDetail" ? "main" : page;
}

// Baseline so CameraRig isn't at origin before the first layout effect runs.
Object.assign(cameraBasePoseRef.current, ROOM_POSES[resolveInitialRoom()]);

function snapTo(target: (typeof ROOM_POSES)[RoomNamespace]) {
  for (const key of POSE_KEYS) {
    cameraBasePoseRef.current[key] = target[key];
  }
}

/**
 * GSAP-driven camera pose orchestrator. Each room defines a static pose in
 * `ROOM_POSES`; route changes tween `cameraBasePoseRef.current` to the new pose.
 * CameraRig reads from `cameraBasePoseRef.current` every frame.
 */
export default function RoomCam() {
  const activePage = useWebglStore((state) => state.activePage);
  const prevRoomRef = useRef<RoomNamespace | null>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const arrivalCallRef = useRef<gsap.core.Tween | null>(null);

  useLayoutEffect(() => {
    if (activePage === "projectDetail") return;

    const next = activePage;
    const prev = prevRoomRef.current;
    const targetPose = ROOM_POSES[next];
    const prevPose = prev != null ? ROOM_POSES[prev] : null;

    if (tweenRef.current) {
      tweenRef.current.kill();
      tweenRef.current = null;
      cameraTransitionRef.current = false;
    }
    if (arrivalCallRef.current) {
      arrivalCallRef.current.kill();
      arrivalCallRef.current = null;
    }

    if (prev === next) return;

    setArrivedRoom(null);

    const samePose = prevPose != null && posesEqual(prevPose, targetPose);

    if (prev == null || prefersReducedMotion() || samePose) {
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
        if (arrivalCallRef.current) {
          arrivalCallRef.current.kill();
          arrivalCallRef.current = null;
        }
        setArrivedRoom(next);
      },
    });

    const leadDelay = Math.max(0, ROOM_TRANSITION_SECONDS - ARRIVAL_LEAD_SECONDS);
    arrivalCallRef.current = gsap.delayedCall(leadDelay, () => {
      arrivalCallRef.current = null;
      setArrivedRoom(next);
    });

    prevRoomRef.current = next;
  }, [activePage]);

  useLayoutEffect(() => {
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
