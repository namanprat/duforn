// @ts-nocheck
/**
 * Route helpers for the archive “burn” transition (any namespace crossing archive).
 */

export function crossesArchive(fromNamespace, toNamespace) {
  if (!fromNamespace || !toNamespace || fromNamespace === toNamespace) return false;
  return fromNamespace === "archive" || toNamespace === "archive";
}

let skipNextCanvasEnterTransition = false;

export function setArchiveBurnSkipNextCanvasEnter() {
  skipNextCanvasEnterTransition = true;
}

export function consumeArchiveBurnSkipNextCanvasEnter() {
  const v = skipNextCanvasEnterTransition;
  skipNextCanvasEnterTransition = false;
  return v;
}

/** @type {{ current: null | { showFromCanvas: Function, playDissolve: Function, hide: Function } }} */
const overlayRef = { current: null };

/** @param {null | { showFromCanvas: Function, playDissolve: Function, hide: Function }} api */
export function registerArchiveBurnOverlay(api) {
  overlayRef.current = api;
}

export function getArchiveBurnOverlay() {
  return overlayRef.current;
}

export function getArchiveBurnMotionPrefs() {
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  if (reduced) {
    return {
      durationMs: 280,
      simpleFade: true,
      rimIntensity: 0,
      noiseAmp: 0,
    };
  }
  return {
    durationMs: 1100,
    simpleFade: false,
    rimIntensity: 1.15,
    noiseAmp: 0.14,
  };
}

export function waitForNextPaint() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve);
    });
  });
}
