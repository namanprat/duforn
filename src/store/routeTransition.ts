import { create } from "zustand";
import type * as THREE from "three";
import { ROOM_POSES, SHARED_FOV } from "../scenes/cam/roomPoses";
import { ARCHIVE_FOV } from "../scenes/cam/transitionFov";
import {
  getBlackHoldoutTexture,
  requestDepartingHoldout,
} from "../scenes/transition/departingHoldout";
import {
  killDissolveProgressTweens,
  runPierceCloseTimeline,
  runPierceTimeline,
  setDissolveCover,
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
import { getRouteNamespace, type RoomNamespace } from "../lib/route";
import { resetArchiveToOrbView } from "./archiveView";
import { useArchiveReturnStore, getArchiveReturnRoom } from "./archiveReturn";
import { preloadArchiveReturnRoom } from "../lib/roomReturnPreload";

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

export function shouldUseDissolveTransition(fromPath: string, toPath: string): boolean {
  return (fromPath === "/archive") !== (toPath === "/archive");
}

function canRunDissolve(): boolean {
  return getDeviceTier() > 0 && !prefersReducedMotion();
}

function waitFrames(count: number): Promise<void> {
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

async function armDepartingHoldout(
  store: Pick<DissolveTransitionState, "setUseHoldout" | "setHoldout">,
): Promise<void> {
  store.setUseHoldout(true);
  store.setHoldout(getBlackHoldoutTexture());
  const texture = await requestDepartingHoldout();
  store.setHoldout(texture);
}

type DissolveOpts = {
  fov?: boolean;
  targetFov?: number;
  holdout?: "black" | "departing";
  /** When to run swap — archive delays until gather beat ends (live canvas). */
  swapAt?: "pre" | "hold";
  swap?: () => void;
  beforeDissolve?: () => void | Promise<void>;
  onPierceReveal?: () => void;
};

type DissolveCloseOpts = {
  fov?: boolean;
  fromFov?: number;
  targetFov?: number;
  holdout?: "departing";
  swap?: () => void;
  beforeDissolve?: () => void | Promise<void>;
  onComplete?: () => void;
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
  holdout,
  swapAt = "pre",
  swap,
  beforeDissolve,
  onPierceReveal,
}: DissolveOpts = {}): Promise<void> {
  killDissolveProgressTweens();
  const store = useDissolveTransitionStore.getState();

  try {
    await beforeDissolve?.();

    if (holdout === "black") {
      store.setUseHoldout(true);
      store.setHoldout(getBlackHoldoutTexture());
    } else if (holdout === "departing") {
      await armDepartingHoldout(store);
    } else {
      store.setUseHoldout(false);
    }

    store.start();
    setDissolveCover(1);
    if (swapAt === "pre") swap?.();
    await waitFrames(2);

    await runPierceTimeline({
      fov,
      targetFov,
      onSwap: swapAt === "hold" ? swap : undefined,
      onPierceReveal,
    });
  } finally {
    store.finish();
  }
}

/** Exact reverse of playDissolve: capture → close → hold → swap → hold → open. */
export async function playDissolveClose({
  fov = false,
  fromFov = ARCHIVE_FOV,
  targetFov = SHARED_FOV,
  holdout,
  swap,
  beforeDissolve,
  onComplete,
}: DissolveCloseOpts = {}): Promise<void> {
  killDissolveProgressTweens();
  const store = useDissolveTransitionStore.getState();

  try {
    await beforeDissolve?.();

    if (holdout === "departing") {
      await armDepartingHoldout(store);
    } else {
      store.setUseHoldout(false);
    }

    store.start();
    setDissolveCover(0);
    await waitFrames(2);

    await runPierceCloseTimeline({ fov, fromFov });

    swap?.();

    await runPierceTimeline({
      fov,
      targetFov,
      onPierceReveal: onComplete,
    });
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

  if (fromArchive) {
    void preloadArchiveReturnRoom(getArchiveReturnRoom());

    if (!canRunDissolve()) {
      await hidePageChrome();
      snapHidePageChrome();
      snapHideAllRegisteredPageText();
      navigate(toPath);
      await showAllRegisteredPageText();
      void showPageChrome(false);
      return;
    }

    const targetFov = targetFovForPath(toPath);

    await playDissolveClose({
      fov: true,
      fromFov: ARCHIVE_FOV,
      targetFov,
      holdout: "departing",
      beforeDissolve: () => Promise.all([hideAllRegisteredPageText(), hidePageChrome()]),
      swap: () => {
        snapHidePageChrome();
        snapHideAllRegisteredPageText();
        navigate(toPath);
      },
      onComplete: () => {
        void showAllRegisteredPageText();
        void showPageChrome(false);
      },
    });
    return;
  }

  if (!canRunDissolve()) {
    resetArchiveToOrbView();
    navigate(toPath);
    snapShowPageChrome(true);
    return;
  }

  useArchiveReturnStore.getState().setOriginFromPath(fromPath);

  const targetFov = targetFovForPath(toPath);

  await playDissolve({
    fov: true,
    targetFov,
    holdout: "departing",
    swapAt: "pre",
    beforeDissolve: () => Promise.all([hideAllRegisteredPageText(), hidePageChrome()]),
    swap: () => {
      snapHidePageChrome();
      snapHideAllRegisteredPageText();
      resetArchiveToOrbView();
      navigate(toPath);
    },
    onPierceReveal: () => {
      void showPageChrome(true);
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
  if (!canRunDissolve()) {
    onComplete();
    return;
  }

  void playDissolve({
    fov: true,
    targetFov,
    holdout: "black",
    beforeDissolve,
    swap,
    onPierceReveal: onComplete,
  });
}
