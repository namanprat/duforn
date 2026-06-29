import { MOTION_TOKENS } from "../lib/animation/motionTokens";
import { CAMERA_ARRIVED_EVENT, getArrivedRoom } from "../lib/cam/arrival";
import { getSceneReady, SCENE_READY_EVENT } from "../scenes/preloader/sceneReady";

export { prefersReducedMotion } from "../lib/prefersReducedMotion";

export function resolveMotionTokens(reduce: boolean) {
  const t = MOTION_TOKENS.textReveal;
  return {
    revealDuration: reduce ? 0.05 : t.revealDuration,
    revealStagger: reduce ? 0 : t.revealStagger,
    hideDuration: reduce ? 0.05 : t.hideDuration,
    hideStagger: reduce ? 0 : t.hideStagger,
  };
}

export function waitForCamera(root: Element | null, onReady: () => void): () => void {
  const host = root?.closest?.("[data-page-namespace]") ?? null;
  const expectedRoom = host?.getAttribute("data-page-namespace") ?? null;
  const isReady = expectedRoom ? getArrivedRoom() === expectedRoom : getArrivedRoom() != null;
  if (isReady) {
    onReady();
    return () => {};
  }
  const handler = (e: Event) => {
    const detail = (e as CustomEvent<{ room?: string }>).detail;
    if (expectedRoom && detail?.room !== expectedRoom) return;
    window.removeEventListener(CAMERA_ARRIVED_EVENT, handler);
    onReady();
  };
  window.addEventListener(CAMERA_ARRIVED_EVENT, handler);
  return () => window.removeEventListener(CAMERA_ARRIVED_EVENT, handler);
}

export function waitForSceneAndCamera(root: Element | null, onReady: () => void): () => void {
  const host = root?.closest?.("[data-page-namespace]") ?? null;
  const expectedRoom = host?.getAttribute("data-page-namespace") ?? null;

  const check = () => {
    const cameraOk = expectedRoom ? getArrivedRoom() === expectedRoom : getArrivedRoom() != null;
    return cameraOk && getSceneReady();
  };

  if (check()) {
    onReady();
    return () => {};
  }

  let fired = false;
  const maybeFire = () => {
    if (fired || !check()) return;
    fired = true;
    cleanup();
    onReady();
  };

  const onCamera = (e: Event) => {
    const detail = (e as CustomEvent<{ room?: string }>).detail;
    if (expectedRoom && detail?.room !== expectedRoom) return;
    maybeFire();
  };

  const onScene = () => maybeFire();

  const cleanup = () => {
    window.removeEventListener(CAMERA_ARRIVED_EVENT, onCamera);
    window.removeEventListener(SCENE_READY_EVENT, onScene);
  };

  window.addEventListener(CAMERA_ARRIVED_EVENT, onCamera);
  window.addEventListener(SCENE_READY_EVENT, onScene);
  return cleanup;
}
