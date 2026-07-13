import gsap from "gsap";
import { MOTION_TOKENS } from "../../lib/animation/motionTokens";
import {
  runTransitionFovClose,
  runTransitionFovPunch,
  killTransitionFovTweens,
} from "../cam/transitionFov";

const TOKENS = MOTION_TOKENS.bootReveal;

/** Ironhill CONFIG max — full closed cover. */
export const WIPE_CLOSED = 1.1;

const progressTweenProxy = { value: WIPE_CLOSED };
let activeProgressTimeline: gsap.core.Timeline | null = null;

// ponytail: per-frame progress lives outside zustand — DissolveEffect reads this in update()
let dissolveProgress = WIPE_CLOSED;

export function getDissolveProgress(): number {
  return dissolveProgress;
}

function setProgress(progress: number): void {
  dissolveProgress = Math.min(WIPE_CLOSED, Math.max(0, progress));
}

/** Set ironhill wipe progress (0 = open, 1.1 = closed). */
export function setDissolveCover(progress: number): void {
  setProgress(progress);
  progressTweenProxy.value = dissolveProgress;
}

export function killDissolveProgressTweens(): void {
  activeProgressTimeline?.kill();
  activeProgressTimeline = null;
  gsap.killTweensOf(progressTweenProxy);
  killTransitionFovTweens();
}

type PierceTimelineOpts = {
  targetFov?: number;
  fov?: boolean;
  onPierceReveal?: () => void;
  onComplete?: () => void;
};

type CloseTimelineOpts = {
  fromFov?: number;
  fov?: boolean;
  onComplete?: () => void;
};

/**
 * Ironhill-style wipe close: linear progress 0 → 1.1, optional FOV widen.
 */
export function runIronhillCloseTimeline({
  fromFov = 70,
  fov = false,
  onComplete,
}: CloseTimelineOpts = {}): Promise<void> {
  killDissolveProgressTweens();
  setDissolveCover(0);

  return new Promise((resolve) => {
    let settled = false;
    const settle = (completed: boolean) => {
      if (settled) return;
      settled = true;
      if (activeProgressTimeline === tl) activeProgressTimeline = null;
      if (completed) onComplete?.();
      resolve();
    };
    const tl = gsap.timeline({
      onComplete: () => settle(true),
      onInterrupt: () => settle(false),
    });
    activeProgressTimeline = tl;

    tl.to(progressTweenProxy, {
      value: WIPE_CLOSED,
      duration: TOKENS.openDuration,
      ease: TOKENS.openEase,
      onUpdate: () => setProgress(progressTweenProxy.value),
    });

    if (fov) {
      tl.call(() => runTransitionFovClose(fromFov, TOKENS.fovEase), [], 0);
    }
  });
}

/**
 * Ironhill-style wipe open: linear progress 1.1 → 0 (scroll-driven feel), optional FOV punch.
 */
export function runPierceTimeline({
  targetFov = 70,
  fov = false,
  onPierceReveal,
  onComplete,
}: PierceTimelineOpts = {}): Promise<void> {
  killDissolveProgressTweens();
  setDissolveCover(WIPE_CLOSED);

  return new Promise((resolve) => {
    let settled = false;
    let pierced = false;
    const reveal = () => {
      if (pierced) return;
      pierced = true;
      onPierceReveal?.();
    };
    const settle = (completed: boolean) => {
      if (settled) return;
      settled = true;
      if (activeProgressTimeline === tl) activeProgressTimeline = null;
      reveal();
      if (completed) onComplete?.();
      resolve();
    };
    const tl = gsap.timeline({
      onComplete: () => settle(true),
      // ponytail: interruption is cleanup, not an error; let playDissolve reach finally.
      onInterrupt: () => settle(false),
    });
    activeProgressTimeline = tl;

    // Linear like ironhill scroll — no hold beat, continuous wipe.
    tl.to(progressTweenProxy, {
      value: 0,
      duration: TOKENS.openDuration,
      ease: TOKENS.openEase,
      onUpdate: () => setProgress(progressTweenProxy.value),
    });

    if (fov) {
      tl.call(() => runTransitionFovPunch(targetFov, TOKENS.fovEase), [], 0);
    }

    tl.call(reveal, [], TOKENS.openDuration * TOKENS.pierceRevealAt);
  });
}
