import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
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

/** ponytail: maps host state to lift target — dev self-check at file bottom */
function resolveHoverLift(
  host: HTMLElement | null,
  paused: boolean,
  reduce: boolean,
): boolean {
  if (!host || paused || reduce) return false;
  if (host.getAttribute("aria-current") === "page") return false;
  return host.matches(":hover") || host.matches(":focus-within");
}

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

  useGSAP(
    () => {
      const clip = clipRef.current;
      if (!clip) return;

      const host = clip.closest(INTERACTIVE_SELECTOR) as HTMLElement | null;
      if (!host) return;

      host.classList.add("nav-link-hover");

      const { duration, staggerAmount, ease } = MOTION_TOKENS.navHover;
      const stagger = { amount: staggerAmount, from: "start" as const };

      const getSpans = () =>
        Array.from(clip.querySelectorAll<HTMLElement>(".nav-link-hover__track > span"));

      const applyClipHeight = () => {
        const firstTrack = clip.querySelector(".nav-link-hover__track") as HTMLElement | null;
        if (!firstTrack) return;

        const resolveLineHeightPx = () => {
          const cs = getComputedStyle(host);
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
      };

      const applyHover = (on: boolean) => {
        if (pausedRef.current || prefersReducedMotion()) return;
        const spans = getSpans();
        if (!spans.length) return;
        gsap.to(spans, {
          yPercent: on ? -100 : 0,
          duration,
          ease,
          stagger,
          overwrite: "auto",
        });
      };

      const syncPointerState = () => {
        const reduce = prefersReducedMotion();
        if (pausedRef.current || reduce) {
          isHoveredRef.current = false;
          const spans = getSpans();
          if (spans.length) {
            gsap.killTweensOf(spans);
            gsap.set(spans, { yPercent: 0 });
          }
          return;
        }

        const on = resolveHoverLift(host, false, false);
        isHoveredRef.current = on;
        applyHover(on);
      };

      const onPointerEnter = () => {
        if (pausedRef.current || prefersReducedMotion()) return;
        if (host.getAttribute("aria-current") === "page") return;
        isHoveredRef.current = true;
        applyHover(true);
      };

      const onPointerLeave = () => {
        isHoveredRef.current = false;
        applyHover(false);
      };

      const onFocusChange = () => syncPointerState();

      host.addEventListener("pointerenter", onPointerEnter);
      host.addEventListener("pointerleave", onPointerLeave);
      host.addEventListener("focusin", onFocusChange);
      host.addEventListener("focusout", onFocusChange);

      const firstTrack = clip.querySelector(".nav-link-hover__track");
      const ro =
        typeof ResizeObserver !== "undefined"
          ? new ResizeObserver(() => {
              applyClipHeight();
              syncPointerState();
            })
          : null;
      if (ro) {
        if (firstTrack) ro.observe(firstTrack);
        ro.observe(host);
      }

      applyClipHeight();
      if (typeof document !== "undefined" && document.fonts?.ready) {
        void document.fonts.ready.then(() => {
          applyClipHeight();
          syncPointerState();
        });
      }

      const spanEls = getSpans();
      const reduce = prefersReducedMotion();
      const prev = prevChangeKeyRef.current;

      applyClipHeight();
      requestAnimationFrame(() => applyClipHeight());

      if (paused || reduce) {
        gsap.killTweensOf(spanEls);
        gsap.set(spanEls, { yPercent: 0 });
        if (!paused) prevChangeKeyRef.current = effectiveChangeKey;
        syncPointerState();
      } else if (prev === null) {
        prevChangeKeyRef.current = effectiveChangeKey;
        gsap.set(spanEls, { yPercent: 0 });
        syncPointerState();
      } else if (prev !== effectiveChangeKey) {
        prevChangeKeyRef.current = effectiveChangeKey;
        gsap.killTweensOf(spanEls);
        gsap.fromTo(
          spanEls,
          { yPercent: 100 },
          {
            yPercent: 0,
            duration,
            ease,
            stagger,
            overwrite: "auto",
            onComplete: () => syncPointerState(),
          },
        );
      } else {
        syncPointerState();
      }

      return () => {
        host.removeEventListener("pointerenter", onPointerEnter);
        host.removeEventListener("pointerleave", onPointerLeave);
        host.removeEventListener("focusin", onFocusChange);
        host.removeEventListener("focusout", onFocusChange);
        host.classList.remove("nav-link-hover");
        ro?.disconnect();
        clip.style.height = "";
      };
    },
    { scope: clipRef, dependencies: [effectiveChangeKey, text, paused] },
  );

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

if (import.meta.env.DEV) {
  const stub = document.createElement("a");
  console.assert(resolveHoverLift(null, false, false) === false, "hover lift: null host");
  console.assert(resolveHoverLift(stub, true, false) === false, "hover lift: paused");
  console.assert(resolveHoverLift(stub, false, true) === false, "hover lift: reduced motion");
  stub.setAttribute("aria-current", "page");
  console.assert(resolveHoverLift(stub, false, false) === false, "hover lift: current page");
  stub.removeAttribute("aria-current");
}
