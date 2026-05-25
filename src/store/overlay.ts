import { create } from "zustand";

interface PreloaderOverlayState {
  visible: boolean;
  setVisible: (value: boolean) => void;
}

export const usePreloaderOverlayStore = create<PreloaderOverlayState>((set) => ({
  visible: true,
  setVisible: (value) => set({ visible: value }),
}));
