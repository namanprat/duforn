import { create } from "zustand";

export const useWebglStore = create((set) => ({
  activePage: "main",
  rendererType: "unknown",
  gyroEnabled: false,
  setActivePage: (page) => set({ activePage: page }),
  setRendererType: (rendererType) => set({ rendererType }),
  setGyroEnabled: (gyroEnabled) => set({ gyroEnabled }),
}));
