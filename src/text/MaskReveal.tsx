import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { registerPageTextReveal } from "../lib/text";
import { MOTION_TOKENS } from "../lib/anim/tokens";
import { prefersReducedMotion, resolveMotionTokens, waitForCamera as waitForCameraGate } from "./useRevealGate";

interface MaskRevealProps {
  children: React.ReactNode;
  delay?: number;
  waitForCamera?: boolean;
  className?: string;
}

/** Masked y-slide reveal for non-text blocks (SVG wordmarks, etc.). */
export default function MaskReveal({
  children,
  delay = 0,
  waitForCamera = false,
  className,
}: MaskRevealProps) {
  const maskRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mask = maskRef.current;
      const inner = innerRef.current;
      if (!mask || !inner) return;

      const reduce = prefersReducedMotion();
      const { revealDuration, hideDuration } = resolveMotionTokens(reduce);

      gsap.set(inner, { y: reduce ? "0%" : "100%" });

      let disposeCamera: (() => void) | null = null;

      const runReveal = () => {
        gsap.killTweensOf(inner);
        if (reduce) {
          gsap.set(inner, { y: "0%" });
          return;
        }
        gsap.to(inner, {
          y: "0%",
          duration: revealDuration,
          ease: MOTION_TOKENS.textReveal.revealEase,
          delay,
        });
      };

      if (waitForCamera) {
        disposeCamera = waitForCameraGate(mask, runReveal);
      } else {
        runReveal();
      }

      const hide = () =>
        new Promise<void>((resolve) => {
          disposeCamera?.();
          disposeCamera = null;
          gsap.killTweensOf(inner);
          if (reduce) {
            gsap.set(inner, { y: "100%" });
            resolve();
            return;
          }
          gsap.to(inner, {
            y: "100%",
            duration: hideDuration,
            ease: MOTION_TOKENS.textReveal.hideEase,
            onComplete: () => resolve(),
          });
        });

      const show = () =>
        new Promise<void>((resolve) => {
          gsap.killTweensOf(inner);
          if (reduce) {
            gsap.set(inner, { y: "0%" });
            resolve();
            return;
          }
          gsap.to(inner, {
            y: "0%",
            duration: revealDuration * MOTION_TOKENS.textReveal.showDurationScale,
            ease: MOTION_TOKENS.textReveal.revealEase,
            delay,
            onComplete: () => resolve(),
          });
        });

      const unregister = registerPageTextReveal({ hide, show });

      return () => {
        unregister();
        disposeCamera?.();
        gsap.killTweensOf(inner);
      };
    },
    {
      scope: maskRef,
      dependencies: [delay, waitForCamera],
    },
  );

  return (
    <div ref={maskRef} className={className} style={{ overflow: "hidden", height: "100%" }}>
      <div ref={innerRef} style={{ height: "100%", willChange: "transform" }}>
        {children}
      </div>
    </div>
  );
}
