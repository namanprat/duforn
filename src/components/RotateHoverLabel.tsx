import { useCallback, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { MOTION_TOKENS } from "../lib/animation/motionTokens";
import { prefersReducedMotion } from "../lib/prefersReducedMotion";

const CLIP_BUFFER_PX = 0.5;
const INTERACTIVE_SELECTOR = "a, button, [role=\"button\"]";

type RotateHoverLabelProps = {
  text: string;
  /** Entrance animation runs only when this changes. Defaults to `text`. */
  changeKey?: string;
  /** Kill tweens and skip hover while true (menu morph). */
  paused?: boolean;
};

export default function RotateHoverLabel({
  text,
  changeKey,
  paused = false,
}: RotateHoverLabelProps) {
  const clipRef = useRef<HTMLSpanElement | null>(null);
  const isHoveredRef = useRef(false);
  const prevChangeKeyRef = useRef<string | null>(null);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  const effectiveChangeKey = changeKey ?? text;
  const chars = [...(text ?? "")];

  const getSpans = useCallback(() => {
    const clip = clipRef.current;
    if (!clip) return [] as HTMLElement[];
    return Array.from(clip.querySelectorAll<HTMLElement>(".nav-link-hover__track > span"));
  }, []);

  const applyClipHeight = useCallback(() => {
    const clip = clipRef.current;
    if (!clip) return;

    const interactive = clip.closest(INTERACTIVE_SELECTOR) as HTMLElement | null;
    const firstTrack = clip.querySelector(".nav-link-hover__track") as HTMLElement | null;
    if (!firstTrack) return;

    const resolveLineHeightPx = () => {
      const source = interactive ?? clip;
      const cs = getComputedStyle(source);
      const lh = cs.lineHeight;
      if (lh === "normal") {
        const fs = parseFloat(cs.fontSize) || 16;
        return fs * 1.2;
      }
      const px = parseFloat(lh);
      return Number.isFinite(px) && px > 0 ? px : 20;
    };

    void clip.offsetHeight;
    void firstTrack.offsetHeight;

    const rectH = firstTrack.getBoundingClientRect().height;
    const offsetH = firstTrack.offsetHeight;
    const h = Math.max(rectH, offsetH, resolveLineHeightPx());
    clip.style.height = `${Math.max(1, Math.round(h + CLIP_BUFFER_PX))}px`;
  }, []);

  // Pointer handlers — bind once; read live spans + paused from refs.
  useLayoutEffect(() => {
    const clip = clipRef.current;
    if (!clip) return;

    const interactive = clip.closest(INTERACTIVE_SELECTOR) as HTMLElement | null;
    if (!interactive) return;

    interactive.classList.add("nav-link-hover");

    const { duration, staggerAmount, ease } = MOTION_TOKENS.navHover;
    const stagger = { amount: staggerAmount, from: "start" as const };

    const tweenTo = (yPercent: number) => {
      if (pausedRef.current || prefersReducedMotion()) return;
      const spans = getSpans();
      if (!spans.length) return;
      gsap.to(spans, { yPercent, duration, ease, stagger, overwrite: "auto" });
    };

    const onEnter = () => {
      isHoveredRef.current = true;
      tweenTo(-100);
    };

    const onLeave = () => {
      isHoveredRef.current = false;
      tweenTo(0);
    };

    interactive.addEventListener("pointerenter", onEnter);
    interactive.addEventListener("pointerleave", onLeave);

    const firstTrack = clip.querySelector(".nav-link-hover__track");
    const ro =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => applyClipHeight()) : null;
    if (ro) {
      if (firstTrack) ro.observe(firstTrack);
      ro.observe(interactive);
    }

    if (typeof document !== "undefined" && document.fonts?.ready) {
      void document.fonts.ready.then(() => applyClipHeight());
    }

    return () => {
      interactive.removeEventListener("pointerenter", onEnter);
      interactive.removeEventListener("pointerleave", onLeave);
      interactive.classList.remove("nav-link-hover");
      ro?.disconnect();
      clip.style.height = "";
    };
  }, [applyClipHeight, getSpans]);

  // State entrance — only when changeKey changes.
  useLayoutEffect(() => {
    const spans = getSpans();
    if (!spans.length) return;

    const reduce = prefersReducedMotion();
    const { duration, staggerAmount, ease } = MOTION_TOKENS.navHover;
    const stagger = { amount: staggerAmount, from: "start" as const };
    const prev = prevChangeKeyRef.current;

    if (paused || reduce) {
      gsap.killTweensOf(spans);
      gsap.set(spans, { yPercent: 0 });
      if (!paused) prevChangeKeyRef.current = effectiveChangeKey;
      applyClipHeight();
      return;
    }

    if (prev === null) {
      prevChangeKeyRef.current = effectiveChangeKey;
      gsap.set(spans, { yPercent: 0 });
      applyClipHeight();
      return;
    }

    if (prev === effectiveChangeKey) return;

    prevChangeKeyRef.current = effectiveChangeKey;
    gsap.killTweensOf(spans);
    gsap.fromTo(
      spans,
      { yPercent: 100 },
      {
        yPercent: 0,
        duration,
        ease,
        stagger,
        overwrite: "auto",
        onComplete: () => {
          if (isHoveredRef.current) gsap.set(getSpans(), { yPercent: -100 });
          applyClipHeight();
        },
      },
    );
    applyClipHeight();
  }, [effectiveChangeKey, paused, applyClipHeight, getSpans]);

  // Text tick — remeasure only; never kill hover tweens.
  useLayoutEffect(() => {
    applyClipHeight();
    requestAnimationFrame(applyClipHeight);

    if (isHoveredRef.current) return;

    const spans = getSpans();
    if (!spans.length) return;
    gsap.killTweensOf(spans);
    gsap.set(spans, { yPercent: 0 });
  }, [text, applyClipHeight, getSpans]);

  return (
    <span ref={clipRef} className="nav-link-hover__clip">
      <span className="nav-link-hover__track">
        {chars.map((c, i) => (
          <span key={i}>{c === " " ? "\u00A0" : c}</span>
        ))}
      </span>
      <span className="nav-link-hover__track" aria-hidden="true">
        {chars.map((c, i) => (
          <span key={i}>{c === " " ? "\u00A0" : c}</span>
        ))}
      </span>
    </span>
  );
}
