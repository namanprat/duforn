// @ts-nocheck
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { triggerNavHaptic } from "../../scripts/haptic-feedback";

/**
 * CodePen-style stacked duplicate line + per-glyph Y slide (web_taku / QWmXyLd).
 * Must live under an `<a>`; GSAP binds to the parent anchor. Rendered by React so
 * parent re-renders do not wipe imperative DOM from link-hover init.
 */
export default function RotateHoverLabel({ text }) {
  const clipRef = useRef(null);
  const chars = [...(text ?? "")];

  useLayoutEffect(() => {
    const clip = clipRef.current;
    if (!clip) return;
    const link = clip.closest("a");
    if (!link) return;

    const allSpans = clip.querySelectorAll(".nav-link-hover__track > span");
    if (!allSpans.length) return;

    link.classList.add("nav-link-hover");

    /** Clip only the first line here so the duplicate track never peeks past the anchor/grid row. */
    const applyClipHeight = () => {
      const firstTrack = clip.querySelector(".nav-link-hover__track");
      if (!firstTrack) return;

      void clip.offsetHeight;
      void firstTrack.offsetHeight;
      let h = firstTrack.offsetHeight;
      if (h <= 0) h = firstTrack.getBoundingClientRect().height;
      if (h <= 0) {
        const cs = getComputedStyle(link);
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

    const stagger = { amount: 0.14 * 1.15, from: "start" };
    const ease = "power1.out";
    const duration = 0.45;

    const onEnter = () => {
      triggerNavHaptic("hover");
      gsap.to(allSpans, { yPercent: -100, duration, ease, stagger });
    };

    const onLeave = () => {
      gsap.to(allSpans, { yPercent: 0, duration, ease, stagger });
    };

    link.addEventListener("mouseenter", onEnter);
    link.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      gsap.killTweensOf(allSpans);
      link.removeEventListener("mouseenter", onEnter);
      link.removeEventListener("mouseleave", onLeave);
      clip.style.height = "";
      link.classList.remove("nav-link-hover");
    };
  }, [text]);

  return (
    <span ref={clipRef} className="nav-link-hover__clip">
      <span className="nav-link-hover__track">
        {chars.map((c, i) => (
          <span key={`t0-${i}`}>{c === " " ? "\u00A0" : c}</span>
        ))}
      </span>
      <span className="nav-link-hover__track" aria-hidden="true">
        {chars.map((c, i) => (
          <span key={`t1-${i}`}>{c === " " ? "\u00A0" : c}</span>
        ))}
      </span>
    </span>
  );
}
