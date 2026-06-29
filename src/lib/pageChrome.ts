import gsap from "gsap";
import { prefersReducedMotion } from "./prefersReducedMotion";

const CHROME_SELECTORS = [".site-header", "[data-archive-view-switcher]"] as const;
const CHROME_DURATION = 0.45;

function chromeTargets(): HTMLElement[] {
  return CHROME_SELECTORS.flatMap((sel) => {
    const el = document.querySelector<HTMLElement>(sel);
    return el ? [el] : [];
  });
}

export async function hidePageChrome(): Promise<void> {
  const targets = chromeTargets();
  if (!targets.length) return;

  if (prefersReducedMotion()) {
    gsap.set(targets, { opacity: 0, pointerEvents: "none" });
    return;
  }

  await new Promise<void>((resolve) => {
    gsap.to(targets, {
      opacity: 0,
      duration: CHROME_DURATION,
      ease: "power3.in",
      onComplete: () => {
        gsap.set(targets, { pointerEvents: "none" });
        resolve();
      },
    });
  });
}

export async function showPageChrome(showArchiveSwitcher: boolean): Promise<void> {
  const targets = chromeTargets().filter((el) => {
    if (el.matches("[data-archive-view-switcher]")) return showArchiveSwitcher;
    return true;
  });

  if (!targets.length) return;

  gsap.set(targets, { pointerEvents: "auto" });

  if (prefersReducedMotion()) {
    gsap.set(targets, { opacity: 1 });
    return;
  }

  gsap.set(targets, { opacity: 0 });
  await new Promise<void>((resolve) => {
    gsap.to(targets, {
      opacity: 1,
      duration: CHROME_DURATION,
      ease: "power3.out",
      onComplete: () => resolve(),
    });
  });
}
