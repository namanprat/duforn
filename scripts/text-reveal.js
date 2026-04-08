import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { REVEAL_TEXT_TIME_SCALE } from "./reveal-timing.js";

gsap.registerPlugin(SplitText, ScrollTrigger);

const rt = (seconds) => seconds * REVEAL_TEXT_TIME_SCALE;

/** Visual ScrollTrigger start/end markers: dev server, or `VITE_SCROLL_REVEAL_MARKERS=true`. */
const SCROLL_REVEAL_MARKERS =
  typeof import.meta !== "undefined" &&
  import.meta.env &&
  (import.meta.env.DEV || import.meta.env.VITE_SCROLL_REVEAL_MARKERS === "true");

// ── Title state (brand handoff only) ────────────────────────────────────
const titleStates = new Map();

function normalizeTitleText(text) {
  return `${text ?? ""}`;
}

function getTitleAccessibilityMeta(element, previousState = null) {
  if (previousState) {
    return { hadAriaLabel: previousState.hadAriaLabel, ariaLabel: previousState.ariaLabel };
  }
  return {
    hadAriaLabel: element.hasAttribute("aria-label"),
    ariaLabel: element.getAttribute("aria-label"),
  };
}

function restoreTitleAccessibility(element, state) {
  if (!state) return;
  if (state.hadAriaLabel) {
    element.setAttribute("aria-label", state.ariaLabel ?? "");
  } else {
    element.removeAttribute("aria-label");
  }
}

function clearTitleState(element, { restoreText = true } = {}) {
  const state = titleStates.get(element);
  if (!state) return;
  gsap.killTweensOf(state.characters);
  if (restoreText && element.isConnected && element.contains(state.clip)) {
    element.textContent = state.sourceText;
  }
  restoreTitleAccessibility(element, state);
  titleStates.delete(element);
}

function createTitleCharacter(char) {
  const node = document.createElement("span");
  node.className = "reveal-title-char";
  node.textContent = char === " " ? "\u00A0" : char;
  return node;
}

function buildTitleState(element, sourceText, accessibilityMeta) {
  const clip = document.createElement("span");
  clip.className = "reveal-title-clip";
  clip.setAttribute("aria-hidden", "true");

  const textBlock = document.createElement("span");
  textBlock.className = "reveal-title-text";

  const characters = Array.from(sourceText).map((char) => {
    const letter = createTitleCharacter(char);
    textBlock.appendChild(letter);
    return letter;
  });

  clip.appendChild(textBlock);
  element.replaceChildren(clip);
  element.setAttribute("aria-label", sourceText);

  const state = { sourceText, clip, textBlock, characters, ...accessibilityMeta };
  titleStates.set(element, state);
  return state;
}

function prepareRevealTitle(element) {
  if (!element) return null;
  const currentState = titleStates.get(element);
  if (currentState && element.contains(currentState.clip)) return currentState;
  const accessibilityMeta = getTitleAccessibilityMeta(element, currentState);
  clearTitleState(element, { restoreText: false });
  const sourceText = normalizeTitleText(element.textContent);
  return buildTitleState(element, sourceText, accessibilityMeta);
}

function getRevealTitleCharacters(element) {
  return prepareRevealTitle(element)?.characters ?? [];
}

function clearRevealTitleStyles(element) {
  const state = prepareRevealTitle(element);
  if (!state) return null;
  gsap.set(state.characters, { clearProps: "transform,opacity" });
  return state;
}

function setRevealTitleText(element, text) {
  if (!element) return null;
  const value = normalizeTitleText(text);
  const currentState = titleStates.get(element);
  const accessibilityMeta = getTitleAccessibilityMeta(element, currentState);
  clearTitleState(element, { restoreText: false });
  element.textContent = value;
  return buildTitleState(element, value, accessibilityMeta);
}

// ── Route reveal state ───────────────────────────────────────────────────
let activeEnterTimeline = null;
let activeLeaveTimeline = null;
const preparedRouteElements = new Set();
const routeBodySplits = new Map(); // element -> { split, wrappers, lines }

// ── Scroll reveal state ──────────────────────────────────────────────────
const scrollRevealSplits = new Map(); // element -> { split, wrappers, lines }
const scrollRevealRegistry = [];

// ── Shared helpers ───────────────────────────────────────────────────────

function filterByExcludeSelector(elements, excludeSelector) {
  if (!excludeSelector) return elements;
  return Array.from(elements).filter((el) => !el.matches(excludeSelector));
}

// ── Route reveal selectors ───────────────────────────────────────────────

function getRouteRevealTitles(container, options = {}) {
  return Array.from(
    filterByExcludeSelector(container.querySelectorAll(".reveal-title"), options.excludeSelector),
  );
}

