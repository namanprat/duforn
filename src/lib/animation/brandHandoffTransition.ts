// @ts-nocheck
import gsap from "gsap";

const HOME_NAMESPACE = "home";
const MAIN_NAMESPACE = "main";
const OLD_NAMESPACE = "old";
const CONTACT_NAMESPACE = "contact";

function isNavBrandHiddenNamespace(namespace) {
  return (
    namespace === HOME_NAMESPACE || namespace === MAIN_NAMESPACE || namespace === OLD_NAMESPACE
  );
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

  if (navBrand) {
    gsap.set(navBrand, {
      autoAlpha: hideNavBrand ? 0 : 1,
      pointerEvents: hideNavBrand ? "none" : "auto",
      clearProps: "transform",
    });
  }

  for (const ns of [HOME_NAMESPACE, MAIN_NAMESPACE, CONTACT_NAMESPACE]) {
    const node = getBrandTitleNode(ns);
    if (!node) continue;
    const handoffToTextReveal = node.hasAttribute?.("data-text-reveal-root");
    if (!handoffToTextReveal && clearHeroTitleChars) clearTitleMotion(node);
    gsap.set(node, {
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
