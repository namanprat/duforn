import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MOTION_TOKENS } from "../lib/animation/motionTokens";
import { getLenis } from "../lib/lenis-scroll";

gsap.registerPlugin(ScrollTrigger);

const VIEWPORT_THRESHOLD = 0.95;

export interface ScrollLineRevealOptions {
  delay?: number;
  reduce: boolean;
  revealDuration: number;
  revealStagger: number;
}

export interface ScrollLineRevealController {
  kill: () => void;
  refresh: () => void;
}

function linesInViewport(candidates: Element[]): Element[] {
  const threshold = window.innerHeight * VIEWPORT_THRESHOLD;
  return candidates.filter((el) => {
    const r = el.getBoundingClientRect();
    return r.top < threshold && r.bottom > 0;
  });
}

export function armScrollLineReveal(
  lines: Element[],
  opts: ScrollLineRevealOptions,
): ScrollLineRevealController {
  const { delay = 0, reduce, revealDuration, revealStagger } = opts;
  const revealed = new Set<Element>();
  let triggers: ScrollTrigger[] = [];

  const kill = () => {
    triggers.forEach((trigger) => trigger.kill());
    triggers = [];
    revealed.clear();
  };

  if (!lines.length) {
    return {
      kill,
      refresh: () => ScrollTrigger.refresh(),
    };
  }

  if (reduce) {
    gsap.set(lines, { y: "0%" });
    lines.forEach((line) => revealed.add(line));
    return {
      kill,
      refresh: () => ScrollTrigger.refresh(),
    };
  }

  gsap.set(lines, { y: "100%" });

  const revealPending = () => {
    const inView = linesInViewport(lines);
    const next = inView.filter((line) => !revealed.has(line));
    if (!next.length) return;

    const ordered = lines.filter((line) => next.includes(line));
    ordered.forEach((line) => revealed.add(line));

    gsap.killTweensOf(ordered);
    gsap.to(ordered, {
      y: "0%",
      duration: revealDuration,
      stagger: revealStagger,
      ease: MOTION_TOKENS.textReveal.revealEase,
      delay,
    });
  };

  const refresh = () => {
    ScrollTrigger.refresh();
    revealPending();
  };

  triggers = ScrollTrigger.batch(lines, {
    start: "top 95%",
    once: true,
    ...(getLenis() ? { scroller: document.body } : {}),
    onEnter: () => {
      revealPending();
    },
  });

  requestAnimationFrame(refresh);

  return { kill, refresh };
}
