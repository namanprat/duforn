import { create } from "zustand";
import { requestArchiveMorph } from "../scenes/archive/rigMorph";
import { rigState } from "../scenes/archive/rigState";

export type ArchiveView = "orb" | "grid";

interface ArchiveViewState {
  view: ArchiveView;
  isMorphing: boolean;
  setView: (view: ArchiveView) => void;
  setMorphing: (v: boolean) => void;
}

export const useArchiveViewStore = create<ArchiveViewState>((set, get) => ({
  view: "orb",
  isMorphing: false,
  setMorphing: (isMorphing) => set({ isMorphing }),
  setView: (view) => {
    if (get().isMorphing || get().view === view) return;
    rigState.morphTarget = view === "grid" ? 1 : 0;
    set({ view, isMorphing: true });
    requestArchiveMorph(() => set({ isMorphing: false }));
  },
}));
