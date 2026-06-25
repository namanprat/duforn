import gsap from "gsap";
import { ARCHIVE_CONFIG } from "./archiveConfig";
import { rigState, resetRigToOrb } from "./rigState";

let tween: gsap.core.Tween | null = null;

/** GSAP-driven morph between orb (0) and grid (1). */
export function requestArchiveMorph(onComplete?: () => void) {
  tween?.kill();
  rigState.isMorphing = true;

  if (rigState.morphTarget >= 1) {
    rigState.yawTarget = 0;
    rigState.pitchTarget = 0;
  }

  tween = gsap.to(rigState, {
    morph: rigState.morphTarget,
    duration: ARCHIVE_CONFIG.morphDuration,
    ease: "power2.inOut",
    onComplete: () => {
      rigState.isMorphing = false;
      if (rigState.morphTarget < 0.5) resetRigToOrb();
      tween = null;
      onComplete?.();
    },
  });
}
