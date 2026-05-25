// @ts-nocheck
/**
 * Hidden SVG <filter> definition for a subtle chromatic aberration. Backend-
 * agnostic — works identically on WebGL and WebGPU renderers because it runs
 * in the browser compositor, not in the GL/GPU render path.
 *
 * The filter id is referenced by CSS in styles.css:
 *   - `#background.canvas-surface canvas` (always on the main R3F canvas)
 *   - `.fullscreen-overlay-cluster__canvas.canvas-surface.is-active canvas`
 *     (active only while the ink-bleed transition is visible)
 *
 * Mount this component ONCE near the canvases (in SiteLayout) so the filter
 * id is globally resolvable from CSS for the duration of the app.
 */
import React from "react";

const FILTER_ID = "duforn-chromatic-aberration";

interface ChromaticAberrationFilterProps {
  /** Horizontal R/B channel offset in pixels. Default 1.2. */
  offsetX?: number;
  /** Vertical R/B channel offset in pixels. Default 0. */
  offsetY?: number;
}

export default function ChromaticAberrationFilter({
  offsetX = 1.2,
  offsetY = 0,
}: ChromaticAberrationFilterProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="0"
      height="0"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      <defs>
        <filter
          id={FILTER_ID}
          x="-2%"
          y="-2%"
          width="104%"
          height="104%"
          colorInterpolationFilters="sRGB"
        >
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="1 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 1 0"
            result="redChannel"
          />
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="0 0 0 0 0
                    0 1 0 0 0
                    0 0 0 0 0
                    0 0 0 1 0"
            result="greenChannel"
          />
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="0 0 0 0 0
                    0 0 0 0 0
                    0 0 1 0 0
                    0 0 0 1 0"
            result="blueChannel"
          />
          <feOffset in="redChannel" dx={offsetX} dy={offsetY} result="redShifted" />
          <feOffset in="blueChannel" dx={-offsetX} dy={-offsetY} result="blueShifted" />
          <feBlend in="redShifted" in2="greenChannel" mode="screen" result="rg" />
          <feBlend in="rg" in2="blueShifted" mode="screen" />
        </filter>
      </defs>
    </svg>
  );
}
