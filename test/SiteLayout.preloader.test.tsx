// @ts-nocheck
import React, { act } from "react";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import SiteLayout from "../src/layout/Site";

const mockSetGyroEnabled = vi.fn();
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
      activePage: "main",
      rendererType: "webgpu",
      setGyroEnabled: mockSetGyroEnabled,
    }),
}));

vi.mock("../src/store/loading", () => ({
  useLoadingStore: (selector) =>
    selector({
      progress: 1,
      essentialsReady: true,
    }),
}));

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

async function renderAt(pathname) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={[pathname]}>
        <SiteLayout>
          <main id="main">Page</main>
        </SiteLayout>
      </MemoryRouter>,
    );
  });

  return { root, container };
}

afterEach(async () => {
  document.body.className = "";
  document.body.removeAttribute("style");
  document.body.innerHTML = "";
  document.documentElement.className = "";
  mockSetGyroEnabled.mockReset();
  mockSetPreloaderOverlayVisible.mockReset();
});

describe("SiteLayout intro preloader routing", () => {
  it("skips the intro preloader on deep-linked project detail routes", async () => {
    const { root, container } = await renderAt("/money-me");

    expect(document.body.classList.contains("preloader-active")).toBe(false);

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it("keeps the intro preloader on the home route", async () => {
    const { root, container } = await renderAt("/");

    expect(document.body.classList.contains("preloader-active")).toBe(true);

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });
});
