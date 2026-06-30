import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { registerPageTextReveal } from "../lib/text";
import { MOTION_TOKENS } from "../lib/animation/motionTokens";
import {
  prefersReducedMotion,
  resolveMotionTokens,
  waitForCamera as waitForCameraGate,
  waitForSceneAndCamera,
} from "./useRevealGate";

interface CameraRevealGroupProps {
  children: React.ReactNode;
  delay?: number;
  yOffset?: number;
  waitForCamera?: boolean;
  waitForScene?: boolean;
}

/** Fade + slide reveal for buttons and grouped UI, gated on camera arrival. */
export default function CameraRevealGroup({
  children,
  delay = 0,
  yOffset = 28,
  waitForCamera = true,
  waitForScene = false,
}: CameraRevealGroupProps) {
  const containerRef = useRef<HTMLDivElement>(null);

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

      let disposeCamera: (() => void) | null = null;

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

      if (waitForCamera && waitForScene) {
        disposeCamera = waitForSceneAndCamera(root, runReveal);
      } else if (waitForCamera) {
        disposeCamera = waitForCameraGate(root, runReveal);
      } else {
        runReveal();
      }

      const snapHide = () => {
        disposeCamera?.();
        disposeCamera = null;
        gsap.killTweensOf(items);
        gsap.set(items, { y: yOffset, opacity: 0 });
      };

      const hide = () =>
        new Promise<void>((resolve) => {
          disposeCamera?.();
          disposeCamera = null;
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

      const isShown = () =>
        items.length > 0 &&
        gsap.getProperty(items[0], "opacity") === 1 &&
        gsap.getProperty(items[0], "y") === 0;

      const show = () =>
        new Promise<void>((resolve) => {
          if (isShown()) {
            resolve();
            return;
          }
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

      const unregister = registerPageTextReveal({ hide, show, snapHide });

      return () => {
        unregister();
        disposeCamera?.();
        gsap.killTweensOf(items);
      };
    },
    {
      scope: containerRef,
      dependencies: [delay, yOffset, waitForCamera, waitForScene],
    },
  );

  return (
    <div ref={containerRef} data-camera-reveal-group="" style={{ display: "contents" }}>
      {children}
    </div>
  );
}
