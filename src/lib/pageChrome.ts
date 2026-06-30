import gsap from "gsap";

const CHROME_SELECTORS = [".site-header", "[data-archive-view-switcher]"] as const;

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

/** Instant hide while dissolve cover is full — no pre-transition fade. */
export function snapHidePageChrome(): void {
  const targets = chromeTargets();
  if (!targets.length) return;
  gsap.set(targets, { opacity: 0, pointerEvents: "none" });
}

/** Instant show after dissolve — no post-transition fade. */
export function snapShowPageChrome(showArchiveSwitcher: boolean): void {
  const targets = filteredChromeTargets(showArchiveSwitcher);
  if (!targets.length) return;
  gsap.set(targets, { opacity: 1, pointerEvents: "auto" });
}
