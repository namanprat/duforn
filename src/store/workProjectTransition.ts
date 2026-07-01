import { create } from "zustand";
import gsap from "gsap";
import { MOTION_TOKENS } from "../lib/animation/motionTokens";
import { getRouteNamespace } from "../lib/route";
import { getDeviceTier } from "../lib/deviceTier";
import { prefersReducedMotion } from "../lib/prefersReducedMotion";
import {
  hideAllRegisteredPageText,
  showAllRegisteredPageText,
  snapHideAllRegisteredPageText,
} from "../lib/text";
import { snapHidePageChrome, snapShowPageChrome } from "../lib/pageChrome";
import { cameraBasePoseRef, cameraTransitionRef } from "../scenes/cam/pose";
import { ROOM_POSES } from "../scenes/cam/roomPoses";
import { PROJECT_DETAIL_SWATCH } from "../lib/siteColors";
import { initLenis } from "../lib/lenis-scroll";

export { PROJECT_DETAIL_SWATCH };

export const PROJECT_DETAIL_ARRIVED_EVENT = "duforn:project-detail-arrived";

type Phase = "idle" | "departing" | "covered" | "arriving";

type WorkProjectTransitionState = {
  active: boolean;
  phase: Phase;
  stripOpacity: number;
  overlayOpacity: number;
  projectBgReady: boolean;
  begin: () => void;
  setPhase: (phase: Phase) => void;
  setStripOpacity: (value: number) => void;
  setOverlayOpacity: (value: number) => void;
  setProjectBgReady: (ready: boolean) => void;
  reset: () => void;
};

const TOKENS = MOTION_TOKENS.workProjectTransition;
const CAMERA_DEPARTURE_HEIGHT = -2.5;

export const useWorkProjectTransitionStore = create<WorkProjectTransitionState>((set) => ({
  active: false,
  phase: "idle",
  stripOpacity: 1,
  overlayOpacity: 0,
  projectBgReady: false,
  begin: () =>
    set({
      active: true,
      phase: "departing",
      stripOpacity: 1,
      overlayOpacity: 0,
      projectBgReady: false,
    }),
  setPhase: (phase) => set({ phase }),
  setStripOpacity: (stripOpacity) => set({ stripOpacity }),
  setOverlayOpacity: (overlayOpacity) => set({ overlayOpacity }),
  setProjectBgReady: (projectBgReady) => set({ projectBgReady }),
  reset: () =>
    set({
      active: false,
      phase: "idle",
      stripOpacity: 1,
      overlayOpacity: 0,
      projectBgReady: false,
    }),
}));

export function shouldUseWorkProjectTransition(fromPath: string, toPath: string): boolean {
  return fromPath === "/work" && getRouteNamespace(toPath) === "projectDetail";
}

export function isWorkProjectTransitionActive(): boolean {
  return useWorkProjectTransitionStore.getState().active;
}

function canRunTransition(): boolean {
  return getDeviceTier() > 0 && !prefersReducedMotion();
}

function waitFrames(count = 2): Promise<void> {
  return new Promise((resolve) => {
    let remaining = count;
    const step = () => {
      remaining -= 1;
      if (remaining <= 0) resolve();
      else requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

function tweenValue(
  from: number,
  to: number,
  duration: number,
  ease: string,
  onUpdate: (value: number) => void,
): Promise<void> {
  return new Promise((resolve) => {
    const cursor = { value: from };
    onUpdate(from);
    gsap.to(cursor, {
      value: to,
      duration,
      ease,
      onUpdate: () => onUpdate(cursor.value),
      onComplete: () => resolve(),
    });
  });
}

function waitForProjectBgReady(timeoutMs: number): Promise<void> {
  if (useWorkProjectTransitionStore.getState().projectBgReady) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const timer = window.setTimeout(finish, timeoutMs);
    const unsub = useWorkProjectTransitionStore.subscribe((state) => {
      if (state.projectBgReady) finish();
    });

    function finish() {
      window.clearTimeout(timer);
      unsub();
      resolve();
    }
  });
}

export function applyProjectDetailSideEffects(): void {
  document.body.classList.add("page-wrap--scrollable");
  const themeColor = document.querySelector('meta[name="theme-color"]');
  themeColor?.setAttribute("content", PROJECT_DETAIL_SWATCH);
  initLenis();
}

export async function runWorkToProjectTransition(
  toPath: string,
  navigate: (path: string) => void,
): Promise<void> {
  const store = useWorkProjectTransitionStore.getState();
  const workPose = ROOM_POSES.work;

  if (!canRunTransition()) {
    snapHidePageChrome();
    snapHideAllRegisteredPageText();
    navigate(toPath);
    applyProjectDetailSideEffects();
    await waitFrames(2);
    snapShowPageChrome(false);
    await showAllRegisteredPageText();
    window.dispatchEvent(new CustomEvent(PROJECT_DETAIL_ARRIVED_EVENT));
    return;
  }

  const startCameraHeight = cameraBasePoseRef.current.cameraHeight;

  store.begin();

  await Promise.all([
    tweenValue(1, 0, TOKENS.stripFadeDuration, TOKENS.stripFadeEase, store.setStripOpacity),
    hideAllRegisteredPageText(),
    (async () => {
      cameraTransitionRef.current = true;
      try {
        await tweenValue(
          startCameraHeight,
          CAMERA_DEPARTURE_HEIGHT,
          TOKENS.cameraDownDuration,
          TOKENS.cameraDownEase,
          (value) => {
            cameraBasePoseRef.current.cameraHeight = value;
          },
        );
      } finally {
        cameraTransitionRef.current = false;
      }
    })(),
  ]);

  store.setPhase("covered");
  await tweenValue(0, 1, TOKENS.overlayInDuration, TOKENS.overlayInEase, store.setOverlayOpacity);

  snapHidePageChrome();
  snapHideAllRegisteredPageText();
  store.setProjectBgReady(false);
  navigate(toPath);
  applyProjectDetailSideEffects();
  await waitFrames(2);

  await waitForProjectBgReady(TOKENS.bgReadyTimeoutMs);

  store.setPhase("arriving");
  await tweenValue(1, 0, TOKENS.overlayOutDuration, TOKENS.overlayOutEase, store.setOverlayOpacity);

  cameraBasePoseRef.current.cameraHeight = workPose.cameraHeight;
  snapShowPageChrome(false);
  window.dispatchEvent(new CustomEvent(PROJECT_DETAIL_ARRIVED_EVENT));
  await showAllRegisteredPageText();
  store.reset();
}
