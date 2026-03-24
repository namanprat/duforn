import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

const bodySplits = new Map();
const bodySplitTracking = [];
const titleStates = new Map();

function tweenToPromise(tween) {
  return tween
    ? new Promise((resolve) => tween.eventCallback("onComplete", resolve))
    : Promise.resolve();
}

function getOrSplitBody(element, type = "lines") {
  if (!element) return null;
  if (bodySplits.has(element)) return bodySplits.get(element);

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

  bodySplits.set(element, split);
  bodySplitTracking.push(split);
  return split;
}

function normalizeTitleText(text) {
  return `${text ?? ""}`;
}

function getTitleAccessibilityMeta(element, previousState = null) {
  if (previousState) {
    return {
      hadAriaLabel: previousState.hadAriaLabel,
      ariaLabel: previousState.ariaLabel,
    };
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

  const state = {
    sourceText,
    clip,
    textBlock,
    characters,
    ...accessibilityMeta,
  };

  titleStates.set(element, state);
  return state;
}

function prepareRevealTitle(element) {
  if (!element) return null;

  const currentState = titleStates.get(element);
  if (currentState && element.contains(currentState.clip)) {
    return currentState;
  }

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

function revealTitleLetters(
  element,
  { duration = 0.6, stagger = 0.02, ease = "power2.out", delay = 0 } = {},
) {
  const state = clearRevealTitleStyles(element);
  if (!state?.characters?.length) return null;

  return gsap.fromTo(
    state.characters,
    { yPercent: 110, opacity: 0 },
    { yPercent: 0, opacity: 1, duration, stagger, ease, delay },
  );
}

function hideTitleLetters(
  element,
  { duration = 0.4, stagger = 0.015, ease = "power2.in", delay = 0 } = {},
) {
  const state = clearRevealTitleStyles(element);
  if (!state?.characters?.length) return null;

  return gsap.to(state.characters, {
    yPercent: -110,
    opacity: 0,
    duration,
    stagger,
    ease,
    delay,
  });
}

function revealLines(
  element,
  { duration = 0.7, stagger = 0.08, ease = "power4.out", delay = 0 } = {},
) {
  if (element.getAttribute("data-split-type") === "element") {
    return gsap.fromTo(
      element,
      { y: 100, opacity: 0 },
      { y: 0, opacity: 1, duration, ease, delay },
    );
  }

  const split = getOrSplitBody(element, "lines");
  if (!split?.lines?.length) return null;

  return gsap.fromTo(
    split.lines,
    { yPercent: 100, opacity: 0 },
    { yPercent: 0, opacity: 1, duration, stagger, ease, delay },
  );
}

function hideLines(
  element,
  { duration = 0.35, stagger = 0.05, ease = "power2.in", delay = 0 } = {},
) {
  if (element.getAttribute("data-split-type") === "element") {
    return gsap.to(element, { y: -100, opacity: 0, duration, ease, delay });
  }

  const split = getOrSplitBody(element, "lines");
  if (!split?.lines?.length) return null;

  return gsap.to(split.lines, { yPercent: -100, opacity: 0, duration, stagger, ease, delay });
}

function filterByExcludeSelector(elements, excludeSelector) {
  if (!excludeSelector) return elements;
  return Array.from(elements).filter((element) => !element.matches(excludeSelector));
}

async function prepareRevealHidden(container, options = {}) {
  if (!container) return;
  const { excludeSelector } = options;

  const titles = filterByExcludeSelector(
    container.querySelectorAll(".reveal-title"),
    excludeSelector,
  );
  const bodies = filterByExcludeSelector(
    container.querySelectorAll(".reveal-body"),
    excludeSelector,
  );
  if (!titles.length && !bodies.length) return;

  await document.fonts.ready;

  for (let i = 0; i < titles.length; i++) {
    const el = titles[i];
    if (!el.textContent.trim()) continue;
    const chars = getRevealTitleCharacters(el);
    if (chars.length) gsap.set(chars, { yPercent: 110, opacity: 0 });
  }

  for (let i = 0; i < bodies.length; i++) {
    const el = bodies[i];
    if (!el.textContent.trim()) continue;

    if (el.getAttribute("data-split-type") === "element") {
      gsap.set(el, { y: 100, opacity: 0 });
      continue;
    }

    const split = getOrSplitBody(el, "lines");
    if (split?.lines?.length) {
      gsap.set(split.lines, { yPercent: 100, opacity: 0 });
    }
  }
}

async function animateRevealEnter(container, options = {}) {
  if (!container) return;
  const { excludeSelector } = options;

  const titles = filterByExcludeSelector(
    container.querySelectorAll(".reveal-title"),
    excludeSelector,
  );
  const bodies = filterByExcludeSelector(
    container.querySelectorAll(".reveal-body"),
    excludeSelector,
  );
  if (!titles.length && !bodies.length) return;

  await document.fonts.ready;

  gsap.set(bodies, { clearProps: "all" });

  const animations = [];

  for (let i = 0; i < titles.length; i++) {
    const el = titles[i];
    if (!el.textContent.trim()) continue;
    const tween = revealTitleLetters(el, { delay: i * 0.06 });
    if (tween) animations.push(tweenToPromise(tween));
  }

  let bodyDelay = 0;
  for (let i = 0; i < bodies.length; i++) {
    const el = bodies[i];
    if (!el.textContent.trim()) continue;
    const tween = revealLines(el, { delay: bodyDelay });
    if (tween) {
      bodyDelay += 0.1;
      animations.push(tweenToPromise(tween));
    }
  }

  if (animations.length) await Promise.all(animations);
}

async function animateRevealLeave(container) {
  if (!container) return;

  const titles = Array.from(container.querySelectorAll(".reveal-title")).filter(
    (el) => !el.classList.contains("home-hero-brand"),
  );
  const bodies = container.querySelectorAll(".reveal-body");
  if (!titles.length && !bodies.length) return;

  const animations = [];

  for (let i = 0; i < titles.length; i++) {
    const el = titles[i];
    if (!el.textContent.trim()) continue;
    const tween = hideTitleLetters(el);
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
  for (let i = bodySplitTracking.length - 1; i >= 0; i--) {
    const split = bodySplitTracking[i];
    if (split && typeof split.revert === "function") {
      split.revert();
    }
  }

  bodySplitTracking.length = 0;
  bodySplits.clear();

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
