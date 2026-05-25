// @ts-nocheck
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import {
  getRoomRouteKey,
  getRoomRouteRange,
  isRoomNamespace,
  playToRoom,
  ROOM_NAMESPACES,
  ROOM_POSES,
  ROOM_ROUTES,
  snapToRoom,
} from "../src/lib/theatre/roomCam";

describe("roomCameraTransition", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("defines pose anchors for all room namespaces", () => {
    for (const room of ROOM_NAMESPACES) {
      expect(typeof ROOM_POSES[room]).toBe("number");
    }
  });

  it("defines directed route segments for every room pair", () => {
    expect(ROOM_ROUTES["main->contact"]).toEqual([0, 2]);
    expect(ROOM_ROUTES["contact->main"]).toEqual([3, 5]);
    expect(ROOM_ROUTES["main->work"]).toEqual([6, 8]);
    expect(ROOM_ROUTES["work->main"]).toEqual([9, 11]);
    expect(ROOM_ROUTES["work->contact"]).toEqual([12, 14]);
    expect(ROOM_ROUTES["contact->work"]).toEqual([15, 17]);
  });

  it("builds route keys and looks up directed ranges", () => {
    expect(getRoomRouteKey("work", "contact")).toBe("work->contact");
    expect(getRoomRouteRange("work", "contact")).toEqual([12, 14]);
    expect(getRoomRouteRange("contact", "work")).toEqual([15, 17]);
  });

  it("snaps to the canonical idle pose for a room", () => {
    const sheet = { sequence: { pause: vi.fn(), position: -1 } };

    snapToRoom(sheet, "contact");

    expect(sheet.sequence.pause).toHaveBeenCalledTimes(1);
    expect(sheet.sequence.position).toBe(ROOM_POSES.contact);
  });

  it("plays the authored directed range for work to contact", async () => {
    const play = vi.fn(() => Promise.resolve(true));
    const sheet = {
      sequence: {
        pause: vi.fn(),
        position: ROOM_POSES.work,
        play,
      },
    };

    await playToRoom(sheet, "work", "contact", { reducedMotion: false });

    expect(sheet.sequence.position).toBe(12);
    expect(play).toHaveBeenCalledWith(
      expect.objectContaining({
        range: [12, 14],
        direction: "normal",
      }),
    );
  });

  it("recognizes room-family activePage values", () => {
    expect(isRoomNamespace("main")).toBe(true);
    expect(isRoomNamespace("contact")).toBe(true);
    expect(isRoomNamespace("work")).toBe(true);
    expect(isRoomNamespace("projectDetail")).toBe(false);
  });
});
