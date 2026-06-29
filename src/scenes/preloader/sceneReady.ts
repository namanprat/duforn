import { create } from "zustand";

export const SCENE_READY_EVENT = "duforn:scene-ready";

export type BootPhase = "fetching" | "compiling" | "ready" | "revealing" | "live";

type SceneBootState = {
  phase: BootPhase;
  progress: number;
  muted: boolean;
  revealNonce: number;
  setPhase: (phase: BootPhase) => void;
  setProgress: (progress: number) => void;
  setMuted: (muted: boolean) => void;
  requestReveal: (muted: boolean) => void;
};

export const useSceneBootStore = create<SceneBootState>((set, get) => ({
  phase: "fetching",
  progress: 0,
  muted: false,
  revealNonce: 0,
  setPhase: (phase) => set({ phase }),
  setProgress: (progress) => set({ progress }),
  setMuted: (muted) => set({ muted }),
  requestReveal: (muted) => set({ muted, revealNonce: get().revealNonce + 1 }),
}));

let sceneReady = false;
let initialBootCompleted = false;

export function hasInitialBootCompleted(): boolean {
  return initialBootCompleted;
}

export function getSceneBootPhase(): BootPhase {
  return useSceneBootStore.getState().phase;
}

export function getSceneReady(): boolean {
  return sceneReady;
}

export function getAudioMuted(): boolean {
  return useSceneBootStore.getState().muted;
}

export function setSceneReady(ready = true): void {
  sceneReady = ready;
  if (!ready) return;
  initialBootCompleted = true;
  useSceneBootStore.getState().setPhase("live");
  if (typeof document !== "undefined") {
    document.documentElement.classList.add("scene-live");
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(SCENE_READY_EVENT));
  }
}

export function resetSceneBoot(): void {
  sceneReady = false;
  initialBootCompleted = false;
  useSceneBootStore.setState({
    phase: "fetching",
    progress: 0,
    muted: false,
    revealNonce: 0,
  });
  if (typeof document !== "undefined") {
    document.documentElement.classList.remove("scene-live");
  }
}
