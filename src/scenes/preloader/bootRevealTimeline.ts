import gsap from "gsap";
import { MOTION_TOKENS } from "../../lib/animation/motionTokens";
import {
  runTransitionFovClose,
  runTransitionFovPunch,
  killTransitionFovTweens,
} from "../cam/transitionFov";
import { ARCHIVE_FOV } from "../cam/transitionFov";

const TOKENS = MOTION_TOKENS.bootReveal;

const progressTweenProxy = { value: 1 };

// ponytail: per-frame progress lives outside zustand — DissolveEffect reads this in update()
let dissolveProgress = 1;

export function getDissolveProgress(): number {
  return dissolveProgress;
}

function setCover(progress: number): void {
  dissolveProgress = Math.min(1, Math.max(0, progress));
}

export function setDissolveCover(progress: number): void {
  setCover(progress);
  progressTweenProxy.value = progress;
}

export function killDissolveProgressTweens(): void {
  gsap.killTweensOf(progressTweenProxy);
  killTransitionFovTweens();
}

type PierceTimelineOpts = {
  targetFov?: number;
  fov?: boolean;
  onSwap?: () => void;
  onPierceReveal?: () => void;
  onComplete?: () => void;
};

/**
 * Single GSAP timeline: hold at full cover → iris 1→0, optional FOV punch, pierce-reveal at burst peak.
 */
export function runPierceTimeline({
  targetFov = 70,
  fov = false,
  onSwap,
  onPierceReveal,
  onComplete,
}: PierceTimelineOpts = {}): Promise<void> {
  killDissolveProgressTweens();
  setDissolveCover(1);

  return new Promise((resolve) => {
    const tl = gsap.timeline({
      onComplete: () => {
        onComplete?.();
        resolve();
      },
    });

    // Beat 1 — full cover, stars gather (no iris hole yet)
    tl.to(progressTweenProxy, {
      value: 1,
      duration: TOKENS.holdDuration,
      onUpdate: () => setCover(progressTweenProxy.value),
    });

    // Beat 2 — iris opens center-out
    tl.to(
      progressTweenProxy,
      {
        value: 0,
        duration: TOKENS.openDuration,
        ease: TOKENS.openEase,
        onUpdate: () => setCover(progressTweenProxy.value),
      },
      ">0",
    );

    if (onSwap) {
      tl.call(onSwap, [], TOKENS.holdDuration);
    }

    if (fov) {
      tl.call(() => runTransitionFovPunch(targetFov, TOKENS.fovEase), [], TOKENS.holdDuration);
    }

    const pierceAt =
      TOKENS.holdDuration + TOKENS.openDuration * TOKENS.pierceRevealAt;
    tl.call(() => onPierceReveal?.(), [], pierceAt);
  });
}

type PierceCloseTimelineOpts = {
  fromFov?: number;
  fov?: boolean;
  onComplete?: () => void;
};

/** Reverse of runPierceTimeline: iris closes outside-in, hold at full cover. */
export function runPierceCloseTimeline({
  fromFov = ARCHIVE_FOV,
  fov = false,
  onComplete,
}: PierceCloseTimelineOpts = {}): Promise<void> {
  killDissolveProgressTweens();
  setDissolveCover(0);

  return new Promise((resolve) => {
    const tl = gsap.timeline({
      onComplete: () => {
        onComplete?.();
        resolve();
      },
    });

    tl.to(progressTweenProxy, {
      value: 1,
      duration: TOKENS.openDuration,
      ease: TOKENS.openEase,
      onUpdate: () => setCover(progressTweenProxy.value),
    });

    if (fov) {
      tl.call(() => runTransitionFovClose(fromFov, TOKENS.fovEase), [], 0);
    }

    tl.to(
      progressTweenProxy,
      {
        value: 1,
        duration: TOKENS.holdDuration,
        onUpdate: () => setCover(progressTweenProxy.value),
      },
      ">0",
    );
  });
}
