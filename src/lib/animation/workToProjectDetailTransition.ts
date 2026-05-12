// @ts-nocheck
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  DEFAULT_WORK_TO_PROJECT_BRIDGE_COLOR,
  useWorkToProjectTransitionStore,
  WORK_TO_PROJECT_PHASES,
} from "../../store/workToProjectTransition";

export const WORK_TO_PROJECT_TIMINGS = {
  stripFadeOutMs: 280,
  titleDropDelayMs: 120,
  titleDropMs: 320,
  workBgFadeOutMs: 380,
  projectBgDissolveInMs: 560,
  contentRevealHandoffAt: 0.7,
} as const;

export function isWorkToProjectDetailTransition(fromNamespace, toNamespace) {
  return fromNamespace === "work" && toNamespace === "projectDetail";
}

function prefersReducedMotion() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function nextFrame() {
  return new Promise((resolve) => {
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => resolve(undefined));
      return;
    }
    setTimeout(resolve, 16);
  });
}

function waitForProjectBgReady(timeoutMs = 4000) {
  return new Promise((resolve) => {
    if (useWorkToProjectTransitionStore.getState().projectBgReady) {
      resolve(undefined);
      return;
    }
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      unsub();
      clearTimeout(timer);
      resolve(undefined);
    };
    const unsub = useWorkToProjectTransitionStore.subscribe((state) => {
      if (state.projectBgReady) finish();
    });
    const timer = setTimeout(finish, timeoutMs);
  });
}

function tweenValue({ from, to, durationMs, ease, onUpdate, delayMs = 0 }) {
  return new Promise((resolve) => {
    const proxy = { value: from };
    onUpdate(from);
    gsap.to(proxy, {
      value: to,
      duration: Math.max(0.001, durationMs / 1000),
      delay: Math.max(0, delayMs / 1000),
      ease,
      onUpdate: () => onUpdate(proxy.value),
      onComplete: () => {
        onUpdate(to);
        resolve(undefined);
      },
      onInterrupt: () => resolve(undefined),
    });
  });
}

function getTitleElement() {
  if (typeof document === "undefined") return null;
  return document.querySelector("[data-work-strip-title]");
}

function animateTitleDrop(titleElement, delayMs) {
  return new Promise((resolve) => {
    if (!titleElement) {
      resolve(undefined);
      return;
    }
    gsap.killTweensOf(titleElement);
    gsap.to(titleElement, {
      y: 56,
      autoAlpha: 0,
      delay: Math.max(0, delayMs / 1000),
      duration: WORK_TO_PROJECT_TIMINGS.titleDropMs / 1000,
      ease: "power3.inOut",
      onComplete: () => resolve(undefined),
      onInterrupt: () => resolve(undefined),
    });
  });
}

function clearTitleTransforms(titleElement) {
  if (!titleElement) return;
  gsap.killTweensOf(titleElement);
  gsap.set(titleElement, { clearProps: "all" });
}

export async function runWorkToProjectDetailTransition({ navigate, nextPath }) {
  const store = useWorkToProjectTransitionStore.getState();

  if (store.active) {
    navigate(nextPath);
    return;
  }

  const bridgeColor = DEFAULT_WORK_TO_PROJECT_BRIDGE_COLOR;
  const titleElement = getTitleElement();

  if (prefersReducedMotion()) {
    useWorkToProjectTransitionStore.setState({
      active: false,
      phase: WORK_TO_PROJECT_PHASES.idle,
      bridgeColor,
      stripOpacity: 1,
      workBackgroundProgress: 0,
      projectBackgroundProgress: 1,
      contentReady: true,
    });
    clearTitleTransforms(titleElement);
    navigate(nextPath);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("duforn:work-project-content-ready"));
    }
    return;
  }

  useWorkToProjectTransitionStore.getState().begin({ bridgeColor });

  try {
    // Phase 1: strip fade-out overlapped with title drop.
    await Promise.all([
      tweenValue({
        from: 1,
        to: 0,
        durationMs: WORK_TO_PROJECT_TIMINGS.stripFadeOutMs,
        ease: "power2.out",
        onUpdate: (v) => useWorkToProjectTransitionStore.getState().setStripOpacity(v),
      }),
      (async () => {
        useWorkToProjectTransitionStore.getState().setPhase(WORK_TO_PROJECT_PHASES.titleDrop);
        await animateTitleDrop(titleElement, WORK_TO_PROJECT_TIMINGS.titleDropDelayMs);
      })(),
    ]);

    // Phase 2: work background → bridge color.
    useWorkToProjectTransitionStore.getState().setPhase(WORK_TO_PROJECT_PHASES.workBgFadeOut);
    await tweenValue({
      from: 0,
      to: 1,
      durationMs: WORK_TO_PROJECT_TIMINGS.workBgFadeOutMs,
      ease: "power2.inOut",
      onUpdate: (v) => useWorkToProjectTransitionStore.getState().setWorkBackgroundProgress(v),
    });

    // Navigate while bridge color holds.
    navigate(nextPath);
    await nextFrame();
    await nextFrame();

    // Hold on the bridge color until the project background scene has finished
    // its async material build — otherwise the dissolve runs against an empty
    // quad and the user only sees the solid bridge color.
    await waitForProjectBgReady();
    await nextFrame();

    // Phase 3: project background dissolves in; fire content reveal partway through.
    useWorkToProjectTransitionStore.getState().setPhase(WORK_TO_PROJECT_PHASES.projectBgDissolveIn);
    let contentReleased = false;
    await tweenValue({
      from: 0,
      to: 1,
      durationMs: WORK_TO_PROJECT_TIMINGS.projectBgDissolveInMs,
      ease: "power2.out",
      onUpdate: (v) => {
        useWorkToProjectTransitionStore.getState().setProjectBackgroundProgress(v);
        if (!contentReleased && v >= WORK_TO_PROJECT_TIMINGS.contentRevealHandoffAt) {
          contentReleased = true;
          useWorkToProjectTransitionStore.getState().releaseContent();
        }
      },
    });

    if (!contentReleased) {
      useWorkToProjectTransitionStore.getState().releaseContent();
    }

    useWorkToProjectTransitionStore.getState().finish();
    clearTitleTransforms(titleElement);
    await nextFrame();
    ScrollTrigger.refresh();
    if (typeof window !== "undefined") {
      window.__refreshLinkHover?.();
    }
  } catch (error) {
    clearTitleTransforms(titleElement);
    useWorkToProjectTransitionStore.getState().reset();
    throw error;
  }
}
