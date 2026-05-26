// @ts-nocheck
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { triggerNavHaptic } from "../../scripts/haptic-feedback";
import { MOTION_TOKENS } from "../lib/anim/tokens";

/**
 * CodePen-style stacked duplicate line + per-glyph Y slide (web_taku / QWmXyLd).
 * Parent must be an `<a>` or `<button>`; GSAP binds to that interactive ancestor.
 * When `active` is provided, the same stacked-line animation is driven by state
 * instead of pointer hover, which is useful for toggle labels like MENU/CLOSE.
 */
export default function RotateHoverLabel({ text, hoverText = text, active }) {
  const clipRef = useRef(null);
  const baseChars = [...(text ?? "")];
  const hoverChars = [...(hoverText ?? text ?? "")];

  useLayoutEffect(() => {
    const clip = clipRef.current;
    if (!clip) return;
    const interactive = clip.closest("a, button");
    if (!interactive) return;

    const allSpans = clip.querySelectorAll(".nav-link-hover__track > span");
    if (!allSpans.length) return;

    interactive.classList.add("nav-link-hover");

    // Keep viewport locked to one text line so stacked clone stays hidden.
    const CLIP_BUFFER_PX = 0.5;

    const resolveLineHeightPx = () => {
      const cs = getComputedStyle(interactive);
      const lh = cs.lineHeight;
      if (lh === "normal") {
        const fs = parseFloat(cs.fontSize) || 16;
        return fs * 1.2;
      }
      const px = parseFloat(lh);
      return Number.isFinite(px) && px > 0 ? px : 20;
    };

    const measureTrackHeight = (firstTrack) => {
      const rectH = firstTrack.getBoundingClientRect().height;
      const scrollH = firstTrack.scrollHeight;
      const offsetH = firstTrack.offsetHeight;
      const measured = Math.max(rectH, scrollH, offsetH, resolveLineHeightPx());
      return measured;
    };

    const applyClipHeight = () => {
      const firstTrack = clip.querySelector(".nav-link-hover__track");
      if (!firstTrack) return;

      void clip.offsetHeight;
      void firstTrack.offsetHeight;
      const h = measureTrackHeight(firstTrack);
      clip.style.height = `${Math.max(1, Math.round(h + CLIP_BUFFER_PX))}px`;
    };

    applyClipHeight();
    const raf = requestAnimationFrame(() => applyClipHeight());

    if (typeof document !== "undefined" && document.fonts?.ready) {
      void document.fonts.ready.then(() => applyClipHeight());
    }

    const ro =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => applyClipHeight()) : null;
    if (ro) {
      const firstTrackEl = clip.querySelector(".nav-link-hover__track");
      if (firstTrackEl) ro.observe(firstTrackEl);
      ro.observe(interactive);
    }

    const stagger = { amount: MOTION_TOKENS.navHover.staggerAmount, from: "start" };
    const ease = MOTION_TOKENS.navHover.ease;
    const duration = MOTION_TOKENS.navHover.duration;
    const isControlled = typeof active === "boolean";

    gsap.set(allSpans, { yPercent: isControlled && active ? -100 : 0 });

    const animateTo = (yPercent) =>
      gsap.to(allSpans, { yPercent, duration, ease, stagger, overwrite: true });

    const onEnter = () => {
      triggerNavHaptic("hover");
      animateTo(-100);
    };

    const onLeave = () => {
      animateTo(0);
    };

    if (!isControlled) {
      interactive.addEventListener("mouseenter", onEnter);
      interactive.addEventListener("mouseleave", onLeave);
    } else {
      animateTo(active ? -100 : 0);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      gsap.killTweensOf(allSpans);
      interactive.removeEventListener("mouseenter", onEnter);
      interactive.removeEventListener("mouseleave", onLeave);
      clip.style.height = "";
      interactive.classList.remove("nav-link-hover");
    };
  }, [active, hoverText, text]);

  return (
    <span ref={clipRef} className="nav-link-hover__clip">
      <span className="nav-link-hover__track">
        {baseChars.map((c, i) => (
          <span key={`t0-${i}`}>{c === " " ? "\u00A0" : c}</span>
        ))}
      </span>
      <span className="nav-link-hover__track" aria-hidden="true">
        {hoverChars.map((c, i) => (
          <span key={`t1-${i}`}>{c === " " ? "\u00A0" : c}</span>
        ))}
      </span>
    </span>
  );
}
