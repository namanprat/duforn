// @ts-nocheck
import React, { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { createRoot } from "react-dom/client";
import TheatreCameraController from "../src/scenes/TheatreCameraController";
import { DEFAULT_CAMERA_BASE_POSE, cameraBasePoseRef } from "../src/lib/theatre/cameraBasePose";
import { useWebglStore } from "../src/store/webgl";
import { getRoomCameraObject, getRoomCameraSheet } from "../src/lib/theatre/dufornProject";
import { playToRoom, snapToRoom } from "../src/lib/theatre/roomCameraTransition";

vi.mock("../src/lib/theatre/dufornProject", () => ({
  getRoomCameraSheet: vi.fn(),
  getRoomCameraObject: vi.fn(),
}));

vi.mock("../src/lib/theatre/roomCameraTransition", () => ({
  isRoomNamespace: (value) => ["main", "contact", "work"].includes(value),
  playToRoom: vi.fn(() => Promise.resolve(true)),
  snapToRoom: vi.fn(),
}));

vi.mock("../src/lib/theatre/theatreRafDriver", () => ({
  getTheatreRafDriver: vi.fn(() => undefined),
}));

async function flushEffects() {
  await Promise.resolve();
  await Promise.resolve();
}

async function renderController() {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  await act(async () => {
    root.render(<TheatreCameraController />);
    await flushEffects();
  });

  return { root, container };
}

beforeEach(() => {
  vi.clearAllMocks();
  useWebglStore.setState({ activePage: "main" });
  cameraBasePoseRef.current = { ...DEFAULT_CAMERA_BASE_POSE };
});

afterEach(() => {
  useWebglStore.setState({ activePage: "main" });
  cameraBasePoseRef.current = { ...DEFAULT_CAMERA_BASE_POSE };
});

describe("TheatreCameraController", () => {
  it("snaps to the current room on mount instead of seeding a default contact pose", async () => {
    const sheet = { sequence: { pause: vi.fn(), position: 0 } };
    const values = {
      orbitCenterX: 4.2,
      orbitCenterY: 0.6,
      orbitCenterZ: -5.6,
      orbitRadius: 5.4,
      cameraHeight: 1.35,
      fov: 52,
      orbitAngleDeg: 28,
      lookAtYawDeg: 26,
      lookAtPitchDeg: -10,
    };
    const unsubscribe = vi.fn();
    const obj = {
      value: values,
      onValuesChange: vi.fn(() => unsubscribe),
    };

    getRoomCameraSheet.mockResolvedValue(sheet);
    getRoomCameraObject.mockResolvedValue(obj);
    useWebglStore.setState({ activePage: "contact" });

    const { root, container } = await renderController();

    expect(snapToRoom).toHaveBeenCalledTimes(1);
    expect(snapToRoom).toHaveBeenCalledWith(sheet, "contact");
    expect(playToRoom).not.toHaveBeenCalled();
    expect(cameraBasePoseRef.current).toMatchObject(values);

    await act(async () => {
      root.unmount();
    });
    expect(unsubscribe).toHaveBeenCalledTimes(1);
    container.remove();
  });

  it("plays from contact to work without starting from work's prior room state", async () => {
    const sheet = { sequence: { pause: vi.fn(), position: 0 } };
    const obj = {
      value: { ...DEFAULT_CAMERA_BASE_POSE },
      onValuesChange: vi.fn(() => vi.fn()),
    };

    getRoomCameraSheet.mockResolvedValue(sheet);
    getRoomCameraObject.mockResolvedValue(obj);
    useWebglStore.setState({ activePage: "contact" });

    const { root, container } = await renderController();
    vi.mocked(playToRoom).mockClear();

    await act(async () => {
      useWebglStore.getState().setActivePage("work");
      await flushEffects();
    });

    expect(playToRoom).toHaveBeenCalledTimes(1);
    expect(playToRoom).toHaveBeenCalledWith(sheet, "contact", "work");

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it("plays from work to contact without starting from contact's prior room state", async () => {
    const sheet = { sequence: { pause: vi.fn(), position: 0 } };
    const obj = {
      value: { ...DEFAULT_CAMERA_BASE_POSE },
      onValuesChange: vi.fn(() => vi.fn()),
    };

    getRoomCameraSheet.mockResolvedValue(sheet);
    getRoomCameraObject.mockResolvedValue(obj);
    useWebglStore.setState({ activePage: "work" });

    const { root, container } = await renderController();
    vi.mocked(playToRoom).mockClear();

    await act(async () => {
      useWebglStore.getState().setActivePage("contact");
      await flushEffects();
    });

    expect(playToRoom).toHaveBeenCalledTimes(1);
    expect(playToRoom).toHaveBeenCalledWith(sheet, "work", "contact");

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });
});
