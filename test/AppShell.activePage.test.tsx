// @ts-nocheck
import React, { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { createRoot } from "react-dom/client";
import {
  createMemoryRouter,
  Route,
  RouterProvider,
  createRoutesFromElements,
} from "react-router-dom";
import { AppShell } from "../src/App";
import { useWebglStore } from "../src/store/webgl";

vi.mock("../src/layout/Site", () => ({
  default: ({ children }) => children,
}));

vi.mock("../src/routes/Main", () => ({ default: () => null }));
vi.mock("../src/routes/Work", () => ({ default: () => null }));
vi.mock("../src/routes/Contact", () => ({ default: () => null }));
vi.mock("../src/routes/About", () => ({ default: () => null }));
vi.mock("../src/routes/Project", () => ({ default: () => null }));
vi.mock("../src/routes/NotFound", () => ({ default: () => null }));

vi.mock("../scripts/link-hover", () => ({
  initLinkHover: vi.fn(),
  destroyLinkHover: vi.fn(),
}));

vi.mock("../scripts/button-hover-scale", () => ({
  initButtonHoverScale: vi.fn(),
  destroyButtonHoverScale: vi.fn(),
}));

vi.mock("../scripts/lenis-scroll", () => ({
  initLenis: vi.fn(),
  destroyLenis: vi.fn(),
}));

vi.mock("../src/lib/nav", () => ({
  setNavigateHandler: vi.fn(),
}));

vi.mock("../src/lib/anim/route", () => ({
  shouldAnimateCanvasBetweenNamespaces: vi.fn(() => false),
  runRouteEnterTransition: vi.fn(() => () => {}),
  runRouteLeaveTransition: vi.fn(() => Promise.resolve()),
}));

vi.mock("../src/lib/anim/brandHandoff", () => ({
  cleanupBrandHandoff: vi.fn(),
  runBrandHandoff: vi.fn(() => Promise.resolve()),
}));

vi.mock("../src/lib/ink/transition", () => ({
  canvasInk: {
    isReady: vi.fn(() => false),
  },
}));

vi.mock("../src/lib/ink/route", () => ({
  CANVAS_INK_ROUTE_TIMING: { expandMs: 0, holdMs: 0, collapseMs: 0 },
  shouldUseRouteInkBleed: vi.fn(() => false),
}));

vi.mock("../src/lib/text", () => ({
  hideAllRegisteredPageText: vi.fn(() => Promise.resolve()),
}));

vi.mock("gsap/ScrollTrigger", () => ({
  ScrollTrigger: {
    refresh: vi.fn(),
  },
}));

async function renderAppShellAt(pathname) {
  const routes = createRoutesFromElements(
    <Route path="/" element={<AppShell />}>
      <Route index element={<div>Main</div>} />
      <Route path="work" element={<div>Work</div>} />
      <Route path="contact" element={<div>Contact</div>} />
      <Route path="about" element={<div>About</div>} />
    </Route>,
  );

  const router = createMemoryRouter(routes, {
    initialEntries: [pathname],
  });

  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  await act(async () => {
    root.render(<RouterProvider router={router} />);
  });

  return { router, root, container };
}

beforeEach(() => {
  document.fonts = { ready: Promise.resolve() };
  useWebglStore.setState({ activePage: "main" });
});

afterEach(() => {
  useWebglStore.setState({ activePage: "main" });
});

describe("AppShell activePage sync", () => {
  it("syncs contact route state before navigating to work", async () => {
    const { router, root, container } = await renderAppShellAt("/contact");

    expect(useWebglStore.getState().activePage).toBe("contact");

    await act(async () => {
      await router.navigate("/work");
    });

    expect(useWebglStore.getState().activePage).toBe("work");

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it("syncs work route state before navigating to contact", async () => {
    const { router, root, container } = await renderAppShellAt("/work");

    expect(useWebglStore.getState().activePage).toBe("work");

    await act(async () => {
      await router.navigate("/contact");
    });

    expect(useWebglStore.getState().activePage).toBe("contact");

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });
});
