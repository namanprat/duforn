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
import { PROJECT_DETAIL_SWATCH, SWATCH_DARK } from "../lib/siteColors";
import { destroyLenis, initLenis } from "../lib/lenis-scroll";
import { setArrivedRoom } from "../lib/cam/arrival";

export { PROJECT_DETAIL_SWATCH };

export const PROJECT_DETAIL_ARRIVED_EVENT = "duforn:project-detail-arrived";
export const WORK_ARRIVED_EVENT = "duforn:work-arrived";

export type TransitionDirection = "toProject" | "toWork";
export type TransitionPhase = "idle" | "stripDissolve" | "cameraBridge" | "swap" | "textReveal";

type WorkProjectTransitionState = {
  active: boolean;
  direction: TransitionDirection | null;
  phase: TransitionPhase;
  stripDissolve: number;
  riseOffset: number;
  mountProjectLayer: boolean;
  projectBgReady: boolean;
  departedOrbitCenterY: number | null;
  targetPath: string | null;
  setPhase: (phase: TransitionPhase) => void;
  setStripDissolve: (value: number) => void;
  setRiseOffset: (value: number) => void;
  setMountProjectLayer: (mount: boolean) => void;
  setProjectBgReady: (ready: boolean) => void;
  beginToWork: () => void;
  reset: () => void;
};

const TOKENS = MOTION_TOKENS.workProjectTransition;
const WORK_PATH = "/work";

const IDLE_STATE = {
  active: false,
  direction: null as TransitionDirection | null,
  phase: "idle" as TransitionPhase,
  stripDissolve: 0,
  riseOffset: 0,
  mountProjectLayer: false,
  projectBgReady: false,
  targetPath: null as string | null,
};

export const useWorkProjectTransitionStore = create<WorkProjectTransitionState>((set, get) => ({
  ...IDLE_STATE,
  departedOrbitCenterY: null,
  setPhase: (phase) => set({ phase }),
  setStripDissolve: (stripDissolve) => set({ stripDissolve }),
  setRiseOffset: (riseOffset) => set({ riseOffset }),
  setMountProjectLayer: (mountProjectLayer) => set({ mountProjectLayer }),
  setProjectBgReady: (projectBgReady) => set({ projectBgReady }),
  beginToWork: () =>
    set({
      active: true,
      direction: "toWork",
      phase: "cameraBridge",
      stripDissolve: 1,
      riseOffset: 0,
      mountProjectLayer: false,
      targetPath: WORK_PATH,
    }),
  reset: () => {
    const { departedOrbitCenterY } = get();
    set({ ...IDLE_STATE, departedOrbitCenterY });
  },
}));

/** @deprecated use shouldUseProjectWorkTransition */
export function shouldUseWorkProjectTransition(fromPath: string, toPath: string): boolean {
  return shouldUseProjectWorkTransition(fromPath, toPath);
}

export function shouldUseProjectWorkTransition(fromPath: string, toPath: string): boolean {
  const fromWork = fromPath === WORK_PATH;
  const toWork = toPath === WORK_PATH;
  const fromProject = getRouteNamespace(fromPath) === "projectDetail";
  const toProject = getRouteNamespace(toPath) === "projectDetail";
  return (fromWork && toProject) || (fromProject && toWork);
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

function delay(seconds: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, seconds * 1000));
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

function workOrbitY(): number {
  return ROOM_POSES.work.orbitCenterY;
}

function departedOrbitY(): number {
  return workOrbitY() - TOKENS.cameraYDelta;
}

export function applyProjectDetailSideEffects(): void {
  document.body.classList.add("page-wrap--scrollable");
  const themeColor = document.querySelector('meta[name="theme-color"]');
  themeColor?.setAttribute("content", PROJECT_DETAIL_SWATCH);
  initLenis();
}

export function applyWorkSideEffects(): void {
  document.body.classList.remove("page-wrap--scrollable");
  const themeColor = document.querySelector('meta[name="theme-color"]');
  themeColor?.setAttribute("content", SWATCH_DARK);
  destroyLenis();
}

async function tweenOrbitCenterY(from: number, to: number): Promise<void> {
  cameraTransitionRef.current = true;
  try {
    await tweenValue(from, to, TOKENS.cameraYDuration, TOKENS.cameraYEase, (value) => {
      cameraBasePoseRef.current.orbitCenterY = value;
    });
  } finally {
    cameraTransitionRef.current = false;
  }
}

export async function runWorkToProjectTransition(
  toPath: string,
  navigate: (path: string) => void,
): Promise<void> {
  // ponytail: work→project transition removed — always do an instant swap
  // (this is the same path canRunTransition()===false already took).
  const departedY = departedOrbitY();

  snapHidePageChrome();
  snapHideAllRegisteredPageText();
  navigate(toPath);
  applyProjectDetailSideEffects();
  await waitFrames(2);
  snapShowPageChrome(false);
  await showAllRegisteredPageText();
  useWorkProjectTransitionStore.setState({ departedOrbitCenterY: departedY });
  window.dispatchEvent(new CustomEvent(PROJECT_DETAIL_ARRIVED_EVENT));
}

export async function runProjectToWorkTransition(
  _fromPath: string,
  navigate: (path: string) => void,
): Promise<void> {
  const store = useWorkProjectTransitionStore.getState();
  const workY = workOrbitY();
  const startY = store.departedOrbitCenterY ?? departedOrbitY();

  if (!canRunTransition()) {
    snapHidePageChrome();
    snapHideAllRegisteredPageText();
    navigate(WORK_PATH);
    applyWorkSideEffects();
    await waitFrames(2);
    snapShowPageChrome(false);
    await showAllRegisteredPageText();
    cameraBasePoseRef.current.orbitCenterY = workY;
    window.dispatchEvent(new CustomEvent(WORK_ARRIVED_EVENT));
    return;
  }

  store.beginToWork();
  snapHidePageChrome();
  await hideAllRegisteredPageText();

  await tweenValue(0, 1, TOKENS.bgRiseDuration, TOKENS.bgRiseEase, store.setRiseOffset);

  store.setPhase("swap");
  cameraBasePoseRef.current.orbitCenterY = startY;
  navigate(WORK_PATH);
  applyWorkSideEffects();
  await waitFrames(2);

  store.setPhase("cameraBridge");
  await tweenOrbitCenterY(startY, workY);

  store.setPhase("stripDissolve");
  await tweenValue(1, 0, TOKENS.stripDissolveDuration, TOKENS.stripDissolveEase, store.setStripDissolve);

  store.setPhase("textReveal");
  if (TOKENS.textRevealDelay > 0) await delay(TOKENS.textRevealDelay);
  await showAllRegisteredPageText();
  snapShowPageChrome(false);
  setArrivedRoom("work");
  window.dispatchEvent(new CustomEvent(WORK_ARRIVED_EVENT));
  useWorkProjectTransitionStore.getState().reset();
}
