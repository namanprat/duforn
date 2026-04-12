import { create } from "zustand";

// `phase` becomes `ready` when `ShaderCompiler` (inside `UnifiedCanvas`) finishes after
// `gl.compile` / `compileAsync` for the active scene branch.
// GLB/HDR preloads run from `src/models/preload` (imported in `main.tsx`); not tracked here.
export const useLoadingStore = create((set) => ({
  phase: "assets", // 'assets' | 'compiling' | 'ready'
  markReady: () => set({ phase: "ready" }),
}));
