import { create } from "zustand";
import type * as THREE from "three";
import gsap from "gsap";
import { ROOM_POSES, SHARED_FOV } from "../scenes/cam/roomPoses";
import { ARCHIVE_FOV, runTransitionFovPunch } from "../scenes/cam/transitionFov";
import { requestDepartingHoldout } from "../scenes/transition/departingHoldout";
import { snapHidePageChrome, snapShowPageChrome } from "../lib/pageChrome";
import { showAllRegisteredPageText, snapHideAllRegisteredPageText } from "../lib/text";
import { getDeviceTier } from "../lib/deviceTier";
import { prefersReducedMotion } from "../lib/prefersReducedMotion";
import { getRouteNamespace, type RoomNamespace } from "../lib/route";
import { resetArchiveToOrbView } from "./archiveView";

const OPEN_DUR = 1.715;
const OPEN_EASE = "power4.out";
const FOV_EASE = "power3.out";

type DissolveTransitionState = {
  active: boolean;
  progress: number;
  useHoldout: boolean;
  holdout: THREE.Texture | null;
  start: () => void;
  setProgress: (progress: number) => void;
  setHoldout: (texture: THREE.Texture) => void;
  setUseHoldout: (useHoldout: boolean) => void;
  finish: () => void;
  reset: () => void;
};

export const useDissolveTransitionStore = create<DissolveTransitionState>((set, get) => ({
  active: false,
  progress: 0,
  useHoldout: false,
  holdout: null,
  start: () => set({ active: true, progress: 0 }),
  setProgress: (progress) => {
    if (!get().active) return;
    set({ progress: Math.min(1, Math.max(0, progress)) });
  },
  setHoldout: (holdout) => set({ holdout }),
  setUseHoldout: (useHoldout) => set({ useHoldout }),
  finish: () => get().reset(),
  reset: () => set({ active: false, progress: 0, useHoldout: false, holdout: null }),
}));

export function shouldUseDissolveTransition(fromPath: string, toPath: string): boolean {
  const fromArchive = fromPath === "/archive";
  const toArchive = toPath === "/archive";
  return fromArchive !== toArchive;
}

function canRunDissolve(): boolean {
  return getDeviceTier() > 0 && !prefersReducedMotion();
}

function waitFrames(count = 2): Promise<void> {
  return new Promise((resolve) => {
    let remaining = count;
    const step = () => {
      remaining -= 1;
      if (remaining <= 0) resolve();
      else requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

function tweenCover(from: number, to: number, duration: number, ease: string): Promise<void> {
  return new Promise((resolve) => {
    const store = useDissolveTransitionStore.getState();
    store.setProgress(from);
    const c = { value: from };
    gsap.to(c, {
      value: to,
      duration,
      ease,
      onUpdate: () => store.setProgress(c.value),
      onComplete: () => resolve(),
    });
  });
}

type DissolveOpts = {
  fov?: boolean;
  targetFov?: number;
  holdout?: boolean;
  swap?: () => void;
};

function targetFovForPath(path: string): number {
  if (path === "/archive") return ARCHIVE_FOV;
  const ns = getRouteNamespace(path);
  if (ns === "main" || ns === "work" || ns === "contact") {
    return ROOM_POSES[ns as RoomNamespace].fov;
  }
  return SHARED_FOV;
}

export async function playDissolve({
  fov = false,
  targetFov = SHARED_FOV,
  holdout = false,
  swap,
}: DissolveOpts = {}): Promise<void> {
  const store = useDissolveTransitionStore.getState();

  if (holdout) {
    store.setUseHoldout(true);
    await requestDepartingHoldout();
  }

  store.start();
  store.setProgress(1);

  swap?.();
  await waitFrames(2);

  if (fov) {
    runTransitionFovPunch(targetFov, FOV_EASE);
  }

  await tweenCover(1, 0, OPEN_DUR, OPEN_EASE);
  store.finish();
}

export async function runArchiveRouteTransition(
  _fromPath: string,
  toPath: string,
  navigate: (path: string) => void,
): Promise<void> {
  const toArchive = toPath === "/archive";

  if (!canRunDissolve()) {
    if (toArchive) resetArchiveToOrbView();
    navigate(toPath);
    snapShowPageChrome(toArchive);
    if (!toArchive) await showAllRegisteredPageText();
    return;
  }

  await playDissolve({
    fov: true,
    targetFov: targetFovForPath(toPath),
    holdout: true,
    swap: () => {
      snapHidePageChrome();
      snapHideAllRegisteredPageText();
      if (toArchive) resetArchiveToOrbView();
      navigate(toPath);
    },
  });

  snapShowPageChrome(toArchive);
  if (!toArchive) await showAllRegisteredPageText();
}

export function runBootDissolveTransition(onComplete: () => void, targetFov = SHARED_FOV): void {
  if (!canRunDissolve()) {
    onComplete();
    return;
  }
  // `targetFov` is the landing room's resting fov so a deep-link/refresh into /work settles the
  // boot punch at the work fov, not SHARED_FOV (which left work rendering at the wrong FOV).
  void playDissolve({ fov: true, targetFov }).then(onComplete);
}
