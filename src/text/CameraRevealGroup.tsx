// @ts-nocheck
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

/**
 * Fade + slide reveal for non-text elements (buttons, link cards, etc.) gated
 * on camera arrival. Sibling of `TextRevealLines` — registers with the same
 * page-text registry so `hideAllRegisteredPageText` reaches it during route
 * leaves, and listens to `duforn:room-camera-arrived` scoped to the host
 * `[data-page-namespace]` (so a stale arrival from the prior room cannot
 * pre-arm it).
 *
 * Layout: wrapper uses `display: contents` so it does not affect flex/grid.
 */
export default function CameraRevealGroup({
  children,
  delay = 0,
  yOffset = 28,
  waitForCamera = true,
  waitForPreloader = false,
}) {
  const containerRef = useRef(null);

  useGSAP(
    () => {
      const root = containerRef.current;
      if (!root) return;
      const items = Array.from(root.children).filter((n) => n.nodeType === 1);
      if (items.length === 0) return;

      const reduce = prefersReducedMotion();
      const { revealDuration, revealStagger, hideDuration, hideStagger } =
        resolveMotionTokens(reduce);

      gsap.set(items, { y: reduce ? 0 : yOffset, opacity: reduce ? 1 : 0 });

      let disposeCamera = null;
      let disposePreloader = null;

      const runReveal = () => {
        gsap.killTweensOf(items);
        if (reduce) {
          gsap.set(items, { y: 0, opacity: 1 });
          return;
        }
        gsap.to(items, {
          y: 0,
          opacity: 1,
          duration: revealDuration,
          stagger: revealStagger,
          ease: MOTION_TOKENS.textReveal.revealEase,
          delay,
        });
      };

      if (waitForCamera && waitForPreloader) {
        disposeCamera = waitForCamera_fn(root, () => {
          disposePreloader = waitForPreloader_fn(runReveal);
        });
      } else if (waitForCamera) {
        disposeCamera = waitForCamera_fn(root, runReveal);
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
          gsap.killTweensOf(items);
          if (reduce) {
            gsap.set(items, { y: yOffset, opacity: 0 });
            resolve();
            return;
          }
          gsap.to(items, {
            y: yOffset,
            opacity: 0,
            duration: hideDuration,
            stagger: hideStagger,
            ease: MOTION_TOKENS.textReveal.hideEase,
            onComplete: () => resolve(),
          });
        });

      const show = () =>
        new Promise<void>((resolve) => {
          gsap.killTweensOf(items);
          if (reduce) {
            gsap.set(items, { y: 0, opacity: 1 });
            resolve();
            return;
          }
          gsap.to(items, {
            y: 0,
            opacity: 1,
            duration: revealDuration * MOTION_TOKENS.textReveal.showDurationScale,
            stagger: revealStagger * MOTION_TOKENS.textReveal.showStaggerScale,
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
        gsap.killTweensOf(items);
      };
    },
    {
      scope: containerRef,
      dependencies: [delay, yOffset, waitForCamera, waitForPreloader],
    },
  );

  return (
    <div ref={containerRef} data-camera-reveal-group="" style={{ display: "contents" }}>
      {children}
    </div>
  );
}
