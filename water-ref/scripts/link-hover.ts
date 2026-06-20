// @ts-nocheck
import gsap from "gsap";

const attachedHoverInstances = new Map();

/** Used by NavLink to decide if rotate markup runs in React (survives re-renders). */
export function shouldUseNavRotateHover() {
  if (typeof window === "undefined") return false;
  if (!window.matchMedia("(hover: hover)").matches) return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  return true;
}

function supportsHoverInput() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return true;
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

export function initLinkHover() {
  // Nav rotate hover is handled in React (`RotateHoverLabel`).
}

function resolveHoverTextConfig(input) {
  if (typeof input === "string") {
    const trimmed = input.trim();
    return { baseText: trimmed, hoverText: trimmed };
  }

  if (!input || typeof input !== "object") return null;
  const baseText = input.baseText?.trim();
  const hoverText = input.hoverText?.trim();
  if (!baseText || !hoverText) return null;
  return { baseText, hoverText };
}

/**
 * Optional hover for a single element: swaps label on enter/leave without animating glyphs.
 */
export function attachLinkHoverEffect(element, textOrConfig) {
  const config = resolveHoverTextConfig(textOrConfig);
  if (!element || !config) return () => {};

  if (attachedHoverInstances.has(element)) {
    return () => detachLinkHoverEffect(element);
  }

  const hasHoverInput = supportsHoverInput();
  const instance = {};

  if (!hasHoverInput) {
    element.textContent = config.hoverText;
    attachedHoverInstances.set(element, { ...instance, originalText: config.baseText });
    return () => detachLinkHoverEffect(element);
  }

  element.textContent = config.baseText;

  const sameCopy = config.baseText === config.hoverText;

  const handleEnter = () => {
    if (!sameCopy) element.textContent = config.hoverText;
  };

  const handleLeave = () => {
    if (!sameCopy) element.textContent = config.baseText;
  };

  element.addEventListener("mouseenter", handleEnter);
  element.addEventListener("mouseleave", handleLeave);

  attachedHoverInstances.set(element, {
    ...instance,
    originalText: config.baseText,
    handleEnter,
    handleLeave,
  });

  return () => detachLinkHoverEffect(element);
}

export function detachLinkHoverEffect(element) {
  const instance = attachedHoverInstances.get(element);
  if (!instance) return;
  cleanupLink(element, instance);
  attachedHoverInstances.delete(element);
}

function cleanupLink(link, instance, { restoreText = true } = {}) {
  if (!instance) return;

  gsap.killTweensOf(link);
  gsap.set(link, { clearProps: "opacity" });

  if (instance.handleEnter) link.removeEventListener("mouseenter", instance.handleEnter);
  if (instance.handleLeave) link.removeEventListener("mouseleave", instance.handleLeave);

  if (restoreText && instance.originalText != null) {
    link.textContent = instance.originalText;
  }
}

export function destroyLinkHover() {
  for (const [el, instance] of attachedHoverInstances.entries()) {
    cleanupLink(el, instance);
    attachedHoverInstances.delete(el);
  }
}
