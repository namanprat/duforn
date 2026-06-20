import { create } from "zustand";

export const useWebglStore = create((set) => ({
  activePage: "main",
  rendererType: "unknown",
  setActivePage: (page) => set({ activePage: page }),
  setRendererType: (rendererType) => set({ rendererType }),
}));
