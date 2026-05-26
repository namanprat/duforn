import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { MOTION_TOKENS } from "../lib/anim/tokens";

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

type ToggleRevealLabelProps = {
  text: string;
  alternateText?: string;
  active?: boolean;
};

export default function ToggleRevealLabel({
  text,
  alternateText = text,
  active = false,
}: ToggleRevealLabelProps) {
  const rootRef = useRef<HTMLSpanElement | null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const track = root.querySelector<HTMLElement>(".toggle-reveal-label__track");
    const lines = Array.from(root.querySelectorAll<HTMLElement>(".toggle-reveal-label__line"));
    if (!track || lines.length < 2) return;

    const setHeight = () => {
      const measuredHeight = Math.max(
        ...lines.map((line) =>
          Math.max(line.getBoundingClientRect().height, line.scrollHeight, line.offsetHeight, 1),
        ),
      );
      root.style.height = `${Math.max(1, Math.round(measuredHeight + 0.5))}px`;
    };

    setHeight();
    const raf = requestAnimationFrame(() => setHeight());

    if (typeof document !== "undefined" && document.fonts?.ready) {
      void document.fonts.ready.then(() => setHeight());
    }

    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => setHeight()) : null;
    ro?.observe(root);
    lines.forEach((line) => ro?.observe(line));

    const targetY = active ? -50 : 0;
    gsap.killTweensOf(track);

    if (prefersReducedMotion()) {
      gsap.set(track, { yPercent: targetY });
    } else {
      gsap.to(track, {
        yPercent: targetY,
        duration: active
          ? MOTION_TOKENS.textReveal.revealDuration * 0.42
          : MOTION_TOKENS.textReveal.hideDuration * 0.5,
        ease: active ? MOTION_TOKENS.textReveal.revealEase : MOTION_TOKENS.textReveal.hideEase,
        overwrite: true,
      });
    }

    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      gsap.killTweensOf(track);
      root.style.height = "";
    };
  }, [active, alternateText, text]);

  return (
    <span ref={rootRef} className="toggle-reveal-label" aria-hidden="true">
      <span className="toggle-reveal-label__track">
        <span className="toggle-reveal-label__line">{text}</span>
        <span className="toggle-reveal-label__line">{alternateText}</span>
      </span>
    </span>
  );
}
