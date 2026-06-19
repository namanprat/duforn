import gsap from "gsap";
import { MOTION_TOKENS } from "./animation/motionTokens";

/** Pill CTAs (`button.button` / `a.button`). */
const BUTTON_SELECTOR = "button.button:not([disabled]), a.button:not([aria-disabled='true'])";

const instances = new Map<Element, { onEnter: () => void; onLeave: () => void }>();

function motionOk() {
  if (typeof window === "undefined") return false;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  return true;
}

function cleanupStale() {
  for (const [el, rec] of instances.entries()) {
    if (!el.isConnected) {
      el.removeEventListener("mouseenter", rec.onEnter);
      el.removeEventListener("mouseleave", rec.onLeave);
      gsap.killTweensOf(el);
      instances.delete(el);
    }
  }
}

export function initButtonHoverScale() {
  cleanupStale();
  if (!motionOk()) return;

  document.querySelectorAll(BUTTON_SELECTOR).forEach((el) => {
    if (instances.has(el)) return;
    if (el.closest("[data-button-hover-scale='false']")) return;

    gsap.set(el, { transformOrigin: "50% 50%" });

    const onEnter = () => {
      gsap.killTweensOf(el);
      gsap.to(el, {
        scale: MOTION_TOKENS.buttonHover.enterScale,
        duration: MOTION_TOKENS.buttonHover.enterDuration,
        ease: MOTION_TOKENS.buttonHover.ease,
      });
    };
    const onLeave = () => {
      gsap.killTweensOf(el);
      gsap.to(el, {
        scale: MOTION_TOKENS.buttonHover.leaveScale,
        duration: MOTION_TOKENS.buttonHover.leaveDuration,
        ease: MOTION_TOKENS.buttonHover.ease,
      });
    };

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);

    instances.set(el, { onEnter, onLeave });
  });
}

export function destroyButtonHoverScale() {
  instances.forEach((rec, el) => {
    el.removeEventListener("mouseenter", rec.onEnter);
    el.removeEventListener("mouseleave", rec.onLeave);
    gsap.killTweensOf(el);
    gsap.set(el, { scale: 1, clearProps: "transform" });
  });
  instances.clear();
}

