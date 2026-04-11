// @ts-nocheck
import gsap from "gsap";
import { triggerNavHaptic } from "./haptic-feedback";
import { REVEAL_TEXT_TIME_SCALE } from "./reveal-timing";

const ANIM_CONFIG = {
  duration: 0.42 * REVEAL_TEXT_TIME_SCALE,
  ease: "power2.inOut",
  stagger: 0.014 * REVEAL_TEXT_TIME_SCALE,
  overlap: 0.08 * REVEAL_TEXT_TIME_SCALE,
};

const LINK_SELECTOR = ".nav-wrap a, .bottom-nav-wrap a, .contact-info a";
const linkInstances = new Map();
/** Manually attached hosts (e.g. preloader CTA) — same char-layer hover as nav links. */
const attachedHoverInstances = new Map();

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

    const originalText = link.textContent || "";
    const trimmedText = originalText.trim();
    if (!trimmedText) return;

    const { viewport, baseLayer, hoverLayer } = mountLayers(link, trimmedText);

    let tl = null;

    const handleEnter = () => {
      if (link.getAttribute("aria-current") === "page") return;
      tl?.kill();
      tl = animateChars(baseLayer.chars, hoverLayer.chars, true);
      triggerNavHaptic("hover");
    };

    const handleLeave = () => {
      if (link.getAttribute("aria-current") === "page") return;
      tl?.kill();
      tl = animateChars(baseLayer.chars, hoverLayer.chars, false);
    };

    const handleClick = () => {
      triggerNavHaptic("click");
    };

    link.addEventListener("mouseenter", handleEnter);
    link.addEventListener("mouseleave", handleLeave);
    link.addEventListener("click", handleClick);

    linkInstances.set(link, {
      ...instance,
      originalText: trimmedText,
      handleEnter,
      handleLeave,
      handleClick,
      getTween: () => tl,
      viewport,
      baseLayer,
      hoverLayer,
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
 * Mounts the same dual-layer character hover used on nav links.
 * Accepts:
 * - string: both layers use same text
 * - object: { baseText, hoverText } for replacement transitions
 * @returns {() => void} detach — call on unmount
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
    attachedHoverInstances.set(element, instance);
    return () => detachLinkHoverEffect(element);
  }

  const { viewport, baseLayer, hoverLayer } = mountLayers(
    element,
    config.baseText,
    config.hoverText,
  );
  let tl = null;

  const handleEnter = () => {
    tl?.kill();
    tl = animateChars(baseLayer.chars, hoverLayer.chars, true);
    triggerNavHaptic("hover");
  };

  const handleLeave = () => {
    tl?.kill();
    tl = animateChars(baseLayer.chars, hoverLayer.chars, false);
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
    getTween: () => tl,
    viewport,
    baseLayer,
    hoverLayer,
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

  if (instance.handleTouchStart) {
    link.removeEventListener("touchstart", instance.handleTouchStart);
  }

  if (instance.getTween) {
    const activeTween = instance.getTween();
    if (activeTween) activeTween.kill();
  }

  if (instance.handleEnter) link.removeEventListener("mouseenter", instance.handleEnter);
  if (instance.handleLeave) link.removeEventListener("mouseleave", instance.handleLeave);
  if (instance.handleClick) link.removeEventListener("click", instance.handleClick);

  if (restoreText) {
    link.textContent = instance.originalText || link.textContent;
    link.style.position = "";
    link.style.display = "";
    link.style.overflow = "";
  }
}

function cleanupStaleLinkHover() {
  for (const [link, instance] of linkInstances.entries()) {
    if (link.isConnected) continue;
    cleanupLink(link, instance, { restoreText: false });
    linkInstances.delete(link);
  }
}

function mountLayers(link, baseText, hoverText = baseText) {
  const viewport = createViewport();
  const baseLayer = createLayer(baseText, false);
  const hoverLayer = createLayer(hoverText, true);

  link.textContent = "";
  link.style.position = "relative";
  link.style.display = "inline-block";
  link.style.overflow = "visible";
  viewport.appendChild(baseLayer.root);
  viewport.appendChild(hoverLayer.root);
  link.appendChild(viewport);

  return { viewport, baseLayer, hoverLayer };
}

function createViewport() {
  const viewport = document.createElement("span");
  Object.assign(viewport.style, {
    position: "relative",
    display: "inline-grid",
    overflow: "hidden",
    whiteSpace: "pre",
    lineHeight: "1.05",
    verticalAlign: "top",
    paddingTop: "0.08em",
    paddingBottom: "0.12em",
    marginTop: "-0.08em",
    marginBottom: "-0.12em",
  });
  return viewport;
}

function createLayer(text, isOverlay) {
  const root = document.createElement("span");
  Object.assign(root.style, {
    display: "inline-flex",
    gridArea: "1 / 1",
    whiteSpace: "pre",
    lineHeight: "1.05",
    ...(isOverlay ? { position: "absolute", inset: "0 auto auto 0" } : {}),
  });

  const chars = Array.from(text).map((char) => {
    const clip = document.createElement("span");
    const glyph = document.createElement("span");

    Object.assign(clip.style, {
      display: "inline-block",
      overflow: "hidden",
      lineHeight: "1.05",
      verticalAlign: "top",
      paddingTop: "0.04em",
      paddingBottom: "0.08em",
      marginTop: "-0.04em",
      marginBottom: "-0.08em",
    });

    Object.assign(glyph.style, {
      display: "inline-block",
      willChange: "transform, opacity",
    });

    glyph.textContent = char === " " ? "\u00A0" : char;
    clip.appendChild(glyph);
    root.appendChild(clip);

    return glyph;
  });

  gsap.set(chars, {
    yPercent: isOverlay ? 115 : 0,
    opacity: isOverlay ? 0 : 1,
  });

  return { root, chars };
}

function animateChars(baseChars, hoverChars, isHover) {
  const tl = gsap.timeline();

  if (isHover) {
    tl.to(
      baseChars,
      {
        yPercent: -115,
        opacity: 0,
        duration: ANIM_CONFIG.duration,
        ease: ANIM_CONFIG.ease,
        stagger: { each: ANIM_CONFIG.stagger, from: "start" },
      },
      0,
    );

    tl.to(
      hoverChars,
      {
        yPercent: 0,
        opacity: 1,
        duration: ANIM_CONFIG.duration,
        ease: ANIM_CONFIG.ease,
        stagger: { each: ANIM_CONFIG.stagger, from: "start" },
      },
      ANIM_CONFIG.overlap,
    );
  } else {
    tl.to(
      baseChars,
      {
        yPercent: 0,
        opacity: 1,
        duration: ANIM_CONFIG.duration,
        ease: ANIM_CONFIG.ease,
        stagger: { each: ANIM_CONFIG.stagger, from: "end" },
      },
      0,
    );

    tl.to(
      hoverChars,
      {
        yPercent: 115,
        opacity: 0,
        duration: ANIM_CONFIG.duration,
        ease: ANIM_CONFIG.ease,
        stagger: { each: ANIM_CONFIG.stagger, from: "end" },
      },
      ANIM_CONFIG.overlap,
    );
  }

  return tl;
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
