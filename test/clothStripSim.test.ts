import { describe, expect, it } from "vite-plus/test";
import { createClothStripSim, type ClothStripSimParams } from "../src/work/sim/clothStripSim";

const COLS = 8;
const ROWS = 6;

/** Flat grid rest positions in the XY plane (row 0 = pinned edge at y=0). */
function makeRest(cols: number, rows: number): Float32Array {
  const rest = new Float32Array(cols * rows * 3);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const o = (r * cols + c) * 3;
      rest[o] = c * 0.1;
      rest[o + 1] = r * 0.1;
      rest[o + 2] = 0;
    }
  }
  return rest;
}

function makeSim() {
  const rest = makeRest(COLS, ROWS);
  const live = Float32Array.from(rest);
  const sim = createClothStripSim(COLS, ROWS, rest, live);
  return { sim, rest };
}

const STILL: ClothStripSimParams = {
  gravity: 0,
  windStrength: 0,
  windDir: [0, 0, 1],
  gustFrequency: 1,
  windSpeed: 1.5,
  damping: 0.95,
  stiffness: 0.9,
  anchorStiffness: 0.3,
  iterations: 6,
  time: 0,
};

const WINDY: ClothStripSimParams = {
  ...STILL,
  gravity: 4,
  windStrength: 6,
};

function maxDeviation(a: Float32Array, b: Float32Array): number {
  let max = 0;
  for (let i = 0; i < a.length; i++) max = Math.max(max, Math.abs(a[i] - b[i]));
  return max;
}

describe("createClothStripSim", () => {
  it("shares the live position buffer and seeds it with rest positions", () => {
    const rest = makeRest(COLS, ROWS);
    const live = new Float32Array(rest.length);
    const sim = createClothStripSim(COLS, ROWS, rest, live);
    expect(sim.positions).toBe(live);
    expect(Array.from(live)).toEqual(Array.from(rest));
  });

  it("stays at rest when there are no external forces", () => {
    const { sim, rest } = makeSim();
    for (let i = 0; i < 120; i++) sim.step(1 / 60, STILL);
    expect(maxDeviation(sim.positions, rest)).toBeLessThan(1e-3);
  });

  it("keeps the pinned edge (row 0) fixed under gravity and wind", () => {
    const { sim, rest } = makeSim();
    for (let i = 0; i < 200; i++) sim.step(1 / 60, { ...WINDY, time: i / 60 });
    for (let c = 0; c < COLS; c++) {
      const o = c * 3;
      expect(sim.positions[o]).toBeCloseTo(rest[o], 6);
      expect(sim.positions[o + 1]).toBeCloseTo(rest[o + 1], 6);
      expect(sim.positions[o + 2]).toBeCloseTo(rest[o + 2], 6);
    }
  });

  it("produces bounded, finite, non-trivial motion under wind", () => {
    const { sim, rest } = makeSim();
    for (let i = 0; i < 200; i++) sim.step(1 / 60, { ...WINDY, time: i / 60 });
    for (let i = 0; i < sim.positions.length; i++) {
      expect(Number.isFinite(sim.positions[i])).toBe(true);
    }
    const dev = maxDeviation(sim.positions, rest);
    expect(dev).toBeGreaterThan(1e-3); // something actually moved
    expect(dev).toBeLessThan(5); // but stayed anchored near the rest shape
  });

  it("survives absurd timesteps without producing NaN (dt is clamped)", () => {
    const { sim } = makeSim();
    for (let i = 0; i < 50; i++) sim.step(10, { ...WINDY, time: i });
    expect(Number.isFinite(sim.positions[0])).toBe(true);
    expect(Number.isFinite(sim.positions[sim.positions.length - 1])).toBe(true);
  });

  it("reset() snaps every particle back to rest", () => {
    const { sim, rest } = makeSim();
    for (let i = 0; i < 50; i++) sim.step(1 / 60, { ...WINDY, time: i / 60 });
    sim.reset();
    expect(maxDeviation(sim.positions, rest)).toBe(0);
  });
});
