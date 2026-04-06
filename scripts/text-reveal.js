import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

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
const routeSplits = new Map(); // element → { split, wrappers, lines }
let activeEnterTimeline = null;
let activeLeaveTimeline = null;

// ── Scroll reveal state ──────────────────────────────────────────────────
const scrollObservers = new Map(); // element → IntersectionObserver

// ── Shared helpers ───────────────────────────────────────────────────────

function filterByExcludeSelector(elements, excludeSelector) {
  if (!excludeSelector) return elements;
  return Array.from(elements).filter((el) => !el.matches(excludeSelector));
}

function canSplitRevealElement(element) {
  if (!element) return false;
  if (element.hasAttribute("data-reveal-allow-interactive")) return true;
  if (element.matches("a, button, label")) return false;
  if (element.querySelector("a, button, input, select, textarea, label")) return false;
  return true;
}

function isHomeDesktopHiddenRevealBody(element) {
  if (!element?.classList?.contains("reveal-body")) return false;
  if (!element.classList.contains("u-mobile-hidden")) return false;
  if (window.innerWidth <= 768) return false;
  return Boolean(element.closest('[data-page-namespace="home"]'));
}

// ── Route split helpers ──────────────────────────────────────────────────

function splitRevealLines(element) {
  if (routeSplits.has(element)) return routeSplits.get(element);
  if (!canSplitRevealElement(element)) return null;

  const split = new SplitText(element, { type: "lines", linesClass: "reveal-line" });
  const wrappers = [];

  for (const line of split.lines) {
    const wrapper = document.createElement("div");
    wrapper.style.cssText = "display:block;width:100%;overflow:hidden;";
    line.style.display = "block";
    line.style.width = "100%";
    line.parentNode.insertBefore(wrapper, line);
    wrapper.appendChild(line);
    wrappers.push(wrapper);
  }

  const state = { split, wrappers, lines: [...split.lines] };
  routeSplits.set(element, state);
  return state;
}

function revertRevealSplit(element) {
  const state = routeSplits.get(element);
  if (!state) return;
  routeSplits.delete(element);
  gsap.killTweensOf(state.lines);
  for (const wrapper of state.wrappers) {
    if (wrapper.isConnected && wrapper.firstChild) {
      wrapper.parentNode.insertBefore(wrapper.firstChild, wrapper);
      wrapper.remove();
    }
  }
  state.split.revert();
}

function revertRevealSplitWithStabilization(element) {
  if (!isHomeDesktopHiddenRevealBody(element)) {
    revertRevealSplit(element);
    return;
  }
  const lockedHeight = element.getBoundingClientRect().height;
  if (lockedHeight > 0) element.style.minHeight = `${lockedHeight}px`;
  revertRevealSplit(element);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      element.style.minHeight = "";
    });
  });
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
  for (const el of Array.from(routeSplits.keys())) {
    revertRevealSplit(el);
  }
}

// ── Route reveal: prepare ────────────────────────────────────────────────