function getRouteRevealBodies(container, options = {}) {
  return Array.from(
    filterByExcludeSelector(container.querySelectorAll(".reveal-body"), options.excludeSelector),
  );
}

function getScrollRevealElements(container) {
  return Array.from(container.querySelectorAll("[data-scroll-reveal]"));
}

function createLineClipSplit(element, registry) {
  if (!element) return null;
  if (registry.has(element)) return registry.get(element);

  const split = new SplitText(element, { type: "lines", linesClass: "reveal-line" });
  const wrappers = [];

  for (const line of split.lines) {
    const wrapper = document.createElement("div");
    wrapper.className = "reveal-body-line-wrap";
    line.parentNode.insertBefore(wrapper, line);
    wrapper.appendChild(line);
    wrappers.push(wrapper);
  }

  const state = { split, wrappers, lines: [...split.lines] };
  registry.set(element, state);
  return state;
}

function revertLineClipSplit(element, registry) {
  const state = registry.get(element);
  if (!state) return;
  registry.delete(element);
  gsap.killTweensOf(state.lines);
  for (const wrapper of state.wrappers) {
    if (wrapper.isConnected && wrapper.firstChild) {
      wrapper.parentNode.insertBefore(wrapper.firstChild, wrapper);
      wrapper.remove();
    }
  }
  state.split.revert();
}

function splitRevealBodyLines(element) {
  return createLineClipSplit(element, routeBodySplits);
}

function revertRevealBodySplit(element) {
  revertLineClipSplit(element, routeBodySplits);
}

function revertAllRevealBodySplits() {
  for (const el of Array.from(routeBodySplits.keys())) {
    revertLineClipSplit(el, routeBodySplits);
  }
}

function stabilizedRevertBodySplit(element) {
  const state = routeBodySplits.get(element);
  if (!state) return;
  gsap.killTweensOf(state.lines);
  gsap.set(state.lines, { yPercent: 0, opacity: 1, clearProps: "willChange,transformOrigin" });

  const lockedHeight = element.getBoundingClientRect().height;
  if (lockedHeight > 0) element.style.minHeight = `${lockedHeight}px`;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      revertRevealBodySplit(element);
      element.style.minHeight = "";
    });
  });
}

function finalizeRouteBodySplitsAfterEnter(container, options = {}) {
  if (!container) return;
  const bodies = getRouteRevealBodies(container, options);
  for (const el of bodies) {
    if (routeBodySplits.has(el)) stabilizedRevertBodySplit(el);
  }
}

function stabilizedRevertScrollSplit(element) {
  const state = scrollRevealSplits.get(element);
  if (!state) return;
  gsap.killTweensOf(state.lines);
  gsap.set(state.lines, { yPercent: 0, opacity: 1, clearProps: "willChange,transformOrigin" });

  const lockedHeight = element.getBoundingClientRect().height;
  if (lockedHeight > 0) element.style.minHeight = `${lockedHeight}px`;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      revertLineClipSplit(element, scrollRevealSplits);
      element.style.minHeight = "";
      gsap.set(element, { visibility: "visible" });
    });
  });
}

function clearPreparedRouteState() {
  for (const el of preparedRouteElements) {
    gsap.killTweensOf(el);
    gsap.set(el, {
      visibility: "visible",
      clearProps: "transform,opacity,willChange,transformOrigin",
    });
  }
  preparedRouteElements.clear();
}

// ── Route reveal: destroy ────────────────────────────────────────────────

function destroyRouteReveals() {
  if (activeEnterTimeline) {
    activeEnterTimeline.kill();
    activeEnterTimeline = null;
  }
  if (activeLeaveTimeline) {
    activeLeaveTimeline.kill();
    activeLeaveTimeline = null;
  }
  clearPreparedRouteState();
  revertAllRevealBodySplits();
}

// ── Route reveal: prepare ────────────────────────────────────────────────

