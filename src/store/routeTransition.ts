import { create } from "zustand";
import type * as THREE from "three";
import gsap from "gsap";
import { ROOM_POSES, SHARED_FOV } from "../scenes/cam/roomPoses";
import {
  ARCHIVE_FOV,
  killTransitionFovTweens,
  runTransitionFovPunch,
} from "../scenes/cam/transitionFov";
import { requestDepartingHoldout } from "../scenes/transition/departingHoldout";
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
import { getRouteNamespace, type RoomNamespace } from "../lib/route";
import { resetArchiveToOrbView } from "./archiveView";
import { useArchiveReturnStore, getArchiveReturnRoom } from "./archiveReturn";
import { preloadArchiveReturnRoom } from "../lib/roomReturnPreload";

const OPEN_DUR = 1.715;
const OPEN_EASE = "power4.out";
const FOV_EASE = "power3.out";
/** 90% through iris pierce (open 1→0) before FOV + reveal fire. */
const PIERCE_REVEAL_THRESHOLD = 0.1;

const progressTweenProxy = { value: 0 };
// ponytail: per-frame progress lives outside zustand — DissolveEffect reads this in update()
let dissolveProgress = 0;

export function getDissolveProgress(): number {
  return dissolveProgress;
}

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
  start: () => {
    dissolveProgress = 0;
    set({ active: true });
  },
  setHoldout: (holdout) => set({ holdout }),
  setUseHoldout: (useHoldout) => set({ useHoldout }),
  finish: () => get().reset(),
  reset: () => {
    dissolveProgress = 0;
    set({ active: false, useHoldout: false, holdout: null });
  },
}));

export function shouldUseDissolveTransition(fromPath: string, toPath: string): boolean {
  return (fromPath === "/archive") !== (toPath === "/archive");
}

function canRunDissolve(): boolean {
  return getDeviceTier() > 0 && !prefersReducedMotion();
}

function killDissolveTweens(): void {
  gsap.killTweensOf(progressTweenProxy);
  killTransitionFovTweens();
}

function setCover(progress: number): void {
  dissolveProgress = Math.min(1, Math.max(0, progress));
}

function waitFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

function tweenCoverOpen(onPierceReveal?: () => void): Promise<void> {
  return new Promise((resolve) => {
    if (!useDissolveTransitionStore.getState().active) return resolve();

    setCover(1);
    progressTweenProxy.value = 1;
    let revealFired = false;

    gsap.to(progressTweenProxy, {
      value: 0,
      duration: OPEN_DUR,
      ease: OPEN_EASE,
      onUpdate: () => {
        setCover(progressTweenProxy.value);
        if (!revealFired && dissolveProgress <= PIERCE_REVEAL_THRESHOLD) {
          revealFired = true;
          onPierceReveal?.();
        }
      },
      onComplete: () => {
        if (!revealFired) onPierceReveal?.();
        resolve();
      },
    });
  });
}

type DissolveOpts = {
  fov?: boolean;
  targetFov?: number;
  holdout?: boolean;
  swap?: () => void;
  beforeDissolve?: () => void | Promise<void>;
  onPierceReveal?: () => void;
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
  beforeDissolve,
  onPierceReveal,
}: DissolveOpts = {}): Promise<void> {
  killDissolveTweens();
  const store = useDissolveTransitionStore.getState();

  try {
    await beforeDissolve?.();

    if (holdout) {
      store.setUseHoldout(true);
      await requestDepartingHoldout();
    }

    store.start();
    setCover(1);
    swap?.();
    await waitFrame();

    const pierceReveal = fov
      ? () => {
          runTransitionFovPunch(targetFov, FOV_EASE);
          onPierceReveal?.();
        }
      : onPierceReveal;

    await tweenCoverOpen(pierceReveal);
  } finally {
    store.finish();
  }
}

export async function runArchiveRouteTransition(
  fromPath: string,
  toPath: string,
  navigate: (path: string) => void,
): Promise<void> {
  const toArchive = toPath === "/archive";
  const fromArchive = fromPath === "/archive";

  if (!canRunDissolve()) {
    if (toArchive) resetArchiveToOrbView();
    navigate(toPath);
    snapShowPageChrome(toArchive);
    if (!toArchive) await showAllRegisteredPageText();
    return;
  }

  if (fromArchive) void preloadArchiveReturnRoom(getArchiveReturnRoom());
  if (toArchive) useArchiveReturnStore.getState().setOriginFromPath(fromPath);

  const targetFov = targetFovForPath(toPath);

  await playDissolve({
    fov: true,
    targetFov,
    holdout: true,
    beforeDissolve: toArchive
      ? () => Promise.all([hideAllRegisteredPageText(), hidePageChrome()])
      : () => hidePageChrome(),
    swap: () => {
      snapHidePageChrome();
      snapHideAllRegisteredPageText();
      if (toArchive) resetArchiveToOrbView();
      navigate(toPath);
    },
    onPierceReveal: () => {
      if (toArchive) void showPageChrome(true);
      else void Promise.all([showAllRegisteredPageText(), showPageChrome(false)]);
    },
  });
}

export function runBootDissolveTransition(onComplete: () => void, targetFov = SHARED_FOV): void {
  if (!canRunDissolve()) {
    onComplete();
    return;
  }
  void playDissolve({ fov: true, targetFov, onPierceReveal: onComplete });
}
