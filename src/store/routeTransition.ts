import { create } from "zustand";
import type * as THREE from "three";
import { SHARED_FOV, ROOM_TRANSITION_SECONDS } from "../scenes/cam/roomPoses";
import { getBlackHoldoutTexture } from "../scenes/transition/departingHoldout";
import {
  killDissolveProgressTweens,
  runIronhillCloseTimeline,
  runPierceTimeline,
  setDissolveCover,
  WIPE_CLOSED,
} from "../scenes/preloader/bootRevealTimeline";
import {
  hidePageChrome,
  showPageChrome,
  snapHidePageChrome,
  snapShowPageChrome,
} from "../lib/pageChrome";
import {
  hideAllRegisteredPageText,
  showAllRegisteredPageText,
  snapHideAllRegisteredPageText,
} from "../lib/text";
import { getDeviceTier } from "../lib/deviceTier";
import { prefersReducedMotion } from "../lib/prefersReducedMotion";
import { getRouteNamespace } from "../lib/route";
import { CAMERA_ARRIVED_EVENT } from "../lib/cam/arrival";
import { resetArchiveToOrbView } from "./archiveView";
import { useArchiveReturnStore, getArchiveReturnRoom } from "./archiveReturn";
import { preloadArchiveReturnRoom, warmArchiveMedia } from "../lib/roomReturnPreload";

const TEXT_UNREVEAL_TIMEOUT_MS = 550;
const ROOM_NAV_TIMEOUT_MS = ROOM_TRANSITION_SECONDS * 1000 + 400;

type DissolveTransitionState = {
  active: boolean;
  useHoldout: boolean;
  holdout: THREE.Texture | null;
  start: () => void;
  setHoldout: (texture: THREE.Texture) => void;
  setUseHoldout: (useHoldout: boolean) => void;
  finish: () => void;
  reset: () => void;
};

export const useDissolveTransitionStore = create<DissolveTransitionState>((set, get) => ({
  active: false,
  useHoldout: false,
  holdout: null,
  start: () => set({ active: true }),
  setHoldout: (holdout) => set({ holdout }),
  setUseHoldout: (useHoldout) => set({ useHoldout }),
  finish: () => get().reset(),
  reset: () => set({ active: false, useHoldout: false, holdout: null }),
}));

export function canRunDissolveTransition(): boolean {
  return getDeviceTier() > 0 && !prefersReducedMotion();
}

export function isRoomRoute(path: string): boolean {
  const ns = getRouteNamespace(path);
  return ns === "main" || ns === "work" || ns === "contact";
}

export function shouldUseRoomCameraTransition(fromPath: string, toPath: string): boolean {
  return isRoomRoute(fromPath) && isRoomRoute(toPath);
}

export function shouldUseArchiveLiveWipe(fromPath: string, toPath: string): boolean {
  return fromPath === "/archive" || toPath === "/archive";
}

export function armBootDissolveCover(): boolean {
  if (!canRunDissolveTransition()) return false;

  killDissolveProgressTweens();
  const store = useDissolveTransitionStore.getState();
  store.setUseHoldout(true);
  store.setHoldout(getBlackHoldoutTexture());
  store.start();
  setDissolveCover(WIPE_CLOSED);
  return true;
}

export function resetDissolveTransition(): void {
  killDissolveProgressTweens();
  useDissolveTransitionStore.getState().reset();
  setDissolveCover(0);
}

