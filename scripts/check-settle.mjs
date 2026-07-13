// Self-check for the waitUntilSettled branch logic in src/store/routeTransition.ts.
// No test runner in this repo; run directly: `node scripts/check-settle.mjs`.
// Mirrors the resolve condition: (frames >= 2 && delta <= smoothMs) || frames >= maxFrames.
import assert from "node:assert/strict";

// Drive a synthetic rAF where we control the per-frame delta, and count frames
// until the same condition waitUntilSettled uses would resolve.
function framesToResolve(deltas, maxFrames = 12, smoothMs = 24) {
  let frames = 0;
  for (const delta of deltas) {
    frames += 1;
    if ((frames >= 2 && delta <= smoothMs) || frames >= maxFrames) return frames;
  }
  return frames; // ran out of deltas without resolving
}

// 1. Every frame heavy (delta > smoothMs) => must resolve by the cap, never hang.
const allHeavy = Array.from({ length: 50 }, () => 100);
assert.equal(framesToResolve(allHeavy), 12, "cap branch must resolve at maxFrames");

// 2. First smooth frame arrives at frame 3 => resolves there (needs frames >= 2).
assert.equal(framesToResolve([100, 100, 10, 10]), 3, "smooth frame after warmup resolves");

// 3. A smooth frame 1 alone must NOT resolve (guard against opening pierce on frame 1).
assert.equal(framesToResolve([10, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]), 12,
  "single early smooth frame must not short-circuit");

console.log("waitUntilSettled branch logic OK");
