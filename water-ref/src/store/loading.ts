// @ts-nocheck
import { create } from "zustand";
import { getSnapshot, subscribe } from "../lib/preload/gate";

/**
 * Loading store mirrors the preloader gate (asset readiness) plus the
 * `phase` flag flipped by `ShaderWarmup` once the active scene branch's
 * shaders are compiled.
 *
 * - `phase` becomes `ready` when `ShaderWarmup` finishes (`compile` /
 *   `compileAsync`) for the active branch.
 * - `progress` (0..1) and `essentialsReady` come from `preloaderGate` and
 *   reflect fonts, GLBs (see `src/models/gen/preloads.ts`), HDR, and work-strip textures.
 */
export const useLoadingStore = create((set) => ({
  phase: "assets", // 'assets' | 'compiling' | 'ready'
  progress: 0,
  essentialsReady: true,
  markReady: () => set({ phase: "ready" }),
  setProgress: (value) => set({ progress: value }),
  setEssentialsReady: (value) => set({ essentialsReady: value }),
}));

/** Resolves once shader warmup finishes, or after `timeoutMs` as a deadlock fallback. */
export function waitForLoadingPhaseReady(timeoutMs = 15000): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (useLoadingStore.getState().phase === "ready") return Promise.resolve();

  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      unsubscribe();
      resolve();
    };

    const timeoutId = window.setTimeout(finish, timeoutMs);
    const unsubscribe = useLoadingStore.subscribe((state) => {
      if (state.phase === "ready") finish();
    });
  });
}

if (typeof window !== "undefined") {
  // Wire gate snapshots into the store so React subscribers can read them
  // through the same hook.
  subscribe((snapshot) => {
    const state = useLoadingStore.getState();
    if (state.progress !== snapshot.progress) {
      state.setProgress(snapshot.progress);
    }
    if (state.essentialsReady !== snapshot.essentialsReady) {
      state.setEssentialsReady(snapshot.essentialsReady);
    }
  });

  // Apply the initial snapshot synchronously in case tasks were registered
  // before the store module imported the gate (rare but harmless).
  const initial = getSnapshot();
  useLoadingStore.setState({
    progress: initial.progress,
    essentialsReady: initial.essentialsReady,
  });
}
