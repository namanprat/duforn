import gsap from "gsap";

const CHROME_SELECTORS = [".site-header", "[data-archive-view-switcher]"] as const;
const CHROME_ANIM_DUR = 0.55;

function chromeTargets(): HTMLElement[] {
  return CHROME_SELECTORS.flatMap((sel) => {
    const el = document.querySelector<HTMLElement>(sel);
    return el ? [el] : [];
  });
}

function filteredChromeTargets(showArchiveSwitcher: boolean): HTMLElement[] {
  return chromeTargets().filter((el) => {
    if (el.matches("[data-archive-view-switcher]")) return showArchiveSwitcher;
    return true;
  });
}

/** Animated hide before dissolve — header + archive switcher. */
export function hidePageChrome(): Promise<void> {
  const targets = chromeTargets();
  if (!targets.length) return Promise.resolve();
  gsap.killTweensOf(targets);
  return new Promise((resolve) => {
    gsap.to(targets, {
      opacity: 0,
      pointerEvents: "none",
      duration: CHROME_ANIM_DUR,
      ease: "power3.in",
      onComplete: () => resolve(),
    });
  });
}

/** Animated show after dissolve — header + optional archive switcher. */
export function showPageChrome(showArchiveSwitcher: boolean): Promise<void> {
  const targets = filteredChromeTargets(showArchiveSwitcher);
  if (!targets.length) return Promise.resolve();
  gsap.killTweensOf(targets);
  gsap.set(targets, { opacity: 0, pointerEvents: "none" });
  return new Promise((resolve) => {
    gsap.to(targets, {
      opacity: 1,
      pointerEvents: "auto",
      duration: CHROME_ANIM_DUR,
      ease: "power4.out",
      onComplete: () => resolve(),
    });
  });
}

/** Instant hide while dissolve cover is full — no pre-transition fade. */
export function snapHidePageChrome(): void {
  const targets = chromeTargets();
  if (!targets.length) return;
  gsap.killTweensOf(targets);
  gsap.set(targets, { opacity: 0, pointerEvents: "none" });
}

/** Instant show after dissolve — no post-transition fade. */
export function snapShowPageChrome(showArchiveSwitcher: boolean): void {
  const targets = filteredChromeTargets(showArchiveSwitcher);
  if (!targets.length) return;
  gsap.killTweensOf(targets);
  gsap.set(targets, { opacity: 1, pointerEvents: "auto" });
}
