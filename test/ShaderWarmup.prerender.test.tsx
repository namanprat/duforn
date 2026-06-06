// @ts-nocheck
import React, { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { createRoot } from "react-dom/client";
import { useLoadingStore } from "../src/store/loading";

const mockAdvance = vi.fn();
const mockRender = vi.fn();
const mockCompileAsync = vi.fn(() => Promise.resolve());
const mockCompile = vi.fn();

vi.mock("@react-three/fiber", () => ({
  useThree: () => ({
    gl: {
      __rendererType: "webgpu",
      compileAsync: mockCompileAsync,
      compile: mockCompile,
      render: mockRender,
    },
    scene: {},
    camera: {},
    advance: mockAdvance,
  }),
}));

describe("ShaderWarmup prerender", () => {
  beforeEach(() => {
    useLoadingStore.setState({ phase: "assets", progress: 0, essentialsReady: true });
    mockAdvance.mockClear();
    mockRender.mockClear();
    mockCompileAsync.mockClear();
    vi.stubGlobal("requestAnimationFrame", (cb) => {
      cb(0);
      return 0;
    });
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    vi.stubGlobal("performance", { now: () => 0 });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  });

  it("prerenders frames before marking the loading phase ready", async () => {
    const ShaderWarmup = (await import("../src/scenes/ShaderWarmup")).default;
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<ShaderWarmup sceneKey="main" />);
    });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockCompileAsync).toHaveBeenCalled();
    expect(mockAdvance).toHaveBeenCalledTimes(3);
    expect(mockRender).toHaveBeenCalledTimes(3);
    expect(useLoadingStore.getState().phase).toBe("ready");

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });
});
