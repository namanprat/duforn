import { getDeviceTier, isMobileDevice } from "../lib/deviceTier";
import { prefersReducedMotion } from "../lib/prefersReducedMotion";

export const BUST_URL = "/naman_bust.glb";

export function shouldMountAboutBust(): boolean {
  if (getDeviceTier() === 0) return false;
  if (isMobileDevice()) return false;
  return !prefersReducedMotion();
}