async function prepareRouteReveal(container, options = {}) {
  if (!container) return;

  // Kill any in-flight animations and revert existing splits before re-preparing.
  destroyRouteReveals();

  await document.fonts.ready;

  const titles = getRouteRevealTitles(container, options);
  for (const el of titles) {
    const state = splitRevealLines(el);
    if (!state) continue;
    gsap.set(state.lines, { yPercent: 105 });
  }

  const bodies = getRouteRevealBodies(container, options);
  for (const el of bodies) {
    const state = splitRevealLines(el);
    if (state?.lines?.length) {
      gsap.set(state.lines, { yPercent: 105 });
    } else {
      gsap.set(el, { yPercent: 30, opacity: 0, willChange: "transform,opacity" });
    }
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
        resolve();
      },
      onInterrupt: () => {
        activeEnterTimeline = null;
        resolve();
      },
    });

    activeEnterTimeline = timeline;

    let offset = 0;

    const titles = getRouteRevealTitles(container, options);
    const titleLines = [];
    const titleEls = [];
    for (const el of titles) {
      const state = routeSplits.get(el);
      if (state?.lines?.length) {
        titleLines.push(...state.lines);
        titleEls.push(el);
      }
    }

    if (titleLines.length) {
      timeline.fromTo(
        titleLines,
        { yPercent: 105 },
        {
          yPercent: 0,
          duration: 0.75,
          stagger: 0.07,
          onComplete() {
            for (const el of titleEls) revertRevealSplitWithStabilization(el);
          },
        },
        offset,
      );
      offset += 0.1;
    }

    const bodies = getRouteRevealBodies(container, options);
    const allLines = [];
    const bodyEls = [];
    const bodyBlocks = [];
    for (const el of bodies) {
      const state = routeSplits.get(el);
      if (state?.lines?.length) {
        allLines.push(...state.lines);
        bodyEls.push(el);
      } else {
        bodyBlocks.push(el);
      }
    }

    if (allLines.length) {
      timeline.fromTo(
        allLines,
        { yPercent: 105 },
        {
          yPercent: 0,
          duration: 0.805,
          stagger: 0.069,
          onComplete() {
            for (const el of bodyEls) revertRevealSplitWithStabilization(el);
          },
        },
        offset,
      );
    }

    if (bodyBlocks.length) {
      timeline.fromTo(
        bodyBlocks,
        { yPercent: 30, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.06,
          clearProps: "transform,opacity,willChange",
        },
        offset,
      );
    }

    if (!timeline.getChildren(true, true, true).length) {
      activeEnterTimeline = null;
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
  // Revert any splits created by a previous enter so leave starts clean.
  for (const el of Array.from(routeSplits.keys())) {
    revertRevealSplit(el);
  }

  const titles = getRouteRevealTitles(container, options);
  const bodies = getRouteRevealBodies(container, options);

  if (!titles.length && !bodies.length) return Promise.resolve();

  return new Promise((resolve) => {
    const cleanup = () => {
      // Revert splits created during this leave pass.
      for (const el of Array.from(routeSplits.keys())) {
        revertRevealSplit(el);
      }
      activeLeaveTimeline = null;
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

    const titleLines = [];
    for (const el of titles) {
      const state = splitRevealLines(el);
      if (state?.lines?.length) titleLines.push(...state.lines);
    }

    if (titleLines.length) {
      tl.to(titleLines, { yPercent: -110, opacity: 0, duration: 0.32, stagger: 0.04 }, 0);
    }

    const leaveLines = [];
    const leaveBlocks = [];
    for (const el of bodies) {
      const state = splitRevealLines(el);
      if (state?.lines?.length) {
        leaveLines.push(...state.lines);
      } else {
        leaveBlocks.push(el);
      }
    }

    if (leaveLines.length) {
      tl.to(leaveLines, { yPercent: -110, opacity: 0, duration: 0.32, stagger: 0.03 }, 0);
    }

    if (leaveBlocks.length) {
      tl.to(
        leaveBlocks,
        { yPercent: -30, opacity: 0, duration: 0.28, stagger: 0.03, clearProps: "willChange" },
        0,
      );
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

  // Set initial hidden state synchronously before the observer fires.
  for (const el of elements) {
    gsap.set(el, { yPercent: 30, opacity: 0, willChange: "transform,opacity" });
  }

  for (const el of elements) {
    // Disconnect any existing observer for this element.
    scrollObservers.get(el)?.disconnect();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);
          scrollObservers.delete(entry.target);
          gsap.to(entry.target, {
            yPercent: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power3.out",
            clearProps: "transform,opacity,willChange",
          });
        }
      },
      { threshold: 0.12 },
    );

    // Defer first observe by one frame so the hidden state is painted first.
    requestAnimationFrame(() => {
      observer.observe(el);
    });

    scrollObservers.set(el, observer);
  }
}

// ── Scroll reveals: destroy ───────────────────────────────────────────────

function destroyScrollReveals() {
  for (const [el, observer] of scrollObservers) {
    observer.disconnect();
    gsap.killTweensOf(el);
    gsap.set(el, { clearProps: "transform,opacity,willChange" });
  }
  scrollObservers.clear();
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
