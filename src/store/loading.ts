import { create } from "zustand";

// `phase` becomes `ready` when ShaderCompiler finishes for the active scene (inside R3F).
// GLB/HDR preloads run from `src/models/preload` (imported in `main.tsx`); not tracked here.
export const useLoadingStore = create((set) => ({
  phase: "assets", // 'assets' | 'compiling' | 'ready'
  markReady: () => set({ phase: "ready" }),
}));
