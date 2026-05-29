// @ts-nocheck
/**
 * Shared reveal-gating utilities used by TextRevealLines and CameraRevealGroup.
 *
 * - `prefersReducedMotion()` — media-query check.
 * - `resolveMotionTokens(reduce)` — returns the four duration/stagger numbers,
 *   collapsed to ~0 when the user prefers reduced motion.
 * - `waitForPreloader(onReady)` — invokes `onReady` once the intro preloader is
 *   gone (or immediately if it never mounted). Returns a disposer that detaches
 *   the listener.
 * - `waitForCamera(root, onReady)` — invokes `onReady` once the camera arrives
 *   at the page's namespace (scoped via `[data-page-namespace]`). Returns a
 *   disposer.
 */
import { MOTION_TOKENS } from "../lib/anim/tokens";
import { CAMERA_ARRIVED_EVENT, getArrivedRoom } from "../lib/cam/arrival";
import { PRELOADER_DISMISSED_EVENT } from "../lib/preload/events";

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function resolveMotionTokens(reduce: boolean) {
  const t = MOTION_TOKENS.textReveal;
  return {
    revealDuration: reduce ? 0.05 : t.revealDuration,
    revealStagger: reduce ? 0 : t.revealStagger,
    hideDuration: reduce ? 0.05 : t.hideDuration,
    hideStagger: reduce ? 0 : t.hideStagger,
  };
}

export function waitForPreloader(onReady: () => void): () => void {
  const preloaderEl =
    typeof document !== "undefined" ? document.querySelector(".intro-preloader") : null;
  if (!preloaderEl) {
    onReady();
    return () => {};
  }
  const handler = () => {
    window.removeEventListener(PRELOADER_DISMISSED_EVENT, handler);
    onReady();
  };
  window.addEventListener(PRELOADER_DISMISSED_EVENT, handler);
  return () => window.removeEventListener(PRELOADER_DISMISSED_EVENT, handler);
}

export function waitForCamera(root: Element | null, onReady: () => void): () => void {
  const host = root?.closest?.("[data-page-namespace]") ?? null;
  const expectedRoom = host?.dataset?.pageNamespace ?? null;
  const isReady = expectedRoom ? getArrivedRoom() === expectedRoom : getArrivedRoom() != null;
  if (isReady) {
    onReady();
    return () => {};
  }
  const handler = (e: CustomEvent) => {
    if (expectedRoom && e?.detail?.room !== expectedRoom) return;
    window.removeEventListener(CAMERA_ARRIVED_EVENT, handler as EventListener);
    onReady();
  };
  window.addEventListener(CAMERA_ARRIVED_EVENT, handler as EventListener);
  return () => window.removeEventListener(CAMERA_ARRIVED_EVENT, handler as EventListener);
}
