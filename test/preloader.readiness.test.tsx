import React, { act } from "react";
import { afterEach, describe, expect, it } from "vite-plus/test";
import { createRoot } from "react-dom/client";
import PreloaderOverlayLayer from "../src/layout/Preloader";
import { useLoadingStore } from "../src/store/loading";

describe("waitForLoadingPhaseReady", () => {
  afterEach(() => {
    useLoadingStore.setState({ phase: "assets", progress: 0, essentialsReady: true });
  });

  it("resolves immediately when phase is already ready", async () => {
    useLoadingStore.setState({ phase: "ready" });
    const { waitForLoadingPhaseReady } = await import("../src/store/loading");
    await expect(waitForLoadingPhaseReady()).resolves.toBeUndefined();
  });

  it("resolves when phase transitions to ready", async () => {
    useLoadingStore.setState({ phase: "compiling" });
    const { waitForLoadingPhaseReady } = await import("../src/store/loading");

    const pending = waitForLoadingPhaseReady();
    act(() => {
      useLoadingStore.setState({ phase: "ready" });
    });
    await expect(pending).resolves.toBeUndefined();
  });
});

describe("PreloaderOverlayLayer readiness labels", () => {
  const refs = {
    preloaderRef: { current: null },
    strokeTrackRef: { current: null },
    strokeProgressRef: { current: null },
    introHitRef: { current: null },
  };

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("shows compiling label while assets are ready but shaders are not", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <PreloaderOverlayLayer
          visible
          fading={false}
          {...refs}
          essentialsReady
          loadingPhase="compiling"
          introRingComplete={false}
          permissionsPending={false}
          onEnter={() => {}}
        />,
      );
    });

    const button = container.querySelector("button");
    expect(button?.getAttribute("aria-label")).toBe("Compiling shaders");
    expect(button?.disabled).toBe(true);
    expect(container.textContent).toContain("Compiling");

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it("enables enter when ring complete and phase is ready", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <PreloaderOverlayLayer
          visible
          fading={false}
          {...refs}
          essentialsReady
          loadingPhase="ready"
          introRingComplete
          permissionsPending={false}
          onEnter={() => {}}
        />,
      );
    });

    const button = container.querySelector("button");
    expect(button?.getAttribute("aria-label")).toBe("Enter site");
    expect(button?.disabled).toBe(false);

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });
});