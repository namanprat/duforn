// @ts-nocheck
import gsap from "gsap";

function killTweens(elements) {
  if (!elements.length) return;
  gsap.killTweensOf(elements);
}

function compactElements(elements) {
  return elements.filter(Boolean);
}

const HOME_NAMESPACE = "home";
const CONTACT_NAMESPACE = "contact";

function isHomeContactPair(a, b) {
  return (
    (a === HOME_NAMESPACE && b === CONTACT_NAMESPACE) ||
    (a === CONTACT_NAMESPACE && b === HOME_NAMESPACE)
  );
}

/**
 * One persistent R3F canvas wraps all routes. Canvas DOM wrapper slide/fade between namespaces
 * is disabled — routes swap without leave/enter motion (ink / other FX stay elsewhere).
 * Home and contact share the same canvas branch; still skip redundant canvas bookkeeping between them.
 */
export function shouldAnimateCanvasBetweenNamespaces(fromNamespace, toNamespace) {
  if (!fromNamespace || !toNamespace || fromNamespace === toNamespace) return false;
  if (isHomeContactPair(fromNamespace, toNamespace)) return false;
  return true;
}

function resetCanvasWrapper(canvasTargets) {
  if (!canvasTargets.length) return;
  killTweens(canvasTargets);
  gsap.set(canvasTargets, { autoAlpha: 1, yPercent: 0, scale: 1 });
}

export function runRouteEnterTransition({ canvasElement } = {}) {
  const canvasTargets = compactElements([canvasElement]);
  resetCanvasWrapper(canvasTargets);
  return () => {
    killTweens(canvasTargets);
  };
}

export function runRouteLeaveTransition({ canvasElement } = {}) {
  const canvasTargets = compactElements([canvasElement]);
  resetCanvasWrapper(canvasTargets);
  return Promise.resolve();
}
