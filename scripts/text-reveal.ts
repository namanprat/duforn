// @ts-nocheck
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { REVEAL_TEXT_TIME_SCALE } from "./reveal-timing";

gsap.registerPlugin(SplitText, ScrollTrigger);

const rt = (seconds) => seconds * REVEAL_TEXT_TIME_SCALE;

/** Shared: route titles, body, scroll in; +10% duration vs baseline 0.66, +25% stagger vs 0.062 */
function bodyLineRevealDuration() {
  return rt(0.726);
}
function bodyLineRevealStagger() {
  return rt(0.0775);
}
/** Route body/title/scroll line leave (baseline 0.3 / 0.028, +10% / +25%) */
function bodyLineLeaveDuration() {
  return rt(0.33);
}
function bodyLineLeaveStagger() {
  return rt(0.035);
}
const titleToBodyRevealDelay = () => rt(0.04);

async function fontsReady() {
  try {
    await document.fonts?.ready;
  } catch {
    // Font Loading API missing or rejected (e.g. test env).
  }
}

// ── Title / scroll char-split state (shared clip DOM) ─────────────────────
const titleStates = new Map();
/** Route `.reveal-title` line splits (same SplitText + clip pattern as `.reveal-body`) */
const routeTitleSplits = new Map();

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

function appendTitleCharacters(parent, segment, characters) {
  for (const char of segment) {
    const letter = createTitleCharacter(char);
    parent.appendChild(letter);
    characters.push(letter);
  }
}

function buildTitleStateSlideTitle(element, sourceText, accessibilityMeta) {
  const clip = document.createElement("span");
  clip.className = "reveal-title-clip";
  clip.setAttribute("aria-hidden", "true");

  const textBlock = document.createElement("span");
  textBlock.className = "reveal-title-text";

  const characters = [];
  const segments = sourceText.split(/(\s+)/).filter(Boolean);

  for (const segment of segments) {
    if (/^\s+$/.test(segment)) {
      appendTitleCharacters(textBlock, segment, characters);
    } else {
      const wordWrap = document.createElement("span");
      wordWrap.className = "reveal-title-word";
      appendTitleCharacters(wordWrap, segment, characters);
      textBlock.appendChild(wordWrap);
    }
  }

  clip.appendChild(textBlock);
  element.replaceChildren(clip);
  element.setAttribute("aria-label", sourceText);

  const state = { sourceText, clip, textBlock, characters, ...accessibilityMeta };
  titleStates.set(element, state);
  return state;
}

function buildTitleState(element, sourceText, accessibilityMeta) {
  if (
    element.classList.contains("slide-title") ||
    element.classList.contains("reveal-scroll-wrap")
  ) {
    return buildTitleStateSlideTitle(element, sourceText, accessibilityMeta);
  }

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
  if (!element) return null;
  const lineSplit = routeTitleSplits.get(element);
  if (lineSplit?.lines?.length) {
    gsap.killTweensOf(lineSplit.lines);
    gsap.set(lineSplit.lines, { clearProps: "transform,opacity" });
    return null;
  }
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

function sweepDisconnectedTitleStates() {
  for (const el of Array.from(titleStates.keys())) {
    if (!el.isConnected) {
      titleStates.delete(el);
    }
  }
}

// ── Route reveal state ───────────────────────────────────────────────────
let activeEnterTimeline = null;
let activeLeaveTimeline = null;
const preparedRouteElements = new Set();
const routeBodySplits = new Map(); // element -> { split, wrappers, lines }

function splitRouteTitleLines(element) {
  return createLineClipSplit(element, routeTitleSplits);
}

function revertRouteTitleSplit(element) {
  revertLineClipSplit(element, routeTitleSplits);
}

function revertAllRouteTitleSplits() {
  for (const el of Array.from(routeTitleSplits.keys())) {
    revertLineClipSplit(el, routeTitleSplits);
  }
}

function stabilizedRevertTitleSplit(element) {
  const state = routeTitleSplits.get(element);
  if (!state) return;
  gsap.killTweensOf(state.lines);
  gsap.set(state.lines, { yPercent: 0, opacity: 1, clearProps: "willChange,transformOrigin" });

  const lockedHeight = element.getBoundingClientRect().height;
  if (lockedHeight > 0) element.style.minHeight = `${lockedHeight}px`;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      revertRouteTitleSplit(element);
      element.style.minHeight = "";
    });
  });
}

