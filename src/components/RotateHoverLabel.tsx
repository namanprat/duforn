import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { MOTION_TOKENS } from "../lib/animation/motionTokens";
import { prefersReducedMotion } from "../lib/prefersReducedMotion";

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

      // The CSS (.nav-link-hover__track + .nav-link-hover__track) positions the second track one
      // line below and crops it via overflow:hidden — so there is no clip-height to measure here.
      host.classList.add("nav-link-hover");

      const { duration, staggerAmount, ease } = MOTION_TOKENS.navHover;
      const stagger = { amount: staggerAmount, from: "start" as const };

      const getSpans = () =>
        Array.from(clip.querySelectorAll<HTMLElement>(".nav-link-hover__track > span"));

      // Single source of truth: read the DOM's real :hover / :focus-within and drive the roll to
      // match. No isHovered bookkeeping to drift → the lift can never get stuck out of sync.
      const sync = () => {
        const spans = getSpans();
        if (!spans.length) return;
        if (pausedRef.current || prefersReducedMotion()) {
          gsap.killTweensOf(spans);
          gsap.set(spans, { yPercent: 0 });
          return;
        }
        const on = resolveHoverLift(host, false, false);
        gsap.to(spans, { yPercent: on ? -100 : 0, duration, ease, stagger, overwrite: "auto" });
      };

      host.addEventListener("pointerenter", sync);
      host.addEventListener("pointerleave", sync);
      host.addEventListener("focusin", sync);
      host.addEventListener("focusout", sync);

      const spanEls = getSpans();
      const reduce = prefersReducedMotion();
      const prev = prevChangeKeyRef.current;

      if (paused || reduce) {
        gsap.killTweensOf(spanEls);
        gsap.set(spanEls, { yPercent: 0 });
        if (!paused) prevChangeKeyRef.current = effectiveChangeKey;
        sync();
      } else if (prev === null || prev === effectiveChangeKey) {
        // First mount or unchanged label — no entrance, just reconcile to live hover state.
        prevChangeKeyRef.current = effectiveChangeKey;
        if (prev === null) gsap.set(spanEls, { yPercent: 0 });
        sync();
      } else {
        // Label text changed — roll the new characters in, then reconcile to live hover state.
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
            onComplete: () => sync(),
          },
        );
      }

      return () => {
        host.removeEventListener("pointerenter", sync);
        host.removeEventListener("pointerleave", sync);
        host.removeEventListener("focusin", sync);
        host.removeEventListener("focusout", sync);
        host.classList.remove("nav-link-hover");
      };
    },
    { scope: clipRef, dependencies: [effectiveChangeKey, text, paused] },
  );

  return (
    <span ref={clipRef} className="nav-link-hover__clip">
      <span className="nav-link-hover__track">
        {chars.map((c, i) => (
          <span key={i}>{c === " " ? " " : c}</span>
        ))}
      </span>
      <span className="nav-link-hover__track" aria-hidden="true">
        {chars.map((c, i) => (
          <span key={i}>{c === " " ? " " : c}</span>
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
