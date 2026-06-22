import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { cameraBasePoseRef, cameraTransitionRef, POSE_KEYS } from "./cam/pose";
import { prefersReducedMotion } from "../lib/prefersReducedMotion";
import {
  ROOM_POSES,
  ROOM_TRANSITION_SECONDS,
  posesEqual,
  type RoomNamespace,
} from "./cam/roomPoses";
import { setArrivedRoom } from "../lib/cam/arrival";

const ARRIVAL_LEAD_SECONDS = 0.2;
Object.assign(cameraBasePoseRef.current, ROOM_POSES.main);

function snapTo(target: (typeof ROOM_POSES)[RoomNamespace]) {
  for (const key of POSE_KEYS) {
    cameraBasePoseRef.current[key] = target[key];
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