function getRouteTitleLines(element) {
  const state = routeTitleSplits.get(element);
  return state?.lines?.length ? [...state.lines] : [];
}

function finalizeRouteTitleSplitsAfterEnter(container) {
  if (!container) return;
  for (const el of getAllRouteRevealTitles(container)) {
    if (routeTitleSplits.has(el)) stabilizedRevertTitleSplit(el);
  }
}

// ── Scroll reveal state ──────────────────────────────────────────────────
const scrollRevealRegistry = [];
const scrollRevealSplits = new Map();

// ── Shared helpers ───────────────────────────────────────────────────────

function filterByExcludeSelector(elements, excludeSelector) {
  if (!excludeSelector) return elements;
  return Array.from(elements).filter((el) => !el.matches(excludeSelector));
}

function armTextRevealContainer(container) {
  if (!container) return;
  container.setAttribute("data-text-reveal-armed", "true");
}

function getAllRouteRevealTitles(container) {
  if (!container) return [];
  return Array.from(container.querySelectorAll(".reveal-title"));
}

function getRouteRevealTitlesForEnter(container, options = {}) {
  const skip = options.skipEnterTitles;
  const titles = getAllRouteRevealTitles(container);
  if (!skip?.size) return titles;
  return titles.filter((el) => !skip.has(el));
}

function getRouteRevealTitlesForLeave(container, options = {}) {
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

function hasRouteRevealTargets(container, options = {}) {
  if (!container) return false;
  const titles = getAllRouteRevealTitles(container);
  const bodies = getRouteRevealBodies(container, options);
  return titles.length > 0 || bodies.length > 0;
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

function splitScrollRevealLines(element) {
  return createLineClipSplit(element, scrollRevealSplits);
}

function revertScrollRevealSplit(element) {
  revertLineClipSplit(element, scrollRevealSplits);
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
      revertScrollRevealSplit(element);
      element.style.minHeight = "";
    });
  });
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

