// @ts-nocheck
import gsap from "gsap";
import {
  bodyLineLeaveDuration,
  bodyLineLeaveStagger,
  bodyLineRevealDuration,
  bodyLineRevealStagger,
  clearRevealTitleStyles,
  getRouteTitleLines,
  revertRouteTitleSplit,
  splitRouteTitleLines,
} from "../../../scripts/text-reveal";
import { REVEAL_TEXT_TIME_SCALE } from "../../../scripts/reveal-timing";

const rt = (s) => s * REVEAL_TEXT_TIME_SCALE;

const HOME_NAMESPACE = "home";
const CONTACT_NAMESPACE = "contact";

let activeTimeline = null;
let activeGhost = null;
let homeBrandSnapshot = null;
let runToken = 0;

function shouldRunHandoff(fromNamespace, toNamespace) {
  if (!fromNamespace || !toNamespace) return false;
  if (fromNamespace === toNamespace) return false;
  return fromNamespace === HOME_NAMESPACE || toNamespace === HOME_NAMESPACE;
}

function removeGhost() {
  if (!activeGhost) return;
  revertRouteTitleSplit(activeGhost);
  activeGhost.remove();
  activeGhost = null;
}

function captureHomeBrandSnapshot() {
  const homeBrand = document.querySelector(".home-hero-brand");
  if (!homeBrand) return;

  const rect = homeBrand.getBoundingClientRect();
  if (!rect.width || !rect.height) return;

  const computedStyle = window.getComputedStyle(homeBrand);
  homeBrandSnapshot = {
    text: homeBrand.textContent || "",
    rect,
    style: {
      fontFamily: computedStyle.fontFamily,
      fontSize: computedStyle.fontSize,
      fontWeight: computedStyle.fontWeight,
      lineHeight: computedStyle.lineHeight,
      letterSpacing: computedStyle.letterSpacing,
      textTransform: computedStyle.textTransform,
      textAlign: computedStyle.textAlign,
      color: computedStyle.color,
      whiteSpace: computedStyle.whiteSpace,
    },
  };
}

