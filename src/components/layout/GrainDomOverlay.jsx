import React, { useEffect, useMemo, useRef } from "react";
import { getPerformanceProfile } from "../../../scripts/perf.js";
import { useGlobalCanvasFxControlsStore } from "../../store/globalCanvasFxControls";

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function hexToRgb(hex) {
  const cleaned = String(hex || "")
    .replace("#", "")
    .trim();
  if (cleaned.length !== 6) return { r: 255, g: 255, b: 255 };
  const r = Number.parseInt(cleaned.slice(0, 2), 16);
  const g = Number.parseInt(cleaned.slice(2, 4), 16);
  const b = Number.parseInt(cleaned.slice(4, 6), 16);
  if ([r, g, b].some((v) => Number.isNaN(v))) return { r: 255, g: 255, b: 255 };
  return { r, g, b };
}

function makeXorshift32(seed) {
  let x = seed | 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return x | 0;
  };
}

export default function GrainDomOverlay() {
  const grain = useGlobalCanvasFxControlsStore((s) => s.controls.grain);
  const profile = useMemo(() => getPerformanceProfile(), []);
  const canvasRef = useRef(null);

  const enabled = grain.enabled && !profile.prefersReducedMotion && profile.tier !== "low";
  const tintRgb = useMemo(() => hexToRgb(grain.tint), [grain.tint]);

  useEffect(() => {
    if (!enabled) return undefined;
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return undefined;

    ctx.imageSmoothingEnabled = false;

    // Low internal resolution stretched to full viewport.
    // `grain.scale` increases density (higher internal resolution).
    const computeResolution = () => {
      const density = Math.max(0.6, Math.min(10, grain.scale || 1));
      const base = 260; // baseline internal res at scale=1
      const w = Math.max(
        160,
        Math.min(720, Math.round((window.innerWidth / (window.innerHeight || 1)) * base * density)),
      );
      const h = Math.max(160, Math.min(720, Math.round(base * density)));
      return { w, h };
    };

    let { w, h } = computeResolution();
    canvas.width = w;
    canvas.height = h;
    let image = ctx.createImageData(w, h);
    let data = image.data;

    let rnd = makeXorshift32(((performance.now() * 1000) | 0) ^ (w << 16) ^ h);

    const handleResize = () => {
      const next = computeResolution();
      if (next.w === w && next.h === h) return;
      w = next.w;
      h = next.h;
      canvas.width = w;
      canvas.height = h;
      image = ctx.createImageData(w, h);
      data = image.data;
      rnd = makeXorshift32(((performance.now() * 1000) | 0) ^ (w << 16) ^ h);
    };

    window.addEventListener("resize", handleResize, { passive: true });

    const targetFps = Math.max(6, Math.min(60, Math.round(grain.fps || 24)));
    const interval = 1000 / targetFps;
    const contrast = Math.max(0.5, Math.min(2.5, grain.contrast || 1));

    let raf = 0;
    let last = 0;
    const tick = () => {
      const now = performance.now();
      if (now - last >= interval) {
        last = now;
        // Re-randomize grain each update.
        for (let i = 0; i < data.length; i += 4) {
          // 0..1
          const n = ((rnd() >>> 0) / 0xffffffff) * 2 - 1; // -1..1
          const shaped = Math.tanh(n * 1.35) * 0.5 + 0.5; // 0..1, softer tails
          const c = clamp01((shaped - 0.5) * contrast + 0.5);
          const v = (c * 255) | 0;

          if (grain.monochrome) {
            data[i] = v;
            data[i + 1] = v;
            data[i + 2] = v;
          } else {
            // tint the noise
            data[i] = (v * (tintRgb.r / 255)) | 0;
            data[i + 1] = (v * (tintRgb.g / 255)) | 0;
            data[i + 2] = (v * (tintRgb.b / 255)) | 0;
          }
          data[i + 3] = 255;
        }
        ctx.putImageData(image, 0, 0);
      }

      // Tiny drift so it doesn't feel "locked" to pixels.
      const t = now * 0.001 * (grain.speed || 0);
      const shift = 18;
      canvas.style.transform = `translate3d(${(t * 40) % shift}px, ${(t * 26) % shift}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", handleResize);
    };
  }, [
    enabled,
    grain.contrast,
    grain.fps,
    grain.monochrome,
    grain.scale,
    grain.speed,
    tintRgb.b,
    tintRgb.g,
    tintRgb.r,
  ]);

  if (!enabled) return null;

  return (
    <canvas
      className="grain-overlay"
      ref={canvasRef}
      style={{
        opacity: clamp01(grain.opacity ?? 0.55),
        mixBlendMode: grain.blendMode || "overlay",
        filter: `contrast(${Math.max(0.5, Math.min(2.5, grain.contrast || 1))})`,
      }}
      aria-hidden="true"
    />
  );
}
