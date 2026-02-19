import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

// ─── State ──────────────────────────────────────────────────────────────────────

const splits = new Map();
const splitTracking = [];

// ─── Helpers ────────────────────────────────────────────────────────────────────

function tweenToPromise(tween) {
  return tween
    ? new Promise((resolve) => tween.eventCallback("onComplete", resolve))
    : Promise.resolve();
}

function getOrSplit(element, type = "lines, words, chars") {
  if (!element) return null;
  if (splits.has(element)) return splits.get(element);

  const split = new SplitText(element, { type, reduceWhiteSpace: false });

  if (split.lines?.length) {
    const lines = split.lines;
    const len = lines.length;

    const computedStyle = window.getComputedStyle(element);
    const textIndent = computedStyle.textIndent;
    const hasIndent = textIndent && textIndent !== "0px";

    if (hasIndent) {
      lines[0].style.paddingLeft = textIndent;
      element.style.textIndent = "0";
    }

    const wrappers = new Array(len);
    for (let i = 0; i < len; i++) {
      const wrapper = document.createElement("div");
      wrapper.className = "u-overflow-hidden";
      wrapper.style.cssText = "display:block;width:100%";
      wrappers[i] = wrapper;
    }

    for (let i = 0; i < len; i++) {
      const line = lines[i];
      const wrapper = wrappers[i];
      line.parentNode.insertBefore(wrapper, line);
      wrapper.appendChild(line);
      line.style.cssText = "display:block;width:100%;overflow:visible";
    }
  }

  splits.set(element, split);
  splitTracking.push(split);
  return split;
}

// ─── Char animations (reveal-title) ────────────────────────────────────────────

function revealChars(element, { duration = 0.6, stagger = 0.02, ease = "power2.out" } = {}) {
  const split = getOrSplit(element, "lines, words, chars");
  if (!split?.chars?.length) return null;
  return gsap.fromTo(
    split.chars,
    { y: 100, opacity: 0 },
    { y: 0, opacity: 1, duration, stagger, ease }
  );
}

function hideChars(element, { duration = 0.4, stagger = 0.015, ease = "power2.in" } = {}) {
  const split = getOrSplit(element, "lines, words, chars");
  if (!split?.chars?.length) return null;
  return gsap.to(split.chars, { y: -100, opacity: 0, duration, stagger, ease });
}

// ─── Line animations (reveal-body) ─────────────────────────────────────────────

function revealLines(element, { duration = 0.7, stagger = 0.08, ease = "power4.out" } = {}) {
  const split = getOrSplit(element, "lines");
  if (!split?.lines?.length) return null;
  return gsap.fromTo(
    split.lines,
    { yPercent: 100, opacity: 0 },
    { yPercent: 0, opacity: 1, duration, stagger, ease }
  );
}

function hideLines(element, { duration = 0.35, stagger = 0.05, ease = "power2.in" } = {}) {
  const split = getOrSplit(element, "lines");
  if (!split?.lines?.length) return null;
  return gsap.to(split.lines, { yPercent: -100, opacity: 0, duration, stagger, ease });
}

// ─── Public API ─────────────────────────────────────────────────────────────────

async function animateRevealEnter(container) {
  if (!container) return;

  const titles = container.querySelectorAll(".reveal-title");
  const bodies = container.querySelectorAll(".reveal-body");
  if (!titles.length && !bodies.length) return;

  // Clear inline styles so fresh split + animation can take over
  const all = [...titles, ...bodies];
  gsap.set(all, { clearProps: "all" });

  const animations = [];

  for (let i = 0; i < titles.length; i++) {
    const el = titles[i];
    if (!el.textContent.trim()) continue;
    const tween = revealChars(el);
    if (tween) animations.push(tweenToPromise(tween));
  }

  for (let i = 0; i < bodies.length; i++) {
    const el = bodies[i];
    if (!el.textContent.trim()) continue;
    const tween = revealLines(el);
    if (tween) animations.push(tweenToPromise(tween));
  }

  if (animations.length) await Promise.all(animations);
}

async function animateRevealLeave(container) {
  if (!container) return;

  const titles = container.querySelectorAll(".reveal-title");
  const bodies = container.querySelectorAll(".reveal-body");
  if (!titles.length && !bodies.length) return;

  const animations = [];

  for (let i = 0; i < titles.length; i++) {
    const el = titles[i];
    if (!el.textContent.trim()) continue;
    const tween = hideChars(el);
    if (tween) animations.push(tweenToPromise(tween));
  }

  for (let i = 0; i < bodies.length; i++) {
    const el = bodies[i];
    if (!el.textContent.trim()) continue;
    const tween = hideLines(el);
    if (tween) animations.push(tweenToPromise(tween));
  }

  if (animations.length) await Promise.all(animations);
}

function cleanupSplits() {
  for (let i = splitTracking.length - 1; i >= 0; i--) {
    const split = splitTracking[i];
    if (split && typeof split.revert === "function") {
      split.revert();
    }
  }
  splitTracking.length = 0;
  splits.clear();
}

export { animateRevealEnter, animateRevealLeave, cleanupSplits };
