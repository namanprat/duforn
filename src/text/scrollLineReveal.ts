import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MOTION_TOKENS } from "../lib/animation/motionTokens";
import { getLenis, LENIS_SCROLLER } from "../lib/lenis-scroll";

gsap.registerPlugin(ScrollTrigger);

const VIEWPORT_THRESHOLD = 0.95;
const REVEAL_TRIGGER_ID = "scroll-line-reveal";

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

type Registration = { lines: Element[]; opts: ScrollLineRevealOptions };

const registrations = new Map<symbol, Registration>();
let activeOpts: ScrollLineRevealOptions | null = null;
let orderedLines: Element[] = [];
const revealed = new Set<Element>();
let scrollTrigger: ScrollTrigger | null = null;
let removeFallbackListeners: (() => void) | null = null;

function sortByDocumentOrder(elements: Element[]): Element[] {
  return [...elements].sort((a, b) => {
    if (a === b) return 0;
    const pos = a.compareDocumentPosition(b);
    if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
    if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
    return 0;
  });
}

function recomputeActiveOpts() {
  let next: ScrollLineRevealOptions | null = null;
  registrations.forEach(({ opts }) => {
    if (!next) {
      next = { ...opts };
      return;
    }
    next = {
      delay: Math.max(next.delay ?? 0, opts.delay ?? 0),
      reduce: next.reduce || opts.reduce,
      revealDuration: opts.revealDuration,
      revealStagger: opts.revealStagger,
    };
  });
  activeOpts = next;
}

function rebuildOrderedLines() {
  const merged: Element[] = [];
  registrations.forEach(({ lines }) => merged.push(...lines));
  orderedLines = sortByDocumentOrder(merged);
  for (const line of revealed) {
    if (!orderedLines.includes(line)) revealed.delete(line);
  }
}

function killScrollListener() {
  scrollTrigger?.kill();
  scrollTrigger = null;
  removeFallbackListeners?.();
  removeFallbackListeners = null;
}

function ensureScrollListener() {
  if (scrollTrigger) return;

  const onScroll = () => processReveal();
  const onResize = () => {
    ScrollTrigger.refresh();
    processReveal();
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize);

  const lenis = getLenis();
  const onLenisScroll = () => processReveal();
  lenis?.on("scroll", onLenisScroll);

  removeFallbackListeners = () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
    lenis?.off("scroll", onLenisScroll);
  };

  scrollTrigger = ScrollTrigger.create({
    id: REVEAL_TRIGGER_ID,
    trigger: LENIS_SCROLLER,
    start: "top top",
    end: "bottom bottom",
    onUpdate: () => processReveal(),
    ...(getLenis() ? { scroller: LENIS_SCROLLER } : {}),
  });
}

function processReveal() {
  if (!orderedLines.length || !activeOpts) return;

  const { delay = 0, reduce, revealDuration, revealStagger } = activeOpts;
  if (reduce) return;

  const threshold = window.innerHeight * VIEWPORT_THRESHOLD;
  const snap: Element[] = [];
  const animate: Element[] = [];

  for (const line of orderedLines) {
    if (revealed.has(line)) continue;

    const r = line.getBoundingClientRect();

    if (r.bottom < 0) {
      snap.push(line);
      continue;
    }

    if (r.top < threshold && r.bottom > 0) {
      animate.push(line);
      continue;
    }

    break;
  }

  if (snap.length) {
    snap.forEach((line) => revealed.add(line));
    gsap.killTweensOf(snap);
    gsap.set(snap, { y: "0%" });
  }

  if (!animate.length) return;

  animate.forEach((line) => revealed.add(line));
  gsap.killTweensOf(animate);
  gsap.to(animate, {
    y: "0%",
    duration: revealDuration,
    stagger: revealStagger,
    ease: MOTION_TOKENS.textReveal.revealEase,
    delay,
    overwrite: "auto",
  });
}

function registerScrollLines(
  lines: Element[],
  opts: ScrollLineRevealOptions,
): () => void {
  const id = Symbol("scroll-lines");
  registrations.set(id, { lines, opts });
  recomputeActiveOpts();

  lines.forEach((line) => revealed.delete(line));

  if (opts.reduce) {
    gsap.set(lines, { y: "0%" });
    lines.forEach((line) => revealed.add(line));
  } else {
    gsap.set(lines, { y: "100%" });
  }

  rebuildOrderedLines();
  ensureScrollListener();
  requestAnimationFrame(() => {
    ScrollTrigger.refresh();
    processReveal();
  });

  return () => {
    lines.forEach((line) => revealed.delete(line));
    registrations.delete(id);
    recomputeActiveOpts();

    if (registrations.size === 0) {
      killScrollListener();
      activeOpts = null;
      orderedLines = [];
      revealed.clear();
      return;
    }

    rebuildOrderedLines();
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      processReveal();
    });
  };
}

export function armScrollLineReveal(
  lines: Element[],
  opts: ScrollLineRevealOptions,
): ScrollLineRevealController {
  const kill = registerScrollLines(lines, opts);

  return {
    kill,
    refresh: () => {
      ScrollTrigger.refresh();
      processReveal();
    },
  };
}
