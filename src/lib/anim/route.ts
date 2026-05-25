// @ts-nocheck
import gsap from "gsap";

function killTweens(elements) {
  if (!elements.length) return;
  gsap.killTweensOf(elements);
}

function compactElements(elements) {
  return elements.filter(Boolean);
}

const ROOM_NAMESPACES = new Set(["main", "contact", "work"]);

function isRoomFamilyPair(a, b) {
  return ROOM_NAMESPACES.has(a) && ROOM_NAMESPACES.has(b);
}

/**
 * One persistent R3F canvas wraps all routes. Canvas DOM wrapper slide/fade between namespaces
 * is disabled — room-family routes swap without leave/enter motion (camera + text only).
 */
export function shouldAnimateCanvasBetweenNamespaces(fromNamespace, toNamespace) {
  if (!fromNamespace || !toNamespace || fromNamespace === toNamespace) return false;
  if (isRoomFamilyPair(fromNamespace, toNamespace)) return false;
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
