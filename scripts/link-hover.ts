// @ts-nocheck
import gsap from "gsap";
import { triggerNavHaptic } from "./haptic-feedback";

const LINK_SELECTOR =
  ".nav-wrap a, .bottom-nav-wrap a, .contact-info a, .contact-content a, .menu-fullscreen__nav a, a.button, button.button";
const linkInstances = new Map();
const attachedHoverInstances = new Map();

/** Used by NavLink to decide if rotate markup runs in React (survives re-renders). */
export function shouldUseNavRotateHover() {
  if (typeof window === "undefined") return false;
  if (!window.matchMedia("(hover: hover)").matches) return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  return true;
}

function supportsTouchInput() {
  if (typeof navigator !== "undefined" && navigator.maxTouchPoints > 0) return true;
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

function supportsHoverInput() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return true;
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

export function initLinkHover() {
  cleanupStaleLinkHover();
  const navLinks = document.querySelectorAll(LINK_SELECTOR);
  const hasTouchInput = supportsTouchInput();
  const hasHoverInput = supportsHoverInput();

  navLinks.forEach((link) => {
    if (link.id === "time" || link.classList.contains("menu-toggle-btn") || linkInstances.has(link))
      return;

    const instance = {};

    if (hasTouchInput) {
      const handleTouchStart = () => {
        triggerNavHaptic("nudge");
      };

      link.addEventListener("touchstart", handleTouchStart, { passive: true });
      instance.handleTouchStart = handleTouchStart;
    }

    if (!hasHoverInput) {
      linkInstances.set(link, instance);
      return;
    }

    /** GSAP + glyphs handled in React (`RotateHoverLabel`); only attach click haptic here. */
    if (link.hasAttribute("data-rotate-hover")) {
      const handleClick = () => {
        triggerNavHaptic("click");
      };
      link.addEventListener("click", handleClick);
      linkInstances.set(link, {
        ...instance,
        handleClick,
      });
      return;
    }

    const handleEnter = () => {
      if (link.getAttribute("aria-current") === "page") return;
      triggerNavHaptic("hover");
    };

    const handleClick = () => {
      triggerNavHaptic("click");
    };

    link.addEventListener("mouseenter", handleEnter);
    link.addEventListener("click", handleClick);

    linkInstances.set(link, {
      ...instance,
      handleEnter,
      handleClick,
    });
  });
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
 * Optional hover for a single element: whole-element opacity (no per-letter motion).
 * With { baseText, hoverText }, swaps label on enter/leave without animating glyphs.
 */
export function attachLinkHoverEffect(element, textOrConfig) {
  const config = resolveHoverTextConfig(textOrConfig);
  if (!element || !config) return () => {};

  if (attachedHoverInstances.has(element)) {
    return () => detachLinkHoverEffect(element);
  }

  const hasTouchInput = supportsTouchInput();
  const hasHoverInput = supportsHoverInput();
  const instance = {};

  if (hasTouchInput) {
    const handleTouchStart = () => {
      triggerNavHaptic("nudge");
    };
    element.addEventListener("touchstart", handleTouchStart, { passive: true });
    instance.handleTouchStart = handleTouchStart;
  }

  if (!hasHoverInput) {
    element.textContent = config.hoverText;
    attachedHoverInstances.set(element, { ...instance, originalText: config.baseText });
    return () => detachLinkHoverEffect(element);
  }

  element.textContent = config.baseText;

  const sameCopy = config.baseText === config.hoverText;

  const handleEnter = () => {
    if (!sameCopy) element.textContent = config.hoverText;
    triggerNavHaptic("hover");
  };

  const handleLeave = () => {
    if (!sameCopy) element.textContent = config.baseText;
  };

  const handleClick = () => {
    triggerNavHaptic("click");
  };

  element.addEventListener("mouseenter", handleEnter);
  element.addEventListener("mouseleave", handleLeave);
  element.addEventListener("click", handleClick);

  attachedHoverInstances.set(element, {
    ...instance,
    originalText: config.baseText,
    handleEnter,
    handleLeave,
    handleClick,
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

  if (instance.handleTouchStart) {
    link.removeEventListener("touchstart", instance.handleTouchStart);
  }

  if (instance.handleEnter) link.removeEventListener("mouseenter", instance.handleEnter);
  if (instance.handleLeave) link.removeEventListener("mouseleave", instance.handleLeave);
  if (instance.handleClick) link.removeEventListener("click", instance.handleClick);

  if (restoreText && instance.originalText != null) {
    link.textContent = instance.originalText;
  }
}

function cleanupStaleLinkHover() {
  for (const [link, instance] of linkInstances.entries()) {
    if (link.isConnected) continue;
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
