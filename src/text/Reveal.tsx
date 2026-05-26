// @ts-nocheck
import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { registerMenuTextReveal, registerPageTextReveal } from "../lib/text";
import { MOTION_TOKENS } from "../lib/anim/tokens";

gsap.registerPlugin(SplitText, ScrollTrigger);

const LINE_CLASS = "text-reveal-line";

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function mergeRefs(...refs) {
  return (node) => {
    refs.forEach((r) => {
      if (typeof r === "function") r(node);
      else if (r) r.current = node;
    });
  };
}

/**
 * Line-mask reveal matching `text-reveal/src/components/Copy.jsx`.
 */
export default function TextRevealLines({
  children,
  animateOnScroll = true,
  delay = 0,
  scope = "page",
  waitForPreloader = false,
  /** When layout changes (e.g. measured width), pass a new value so SplitText reverts and re-splits. */
  layoutKey = 0,
}) {
  const containerRef = useRef(null);
  const effectiveDelay = delay;

  useGSAP(
    () => {
      const root = containerRef.current;
      if (!root) return;

      const reduce = prefersReducedMotion();
      const revealDuration = reduce ? 0.05 : MOTION_TOKENS.textReveal.revealDuration;
      const revealStagger = reduce ? 0 : MOTION_TOKENS.textReveal.revealStagger;
      const hideDuration = reduce ? 0.05 : MOTION_TOKENS.textReveal.hideDuration;
      const hideStagger = reduce ? 0 : MOTION_TOKENS.textReveal.hideStagger;

      const splitRefs = [];
      let lineEls = [];
      let scrollTriggerInstance = null;
      let intersectionObserver = null;
      let preloaderListener = null;

      let elements = [];
      if (root.hasAttribute("data-copy-wrapper")) {
        elements = Array.from(root.children).filter((n) => n.nodeType === 1);
      } else {
        elements = [root];
      }

      elements.forEach((element) => {
        const split = SplitText.create(element, {
          type: "lines",
          mask: "lines",
          linesClass: LINE_CLASS,
          lineThreshold: 0.1,
        });
        splitRefs.push(split);
        lineEls = lineEls.concat(split.lines);

        const computedStyle = window.getComputedStyle(element);
        const textIndent = computedStyle.textIndent;
        if (textIndent && textIndent !== "0px" && split.lines.length > 0) {
          split.lines[0].style.paddingLeft = textIndent;
          element.style.textIndent = "0";
        }
      });

      if (scope === "menu") {
        gsap.set(lineEls, { y: "100%" });
      } else {
        gsap.set(lineEls, { y: reduce ? "0%" : "100%" });
      }

      const killScrollTrigger = () => {
        if (scrollTriggerInstance) {
          scrollTriggerInstance.kill();
          scrollTriggerInstance = null;
        }
        if (intersectionObserver) {
          intersectionObserver.disconnect();
          intersectionObserver = null;
        }
      };

      const runRevealImmediate = (extraDelay = 0) => {
        killScrollTrigger();
        gsap.killTweensOf(lineEls);
        if (reduce) {
          gsap.set(lineEls, { y: "0%" });
          return;
        }
        gsap.to(lineEls, {
          y: "0%",
          duration: revealDuration,
          stagger: revealStagger,
          ease: "power4.out",
          delay: effectiveDelay + extraDelay,
        });
      };

      const runRevealScroll = () => {
        killScrollTrigger();
        gsap.killTweensOf(lineEls);
        if (reduce) {
          gsap.set(lineEls, { y: "0%" });
          return;
        }
        gsap.set(lineEls, { y: "100%" });
        scrollTriggerInstance = ScrollTrigger.create({
          trigger: root,
          start: "top 75%",
          once: true,
          onEnter: () => {
            gsap.to(lineEls, {
              y: "0%",
              duration: revealDuration,
              stagger: revealStagger,
              ease: MOTION_TOKENS.textReveal.revealEase,
              delay: effectiveDelay,
            });
          },
        });

        // If trigger is already past start at creation (e.g. after route transitions/refresh),
        // reveal immediately so lines don't remain stuck at y:100%.
        if (scrollTriggerInstance.isActive || scrollTriggerInstance.progress > 0) {
          killScrollTrigger();
          gsap.to(lineEls, {
            y: "0%",
            duration: revealDuration,
            stagger: revealStagger,
            ease: MOTION_TOKENS.textReveal.revealEase,
            delay: effectiveDelay,
          });
          return;
        }

        // Secondary guard for smooth-scroll / route-transition timing mismatches:
        // reveal when element intersects viewport even if ScrollTrigger never enters.
        if (typeof IntersectionObserver !== "undefined") {
          intersectionObserver = new IntersectionObserver(
            (entries) => {
              const entry = entries[0];
              if (!entry?.isIntersecting) return;
              killScrollTrigger();
              gsap.to(lineEls, {
                y: "0%",
                duration: revealDuration,
                stagger: revealStagger,
                ease: MOTION_TOKENS.textReveal.revealEase,
                delay: effectiveDelay,
              });
            },
            {
              root: null,
              rootMargin: "0px 0px -25% 0px",
              threshold: 0.01,
            },
          );
          intersectionObserver.observe(root);
        }
      };

      const armReveal = () => {
        if (scope === "menu") {
          return;
        }
        if (animateOnScroll && scope === "page") {
          runRevealScroll();
          return;
        }
        if (waitForPreloader) {
          // `body.preloader-active` is toggled in SiteLayout's useEffect, which runs *after*
          // this useGSAP layout pass — so we must not rely on that class. If the intro DOM is
          // still mounted, wait for Enter (click/ink) via `duforn:preloader-dismissed`; otherwise
          // reveal immediately (e.g. client nav back to home after preloader is gone).
          const preloaderEl = document.querySelector(".intro-preloader");
          if (!preloaderEl) {
            runRevealImmediate(0);
            return;
          }
          const onDismiss = () => {
            window.removeEventListener("duforn:preloader-dismissed", onDismiss);
            preloaderListener = null;
            runRevealImmediate(0);
          };
          preloaderListener = onDismiss;
          window.addEventListener("duforn:preloader-dismissed", onDismiss);
          return;
        }
        runRevealImmediate(0);
      };

      if (scope !== "menu") {
        armReveal();
      }

      const hide = () =>
        new Promise<void>((resolve) => {
          killScrollTrigger();
          if (preloaderListener) {
            window.removeEventListener("duforn:preloader-dismissed", preloaderListener);
            preloaderListener = null;
          }
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
          killScrollTrigger();
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
          gsap.to(lineEls, {
            y: "0%",
            duration: revealDuration * MOTION_TOKENS.textReveal.showDurationScale,
            stagger: revealStagger * MOTION_TOKENS.textReveal.showStaggerScale,
            ease: MOTION_TOKENS.textReveal.revealEase,
            delay: effectiveDelay,
            onComplete: () => resolve(),
          });
        });

      const control = { hide, show };
      const unregister =
        scope === "menu" ? registerMenuTextReveal(control) : registerPageTextReveal(control);

      return () => {
        unregister();
        killScrollTrigger();
        if (preloaderListener) {
          window.removeEventListener("duforn:preloader-dismissed", preloaderListener);
        }
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
      dependencies: [animateOnScroll, delay, scope, waitForPreloader, layoutKey],
    },
  );

  if (React.Children.count(children) === 1) {
    const only = React.Children.only(children);
    return React.cloneElement(only, {
      ref: mergeRefs(containerRef, only.ref),
      "data-text-reveal-root": "",
    });
  }

  return (
    <div ref={containerRef} data-copy-wrapper="true" data-text-reveal-root="">
      {children}
    </div>
  );
}
