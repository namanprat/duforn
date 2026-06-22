import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { MOTION_TOKENS } from "../lib/animation/motionTokens";
import { prefersReducedMotion } from "../lib/prefersReducedMotion";

type RotateHoverLabelProps = {
  text: string;
};

/**
 * CodePen-style stacked duplicate line + per-glyph Y slide.
 * Parent must be an `<a>` or `<button>`; GSAP binds to that interactive ancestor.
 */
export default function RotateHoverLabel({ text }: RotateHoverLabelProps) {
  const clipRef = useRef<HTMLSpanElement | null>(null);
  const chars = [...text];

  useLayoutEffect(() => {
    const clip = clipRef.current;
    if (!clip) return;

    const interactive = clip.closest("a, button") as HTMLElement | null;
    if (!interactive) return;

    const allSpans = clip.querySelectorAll<HTMLSpanElement>(".nav-link-hover__track > span");
    if (!allSpans.length) return;

    interactive.classList.add("nav-link-hover");

    const applyClipHeight = () => {
      const firstTrack = clip.querySelector(".nav-link-hover__track");
      if (!firstTrack) return;

      void clip.offsetHeight;
      void (firstTrack as HTMLElement).offsetHeight;
      let h = (firstTrack as HTMLElement).offsetHeight;
      if (h <= 0) h = firstTrack.getBoundingClientRect().height;
      if (h <= 0) {
        const cs = getComputedStyle(interactive);
        const lh = cs.lineHeight;
        if (lh === "normal") {
          const fs = parseFloat(cs.fontSize) || 16;
          h = fs * 1.25;
        } else {
          h = parseFloat(lh) || 20;
        }
      }
      clip.style.height = `${Math.ceil(h)}px`;
    };

    applyClipHeight();
    const raf = requestAnimationFrame(applyClipHeight);

    const { duration, staggerAmount, ease } = MOTION_TOKENS.navHover;
    const stagger = { amount: staggerAmount, from: "start" as const };

    const onEnter = () => {
      if (prefersReducedMotion()) return;
      gsap.to(allSpans, { yPercent: -100, duration, ease, stagger });
    };

    const onLeave = () => {
      if (prefersReducedMotion()) return;
      gsap.to(allSpans, { yPercent: 0, duration, ease, stagger });
    };

    interactive.addEventListener("mouseenter", onEnter);
    interactive.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      gsap.killTweensOf(allSpans);
      interactive.removeEventListener("mouseenter", onEnter);
      interactive.removeEventListener("mouseleave", onLeave);
      clip.style.height = "";
      interactive.classList.remove("nav-link-hover");
    };
  }, [text]);

  return (
    <span ref={clipRef} className="nav-link-hover__clip">
      <span className="nav-link-hover__track">
        {chars.map((c, i) => (
          <span key={`t0-${i}`}>{c === " " ? "\u00a0" : c}</span>
        ))}
      </span>
      <span className="nav-link-hover__track" aria-hidden="true">
        {chars.map((c, i) => (
          <span key={`t1-${i}`}>{c === " " ? "\u00a0" : c}</span>
        ))}
      </span>
    </span>
  );
}