async function prepareRouteReveal(container, options = {}) {
  if (!container) return;

  const titles = getRouteRevealTitles(container, options);
  const bodies = getRouteRevealBodies(container, options);
  const scrollEls = getScrollRevealElements(container);

  // Hide this route’s targets synchronously before any teardown so revert/kill never paints full copy.
  for (const el of titles) {
    gsap.killTweensOf(el);
    gsap.set(el, { visibility: "hidden", immediateRender: true });
  }
  for (const el of bodies) {
    gsap.killTweensOf(el);
    gsap.set(el, { visibility: "hidden", immediateRender: true });
  }
  for (const el of scrollEls) {
    gsap.killTweensOf(el);
    gsap.set(el, { visibility: "hidden", immediateRender: true });
  }

  // Kill any in-flight animations and revert existing splits from the previous route.
  destroyRouteReveals();

  await document.fonts.ready;

  for (const el of titles) {
    preparedRouteElements.add(el);
    gsap.killTweensOf(el);
    gsap.set(el, {
      visibility: "visible",
      yPercent: 100,
      opacity: 0,
      willChange: "transform,opacity",
      transformOrigin: "50% 50%",
      immediateRender: true,
    });
  }

  for (const el of bodies) {
    const state = splitRevealBodyLines(el);
    if (state?.lines?.length) {
      gsap.killTweensOf(state.lines);
      gsap.set(el, { visibility: "visible", immediateRender: true });
      gsap.set(state.lines, {
        yPercent: 100,
        opacity: 1,
        willChange: "transform,opacity",
        transformOrigin: "50% 50%",
        immediateRender: true,
      });
      continue;
    }
    preparedRouteElements.add(el);
    gsap.killTweensOf(el);
    gsap.set(el, {
      visibility: "visible",
      yPercent: 100,
      opacity: 0,
      willChange: "transform,opacity",
      transformOrigin: "50% 50%",
      immediateRender: true,
    });
  }
}

// ── Route reveal: enter ──────────────────────────────────────────────────

async function runRouteEnter(container, options = {}) {
  if (!container) return Promise.resolve();

  // Kill any running enter before starting a new one.
  if (activeEnterTimeline) {
    activeEnterTimeline.kill();
    activeEnterTimeline = null;
  }

  await document.fonts.ready;

  return new Promise((resolve) => {
    const timeline = gsap.timeline({
      defaults: { ease: "power4.out" },
      onComplete: () => {
        activeEnterTimeline = null;
        clearPreparedRouteState();
        finalizeRouteBodySplitsAfterEnter(container, options);
        resolve();
      },
      onInterrupt: () => {
        activeEnterTimeline = null;
        clearPreparedRouteState();
        finalizeRouteBodySplitsAfterEnter(container, options);
        resolve();
      },
    });

    activeEnterTimeline = timeline;

    const titles = getRouteRevealTitles(container, options);
    if (titles.length) {
      timeline.fromTo(
        titles,
        { yPercent: 100, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: rt(0.62),
          stagger: rt(0.055),
          clearProps: "willChange,transformOrigin",
        },
        0,
      );
    }

    const bodies = getRouteRevealBodies(container, options);
    const bodyLines = [];
    const bodyBlocks = [];
    for (const el of bodies) {
      const state = routeBodySplits.get(el);
      if (state?.lines?.length) {
        bodyLines.push(...state.lines);
      } else {
        bodyBlocks.push(el);
      }
    }

    if (bodyLines.length) {
      timeline.fromTo(
        bodyLines,
        { yPercent: 100, opacity: 1 },
        {
          yPercent: 0,
          opacity: 1,
          duration: rt(0.66),
          stagger: rt(0.045),
        },
        titles.length ? rt(0.08) : 0,
      );
    }
    if (bodyBlocks.length) {
      timeline.fromTo(
        bodyBlocks,
        { yPercent: 100, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: rt(0.66),
          stagger: rt(0.045),
          clearProps: "transform,opacity,willChange,transformOrigin",
        },
        titles.length ? rt(0.08) : 0,
      );
    }

    if (!timeline.getChildren(true, true, true).length) {
      activeEnterTimeline = null;
      clearPreparedRouteState();
      finalizeRouteBodySplitsAfterEnter(container, options);
      resolve();
    }
  });
}

// ── Route reveal: leave ──────────────────────────────────────────────────

function runRouteLeave(container, options = {}) {
  if (!container) return Promise.resolve();

  // Kill running enter — leave always wins.
  if (activeEnterTimeline) {
    activeEnterTimeline.kill();
    activeEnterTimeline = null;
  }
  // Kill any previous leave.
  if (activeLeaveTimeline) {
    activeLeaveTimeline.kill();
    activeLeaveTimeline = null;
  }
  const titles = getRouteRevealTitles(container, options);
  const bodies = getRouteRevealBodies(container, options);

  if (!titles.length && !bodies.length) return Promise.resolve();

  for (const el of bodies) {
    splitRevealBodyLines(el);
  }

  return new Promise((resolve) => {
    const cleanup = () => {
      activeLeaveTimeline = null;
      revertAllRevealBodySplits();
    };

    const tl = gsap.timeline({
      defaults: { ease: "power2.in" },
      onComplete: () => {
        cleanup();
        resolve();
      },
      onInterrupt: () => {
        cleanup();
        resolve();
      },
    });

    activeLeaveTimeline = tl;

    if (titles.length) {
      tl.to(
        titles,
        {
          yPercent: -16,
          opacity: 0,
          duration: rt(0.28),
          stagger: rt(0.03),
          clearProps: "willChange,transformOrigin",
        },
        0,
      );
    }

    if (bodies.length) {
      const leaveLines = [];
      const leaveBlocks = [];
      for (const el of bodies) {
        const state = routeBodySplits.get(el);
        if (state?.lines?.length) {
          leaveLines.push(...state.lines);
        } else {
          leaveBlocks.push(el);
        }
      }

      if (leaveLines.length) {
        tl.to(
          leaveLines,
          {
            yPercent: -110,
            opacity: 0,
            duration: rt(0.3),
            stagger: rt(0.028),
            clearProps: "willChange,transformOrigin",
          },
          0,
        );
      }

      if (leaveBlocks.length) {
        tl.to(
          leaveBlocks,
          {
            yPercent: -20,
            opacity: 0,
            duration: rt(0.3),
            stagger: rt(0.028),
            clearProps: "willChange,transformOrigin",
          },
          0,
        );
      }
    }

    if (!tl.getChildren(true, true, true).length) {
      cleanup();
      resolve();
    }
  });
}

