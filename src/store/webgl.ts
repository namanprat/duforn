import { create } from "zustand";
import type { WebglState } from "../types/webgl";

export const useWebglStore = create<WebglState>((set) => ({
  activePage: "home",
  rendererType: "unknown",
  gyroEnabled: false,
  setActivePage: (page) => set({ activePage: page }),
  setRendererType: (rendererType) => set({ rendererType }),
  setGyroEnabled: (gyroEnabled) => set({ gyroEnabled }),
}));