// ponytail: naive rAF-delta settle — treats a smooth frame as "heavy work done"
// (shader compile / texture upload / water spin-up), so the pierce opens only
// once those land behind the fully-closed cover. Upgrade path: await an explicit
// scene-ready signal if this proves flaky.
function waitUntilSettled(maxFrames = 12, smoothMs = 24): Promise<void> {
  return new Promise((resolve) => {
    let frames = 0;
    let last = performance.now();
    const step = (now: number) => {
      const delta = now - last;
      last = now;
      frames += 1;
      if ((frames >= 2 && delta <= smoothMs) || frames >= maxFrames) resolve();
      else requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

async function unrevealPageText(): Promise<void> {
  // ponytail: text controllers are third-party animation promises; cap the wait
  // so a stale controller cannot strand navigation. The snap preserves ordering.
  await Promise.race([
    hideAllRegisteredPageText(),
    new Promise<void>((resolve) => window.setTimeout(resolve, TEXT_UNREVEAL_TIMEOUT_MS)),
  ]);
  snapHideAllRegisteredPageText();
}

type DissolveMode = "boot" | "route-live";

type DissolveOpts = {
  mode?: DissolveMode;
  fov?: boolean;
  targetFov?: number;
  fromFov?: number;
  /** Boot starts fully closed — skip animated close. */
  skipClose?: boolean;
  swap?: () => void;
  beforeDissolve?: () => void | Promise<void>;
  onPierceReveal?: () => void;
};

export async function playDissolve({
  mode = "route-live",
  fov = false,
  targetFov = SHARED_FOV,
  fromFov = SHARED_FOV,
  skipClose = false,
  swap,
  beforeDissolve,
  onPierceReveal,
}: DissolveOpts = {}): Promise<void> {
  killDissolveProgressTweens();
  const store = useDissolveTransitionStore.getState();

  try {
    await beforeDissolve?.();

    if (mode === "boot") {
      store.setUseHoldout(true);
      store.setHoldout(getBlackHoldoutTexture());
    } else {
      store.setUseHoldout(false);
    }

    store.start();

    if (skipClose) {
      setDissolveCover(WIPE_CLOSED);
    } else {
      setDissolveCover(0);
      await runIronhillCloseTimeline({
        fov,
        fromFov,
      });
    }

    swap?.();
    await waitUntilSettled();

    await runPierceTimeline({
      fov,
      targetFov,
      onPierceReveal,
    });
  } finally {
    store.finish();
  }
}

export async function runRoomCameraRouteTransition(
  toPath: string,
  navigate: (path: string) => void,
): Promise<void> {
  const expectedRoom = getRouteNamespace(toPath);
  navigate(toPath);
  await new Promise<void>((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      window.removeEventListener(CAMERA_ARRIVED_EVENT, onArrived);
      window.clearTimeout(timer);
      resolve();
    };
    const onArrived = (event: Event) => {
      const detail = (event as CustomEvent<{ room?: string }>).detail;
      if (detail?.room !== expectedRoom) return;
      finish();
    };
    const timer = window.setTimeout(finish, ROOM_NAV_TIMEOUT_MS);
    window.addEventListener(CAMERA_ARRIVED_EVENT, onArrived);
  });
}

// Archive uses one live-canvas wipe only. No departing-frame capture, no FOV punch,
// no second visible pass.
export async function runArchiveLiveWipeTransition(
  fromPath: string,
  toPath: string,
  navigate: (path: string) => void,
): Promise<void> {
  const toArchive = toPath === "/archive";
  const fromArchive = fromPath === "/archive";

  if (fromArchive) {
    void preloadArchiveReturnRoom(getArchiveReturnRoom());
  } else {
    useArchiveReturnStore.getState().setOriginFromPath(fromPath);
  }

  if (toArchive) warmArchiveMedia();

  if (!canRunDissolveTransition()) {
    await hidePageChrome();
    snapHidePageChrome();
    await unrevealPageText();
    if (toArchive) resetArchiveToOrbView();
    navigate(toPath);
    await showAllRegisteredPageText();
    if (toArchive) snapShowPageChrome(true);
    else void showPageChrome(false);
    return;
  }

  await playDissolve({
    mode: "route-live",
    fov: false,
    beforeDissolve: async () => {
      await unrevealPageText();
      snapHidePageChrome();
    },
    swap: () => {
      snapHidePageChrome();
      snapHideAllRegisteredPageText();
      if (toArchive) resetArchiveToOrbView();
      navigate(toPath);
    },
    onPierceReveal: () => {
      void showAllRegisteredPageText();
      void showPageChrome(toArchive);
    },
  });
}

export function runBootDissolveTransition(
  onComplete: () => void,
  targetFov = SHARED_FOV,
  {
    swap,
    beforeDissolve,
  }: {
    swap?: () => void;
    beforeDissolve?: () => void | Promise<void>;
  } = {},
): void {
  if (!canRunDissolveTransition()) {
    onComplete();
    return;
  }

  let completed = false;
  const finish = () => {
    if (completed) return;
    completed = true;
    onComplete();
  };

  void playDissolve({
    mode: "boot",
    fov: true,
    targetFov,
    skipClose: true,
    beforeDissolve,
    swap,
    onPierceReveal: finish,
  }).catch((error: unknown) => {
    resetDissolveTransition();
    if (import.meta.env.DEV) console.error("[boot dissolve] transition failed", error);
    finish();
  });
}
