import { describe, expect, it } from "vite-plus/test";
import {
  ShallowWaterState,
  createShallowWaterParams,
} from "../src/components/webgl/water/compute/shallowWaterCPU";

describe("ShallowWaterState (CPU, wave-equation)", () => {
  it("propagates a drop outward and decays the central peak", () => {
    const params = createShallowWaterParams(32, 32, {
      modifier: 0.99,
      impulseRadius: 3,
      impulseStrength: 1.5,
    });
    const sim = new ShallowWaterState(params);

    sim.applyImpulse(16, 16);
    const peakAfterDrop = sim.h[16 + 32 * 16];
    expect(peakAfterDrop).toBeGreaterThan(0.5);

    for (let i = 0; i < 60; i++) sim.substep();

    const peakAfterSpread = sim.h[16 + 32 * 16];
    expect(Math.abs(peakAfterSpread)).toBeLessThan(peakAfterDrop);

    // Energy must stay bounded — MODIFIER < 1 dissipates rather than blow up.
    expect(sim.maxAbsH()).toBeLessThan(peakAfterDrop * 1.2);
  });

  it("stays bounded over many steps with no impulse", () => {
    const params = createShallowWaterParams(24, 24, {
      modifier: 0.99,
      impulseRadius: 2,
      impulseStrength: 1.0,
    });
    const sim = new ShallowWaterState(params);

    sim.applyImpulse(12, 12);
    for (let i = 0; i < 240; i++) sim.substep();

    expect(Number.isFinite(sim.maxAbsH())).toBe(true);
    expect(sim.maxAbsH()).toBeLessThan(5);
  });
});
