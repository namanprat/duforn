import { create } from "zustand";

export type RoomNamespace = "main" | "work" | "contact" | "archive";
export type AppNamespace = RoomNamespace | "projectDetail";

interface WebglState {
  activePage: AppNamespace;
  setActivePage: (page: AppNamespace) => void;
}

export const useWebglStore = create<WebglState>((set) => ({
  activePage: "main",
  setActivePage: (page) => set({ activePage: page }),
}));
