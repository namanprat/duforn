import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { registerPageTextReveal } from "../lib/text";
import { MOTION_TOKENS } from "../lib/anim/tokens";
import {
  prefersReducedMotion,
  resolveMotionTokens,
  waitForCamera as waitForCamera_fn,
  waitForPreloader as waitForPreloader_fn,
} from "./useRevealGate";

interface MaskRevealProps {
  children: React.ReactNode;
  delay?: number;
  /** Wait for the room camera to finish its arrival tween before revealing. */
  waitForCamera?: boolean;
  waitForPreloader?: boolean;
  className?: string;
}

/**
 * Line-mask reveal for a single non-text block (SVG wordmark, image, etc.).
 * Sibling of `TextRevealLines` with identical motion: the child starts at
 * y:100% inside an overflow-hidden mask and rises to 0% with the same tokens,
 * gates, and page-text registry as the SplitText line reveal — so it animates
 * and route-hides in lockstep with surrounding text.
 */
export default function MaskReveal({
  children,
  delay = 0,
  waitForCamera = false,
  waitForPreloader = false,
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
      let disposePreloader: (() => void) | null = null;

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

      if (waitForCamera && waitForPreloader) {
        disposeCamera = waitForCamera_fn(mask, () => {
          disposePreloader = waitForPreloader_fn(runReveal);
        });
      } else if (waitForCamera) {
        disposeCamera = waitForCamera_fn(mask, runReveal);
      } else if (waitForPreloader) {
        disposePreloader = waitForPreloader_fn(runReveal);
      } else {
        runReveal();
      }

      const hide = () =>
        new Promise<void>((resolve) => {
          if (disposeCamera) {
            disposeCamera();
            disposeCamera = null;
          }
          if (disposePreloader) {
            disposePreloader();
            disposePreloader = null;
          }
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
        if (disposeCamera) disposeCamera();
        if (disposePreloader) disposePreloader();
        gsap.killTweensOf(inner);
      };
    },
    {
      scope: maskRef,
      dependencies: [delay, waitForCamera, waitForPreloader],
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
