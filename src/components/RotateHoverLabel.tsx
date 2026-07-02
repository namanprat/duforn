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

  // NOTE: `text` is intentionally NOT an effect dependency — the nav clock updates it
  // every second and the span nodes persist across renders (index keys, fixed length),
  // so the timeline built below stays valid. Re-running per tick fired idle tweens.
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

      const spans = Array.from(
        clip.querySelectorAll<HTMLElement>(".nav-link-hover__track > span"),
      );
      if (!spans.length) return;

      // One persistent, reversible timeline owns the hover roll. play()/reverse() can
      // interrupt each other mid-flight without overlapping tweens or stuck chars.
      const hoverTl = gsap
        .timeline({ paused: true })
        .to(spans, { yPercent: -100, duration, ease, stagger });

      // Hover events during the entrance roll are deferred to its onComplete sync.
      let entering = false;

      const sync = () => {
        if (entering) return;
        if (pausedRef.current || prefersReducedMotion()) {
          hoverTl.pause(0);
          gsap.set(spans, { yPercent: 0 });
          return;
        }
        if (resolveHoverLift(host, false, false)) hoverTl.play();
        else hoverTl.reverse();
      };

      host.addEventListener("pointerenter", sync);
      host.addEventListener("pointerleave", sync);
      host.addEventListener("focusin", sync);
      host.addEventListener("focusout", sync);

      const reduce = prefersReducedMotion();
      const prev = prevChangeKeyRef.current;
      let entranceTween: gsap.core.Tween | null = null;

      if (paused || reduce) {
        gsap.set(spans, { yPercent: 0 });
        if (!paused) prevChangeKeyRef.current = effectiveChangeKey;
      } else if (prev === null || prev === effectiveChangeKey) {
        // First mount or unchanged label — no entrance, just reconcile to live hover state.
        prevChangeKeyRef.current = effectiveChangeKey;
        if (prev === null) gsap.set(spans, { yPercent: 0 });
        sync();
      } else {
        // Label text changed — roll the new characters in, then hand off to the hover
        // timeline snapped to the live hover state (no race between the two).
        prevChangeKeyRef.current = effectiveChangeKey;
        entering = true;
        entranceTween = gsap.fromTo(
          spans,
          { yPercent: 100 },
          {
            yPercent: 0,
            duration,
            ease,
            stagger,
            onComplete: () => {
              entering = false;
              hoverTl.invalidate().pause(0);
              sync();
            },
          },
        );
      }

      return () => {
        host.removeEventListener("pointerenter", sync);
        host.removeEventListener("pointerleave", sync);
        host.removeEventListener("focusin", sync);
        host.removeEventListener("focusout", sync);
        host.classList.remove("nav-link-hover");
        entranceTween?.kill();
        hoverTl.kill();
        gsap.killTweensOf(spans);
        gsap.set(spans, { yPercent: 0 });
      };
    },
    { scope: clipRef, dependencies: [effectiveChangeKey, paused] },
  );

  return (
    <span ref={clipRef} className="nav-link-hover__clip">
      <span className="nav-link-hover__track">
        {chars.map((c, i) => (
          <span key={i}>{c === " " ? " " : c}</span>
        ))}
      </span>
      <span className="nav-link-hover__track" aria-hidden="true">
        {chars.map((c, i) => (
          <span key={i}>{c === " " ? " " : c}</span>
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
