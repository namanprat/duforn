import { create } from "zustand";
import gsap from "gsap";
import { cameraBasePoseRef } from "../scenes/cam/pose";
import { BOOT_FOV, BOOT_FOV_DURATION, SHARED_FOV } from "../scenes/cam/roomPoses";
import { hidePageChrome, showPageChrome } from "../lib/pageChrome";
import { hideAllRegisteredPageText, showAllRegisteredPageText } from "../lib/text";
import { getDeviceTier } from "../lib/deviceTier";
import { prefersReducedMotion } from "../lib/prefersReducedMotion";
import { resetArchiveToOrbView } from "./archiveView";

// Single open-from-centre. The iris starts fully covered (cover = 1) so the route swap
// is hidden, then opens (cover → 0). The open is deliberately faster than the FOV punch
// so the FOV keeps settling after the scene is revealed — i.e. the punch stays visible.
const OPEN_DUR = 0.55;

type DissolveTransitionState = {
  active: boolean;
  progress: number;
  start: () => void;
  setProgress: (progress: number) => void;
  finish: () => void;
  reset: () => void;
};

/**
 * Drives the live dissolve. `progress` (0→1) is read every frame by the in-canvas
 * DissolveTransition postprocessing effect (src/scenes/transition/DissolveEffect.tsx)
 * — there is no overlay, no extra renderer, and no canvas snapshot.
 */
export const useDissolveTransitionStore = create<DissolveTransitionState>((set, get) => ({
  active: false,
  progress: 0,
  start: () => set({ active: true, progress: 0 }),
  setProgress: (progress) => {
    if (!get().active) return;
    set({ progress: Math.min(1, Math.max(0, progress)) });
  },
  finish: () => get().reset(),
  reset: () => set({ active: false, progress: 0 }),
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
  // Boot-style FOV punch (wide → normal) running alongside the open.
  fov?: boolean;
  // Route handover, run once while the screen is fully covered.
  swap?: () => void;
};

/**
 * Single open-from-centre. The iris starts fully covered (cover = 1), the route swaps
 * underneath, then the live destination opens from the centre (cover → 0). The radial
 * dissolve effect reads `cover` (store.progress) every frame. A boot-style FOV punch
 * runs concurrently and outlasts the open, so the zoom stays visible after the reveal.
 * Used for archive enter/leave AND the post-preloader boot reveal.
 */
export async function playDissolve({ fov = false, swap }: DissolveOpts = {}): Promise<void> {
  const store = useDissolveTransitionStore.getState();
  store.start();
  store.setProgress(1); // iris fully closed — hides the route swap

  swap?.();
  await waitFrames(2); // let the destination scene render under full cover

  if (fov) {
    // Owns the FOV for every dissolve (archive + boot). Punch from wide → normal over a
    // span longer than OPEN_DUR so the settle is visible once the scene is revealed.
    // Runs after RoomCam's same-pose snap so it isn't clobbered.
    gsap.killTweensOf(cameraBasePoseRef.current, "fov");
    cameraBasePoseRef.current.fov = BOOT_FOV;
    gsap.to(cameraBasePoseRef.current, {
      fov: SHARED_FOV,
      duration: BOOT_FOV_DURATION,
      ease: "power2.out",
    });
  }

  await tweenCover(1, 0, OPEN_DUR, "power2.out"); // open from centre
  store.finish();
  // The FOV tween (longer than OPEN_DUR) keeps settling after the reveal → stays visible.
}

export async function runArchiveRouteTransition(
  _fromPath: string,
  toPath: string,
  navigate: (path: string) => void,
): Promise<void> {
  const toArchive = toPath === "/archive";

  await Promise.all([hideAllRegisteredPageText(), hidePageChrome()]);
  await waitFrames(1);

  if (!canRunDissolve()) {
    if (toArchive) resetArchiveToOrbView();
    navigate(toPath);
    await waitFrames();
    await showPageChrome(toArchive);
    if (!toArchive) await showAllRegisteredPageText();
    return;
  }

  // Live center-pierce over the persistent canvas — a single open from centre, with the
  // FOV punch, both entering and leaving the archive.
  await playDissolve({
    fov: true,
    swap: () => {
      if (toArchive) resetArchiveToOrbView();
      navigate(toPath);
    },
  });

  await showPageChrome(toArchive);
  if (!toArchive) await showAllRegisteredPageText();
}

export function runBootDissolveTransition(onComplete: () => void): void {
  if (!canRunDissolve()) {
    onComplete();
    return;
  }
  // Boot reveal (after the preloader): same single open-from-centre + FOV punch as the
  // archive transitions, so the home scene pierces in with a visible FOV settle.
  void playDissolve({ fov: true }).then(onComplete);
}
