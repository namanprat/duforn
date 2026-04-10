import { create } from "zustand";

type WebglState = {
  activePage: string;
  rendererType: string;
  gyroEnabled: boolean;
  setActivePage: (page: string) => void;
  setRendererType: (rendererType: string) => void;
  setGyroEnabled: (gyroEnabled: boolean) => void;
};

export const useWebglStore = create<WebglState>((set) => ({
  activePage: "home",
  rendererType: "unknown",
  gyroEnabled: false,
  setActivePage: (page) => set({ activePage: page }),
  setRendererType: (rendererType) => set({ rendererType }),
  setGyroEnabled: (gyroEnabled) => set({ gyroEnabled }),
}));
