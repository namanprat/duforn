import gsap from "gsap";

const LINK_SELECTOR =
  ".site-header a, .site-header button, .menu-nav__link, .contact-content a, a.button, button.button";

const linkInstances = new Map<Element, object>();
const attachedHoverInstances = new Map<Element, any>();

/** Used by components to decide if rotate markup runs in React (survives re-renders). */
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
  cleanupStaleLinkHover();
  const navLinks = document.querySelectorAll(LINK_SELECTOR);

  navLinks.forEach((link) => {
    if (linkInstances.has(link)) return;
    if (link.hasAttribute("data-rotate-hover")) return;
    linkInstances.set(link, {});
  });
}

function resolveHoverTextConfig(input: any) {
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
 * Optional hover for a single element: whole-element opacity (no per-letter motion).
 * With { baseText, hoverText }, swaps label on enter/leave without animating glyphs.
 */
export function attachLinkHoverEffect(element: Element, textOrConfig: any) {
  const config = resolveHoverTextConfig(textOrConfig);
  if (!element || !config) return () => {};

  if (attachedHoverInstances.has(element)) {
    return () => detachLinkHoverEffect(element);
  }

  const hasHoverInput = supportsHoverInput();
  const instance: any = {};

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

export function detachLinkHoverEffect(element: Element) {
  const instance = attachedHoverInstances.get(element);
  if (!instance) return;
  cleanupLink(element, instance);
  attachedHoverInstances.delete(element);
}

function cleanupLink(link: any, instance: any, { restoreText = true } = {}) {
  if (!instance) return;

  gsap.killTweensOf(link);
  gsap.set(link, { clearProps: "opacity" });

  if (instance.handleEnter) link.removeEventListener("mouseenter", instance.handleEnter);
  if (instance.handleLeave) link.removeEventListener("mouseleave", instance.handleLeave);

  if (restoreText && instance.originalText != null) {
    link.textContent = instance.originalText;
  }
}

function cleanupStaleLinkHover() {
  for (const [link, instance] of linkInstances.entries()) {
    if ((link as any).isConnected) continue;
    cleanupLink(link, instance, { restoreText: false });
    linkInstances.delete(link);
  }
}

export function destroyLinkHover() {
  for (const [link, instance] of linkInstances.entries()) {
    cleanupLink(link, instance);
    linkInstances.delete(link);
  }
  for (const [el, instance] of attachedHoverInstances.entries()) {
    cleanupLink(el, instance);
    attachedHoverInstances.delete(el);
  }
}
