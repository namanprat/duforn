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
import { useDissolveTransitionStore } from "../store/routeTransition";
import { killTransitionFovTweens } from "./cam/transitionFov";

/** Text reveal beat — fire arrival this many seconds after the camera tween starts,
 * so incoming text reveals while the camera is still gliding. */
const ARRIVAL_BEAT_SECONDS = 0.35;
Object.assign(cameraBasePoseRef.current, ROOM_POSES.main);

function snapTo(
  target: (typeof ROOM_POSES)[RoomNamespace],
  fov = target.fov,
  { skipFov = false }: { skipFov?: boolean } = {},
) {
  for (const key of POSE_KEYS) {
    if (skipFov && key === "fov") continue;
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
    const dissolveActive = useDissolveTransitionStore.getState().active;

    if (tweenRef.current) {
      tweenRef.current.kill();
      tweenRef.current = null;
      cameraTransitionRef.current = false;
    }
    if (arrivalCallRef.current) {
      arrivalCallRef.current.kill();
      arrivalCallRef.current = null;
    }
    if (!dissolveActive) {
      killTransitionFovTweens();
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
        snapTo(
          { ...targetPose, orbitCenterY: transition.departedOrbitCenterY },
          targetPose.fov,
          { skipFov: dissolveActive },
        );
      } else {
        snapTo(targetPose, useBootFov ? BOOT_FOV : targetPose.fov, {
          skipFov: dissolveActive,
        });
      }
      prevRoomRef.current = next;
      if (
        !transition.active &&
        !dissolveActive &&
        (getSceneBootPhase() === "live" || hasInitialBootCompleted())
      ) {
        setArrivedRoom(next);
      }
      return;
    }

    cameraTransitionRef.current = true;
    let arrivalFired = false;
    // fov eases prev→target with the pose glide (killTransitionFovTweens above
    // cancels any in-flight boot/archive punch so the handoff stays smooth).
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
      ease: "power2.inOut",
      overwrite: "auto",
      onComplete: () => {
        tweenRef.current = null;
        cameraTransitionRef.current = false;
        if (arrivalCallRef.current) {
          arrivalCallRef.current.kill();
          arrivalCallRef.current = null;
        }
        if (!arrivalFired) {
          arrivalFired = true;
          setArrivedRoom(next);
        }
      },
    });

    arrivalCallRef.current = gsap.delayedCall(ARRIVAL_BEAT_SECONDS, () => {
      arrivalCallRef.current = null;
      arrivalFired = true;
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
      if (!useDissolveTransitionStore.getState().active) {
        killTransitionFovTweens();
      }
      cameraTransitionRef.current = false;
      prevRoomRef.current = null;
    };
  }, []);

  return null;
}
