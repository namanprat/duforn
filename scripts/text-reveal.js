import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

// ── Character-split state (used by brandHandoffTransition only) ────────
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
  node.className = "reveal-title__char";
  node.textContent = char === " " ? "\u00A0" : char;
  return node;
}

function buildTitleState(element, sourceText, accessibilityMeta) {
  const clip = document.createElement("span");
  clip.className = "reveal-title__clip";
  clip.setAttribute("aria-hidden", "true");

  const textBlock = document.createElement("span");
  textBlock.className = "reveal-title__text";

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

// ── Page reveal helpers ────────────────────────────────────────────────

function filterByExcludeSelector(elements, excludeSelector) {
  if (!excludeSelector) return elements;
  return Array.from(elements).filter((el) => !el.matches(excludeSelector));
}

function getRevealTitles(container, options = {}) {
  return Array.from(
    filterByExcludeSelector(container.querySelectorAll(".reveal-title"), options.excludeSelector),
  );
}

function getRevealBodies(container, options = {}) {
  return Array.from(
    filterByExcludeSelector(container.querySelectorAll(".reveal-body"), options.excludeSelector),
  );
}

// ── Clip wrapper (for .reveal-title whole-element reveals) ──────────────

const revealClips = new Map(); // element → wrapperDiv

function wrapInClip(element) {
  if (revealClips.has(element)) return revealClips.get(element);
  if (!element.parentNode) return null;
  const wrapper = document.createElement("div");
  wrapper.style.cssText = "overflow:hidden;";
  element.parentNode.insertBefore(wrapper, element);
  wrapper.appendChild(element);
  revealClips.set(element, wrapper);
  return wrapper;
}

function unwrapFromClip(element) {
  const wrapper = revealClips.get(element);
  revealClips.delete(element);
  if (!wrapper?.isConnected) return;
  wrapper.parentNode?.insertBefore(element, wrapper);
  wrapper.remove();
}

// ── SplitText line splits (for .reveal-body line-by-line reveals) ───────

const bodySplits = new Map(); // element → { split, wrappers, lines }

function splitBodyLines(element) {
  if (bodySplits.has(element)) return bodySplits.get(element);

  const split = new SplitText(element, { type: "lines", linesClass: "reveal-line" });
  const wrappers = [];

  for (const line of split.lines) {
    const wrapper = document.createElement("div");
    wrapper.style.cssText = "overflow:hidden;";
    line.parentNode.insertBefore(wrapper, line);
    wrapper.appendChild(line);
    wrappers.push(wrapper);
  }

  const state = { split, wrappers, lines: [...split.lines] };
  bodySplits.set(element, state);
  return state;
}

function revertBodySplit(element) {
  const state = bodySplits.get(element);
  if (!state) return;
  bodySplits.delete(element);

  // Kill any running tweens on split lines
  gsap.killTweensOf(state.lines);

  // Unwrap lines from clip wrappers
  for (const wrapper of state.wrappers) {
    if (wrapper.isConnected && wrapper.firstChild) {
      wrapper.parentNode.insertBefore(wrapper.firstChild, wrapper);
      wrapper.remove();
    }
  }

  // Restore original DOM
  state.split.revert();
}

function revertAllBodySplits() {
  for (const el of Array.from(bodySplits.keys())) {
    revertBodySplit(el);
  }
}

// ── Prepare: hide all reveal elements before animation ──────────────────

async function prepareRevealHidden(container, options = {}) {
  if (!container) return;
  await document.fonts.ready;

  // Titles: wrap whole element in clip, push below
  const titles = getRevealTitles(container, options);
  for (const el of titles) {
    wrapInClip(el);
    gsap.set(el, { yPercent: 105 });
  }

  // Bodies: split into lines, wrap each line in clip, push below
  const bodies = getRevealBodies(container, options);
  for (const el of bodies) {
    const { lines } = splitBodyLines(el);
    gsap.set(lines, { yPercent: 105 });
  }
}

// ── Enter: reveal titles + body lines, staggered ────────────────────────

async function animateRevealEnter(container, options = {}) {
  if (!container) return;
  await document.fonts.ready;

  const timeline = gsap.timeline({ defaults: { ease: "power4.out" } });
  let offset = 0;

  // Titles: whole-element slide up
  const titles = getRevealTitles(container, options);
  if (titles.length) {
    timeline.fromTo(
      titles,
      { yPercent: 105 },
      {
        yPercent: 0,
        duration: 0.75,
        stagger: 0.07,
        onComplete() {
          for (const el of titles) {
            gsap.set(el, { clearProps: "transform" });
            unwrapFromClip(el);
          }
        },
      },
      offset,
    );
    offset += 0.1;
  }

  // Bodies: each line slides up, staggered across all lines
  const bodies = getRevealBodies(container, options);
  const allLines = [];
  const bodyEls = [];
  for (const el of bodies) {
    const state = bodySplits.get(el);
    if (state?.lines.length) {
      allLines.push(...state.lines);
      bodyEls.push(el);
    }
  }

  if (allLines.length) {
    timeline.fromTo(
      allLines,
      { yPercent: 105 },
      {
        yPercent: 0,
        duration: 0.7,
        stagger: 0.06,
        onComplete() {
          for (const el of bodyEls) {
            revertBodySplit(el);
          }
        },
      },
      offset,
    );
  }
}

// ── Leave: slide everything out upward, returns Promise ─────────────────

function animateRevealLeave(container) {
  if (!container) return Promise.resolve();

  const opts = { excludeSelector: ".home-hero-brand" };
  const titles = getRevealTitles(container, opts);
  const bodies = getRevealBodies(container, opts);

  if (!titles.length && !bodies.length) return Promise.resolve();

  return new Promise((resolve) => {
    const tl = gsap.timeline({ defaults: { ease: "power2.in" }, onComplete: resolve });

    if (titles.length) {
      tl.to(titles, { yPercent: -110, opacity: 0, duration: 0.32, stagger: 0.04 }, 0);
    }

    // Split bodies into lines for a clean per-line exit
    const leaveLines = [];
    for (const el of bodies) {
      const { lines } = splitBodyLines(el);
      leaveLines.push(...lines);
    }

    if (leaveLines.length) {
      tl.to(leaveLines, { yPercent: -110, opacity: 0, duration: 0.32, stagger: 0.03 }, 0);
    }
  });
}

// ── Cleanup ─────────────────────────────────────────────────────────────

function cleanupSplits() {
  revealClips.clear();
  revertAllBodySplits();
  for (const element of Array.from(titleStates.keys())) {
    clearTitleState(element);
  }
}

export {
  animateRevealEnter,
  animateRevealLeave,
  cleanupSplits,
  clearRevealTitleStyles,
  getRevealTitleCharacters,
  prepareRevealHidden,
  prepareRevealTitle,
  setRevealTitleText,
};
