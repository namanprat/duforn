// @ts-nocheck
import { createRafDriver } from "@theatre/core";

let driver = null;

/**
 * Shared RAF driver for Theatre — ticked from WaterRipples' setAnimationLoop so
 * camera timeline updates stay in sync with R3F advance/render (avoids jitter).
 */
export function getTheatreRafDriver() {
  if (!driver) {
    driver = createRafDriver({ name: "DufornWebGPURenderLoop" });
  }
  return driver;
}

export function tickTheatreRafDriver(timestampMs) {
  getTheatreRafDriver().tick(typeof timestampMs === "number" ? timestampMs : performance.now());
}
