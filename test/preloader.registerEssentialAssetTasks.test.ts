import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import {
  __resetPreloaderGate,
  getSnapshot,
  subscribe,
} from "../src/lib/preloader/preloaderGate";
import { registerEssentialAssetTasks } from "../src/models/generated/registerPreloads";

const EXPECTED_IDS = [
  "gltf:scene",
  "gltf:project-bg",
  "gltf:monitor",
  "gltf:main",
  "hdr:home",
  "texture:default",
];

describe("registerEssentialAssetTasks", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    __resetPreloaderGate();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("registers a gate task for every essential 3D asset and resolves them", async () => {
    const requestedUrls: string[] = [];
    globalThis.fetch = vi.fn((url: string) => {
      requestedUrls.push(url);
      return Promise.resolve({
        ok: true,
        status: 200,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
      } as unknown as Response);
    }) as unknown as typeof fetch;

    const snapshots: ReturnType<typeof getSnapshot>[] = [];
    const unsubscribe = subscribe((snapshot) => {
      snapshots.push(snapshot);
    });

    registerEssentialAssetTasks();

    const afterRegistration = getSnapshot();
    expect(afterRegistration.totalCount).toBeGreaterThanOrEqual(EXPECTED_IDS.length);
    expect(afterRegistration.essentialsReady).toBe(false);
    expect(afterRegistration.pendingCount).toBeGreaterThanOrEqual(EXPECTED_IDS.length);

    await new Promise((resolve) => setTimeout(resolve, 0));
    await new Promise((resolve) => setTimeout(resolve, 0));

    const finalSnapshot = getSnapshot();
    expect(finalSnapshot.essentialsReady).toBe(true);
    expect(finalSnapshot.pendingCount).toBe(0);
    expect(finalSnapshot.errors).toEqual([]);

    for (const id of EXPECTED_IDS) {
      expect(
        snapshots.some((snap) => snap.totalCount >= EXPECTED_IDS.length),
        `gate should have seen task ${id}`,
      ).toBe(true);
    }

    expect(requestedUrls).toEqual(
      expect.arrayContaining([
        "/home.hdr",
        "/default.jpg",
      ]),
    );

    unsubscribe();
  });

  it("does not leave failed asset fetches as pending tasks", async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      } as unknown as Response),
    ) as unknown as typeof fetch;

    registerEssentialAssetTasks();

    await new Promise((resolve) => setTimeout(resolve, 0));
    await new Promise((resolve) => setTimeout(resolve, 0));

    const snapshot = getSnapshot();
    expect(snapshot.essentialsReady).toBe(true);
    expect(snapshot.errors.length).toBeGreaterThan(0);
  });
});