function createHomeBrandGhost() {
  if (!homeBrandSnapshot?.text || !homeBrandSnapshot?.rect) return null;

  const ghost = document.createElement("h1");
  ghost.className = "home-hero-brand home-hero-brand-ghost reveal-title";
  ghost.textContent = homeBrandSnapshot.text;
  ghost.setAttribute("aria-hidden", "true");

  const { rect, style } = homeBrandSnapshot;
  Object.assign(ghost.style, {
    position: "fixed",
    top: `${rect.top}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    margin: "0",
    pointerEvents: "none",
    zIndex: "210",
    transformOrigin: "50% 50%",
    fontFamily: style.fontFamily,
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    lineHeight: style.lineHeight,
    letterSpacing: style.letterSpacing,
    textTransform: style.textTransform,
    textAlign: style.textAlign,
    color: style.color,
    whiteSpace: style.whiteSpace,
  });

  document.body.appendChild(ghost);
  splitRouteTitleLines(ghost);
  activeGhost = ghost;
  return ghost;
}

function getNavBrandNode() {
  return document.querySelector(".nav-brand");
}

function getBrandTitleNode(namespace) {
  return document.querySelector(`[data-brand-handoff-title="${namespace}"]`);
}

function getHomeBrandNode() {
  return getBrandTitleNode(HOME_NAMESPACE);
}

function setRestingState(namespace, { clearHeroTitleChars = true } = {}) {
  const isHome = namespace === HOME_NAMESPACE;
  const navBrand = getNavBrandNode();
  const homeBrand = getBrandTitleNode(HOME_NAMESPACE);
  const contactBrand = getBrandTitleNode(CONTACT_NAMESPACE);

  if (navBrand) {
    gsap.set(navBrand, {
      autoAlpha: isHome ? 0 : 1,
      pointerEvents: isHome ? "none" : "auto",
      clearProps: "transform",
    });
  }

  if (homeBrand) {
    if (clearHeroTitleChars) {
      clearRevealTitleStyles(homeBrand);
    }
    gsap.set(homeBrand, {
      autoAlpha: 1,
      clearProps: "transform",
    });
  }

  if (contactBrand) {
    if (clearHeroTitleChars) {
      clearRevealTitleStyles(contactBrand);
    }
    gsap.set(contactBrand, {
      autoAlpha: 1,
      clearProps: "transform",
    });
  }
}

function finalizeNamespaceState(namespace, { clearHeroTitleChars = true } = {}) {
  setRestingState(namespace, { clearHeroTitleChars });
  if (namespace === HOME_NAMESPACE) {
    // Capture after layout settles so home -> non-home can animate a ghost copy.
    requestAnimationFrame(captureHomeBrandSnapshot);
  }
}

export function cleanupBrandHandoff() {
  runToken += 1;
  if (activeTimeline) {
    activeTimeline.kill();
    activeTimeline = null;
  }
  removeGhost();
}

export async function runBrandHandoff({ fromNamespace, toNamespace }) {
  cleanupBrandHandoff();
  const token = runToken;

  if (!shouldRunHandoff(fromNamespace, toNamespace)) {
    finalizeNamespaceState(toNamespace, { clearHeroTitleChars: false });
    return new Set();
  }

  try {
    await document.fonts.ready;
  } catch {
    // Ignore font loading errors and proceed with fallback animation states.
  }

  if (token !== runToken) return new Set();

  const navBrand = getNavBrandNode();
  const leavingHome = fromNamespace === HOME_NAMESPACE && toNamespace !== HOME_NAMESPACE;
  const enteringHome = toNamespace === HOME_NAMESPACE && fromNamespace !== HOME_NAMESPACE;
  const enteringContact = toNamespace === CONTACT_NAMESPACE;
  const contactBrand = getBrandTitleNode(CONTACT_NAMESPACE);

  return await new Promise((resolve) => {
    const skipRouteEnterTitles = new Set();

    const timeline = gsap.timeline({
      defaults: { ease: "power2.out" },
      onComplete: () => {
        removeGhost();
        finalizeNamespaceState(toNamespace);
        activeTimeline = null;
        runToken += 1;
        resolve(skipRouteEnterTitles);
      },
      onInterrupt: () => {
        removeGhost();
        finalizeNamespaceState(toNamespace);
        activeTimeline = null;
        runToken += 1;
        resolve(skipRouteEnterTitles);
      },
    });

    if (leavingHome) {
      const ghost = createHomeBrandGhost();
      const ghostLines = ghost ? getRouteTitleLines(ghost) : [];
      if (ghostLines.length) {
        gsap.set(ghostLines, { yPercent: 0, opacity: 1 });
        timeline.to(
          ghostLines,
          {
            yPercent: -110,
            opacity: 0,
            duration: bodyLineLeaveDuration(),
            stagger: bodyLineLeaveStagger(),
            ease: "power2.in",
          },
          0,
        );
      }

      if (enteringContact && contactBrand) {
        const contactLines = getRouteTitleLines(contactBrand);
        if (contactLines.length) {
          gsap.set(contactBrand, { autoAlpha: 1 });
          skipRouteEnterTitles.add(contactBrand);
          timeline.fromTo(
            contactLines,
            { yPercent: 100, opacity: 1 },
            {
              yPercent: 0,
              opacity: 1,
              duration: bodyLineRevealDuration(),
              stagger: bodyLineRevealStagger(),
              ease: "power4.out",
            },
            rt(0.05),
          );
        } else {
          gsap.fromTo(
            contactBrand,
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: rt(0.3) },
            rt(0.05),
          );
        }
      }

      if (navBrand) {
        gsap.set(navBrand, { autoAlpha: 0, yPercent: 15, pointerEvents: "auto" });
        timeline.to(
          navBrand,
          {
            autoAlpha: 1,
            yPercent: 0,
            duration: rt(0.48),
          },
          rt(0.08),
        );
      }
    }

    if (enteringHome) {
      const homeBrand = getHomeBrandNode();
      const homeLines = getRouteTitleLines(homeBrand);

      if (navBrand) {
        gsap.set(navBrand, { autoAlpha: 1, pointerEvents: "auto" });
        timeline.to(
          navBrand,
          {
            autoAlpha: 0,
            yPercent: -15,
            duration: rt(0.36),
          },
          0,
        );
      }

      if (homeLines.length) {
        gsap.set(homeBrand, { autoAlpha: 1 });
        skipRouteEnterTitles.add(homeBrand);
        timeline.fromTo(
          homeLines,
          { yPercent: 100, opacity: 1 },
          {
            yPercent: 0,
            opacity: 1,
            duration: bodyLineRevealDuration(),
            stagger: bodyLineRevealStagger(),
            ease: "power4.out",
          },
          rt(0.05),
        );
      } else if (homeBrand) {
        gsap.fromTo(homeBrand, { autoAlpha: 0 }, { autoAlpha: 1, duration: rt(0.3) }, rt(0.05));
      }
    }

    if (!timeline.getChildren(true, true, true).length) {
      timeline.kill();
      removeGhost();
      finalizeNamespaceState(toNamespace);
      resolve(skipRouteEnterTitles);
      return;
    }

    activeTimeline = timeline;
  });
}
