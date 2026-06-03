import * as THREE from "three";
import { FRAME_PADDING, MAX_SCALE, ROTATION_DEG, STRIP_ITEMS, STRIP_PATHS } from "./config";

export type StripDim = { w: number; h: number };

export type StripPlacement = {
  x: number;
  y: number;
  z: number;
  opacity: number;
  parallaxDir: 1 | -1;
};

export type StripLayout = {
  spacing: number;
  baseScale: number;
  centerYOffset: number;
  placements: StripPlacement[];
};

export function resolveSpaceGap(el: HTMLElement | null): number {
  if (!el) return 0;
  const probe = document.createElement("div");
  probe.style.cssText =
    "position:absolute;visibility:hidden;width:var(--spacing-space-3);height:0;";
  el.appendChild(probe);
  const px = parseFloat(getComputedStyle(probe).width) || 0;
  el.removeChild(probe);
  return px;
}

function projectedExtents(w: number, h: number, theta: number) {
  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);
  return {
    projW: w * cosT + h * sinT,
    projH: w * sinT + h * cosT,
  };
}

/**
 * Fit the rotated strip fan inside the anchor without the legacy 1.43× overflow fudge.
 */
export function computeStripLayout({
  frameWidth,
  frameHeight,
  stripDims,
  gap,
}: {
  frameWidth: number;
  frameHeight: number;
  stripDims: StripDim[];
  gap: number;
}): StripLayout {
  const count = STRIP_PATHS.length;
  const emptyPlacements: StripPlacement[] = STRIP_ITEMS.map((item) => ({
    x: 0,
    y: 0,
    z: item.z,
    opacity: item.opacity,
    parallaxDir: item.parallaxDir,
  }));

  if (!frameWidth || !frameHeight || stripDims.length === 0) {
    return { spacing: 0, baseScale: 1, centerYOffset: 0, placements: emptyPlacements };
  }

  const theta = THREE.MathUtils.degToRad(ROTATION_DEG);
  const cosT = Math.cos(theta);

  const refW = stripDims[0]?.w ?? 540;
  const maxProjH = stripDims.reduce((max, d) => {
    const { projH } = projectedExtents(d.w, d.h, theta);
    return Math.max(max, projH);
  }, 0);

  const padW = frameWidth * FRAME_PADDING;
  const padH = frameHeight * FRAME_PADDING;

  const fitStripW = (padW * cosT - (count - 1) * gap) / count;
  let baseScale = fitStripW / refW;
  const scaleFromHeight = padH / maxProjH;
  baseScale = Math.min(baseScale, scaleFromHeight, MAX_SCALE);

  const scaledStripW = refW * baseScale;
  const spacing = (scaledStripW + gap) / cosT;

  const placements = STRIP_ITEMS.map((item, i) => ({
    x: (i - (count - 1) / 2) * spacing,
    y: 0,
    z: item.z,
    opacity: item.opacity,
    parallaxDir: item.parallaxDir,
  }));

  return {
    spacing,
    baseScale,
    centerYOffset: 0,
    placements,
  };
}

export function getStripDimsFromTextures(textures: THREE.Texture[]): StripDim[] {
  return textures.map((t) => {
    const img = t.image as HTMLImageElement | undefined;
    const w = img?.naturalWidth ?? img?.width ?? 540;
    const h = img?.naturalHeight ?? img?.height ?? 3596;
    return { w, h };
  });
}
