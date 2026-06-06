// @ts-nocheck
import React, { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { PRELOADER_DISMISSED_EVENT } from "../src/lib/preload/events";

const mockWaitForLoadingPhaseReady = vi.fn(() => Promise.resolve());
const mockSetPreloaderOverlayVisible = vi.fn();

vi.mock("../src/scenes/Canvas", () => ({ default: () => null }));
vi.mock("../src/scenes/OverlayCanvas", () => ({ default: () => null }));
vi.mock("../src/layout/Menu", () => ({ default: () => null }));
vi.mock("../src/layout/Portal", () => ({
  default: ({ children }) => children,
}));
vi.mock("../src/layout/Preloader", () => ({ default: () => null }));
vi.mock("../src/ui/HoverLabel", () => ({
  default: ({ text }) => <>{text}</>,
}));

vi.mock("../src/store/webgl", () => ({
  useWebglStore: (selector) =>
    selector({
      activePage: "test",
      rendererType: "webgpu",
      setGyroEnabled: vi.fn(),
    }),
}));

vi.mock("../src/store/loading", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useLoadingStore: (selector) =>
      selector({
        progress: 1,
        essentialsReady: true,
        phase: "compiling",
      }),
    waitForLoadingPhaseReady: (...args) => mockWaitForLoadingPhaseReady(...args),
  };
});

vi.mock("../src/store/overlay", () => ({
  usePreloaderOverlayStore: (selector) =>
    selector({
      visible: true,
      setVisible: mockSetPreloaderOverlayVisible,
    }),
}));

vi.mock("../src/lib/ink/transition", () => ({
  canvasInk: {
    isReady: vi.fn(() => false),
    cover: vi.fn(() => Promise.resolve()),
    enter: vi.fn(() => Promise.resolve()),
  },
}));

vi.mock("../src/lib/ink/origin", () => ({
  resolveCanvasInkOrigin: vi.fn(() => ({ x: 0.5, y: 0.5 })),
}));

vi.mock("../src/lib/text", () => ({
  hideAllRegisteredMenuText: vi.fn(() => Promise.resolve()),
  hideAllRegisteredPageText: vi.fn(() => Promise.resolve()),
  showAllRegisteredMenuText: vi.fn(() => Promise.resolve()),
  showAllRegisteredPageText: vi.fn(() => Promise.resolve()),
}));

vi.mock("../scripts/runtime/motion", () => ({
  requestDeviceOrientationPermission: vi.fn(() => Promise.resolve(false)),
}));

vi.mock("../scripts/haptic-feedback", () => ({
  triggerNavHaptic: vi.fn(),
}));

vi.mock("../scripts/link-hover", () => ({
  shouldUseNavRotateHover: vi.fn(() => false),
}));

describe("SiteLayout test route auto-dismiss", () => {
  beforeEach(() => {
    mockWaitForLoadingPhaseReady.mockClear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.className = "";
    document.body.innerHTML = "";
  });

  it("waits for shader readiness before auto-dismissing on /test", async () => {
    const SiteLayout = (await import("../src/layout/Site")).default;
    const dismissed = vi.fn();
    window.addEventListener(PRELOADER_DISMISSED_EVENT, dismissed);

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={["/test"]}>
          <SiteLayout>
            <main id="main">Test</main>
          </SiteLayout>
        </MemoryRouter>,
      );
    });

    expect(mockWaitForLoadingPhaseReady).toHaveBeenCalled();
    expect(dismissed).not.toHaveBeenCalled();

    await act(async () => {
      await Promise.resolve();
      vi.advanceTimersByTime(100);
    });

    expect(dismissed).toHaveBeenCalled();

    window.removeEventListener(PRELOADER_DISMISSED_EVENT, dismissed);
    await act(async () => {
      root.unmount();
    });
    container.remove();
  });
});
