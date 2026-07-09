import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import {
  cameraBasePoseRef,
  cameraTransitionRef,
  POSE_KEYS,
  requestParallaxRecenter,
} from "./cam/pose";
import { prefersReducedMotion } from "../lib/prefersReducedMotion";
import {
  ROOM_POSES,
  ROOM_TRANSITION_SECONDS,
  BOOT_FOV,
  posesEqual,
  type RoomNamespace,
} from "./cam/roomPoses";
import { setArrivedRoom } from "../lib/cam/arrival";
import { getSceneBootPhase, hasInitialBootCompleted } from "./preloader/sceneReady";
import { useWorkProjectTransitionStore } from "../store/workProjectTransition";

/** Text reveal lead — fire arrival this many seconds before the camera tween ends. */
const ARRIVAL_LEAD_SECONDS = 0.2;
Object.assign(cameraBasePoseRef.current, ROOM_POSES.main);

function snapTo(target: (typeof ROOM_POSES)[RoomNamespace], fov = target.fov) {
  for (const key of POSE_KEYS) {
    cameraBasePoseRef.current[key] = key === "fov" ? fov : target[key];
  }
}

export default function RoomCam({ activeRoom }: { activeRoom: RoomNamespace }) {
  const prevRoomRef = useRef<RoomNamespace | null>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const arrivalCallRef = useRef<gsap.core.Tween | null>(null);

  useLayoutEffect(() => {
    const next = activeRoom;
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

    requestParallaxRecenter();

    const transition = useWorkProjectTransitionStore.getState();
    if (transition.active && transition.direction === "toProject") {
      prevRoomRef.current = next;
      return;
    }

    setArrivedRoom(null);

    const samePose = prevPose != null && posesEqual(prevPose, targetPose);

    if (prev == null || prefersReducedMotion() || samePose) {
      cameraTransitionRef.current = false;
      const useBootFov = prev == null && !hasInitialBootCompleted();
      if (
        transition.active &&
        transition.direction === "toWork" &&
        transition.departedOrbitCenterY != null
      ) {
        snapTo({ ...targetPose, orbitCenterY: transition.departedOrbitCenterY }, targetPose.fov);
      } else {
        snapTo(targetPose, useBootFov ? BOOT_FOV : targetPose.fov);
      }
      prevRoomRef.current = next;
      if (
        !transition.active &&
        (getSceneBootPhase() === "live" || hasInitialBootCompleted())
      ) {
        setArrivedRoom(next);
      }
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
  }, [activeRoom]);

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
