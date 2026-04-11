import { describe, expect, test } from "vite-plus/test";
import { getPerformanceProfile } from "../scripts/perf";

describe("getPerformanceProfile", () => {
  test("returns a stable shape in happy-dom", () => {
    const p = getPerformanceProfile();
    expect(p).toMatchObject({
      tier: expect.any(String),
      prefersReducedMotion: expect.any(Boolean),
      saveData: expect.any(Boolean),
      coarsePointer: expect.any(Boolean),
      cores: expect.any(Number),
    });
  });
});
