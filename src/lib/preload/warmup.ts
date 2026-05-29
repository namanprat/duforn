// @ts-nocheck
import { projectDetailContent } from "../../projectDetail/content";
import { PRELOADER_DISMISSED_EVENT } from "./events";

/**
 * Phase 2 — Background warmup after preloader dismissal.
 *
 * Listens for `duforn:preloader-dismissed`, then runs a series of low-priority
 * tasks during idle slots:
 *   - Browser-cache every project-detail image (hero, cover, gallery, fact images).
 *   - Pre-fetch the heavy `three/webgpu` + `three/tsl` Vite chunks so the first
 *     route that needs them doesn't pay the parse cost.
 *
 * This file deliberately avoids importing R3F / Three to keep the bundle that
 * ships before dismissal small.
 */

let installed = false;
let kicked = false;

function isReducedMotion() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isCoarsePointer() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

function idle(callback: () => void) {
  if (typeof window === "undefined") return;
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(callback, { timeout: 4000 });
  } else {
    setTimeout(callback, 800);
  }
}

function collectProjectDetailImageUrls() {
  const urls = new Set<string>();
  const visit = (node: unknown) => {
    if (!node) return;
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (typeof node === "object") {
      for (const value of Object.values(node as Record<string, unknown>)) visit(value);
      return;
    }
    if (typeof node === "string" && /^\/[^\s"']+\.(?:webp|png|jpe?g|avif|gif)$/i.test(node)) {
      urls.add(node);
    }
  };
  visit(projectDetailContent);
  return [...urls];
}

function preloadImage(url: string) {
  return new Promise<void>((resolve) => {
    try {
      const img = new Image();
      img.decoding = "async";
      img.loading = "eager";
      img.onload = () => resolve();
      img.onerror = () => resolve();
      img.src = url;
    } catch {
      resolve();
    }
  });
}

async function warmupImages({
  concurrency = 4,
  maxCount,
}: {
  concurrency?: number;
  maxCount?: number;
} = {}) {
  const urls = collectProjectDetailImageUrls().slice(0, maxCount ?? Number.POSITIVE_INFINITY);
  // Chunk the loads so we don't slam the connection at once on slow links.
  const idleBatchSize = 8;
  let cursor = 0;
  let loaded = 0;
  const workers = Array.from({ length: Math.min(concurrency, urls.length) }, async () => {
    while (cursor < urls.length) {
      const url = urls[cursor++];
      // eslint-disable-next-line no-await-in-loop
      await preloadImage(url);
      loaded += 1;
      if (loaded % idleBatchSize === 0) {
        // Yield periodically so image warmup doesn't monopolize a frame on lower-end devices.
        // eslint-disable-next-line no-await-in-loop
        await new Promise<void>((resolve) => idle(() => resolve()));
      }
    }
  });
  await Promise.all(workers);
}

async function warmupChunks() {
  // These imports get tree-shaken into their own chunks by Vite; pre-fetching them
  // before the user navigates to a heavy TSL route avoids a chunk-fetch stall.
  try {
    await import("three/webgpu");
  } catch {
    /* noop: optional */
  }
  try {
    await import("three/tsl");
  } catch {
    /* noop: optional */
  }
}

async function runWarmupSequence() {
  if (kicked) return;
  kicked = true;

  // Yield to the browser so the entrance animation has clean frames.
  await new Promise<void>((resolve) => idle(() => resolve()));

  // Skip heavy work for low-end mobile and reduced-motion users.
  const lightOnly = isReducedMotion() || isCoarsePointer();

  await warmupImages(lightOnly ? { concurrency: 2, maxCount: 8 } : { concurrency: 4 });

  if (!lightOnly) {
    await new Promise<void>((resolve) => idle(() => resolve()));
    await warmupChunks();
  }
}

export function installBackgroundWarmup() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  const onDismissed = () => {
    void runWarmupSequence();
  };
  window.addEventListener(PRELOADER_DISMISSED_EVENT, onDismissed, { once: true });
}
