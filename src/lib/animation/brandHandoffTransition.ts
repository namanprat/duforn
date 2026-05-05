// @ts-nocheck
import gsap from "gsap";

const HOME_NAMESPACE = "home";
const TEST_NAMESPACE = "test";
const CONTACT_NAMESPACE = "contact";

function isNavBrandHiddenNamespace(namespace) {
  return namespace === HOME_NAMESPACE || namespace === TEST_NAMESPACE;
}

function getNavBrandNode() {
  return document.querySelector(".nav-brand");
}

function getBrandTitleNode(namespace) {
  return document.querySelector(`[data-brand-handoff-title="${namespace}"]`);
}

function clearTitleMotion(title) {
  if (!title) return;
  gsap.killTweensOf(title);
  gsap.set(title, { clearProps: "transform,opacity,willChange,transformOrigin" });
}

function setRestingState(namespace, { clearHeroTitleChars = true } = {}) {
  const hideNavBrand = isNavBrandHiddenNamespace(namespace);
  const navBrand = getNavBrandNode();
  const homeBrand = getBrandTitleNode(HOME_NAMESPACE);
  const contactBrand = getBrandTitleNode(CONTACT_NAMESPACE);

  if (navBrand) {
    gsap.set(navBrand, {
      autoAlpha: hideNavBrand ? 0 : 1,
      pointerEvents: hideNavBrand ? "none" : "auto",
      clearProps: "transform",
    });
  }

  if (homeBrand) {
    const handoffToTextReveal = homeBrand.hasAttribute?.("data-text-reveal-root");
    if (!handoffToTextReveal && clearHeroTitleChars) clearTitleMotion(homeBrand);
    gsap.set(homeBrand, {
      autoAlpha: 1,
      ...(handoffToTextReveal ? {} : { clearProps: "transform" }),
    });
  }

  if (contactBrand) {
    const handoffToTextReveal = contactBrand.hasAttribute?.("data-text-reveal-root");
    if (!handoffToTextReveal && clearHeroTitleChars) clearTitleMotion(contactBrand);
    gsap.set(contactBrand, {
      autoAlpha: 1,
      ...(handoffToTextReveal ? {} : { clearProps: "transform" }),
    });
  }
}

function finalizeNamespaceState(namespace, { clearHeroTitleChars = true } = {}) {
  setRestingState(namespace, { clearHeroTitleChars });
}

export function cleanupBrandHandoff() {
  // No running timelines; included for App lifecycle compatibility.
}

/**
 * Applies nav + hero title visibility for the target route without animating text
 * (no line/char motion, no ghost clone).
 */
export async function runBrandHandoff({ fromNamespace: _from, toNamespace }) {
  try {
    await document.fonts.ready;
  } catch {
    // ignore
  }
  finalizeNamespaceState(toNamespace, { clearHeroTitleChars: true });
}
