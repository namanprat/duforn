import { create } from "zustand";
import { getRenderQualityProfile } from "../lib/rendering/qualityProfile";

export const useWebglStore = create((set) => ({
  activePage: "main",
  rendererType: "unknown",
  gyroEnabled: false,
  qualityProfile: getRenderQualityProfile(),
  setActivePage: (page) => set({ activePage: page }),
  setRendererType: (rendererType) => set({ rendererType }),
  setGyroEnabled: (gyroEnabled) => set({ gyroEnabled }),
  setQualityProfile: (qualityProfile) => set({ qualityProfile }),
}));
