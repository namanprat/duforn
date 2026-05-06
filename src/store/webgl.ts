import { create } from "zustand";
import { getRenderQualityProfile } from "../lib/rendering/qualityProfile";

export const useWebglStore = create((set) => ({
  activePage: "home",
  rendererType: "unknown",
  gyroEnabled: false,
  qualityProfile: getRenderQualityProfile(),
  ssaoEnabled: true,
  setActivePage: (page) => set({ activePage: page }),
  setRendererType: (rendererType) => set({ rendererType }),
  setGyroEnabled: (gyroEnabled) => set({ gyroEnabled }),
  setQualityProfile: (qualityProfile) => set({ qualityProfile }),
  setSsaoEnabled: (ssaoEnabled) => set({ ssaoEnabled }),
}));