function clearPreparedRouteState() {
  for (const el of preparedRouteElements) {
    const titleLineState = routeTitleSplits.get(el);
    if (titleLineState?.lines?.length) {
      gsap.killTweensOf(titleLineState.lines);
      gsap.set(titleLineState.lines, {
        clearProps: "transform,opacity,willChange,transformOrigin",
      });
      continue;
    }
    const charState = titleStates.get(el);
    if (charState?.characters?.length) {
      gsap.killTweensOf(charState.characters);
      gsap.set(charState.characters, {
        clearProps: "transform,opacity,willChange,transformOrigin",
      });
    } else {
      gsap.killTweensOf(el);
      gsap.set(el, {
        visibility: "visible",
        clearProps: "transform,opacity,willChange,transformOrigin",
      });
    }
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
  revertAllRouteTitleSplits();
  revertAllRevealBodySplits();
}

// ── Route reveal: prepare ────────────────────────────────────────────────

async function prepareRouteReveal(container, options = {}) {
  if (!container) return { hasRouteRevealTargets: false };

  const titles = getAllRouteRevealTitles(container);
  const bodies = getRouteRevealBodies(container, options);
  const hasRouteRevealTargets = titles.length > 0 || bodies.length > 0;
  const scrollEls = getScrollRevealElements(container);

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

  armTextRevealContainer(container);

  destroyRouteReveals();
  sweepDisconnectedTitleStates();
  for (const el of Array.from(routeBodySplits.keys())) {
    if (!el.isConnected) {
      routeBodySplits.delete(el);
    }
  }
  for (const el of Array.from(scrollRevealSplits.keys())) {
    if (!el.isConnected) {
      scrollRevealSplits.delete(el);
    }
  }
  for (const el of Array.from(routeTitleSplits.keys())) {
    if (!el.isConnected) {
      routeTitleSplits.delete(el);
    }
  }

  await fontsReady();

  for (const el of titles) {
    const state = splitRouteTitleLines(el);
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
      preparedRouteElements.add(el);
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

  return { hasRouteRevealTargets };
}

// ── Route reveal: enter ──────────────────────────────────────────────────

async function runRouteEnter(container, options = {}) {
  if (!container) return Promise.resolve();

  if (activeEnterTimeline) {
    activeEnterTimeline.kill();
    activeEnterTimeline = null;
  }

  await fontsReady();

  return new Promise((resolve) => {
    const timeline = gsap.timeline({
      defaults: { ease: "power4.out" },
      onComplete: () => {
        activeEnterTimeline = null;
        clearPreparedRouteState();
        finalizeRouteTitleSplitsAfterEnter(container);
        finalizeRouteBodySplitsAfterEnter(container, options);
        resolve();
      },
      onInterrupt: () => {
        activeEnterTimeline = null;
        clearPreparedRouteState();
        finalizeRouteTitleSplitsAfterEnter(container);
        finalizeRouteBodySplitsAfterEnter(container, options);
        resolve();
      },
    });

    activeEnterTimeline = timeline;

    const titles = getRouteRevealTitlesForEnter(container, options);
    titles.forEach((el, i) => {
      const state = routeTitleSplits.get(el);
      const lines = state?.lines ?? [];
      const slot = i * rt(0.055);
      if (lines.length) {
        timeline.fromTo(
          lines,
          { yPercent: 100, opacity: 1 },
          {
            yPercent: 0,
            opacity: 1,
            duration: bodyLineRevealDuration(),
            stagger: bodyLineRevealStagger(),
            clearProps: "willChange,transformOrigin",
          },
          slot,
        );
      } else {
        timeline.fromTo(
          el,
          { yPercent: 100, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: bodyLineRevealDuration(),
            clearProps: "willChange,transformOrigin",
          },
          slot,
        );
      }
    });

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

    const bodyStart = titles.length ? titleToBodyRevealDelay() : 0;
    if (bodyLines.length) {
      timeline.fromTo(
        bodyLines,
        { yPercent: 100, opacity: 1 },
        {
          yPercent: 0,
          opacity: 1,
          duration: bodyLineRevealDuration(),
          stagger: bodyLineRevealStagger(),
        },
        bodyStart,
      );
    }
    if (bodyBlocks.length) {
      timeline.fromTo(
        bodyBlocks,
        { yPercent: 100, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: bodyLineRevealDuration(),
          stagger: bodyLineRevealStagger(),
          clearProps: "transform,opacity,willChange,transformOrigin",
        },
        bodyStart,
      );
    }

    if (!timeline.getChildren(true, true, true).length) {
      activeEnterTimeline = null;
      clearPreparedRouteState();
      finalizeRouteTitleSplitsAfterEnter(container);
      finalizeRouteBodySplitsAfterEnter(container, options);
      resolve();
    }
  });
}

// ── Route reveal: leave ──────────────────────────────────────────────────

function runRouteLeave(container, options = {}) {
  if (!container) return Promise.resolve();

  if (activeEnterTimeline) {
    activeEnterTimeline.kill();
    activeEnterTimeline = null;
  }
  if (activeLeaveTimeline) {
    activeLeaveTimeline.kill();
    activeLeaveTimeline = null;
  }
  const titles = getRouteRevealTitlesForLeave(container, options);
  const bodies = getRouteRevealBodies(container, options);

  if (!titles.length && !bodies.length) return Promise.resolve();

  for (const el of bodies) {
    splitRevealBodyLines(el);
  }

  for (const el of titles) {
    if (!routeTitleSplits.has(el)) {
      splitRouteTitleLines(el);
    }
  }

  return new Promise((resolve) => {
    const cleanup = () => {
      activeLeaveTimeline = null;
      revertAllRouteTitleSplits();
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

    for (const el of titles) {
      const state = routeTitleSplits.get(el);
      const lines = state?.lines ?? [];
      if (lines.length) {
        tl.to(
          lines,
          {
            yPercent: -110,
            opacity: 0,
            duration: bodyLineLeaveDuration(),
            stagger: bodyLineLeaveStagger(),
            clearProps: "willChange,transformOrigin",
          },
          0,
        );
      } else {
        tl.to(
          el,
          {
            yPercent: -20,
            opacity: 0,
            duration: bodyLineLeaveDuration(),
            clearProps: "willChange,transformOrigin",
          },
          0,
        );
      }
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
            duration: bodyLineLeaveDuration(),
            stagger: bodyLineLeaveStagger(),
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
            duration: bodyLineLeaveDuration(),
            stagger: bodyLineLeaveStagger(),
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
    el.classList.add("reveal-scroll-block");

    const state = splitScrollRevealLines(el);
    const lines = state?.lines ?? [];

    if (lines.length) {
      gsap.killTweensOf(lines);
      gsap.set(el, { visibility: "visible", immediateRender: true });
      gsap.set(lines, {
        yPercent: 100,
        opacity: 1,
        willChange: "transform,opacity",
        transformOrigin: "50% 50%",
        immediateRender: true,
      });
    } else {
      gsap.set(el, {
        visibility: "visible",
        yPercent: 100,
        opacity: 0,
        willChange: "transform,opacity",
        transformOrigin: "50% 50%",
        immediateRender: true,
      });
    }

    const st = ScrollTrigger.create({
      id: `scroll-reveal-${index}`,
      trigger: el,
      start: "top 88%",
      once: true,
      scrub: false,
      onEnter: () => {
        if (lines.length) {
          gsap.fromTo(
            lines,
            { yPercent: 100, opacity: 1 },
            {
              yPercent: 0,
              opacity: 1,
              duration: bodyLineRevealDuration(),
              stagger: bodyLineRevealStagger(),
              ease: "power4.out",
              onComplete: () => {
                stabilizedRevertScrollSplit(el);
                gsap.set(el, { visibility: "visible" });
              },
            },
          );
          return;
        }
        gsap.to(el, {
          yPercent: 0,
          opacity: 1,
          duration: bodyLineRevealDuration(),
          ease: "power4.out",
          clearProps: "transform,opacity,willChange,transformOrigin",
          onComplete: () => {
            gsap.set(el, { visibility: "visible" });
          },
        });
      },
    });
    scrollRevealRegistry.push({ st, el });
  });

  requestAnimationFrame(() => {
    ScrollTrigger.refresh();
  });
}

// ── Scroll reveals: destroy ───────────────────────────────────────────────

function destroyScrollReveals() {
  for (const { st, el } of scrollRevealRegistry) {
    st.kill();
    gsap.killTweensOf(el);
    const splitState = scrollRevealSplits.get(el);
    if (splitState?.lines?.length) {
      gsap.killTweensOf(splitState.lines);
    }
    if (scrollRevealSplits.has(el)) {
      revertScrollRevealSplit(el);
    } else {
      gsap.set(el, {
        visibility: "visible",
        clearProps: "transform,opacity,willChange,transformOrigin",
      });
    }
    el.classList.remove("reveal-scroll-block", "reveal-scroll-wrap");
  }
  scrollRevealRegistry.length = 0;
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
  hasRouteRevealTargets,
  // Scroll reveals
  initScrollReveals,
  destroyScrollReveals,
  // Full teardown
  destroyAllReveals,
  cleanupSplits,
  // Title helpers (brand handoff + tests)
  clearRevealTitleStyles,
  getRevealTitleCharacters,
  getRouteTitleLines,
  prepareRevealTitle,
  revertRouteTitleSplit,
  setRevealTitleText,
  splitRouteTitleLines,
  bodyLineRevealDuration,
  bodyLineRevealStagger,
  bodyLineLeaveDuration,
  bodyLineLeaveStagger,
};
