import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { MOTION_TOKENS } from "../lib/animation/motionTokens";

type RotateHoverLabelProps = {
  text: string;
};

/**
 * Stacked duplicate line + per-glyph Y slide.
 * Parent must be an `<a>` or `<button>`; GSAP binds to that interactive ancestor.
 */
export default function RotateHoverLabel({ text }: RotateHoverLabelProps) {
  const clipRef = useRef<HTMLSpanElement | null>(null);
  const isFirstRender = useRef(true);
  const chars = [...(text ?? "")];

  useLayoutEffect(() => {
    const clip = clipRef.current;
    if (!clip) return;
    const interactive = clip.closest("a, button") as HTMLElement | null;
    if (!interactive) return;

    const allSpans = clip.querySelectorAll(".nav-link-hover__track > span");
    if (!allSpans.length) return;

    interactive.classList.add("nav-link-hover");

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

    const measureTrackHeight = (firstTrack: Element) => {
      // Use the track's own layout box only. scrollHeight is intentionally
      // excluded: while a label rotates in (spans translated by yPercent), the
      // overflowing glyphs inflate scrollHeight to two lines and the clip would
      // otherwise lock to a stale double-height. Labels are single-line nowrap,
      // so offset/rect height already capture the real height.
      const rectH = firstTrack.getBoundingClientRect().height;
      const offsetH = (firstTrack as HTMLElement).offsetHeight;
      return Math.max(rectH, offsetH, resolveLineHeightPx());
    };

    const applyClipHeight = () => {
      const firstTrack = clip.querySelector(".nav-link-hover__track");
      if (!firstTrack) return;

      // Force layout so measurements are stable after React text updates.
      void clip.offsetHeight;
      void (firstTrack as HTMLElement).offsetHeight;

      const h = measureTrackHeight(firstTrack);
      (clip as HTMLElement).style.height = `${Math.max(1, Math.round(h + CLIP_BUFFER_PX))}px`;
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

    const stagger = { amount: MOTION_TOKENS.navHover.staggerAmount, from: "start" as const };
    const ease = MOTION_TOKENS.navHover.ease;
    const duration = MOTION_TOKENS.navHover.duration;

    const onEnter = () => {
      gsap.to(allSpans, { yPercent: -100, duration, ease, stagger });
    };

    const onLeave = () => {
      gsap.to(allSpans, { yPercent: 0, duration, ease, stagger });
    };

    interactive.addEventListener("mouseenter", onEnter);
    interactive.addEventListener("mouseleave", onLeave);

    // When the label text changes (e.g. Menu -> Close -> Back), rotate the new
    // word up into place instead of swapping it instantly.
    if (isFirstRender.current) {
      isFirstRender.current = false;
    } else {
      gsap.fromTo(
        allSpans,
        { yPercent: 100 },
        { yPercent: 0, duration, ease, stagger },
      );
    }

    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      gsap.killTweensOf(allSpans);
      interactive.removeEventListener("mouseenter", onEnter);
      interactive.removeEventListener("mouseleave", onLeave);
      (clip as HTMLElement).style.height = "";
      interactive.classList.remove("nav-link-hover");
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

