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
const CLOSE_DUR = OPEN_DUR;
const OPEN_EASE = "power4.out";
const CLOSE_EASE = "power4.in";
const FOV_EASE = "power3.out";
/** 70% through iris open (1→0) before FOV punch fires. */
const FOV_LEAVE_THRESHOLD = 0.3;

const progressTweenProxy = { value: 0 };

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

function killDissolveTweens(): void {
  gsap.killTweensOf(progressTweenProxy);
  killTransitionFovTweens();
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

function tweenCover(
  from: number,
  to: number,
  duration: number,
  ease: string,
  onUpdate?: (value: number) => void,
): Promise<void> {
  return new Promise((resolve) => {
    const store = useDissolveTransitionStore.getState();
    store.setProgress(from);
    progressTweenProxy.value = from;
    gsap.to(progressTweenProxy, {
      value: to,
      duration,
      ease,
      onUpdate: () => {
        store.setProgress(progressTweenProxy.value);
        onUpdate?.(progressTweenProxy.value);
      },
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
  killDissolveTweens();
  const store = useDissolveTransitionStore.getState();

  try {
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
  } finally {
    store.finish();
  }
}

type ArchiveDissolveOpts = {
  targetFov: number;
  swap: () => void;
};

/** Archive → room: unreveal text/chrome, iris open, FOV at 70%. */
async function playDissolveLeaveArchive({ targetFov, swap }: ArchiveDissolveOpts): Promise<void> {
  killDissolveTweens();
  const store = useDissolveTransitionStore.getState();

  try {
    await Promise.all([hideAllRegisteredPageText(), hidePageChrome()]);

    store.setUseHoldout(true);
    await requestDepartingHoldout();

    store.start();
    store.setProgress(1);
    swap();
    await waitFrames(2);

    let fovFired = false;
    await tweenCover(1, 0, OPEN_DUR, OPEN_EASE, (value) => {
      if (!fovFired && value <= FOV_LEAVE_THRESHOLD) {
        fovFired = true;
        runTransitionFovPunch(targetFov, FOV_EASE);
      }
    });
  } finally {
    store.finish();
  }
}

type ArchiveEnterOpts = {
  swap: () => void;
};

/** Room → archive: FOV punch, iris close, swap, chrome reveal. */
async function playDissolveEnterArchive({ swap }: ArchiveEnterOpts): Promise<void> {
  killDissolveTweens();
  const store = useDissolveTransitionStore.getState();

  try {
    runTransitionFovPunch(ARCHIVE_FOV, FOV_EASE);

    store.setUseHoldout(true);
    await requestDepartingHoldout();

    store.start();
    await tweenCover(0, 1, CLOSE_DUR, CLOSE_EASE);

    snapHidePageChrome();
    snapHideAllRegisteredPageText();
    swap();
    await waitFrames(2);

    store.setProgress(0);
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

  if (fromArchive) {
    void preloadArchiveReturnRoom(getArchiveReturnRoom());
    await playDissolveLeaveArchive({
      targetFov: targetFovForPath(toPath),
      swap: () => {
        snapHidePageChrome();
        snapHideAllRegisteredPageText();
        navigate(toPath);
      },
    });
    snapShowPageChrome(false);
    await showAllRegisteredPageText();
    return;
  }

  useArchiveReturnStore.getState().setOriginFromPath(fromPath);

  await playDissolveEnterArchive({
    swap: () => {
      resetArchiveToOrbView();
      navigate(toPath);
    },
  });
  await showPageChrome(true);
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
