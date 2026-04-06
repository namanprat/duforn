import gsap from "gsap";
import { WebHaptics } from "web-haptics";

const ANIM_CONFIG = {
  duration: 0.42,
  ease: "power2.inOut",
  stagger: 0.014,
  overlap: 0.08,
};

const LINK_SELECTOR = ".nav-wrap a, .bottom-nav-wrap a, .contact-info a";
const linkInstances = new Map();

let haptics = null;

function supportsTouchInput() {
  if (typeof navigator !== "undefined" && navigator.maxTouchPoints > 0) return true;
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

function supportsHoverInput() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return true;
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

export function getHaptics() {
  if (!haptics) haptics = new WebHaptics({ debug: true });
  return haptics;
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
        getHaptics().trigger("nudge");
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
      getHaptics().trigger([{ duration: 10 }], { intensity: 1 });
    };

    const handleLeave = () => {
      if (link.getAttribute("aria-current") === "page") return;
      tl?.kill();
      tl = animateChars(baseLayer.chars, hoverLayer.chars, false);
    };

    const handleClick = () => {
      getHaptics().trigger([
        { duration: 80, intensity: 0.8 },
        { delay: 80, duration: 50, intensity: 0.3 },
      ]);
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

function mountLayers(link, baseText) {
  const viewport = createViewport();
  const baseLayer = createLayer(baseText, false);
  const hoverLayer = createLayer(baseText, true);

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
}
