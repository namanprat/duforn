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
      wrapper.style.cssText = "display:block;width:100%;padding:0.2em 0;margin:-0.2em 0;";
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
  const splitType = element.getAttribute("data-split-type") || "lines, words, chars";
  const split = getOrSplit(element, splitType);
  if (!split?.chars?.length) return null;
  return gsap.fromTo(
    split.chars,
    { y: 100, opacity: 0 },
    { y: 0, opacity: 1, duration, stagger, ease }
  );
}

function hideChars(element, { duration = 0.4, stagger = 0.015, ease = "power2.in" } = {}) {
  const splitType = element.getAttribute("data-split-type") || "lines, words, chars";
  const split = getOrSplit(element, splitType);
  if (!split?.chars?.length) return null;
  return gsap.to(split.chars, { y: 100, opacity: 0, duration, stagger, ease });
}

// ─── Line animations (reveal-body) ─────────────────────────────────────────────

function revealLines(element, { duration = 0.7, stagger = 0.08, ease = "power4.out", delay = 0 } = {}) {
  const split = getOrSplit(element, "lines");
  if (!split?.lines?.length) return null;
  return gsap.fromTo(
    split.lines,
    { yPercent: 100, opacity: 0 },
    { yPercent: 0, opacity: 1, duration, stagger, ease, delay }
  );
}

function hideLines(element, { duration = 0.35, stagger = 0.05, ease = "power2.in", delay = 0 } = {}) {
  const split = getOrSplit(element, "lines");
  if (!split?.lines?.length) return null;
  return gsap.to(split.lines, { yPercent: 100, opacity: 0, duration, stagger, ease, delay });
}

function getBodyStaggerMeta(element) {
  const parent = element.closest("[data-reveal-body-stagger]");
  if (!parent) return null;

  const siblings = Array.from(parent.querySelectorAll(".reveal-body"));
  const index = siblings.indexOf(element);
  if (index < 0) return null;

  const stepAttr = Number(parent.getAttribute("data-reveal-body-stagger"));
  const step = Number.isFinite(stepAttr) && stepAttr >= 0 ? stepAttr : 0.08;

  return { index, total: siblings.length, step };
}

// ─── Public API ─────────────────────────────────────────────────────────────────

function filterByExcludeSelector(elements, excludeSelector) {
  if (!excludeSelector) return elements;
  return Array.from(elements).filter((element) => !element.matches(excludeSelector));
}

async function animateRevealEnter(container, options = {}) {
  if (!container) return;
  const { excludeSelector } = options;

  const titles = filterByExcludeSelector(container.querySelectorAll(".reveal-title"), excludeSelector);
  const bodies = filterByExcludeSelector(container.querySelectorAll(".reveal-body"), excludeSelector);
  if (!titles.length && !bodies.length) return;

  await document.fonts.ready;

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
    const meta = getBodyStaggerMeta(el);
    const tween = revealLines(el, {
      delay: meta ? meta.index * meta.step : 0,
    });
    if (tween) animations.push(tweenToPromise(tween));
  }

  if (animations.length) await Promise.all(animations);
}

async function animateRevealLeave(container, options = {}) {
  if (!container) return;
  const { excludeSelector } = options;

  const titles = filterByExcludeSelector(container.querySelectorAll(".reveal-title"), excludeSelector);
  const bodies = filterByExcludeSelector(container.querySelectorAll(".reveal-body"), excludeSelector);
  if (!titles.length && !bodies.length) return;

  const animations = [];

  for (let i = 0; i < titles.length; i++) {
    const el = titles[i];
    if (!el.isConnected || !el.textContent.trim()) continue;
    const tween = hideChars(el);
    if (tween) animations.push(tweenToPromise(tween));
  }

  for (let i = 0; i < bodies.length; i++) {
    const el = bodies[i];
    if (!el.isConnected || !el.textContent.trim()) continue;
    const meta = getBodyStaggerMeta(el);
    const tween = hideLines(el, {
      delay: meta ? (meta.total - 1 - meta.index) * meta.step : 0,
    });
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
