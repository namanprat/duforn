import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(SplitText);

const HOME_NAMESPACE = 'home';

let activeTimeline = null;
let activeSplits = [];
let activeGhost = null;
let homeBrandSnapshot = null;
let runToken = 0;

function shouldRunHandoff(fromNamespace, toNamespace) {
  if (!fromNamespace || !toNamespace) return false;
  if (fromNamespace === toNamespace) return false;
  return fromNamespace === HOME_NAMESPACE || toNamespace === HOME_NAMESPACE;
}

function splitNode(node) {
  if (!node) return null;
  const split = new SplitText(node, { type: 'chars', reduceWhiteSpace: false });
  activeSplits.push(split);
  return split;
}

function clearActiveSplits() {
  for (let i = activeSplits.length - 1; i >= 0; i--) {
    const split = activeSplits[i];
    if (split && typeof split.revert === 'function') split.revert();
  }
  activeSplits = [];
}

function removeGhost() {
  if (!activeGhost) return;
  activeGhost.remove();
  activeGhost = null;
}

function captureHomeBrandSnapshot() {
  const homeBrand = document.querySelector('.home-hero-brand');
  if (!homeBrand) return;

  const rect = homeBrand.getBoundingClientRect();
  if (!rect.width || !rect.height) return;

  const computedStyle = window.getComputedStyle(homeBrand);
  homeBrandSnapshot = {
    text: homeBrand.textContent || '',
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

  const ghost = document.createElement('h1');
  ghost.className = 'home-hero-brand home-hero-brand-ghost';
  ghost.textContent = homeBrandSnapshot.text;
  ghost.setAttribute('aria-hidden', 'true');

  const { rect, style } = homeBrandSnapshot;
  Object.assign(ghost.style, {
    position: 'fixed',
    top: `${rect.top}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    margin: '0',
    pointerEvents: 'none',
    zIndex: '210',
    transformOrigin: '50% 50%',
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
  activeGhost = ghost;
  return ghost;
}

function getNavBrandNode() {
  return document.querySelector('.nav-brand');
}

function getHomeBrandNode() {
  return document.querySelector('.home-hero-brand');
}

function setRestingState(namespace) {
  const isHome = namespace === HOME_NAMESPACE;
  const navBrand = getNavBrandNode();
  const homeBrand = getHomeBrandNode();

  if (navBrand) {
    gsap.set(navBrand, {
      autoAlpha: isHome ? 0 : 1,
      pointerEvents: isHome ? 'none' : 'auto',
      clearProps: 'transform',
    });
  }

  if (homeBrand) {
    gsap.set(homeBrand, {
      autoAlpha: 1,
      clearProps: 'transform',
    });
  }
}

function finalizeNamespaceState(namespace) {
  setRestingState(namespace);
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
  clearActiveSplits();
  removeGhost();
}

export function applyBrandRestingState(namespace) {
  finalizeNamespaceState(namespace);
}

export async function runBrandHandoff({ fromNamespace, toNamespace }) {
  cleanupBrandHandoff();
  const token = runToken;

  if (!shouldRunHandoff(fromNamespace, toNamespace)) {
    finalizeNamespaceState(toNamespace);
    return;
  }

  try {
    await document.fonts.ready;
  } catch {
    // Ignore font loading errors and proceed with fallback animation states.
  }

  if (token !== runToken) return;

  const navBrand = getNavBrandNode();
  const leavingHome = fromNamespace === HOME_NAMESPACE && toNamespace !== HOME_NAMESPACE;
  const enteringHome = toNamespace === HOME_NAMESPACE && fromNamespace !== HOME_NAMESPACE;
  const timeline = gsap.timeline({
    defaults: { ease: 'power2.out' },
    onComplete: () => {
      clearActiveSplits();
      removeGhost();
      finalizeNamespaceState(toNamespace);
      activeTimeline = null;
      runToken += 1;
    },
    onInterrupt: () => {
      clearActiveSplits();
      removeGhost();
      finalizeNamespaceState(toNamespace);
      activeTimeline = null;
      runToken += 1;
    },
  });

  if (leavingHome) {
    const ghost = createHomeBrandGhost();
    const ghostSplit = splitNode(ghost);
    const navSplit = splitNode(navBrand);

    if (ghostSplit?.chars?.length) {
      timeline.to(ghostSplit.chars, {
        yPercent: -120,
        opacity: 0,
        duration: 0.42,
        stagger: 0.015,
      }, 0);
    }

    if (navSplit?.chars?.length) {
      gsap.set(navSplit.chars, { yPercent: 120, opacity: 0 });
      gsap.set(navBrand, { autoAlpha: 1, pointerEvents: 'auto' });
      timeline.to(navSplit.chars, {
        yPercent: 0,
        opacity: 1,
        duration: 0.48,
        stagger: 0.02,
      }, 0.08);
    } else if (navBrand) {
      gsap.fromTo(navBrand, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.32 }, 0.08);
    }
  }

  if (enteringHome) {
    const homeBrand = getHomeBrandNode();
    const navSplit = splitNode(navBrand);
    const homeSplit = splitNode(homeBrand);

    if (navSplit?.chars?.length) {
      gsap.set(navBrand, { autoAlpha: 1, pointerEvents: 'auto' });
      timeline.to(navSplit.chars, {
        yPercent: -120,
        opacity: 0,
        duration: 0.36,
        stagger: 0.014,
      }, 0);
    } else if (navBrand) {
      timeline.to(navBrand, { autoAlpha: 0, duration: 0.24 }, 0);
    }

    if (homeSplit?.chars?.length) {
      gsap.set(homeSplit.chars, { yPercent: 120, opacity: 0 });
      gsap.set(homeBrand, { autoAlpha: 1 });
      timeline.to(homeSplit.chars, {
        yPercent: 0,
        opacity: 1,
        duration: 0.52,
        stagger: 0.02,
      }, 0.05);
    } else if (homeBrand) {
      gsap.fromTo(homeBrand, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 0.05);
    }
  }

  if (!timeline.getChildren(true, true, true).length) {
    clearActiveSplits();
    removeGhost();
    finalizeNamespaceState(toNamespace);
    return;
  }

  activeTimeline = timeline;
}
