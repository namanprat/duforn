import { create } from "zustand";
import { getRouteNamespace, type RoomNamespace } from "../lib/route";

export type ArchiveReturnRoom = Extract<RoomNamespace, "main" | "work" | "contact">;

type ArchiveReturnState = {
  origin: ArchiveReturnRoom;
  preloadReadyFor: ArchiveReturnRoom | null;
  setOriginFromPath: (path: string) => void;
  markPreloadReady: (room: ArchiveReturnRoom) => void;
  shouldSkipSubgraphDelay: (room: RoomNamespace) => boolean;
  clearSubgraphDelaySkip: () => void;
};

function roomFromPath(path: string): ArchiveReturnRoom | null {
  const ns = getRouteNamespace(path);
  if (ns === "main" || ns === "work" || ns === "contact") return ns;
  return null;
}

export const useArchiveReturnStore = create<ArchiveReturnState>((set, get) => ({
  origin: "main",
  preloadReadyFor: null,
  setOriginFromPath: (path) => {
    const room = roomFromPath(path);
    if (room) set({ origin: room });
  },
  markPreloadReady: (room) => set({ preloadReadyFor: room }),
  shouldSkipSubgraphDelay: (room) => {
    const { preloadReadyFor } = get();
    return (
      preloadReadyFor !== null &&
      (room === "main" || room === "work" || room === "contact") &&
      preloadReadyFor === room
    );
  },
  clearSubgraphDelaySkip: () => set({ preloadReadyFor: null }),
}));

export function getArchiveReturnRoom(): ArchiveReturnRoom {
  return useArchiveReturnStore.getState().origin;
}
