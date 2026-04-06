import { create } from "zustand";

// Tracks shader compilation phase (populated by ShaderCompiler components).
// Asset progress is tracked via useProgress from @react-three/drei.
export const useLoadingStore = create((set) => ({
  phase: "assets", // 'assets' | 'compiling' | 'ready'
  markReady: () => set({ phase: "ready" }),
}));
