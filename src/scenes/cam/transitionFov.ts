import gsap from "gsap";
import type { PerspectiveCamera } from "three";
import { cameraBasePoseRef } from "./pose";
import { BOOT_FOV, BOOT_FOV_DURATION } from "./roomPoses";

export const ARCHIVE_FOV = 75;

let activeCamera: PerspectiveCamera | null = null;

export function registerTransitionCamera(camera: PerspectiveCamera): void {
  activeCamera = camera;
}

export function unregisterTransitionCamera(camera: PerspectiveCamera): void {
  if (activeCamera === camera) activeCamera = null;
}

export function killTransitionFovTweens(): void {
  gsap.killTweensOf(cameraBasePoseRef.current, "fov");
  if (activeCamera) gsap.killTweensOf(activeCamera, "fov");
}

/** Wide → target FOV punch on the active canvas camera (room rig + archive). */
export function runTransitionFovPunch(targetFov: number, ease: string): void {
  gsap.killTweensOf(cameraBasePoseRef.current, "fov");
  cameraBasePoseRef.current.fov = BOOT_FOV;
  gsap.to(cameraBasePoseRef.current, {
    fov: targetFov,
    duration: BOOT_FOV_DURATION,
    ease,
  });

  const cam = activeCamera;
  if (!cam) return;

  gsap.killTweensOf(cam, "fov");
  cam.fov = BOOT_FOV;
  cam.updateProjectionMatrix();
  gsap.to(cam, {
    fov: targetFov,
    duration: BOOT_FOV_DURATION,
    ease,
    onUpdate: () => cam.updateProjectionMatrix(),
  });
}
