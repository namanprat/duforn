import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";
import { registerPageTextReveal } from "../lib/text";
import { MOTION_TOKENS } from "../lib/animation/motionTokens";
import {
  prefersReducedMotion,
  resolveMotionTokens,
  waitForCamera as waitForCameraGate,
  waitForSceneAndCamera,
} from "./useRevealGate";
import { armScrollLineReveal, type ScrollLineRevealController } from "./scrollLineReveal";

gsap.registerPlugin(SplitText);

const LINE_CLASS = "text-reveal-line";

function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return (node: T | null) => {
    refs.forEach((r) => {
      if (typeof r === "function") r(node);
      else if (r && "current" in r) (r as React.MutableRefObject<T | null>).current = node;
    });
  };
}

interface TextRevealLinesProps {
  children: React.ReactElement;
  animateOnScroll?: boolean;
  animate?: boolean;
  delay?: number;
  scope?: string;
  waitForCamera?: boolean;
  waitForScene?: boolean;
  layoutKey?: number;
}

export default function TextRevealLines({
  children,
  animateOnScroll = true,
  animate = true,
  delay = 0,
  scope = "page",
  waitForCamera = false,
  waitForScene = false,
  layoutKey = 0,
}: TextRevealLinesProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  const effectiveDelay = delay;

  useGSAP(
    () => {
      const root = containerRef.current;
      if (!root) return;

      let cancelled = false;
      const reduce = prefersReducedMotion();
      const { revealDuration, revealStagger, hideDuration, hideStagger } =
        resolveMotionTokens(reduce);

      const splitRefs: SplitText[] = [];
      let lineEls: Element[] = [];
      let scrollReveal: ScrollLineRevealController | null = null;
      let disposeCamera: (() => void) | null = null;

      const elements: Element[] = root.hasAttribute("data-copy-wrapper")
        ? Array.from(root.children).filter((n) => n.nodeType === 1)
        : [root];

      const collectLines = () => {
        lineEls = splitRefs.flatMap((split) => split.lines ?? []);
      };

      const killScrollTriggers = () => {
        scrollReveal?.kill();
        scrollReveal = null;
      };

      const applyTextIndentFixes = () => {
        elements.forEach((element, index) => {
          const split = splitRefs[index];
          if (!split?.lines?.length) return;

          const computedStyle = window.getComputedStyle(element);
          const textIndent = computedStyle.textIndent;
          if (textIndent && textIndent !== "0px") {
            (split.lines[0] as HTMLElement).style.paddingLeft = textIndent;
            (element as HTMLElement).style.textIndent = "0";
          }
        });
      };

      const runRevealImmediate = (extraDelay = 0) => {
        killScrollTriggers();
        gsap.killTweensOf(lineEls);
        if (!lineEls.length) return;
        if (reduce) {
          gsap.set(lineEls, { y: "0%" });
          return;
        }
        gsap.to(lineEls, {
          y: "0%",
          duration: revealDuration,
          stagger: revealStagger,
          ease: MOTION_TOKENS.textReveal.revealEase,
          delay: effectiveDelay + extraDelay,
        });
      };

      const runRevealScroll = () => {
        killScrollTriggers();
        gsap.killTweensOf(lineEls);
        if (!lineEls.length) return;
        if (reduce) {
          gsap.set(lineEls, { y: "0%" });
          return;
        }

        scrollReveal = armScrollLineReveal(lineEls, {
          delay: effectiveDelay,
          reduce,
          revealDuration,
          revealStagger,
        });

        requestAnimationFrame(() => scrollReveal?.refresh());
      };

      const armReveal = () => {
        if (!lineEls.length) return;

        if (!animate) {
          killScrollTriggers();
          gsap.killTweensOf(lineEls);
          gsap.set(lineEls, { y: "0%" });
          return;
        }
        if (animateOnScroll && scope === "page") {
          runRevealScroll();
          return;
        }
        const fire = () => runRevealImmediate(0);
        if (waitForCamera && waitForScene) {
          disposeCamera = waitForSceneAndCamera(root, fire);
          return;
        }
        if (waitForCamera) {
          disposeCamera = waitForCameraGate(root, fire);
          return;
        }
        runRevealImmediate(0);
      };

      const setHidden = () => {
        collectLines();
        if (!lineEls.length) return false;
        gsap.set(lineEls, { y: reduce ? "0%" : "100%" });
        return true;
      };

      const buildSplits = () => {
        splitRefs.forEach((split) => {
          try {
            split.revert();
          } catch {
            /* ignore */
          }
        });
        splitRefs.length = 0;

        elements.forEach((element) => {
          const split = SplitText.create(element, {
            type: "lines",
            mask: "lines",
            linesClass: LINE_CLASS,
            lineThreshold: 0.1,
            autoSplit: true,
          });
          splitRefs.push(split);
        });

        applyTextIndentFixes();
        return setHidden();
      };

      const boot = (attempt = 0) => {
        if (cancelled) return;
        if (!buildSplits()) {
          if (attempt < 12) {
            requestAnimationFrame(() => boot(attempt + 1));
            return;
          }
          collectLines();
          if (lineEls.length) gsap.set(lineEls, { y: "0%" });
          return;
        }
        armReveal();
        scrollReveal?.refresh();
      };

      const start = async () => {
        try {
          if (document.fonts?.ready) await document.fonts.ready;
        } catch {
          /* ignore */
        }
        if (cancelled) return;
        requestAnimationFrame(() => boot());
        if (document.fonts?.ready) {
          document.fonts.ready.then(() => {
            if (cancelled) return;
            boot();
          });
        }
      };

      void start();

      const hide = () =>
        new Promise<void>((resolve) => {
          killScrollTriggers();
          disposeCamera?.();
          disposeCamera = null;
          collectLines();
          gsap.killTweensOf(lineEls);
          if (!lineEls.length) {
            resolve();
            return;
          }
          if (reduce) {
            gsap.set(lineEls, { y: "100%" });
            resolve();
            return;
          }
          gsap.to(lineEls, {
            y: "100%",
            duration: hideDuration,
            stagger: hideStagger,
            ease: MOTION_TOKENS.textReveal.hideEase,
            onComplete: () => resolve(),
          });
        });

      const show = () =>
        new Promise<void>((resolve) => {
          killScrollTriggers();
          disposeCamera?.();
          disposeCamera = null;
          collectLines();
          gsap.killTweensOf(lineEls);
          if (!lineEls.length) {
            resolve();
            return;
          }
          if (reduce) {
            gsap.set(lineEls, { y: "0%" });
            resolve();
            return;
          }
          if (animateOnScroll && scope === "page") {
            gsap.set(lineEls, { y: "100%" });
            runRevealScroll();
            resolve();
            return;
          }
          gsap.to(lineEls, {
            y: "0%",
            duration: revealDuration * MOTION_TOKENS.textReveal.showDurationScale,
            stagger: revealStagger * MOTION_TOKENS.textReveal.showStaggerScale,
            ease: MOTION_TOKENS.textReveal.revealEase,
            delay: effectiveDelay,
            onComplete: () => resolve(),
          });
        });

      const unregister = registerPageTextReveal({ hide, show });

      return () => {
        cancelled = true;
        unregister();
        killScrollTriggers();
        disposeCamera?.();
        splitRefs.forEach((split) => {
          try {
            split?.revert();
          } catch {
            /* ignore */
          }
        });
        gsap.killTweensOf(lineEls);
      };
    },
    {
      scope: containerRef,
      dependencies: [animateOnScroll, animate, delay, scope, waitForCamera, waitForScene, layoutKey],
    },
  );

  if (React.Children.count(children) === 1) {
    const only = React.Children.only(children);
    return React.cloneElement(only, {
      ref: mergeRefs(
        containerRef,
        (only as React.ReactElement & { ref?: React.Ref<HTMLElement> }).ref,
      ),
      "data-text-reveal-root": "",
    } as React.HTMLAttributes<HTMLElement>);
  }

  return (
    <div
      ref={containerRef as React.RefObject<HTMLDivElement>}
      data-copy-wrapper="true"
      data-text-reveal-root=""
    >
      {children}
    </div>
  );
}