// ── Scroll reveals: init ─────────────────────────────────────────────────

function initScrollReveals(container) {
  if (!container) return;

  const elements = getScrollRevealElements(container);
  if (!elements.length) return;

  elements.forEach((el, index) => {
    gsap.killTweensOf(el);
    gsap.set(el, { visibility: "hidden", immediateRender: true });

    const state = createLineClipSplit(el, scrollRevealSplits);

    if (state?.lines?.length) {
      gsap.set(el, { visibility: "visible", immediateRender: true });
      gsap.killTweensOf(state.lines);
      gsap.set(state.lines, {
        yPercent: 100,
        opacity: 1,
        willChange: "transform,opacity",
        transformOrigin: "50% 50%",
        immediateRender: true,
      });

      const st = ScrollTrigger.create({
        id: `scroll-reveal-lines-${index}`,
        trigger: el,
        start: "top 88%",
        end: "bottom top",
        markers: SCROLL_REVEAL_MARKERS,
        once: true,
        onEnter: () => {
          gsap.to(state.lines, {
            yPercent: 0,
            opacity: 1,
            duration: rt(0.75),
            ease: "power3.out",
            stagger: rt(0.055),
            onComplete: () => stabilizedRevertScrollSplit(el),
          });
        },
      });
      scrollRevealRegistry.push({ st, el, lines: true });
    } else {
      gsap.set(el, {
        visibility: "visible",
        yPercent: 100,
        opacity: 0,
        willChange: "transform,opacity",
        transformOrigin: "50% 50%",
        immediateRender: true,
      });

      const st = ScrollTrigger.create({
        id: `scroll-reveal-block-${index}`,
        trigger: el,
        start: "top 88%",
        end: "bottom top",
        markers: SCROLL_REVEAL_MARKERS,
        once: true,
        onEnter: () => {
          gsap.to(el, {
            yPercent: 0,
            opacity: 1,
            duration: rt(0.75),
            ease: "power3.out",
            clearProps: "transform,opacity,willChange,transformOrigin",
            onComplete: () => {
              gsap.set(el, { visibility: "visible" });
            },
          });
        },
      });
      scrollRevealRegistry.push({ st, el, lines: false });
    }
  });

  requestAnimationFrame(() => {
    ScrollTrigger.refresh();
  });
}

// ── Scroll reveals: destroy ───────────────────────────────────────────────

function destroyScrollReveals() {
  for (const { st, el, lines } of scrollRevealRegistry) {
    st.kill();
    gsap.killTweensOf(el);
    if (lines) {
      const state = scrollRevealSplits.get(el);
      if (state) gsap.killTweensOf(state.lines);
      revertLineClipSplit(el, scrollRevealSplits);
    } else {
      gsap.set(el, {
        visibility: "visible",
        clearProps: "transform,opacity,willChange,transformOrigin",
      });
    }
  }
  scrollRevealRegistry.length = 0;

  for (const el of Array.from(scrollRevealSplits.keys())) {
    revertLineClipSplit(el, scrollRevealSplits);
  }
}

// ── Full teardown ─────────────────────────────────────────────────────────

function destroyAllReveals() {
  destroyRouteReveals();
  destroyScrollReveals();
}

function cleanupSplits() {
  for (const element of Array.from(titleStates.keys())) {
    clearTitleState(element, { restoreText: true });
  }
  destroyAllReveals();
}

export {
  // Route reveals
  prepareRouteReveal,
  runRouteEnter,
  runRouteLeave,
  destroyRouteReveals,
  // Scroll reveals
  initScrollReveals,
  destroyScrollReveals,
  // Full teardown
  destroyAllReveals,
  cleanupSplits,
  // Title helpers (used by brandHandoffTransition only)
  clearRevealTitleStyles,
  getRevealTitleCharacters,
  prepareRevealTitle,
  setRevealTitleText,
};
