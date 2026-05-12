// @ts-nocheck
import { create } from "zustand";

export const WORK_TO_PROJECT_PHASES = {
  idle: "idle",
  stripFadeOut: "stripFadeOut",
  titleDrop: "titleDrop",
  workBgFadeOut: "workBgFadeOut",
  projectBgDissolveIn: "projectBgDissolveIn",
  contentReveal: "contentReveal",
} as const;

export const WORK_TO_PROJECT_TEXT_REVEAL_EVENT = "duforn:work-project-content-ready";

const DEFAULT_BRIDGE_COLOR = "#CACACA";

const INITIAL_STATE = {
  active: false,
  phase: WORK_TO_PROJECT_PHASES.idle,
  bridgeColor: DEFAULT_BRIDGE_COLOR,
  stripOpacity: 1,
  workBackgroundProgress: 0,
  projectBackgroundProgress: 1,
  projectBgReady: false,
  contentReady: true,
};

function emitContentReady() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(WORK_TO_PROJECT_TEXT_REVEAL_EVENT));
}

export const useWorkToProjectTransitionStore = create((set, get) => ({
  ...INITIAL_STATE,

  begin: ({ bridgeColor = DEFAULT_BRIDGE_COLOR } = {}) =>
    set({
      active: true,
      phase: WORK_TO_PROJECT_PHASES.stripFadeOut,
      bridgeColor,
      stripOpacity: 1,
      workBackgroundProgress: 0,
      projectBackgroundProgress: 0,
      projectBgReady: false,
      contentReady: false,
    }),

  setPhase: (phase) => set({ phase }),
  setStripOpacity: (stripOpacity) => set({ stripOpacity }),
  setWorkBackgroundProgress: (workBackgroundProgress) => set({ workBackgroundProgress }),
  setProjectBackgroundProgress: (projectBackgroundProgress) => set({ projectBackgroundProgress }),
  setProjectBgReady: (projectBgReady) => set({ projectBgReady }),

  releaseContent: () => {
    if (!get().active && get().contentReady) return;
    set({
      phase: WORK_TO_PROJECT_PHASES.contentReveal,
      contentReady: true,
    });
    emitContentReady();
  },

  finish: () =>
    set({
      ...INITIAL_STATE,
    }),

  reset: () => {
    set({ ...INITIAL_STATE });
    emitContentReady();
  },
}));

export const DEFAULT_WORK_TO_PROJECT_BRIDGE_COLOR = DEFAULT_BRIDGE_COLOR;
