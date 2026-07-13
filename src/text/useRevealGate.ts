import { MOTION_TOKENS } from "../lib/animation/motionTokens";
import { CAMERA_ARRIVED_EVENT, getArrivedRoom } from "../lib/cam/arrival";
import { getSceneReady, SCENE_READY_EVENT, useSceneBootStore } from "../scenes/preloader/sceneReady";
import { ROOM_TRANSITION_SECONDS } from "../scenes/cam/roomPoses";
import {
  PROJECT_DETAIL_ARRIVED_EVENT,
  isWorkProjectTransitionActive,
  useWorkProjectTransitionStore,
} from "../store/workProjectTransition";
import { useDissolveTransitionStore } from "../store/routeTransition";

// ponytail: the arrival event is a one-shot; if a consumer mounts and never sees
// it (missed dispatch, no camera move for the target room), the text would stay
// hidden forever. Reveal anyway once the longest possible camera move is over.
// Ceiling: a fixed timeout — if room transitions ever exceed this, bump it or
// switch to a "transition settled" signal instead of a timer.
const CAMERA_GATE_FALLBACK_MS = ROOM_TRANSITION_SECONDS * 1000 + 300;

function isCameraReadyForRoom(expectedRoom: string | null): boolean {
  if (expectedRoom) return getArrivedRoom() === expectedRoom;
  return getArrivedRoom() != null;
}

/** True while an orchestrated route transition (archive dissolve or work↔project)
 * owns the text reveal — components must not self-arm; the transition's
 * showAllRegisteredPageText() is the sole reveal driver. */
export function isRouteTransitionActive(): boolean {
  return useDissolveTransitionStore.getState().active || isWorkProjectTransitionActive();
}

export function waitForRouteTransitionIdle(onReady: () => void): () => void {
  if (!isRouteTransitionActive()) {
    onReady();
    return () => {};
  }

  let done = false;
  let unsubDissolve: (() => void) | null = null;
  let unsubProject: (() => void) | null = null;

  const finish = () => {
    if (done || isRouteTransitionActive()) return;
    done = true;
    unsubDissolve?.();
    unsubProject?.();
    onReady();
  };

  unsubDissolve = useDissolveTransitionStore.subscribe((state) => {
    if (!state.active) finish();
  });
  unsubProject = useWorkProjectTransitionStore.subscribe((state) => {
    if (!state.active) finish();
  });

  return () => {
    done = true;
    unsubDissolve?.();
    unsubProject?.();
  };
}

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
  if (isCameraReadyForRoom(expectedRoom)) {
    onReady();
    return () => {};
  }
  let done = false;
  let fallback: ReturnType<typeof setTimeout>;
  const handler = (e: Event) => {
    const detail = (e as CustomEvent<{ room?: string }>).detail;
    if (expectedRoom && detail?.room !== expectedRoom) return;
    finish();
  };
  const cleanup = () => {
    window.removeEventListener(CAMERA_ARRIVED_EVENT, handler);
    clearTimeout(fallback);
  };
  const finish = () => {
    if (done) return;
    done = true;
    cleanup();
    onReady();
  };
  window.addEventListener(CAMERA_ARRIVED_EVENT, handler);
  fallback = setTimeout(finish, CAMERA_GATE_FALLBACK_MS);
  return () => {
    done = true;
    cleanup();
  };
}

// Reveal the boot text once the preloader is 70% loaded, without waiting for the
// full scene-ready + camera-arrival beat at the end of boot.
const BOOT_REVEAL_PROGRESS = 70;

export function waitForSceneAndCamera(root: Element | null, onReady: () => void): () => void {
  const host = root?.closest?.("[data-page-namespace]") ?? null;
  const expectedRoom = host?.getAttribute("data-page-namespace") ?? null;

  const check = () =>
    useSceneBootStore.getState().progress >= BOOT_REVEAL_PROGRESS ||
    (isCameraReadyForRoom(expectedRoom) && getSceneReady());

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
  const unsubProgress = useSceneBootStore.subscribe(maybeFire);

  const cleanup = () => {
    window.removeEventListener(CAMERA_ARRIVED_EVENT, onCamera);
    window.removeEventListener(SCENE_READY_EVENT, onScene);
    unsubProgress();
  };

  window.addEventListener(CAMERA_ARRIVED_EVENT, onCamera);
  window.addEventListener(SCENE_READY_EVENT, onScene);
  return cleanup;
}

export function waitForProjectArrival(onReady: () => void): () => void {
  // Direct load / refresh (no work→project transition): hold the reveal until the
  // boot preloader has lifted, so the text animates in on-screen instead of while
  // it's still hidden behind the overlay.
  if (!useWorkProjectTransitionStore.getState().active) {
    if (getSceneReady()) {
      onReady();
      return () => {};
    }
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      window.removeEventListener(SCENE_READY_EVENT, finish);
      onReady();
    };
    window.addEventListener(SCENE_READY_EVENT, finish);
    return () => {
      done = true;
      window.removeEventListener(SCENE_READY_EVENT, finish);
    };
  }

  let done = false;
  const handler = () => finish();
  const finish = () => {
    if (done) return;
    done = true;
    window.removeEventListener(PROJECT_DETAIL_ARRIVED_EVENT, handler);
    onReady();
  };

  window.addEventListener(PROJECT_DETAIL_ARRIVED_EVENT, handler);
  return () => {
    done = true;
    window.removeEventListener(PROJECT_DETAIL_ARRIVED_EVENT, handler);
  };
}
