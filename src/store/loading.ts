import { create } from "zustand";

type LoadingPhase = "assets" | "compiling" | "ready";

type LoadingState = {
  phase: LoadingPhase;
  markReady: () => void;
};

// Tracks shader compilation phase (populated by ShaderCompiler components).
// Asset progress is tracked via useProgress from @react-three/drei.
export const useLoadingStore = create<LoadingState>((set) => ({
  phase: "assets",
  markReady: () => set({ phase: "ready" }),
}));
