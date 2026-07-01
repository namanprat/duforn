import { create } from "zustand";

/** True while a secondary WebGL canvas (e.g. About helmet) is active. */
export const useWebGLOverlayStore = create<{
  active: boolean;
  setActive: (active: boolean) => void;
}>((set) => ({
  active: false,
  setActive: (active) => set({ active }),
}));
