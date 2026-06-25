import { ARCHIVE_CONFIG } from "./archiveConfig";

export type Vec3 = { x: number; y: number; z: number };

export type CellId = { cx: number; cy: number };

export type CellBounds = {
  minCx: number;
  maxCx: number;
  minCy: number;
  maxCy: number;
};

/** Even-ish spread of `count` points on a sphere of `radius` (Fibonacci spiral). */
export function fibonacciSpherePoints(count: number, radius: number): Vec3[] {
  const pts: Vec3[] = [];
  for (let i = 0; i < count; i++) {
    const phi = Math.acos(-1 + (2 * i) / count);
    const theta = Math.sqrt(count * Math.PI) * phi;
    pts.push({
      x: radius * Math.cos(theta) * Math.sin(phi),
      y: radius * Math.sin(theta) * Math.sin(phi),
      z: radius * Math.cos(phi),
    });
  }
  return pts;
}

/** Stereographic unwrap from north pole — peels sphere onto z=0. */
export function stereographicUnwrap(
  globePos: Vec3,
  radius: number,
  scale = ARCHIVE_CONFIG.unwrapScale,
): Vec3 {
  const denom = radius - globePos.z;
  const k = Math.abs(denom) < 1e-4 ? scale : (scale * radius) / denom;
  return { x: globePos.x * k, y: globePos.y * k, z: 0 };
}

export function cellIdFromWorld(x: number, y: number, cellSize: number): CellId {
  return {
    cx: Math.floor(x / cellSize),
    cy: Math.floor(y / cellSize),
  };
}

export function worldFromCell(cx: number, cy: number, cellSize: number, panX = 0, panY = 0): Vec3 {
  return {
    x: cx * cellSize + panX,
    y: cy * cellSize + panY,
    z: 0,
  };
}

/** Phantom-style hash for which texture fills a cell. */
export function textureIndexForCell(cx: number, cy: number, count: number): number {
  if (count <= 0) return 0;
  const raw = cx + cy * 3;
  return ((raw % count) + count) % count;
}

export function visibleCellBounds(
  panX: number,
  panY: number,
  cameraZ: number,
  fovDeg: number,
  aspect: number,
  cellSize: number,
  padding = 2,
): CellBounds {
  const vFov = (fovDeg * Math.PI) / 180;
  const halfH = cameraZ * Math.tan(vFov / 2);
  const halfW = halfH * aspect;

  const minX = panX - halfW;
  const maxX = panX + halfW;
  const minY = panY - halfH;
  const maxY = panY + halfH;

  return {
    minCx: Math.floor(minX / cellSize) - padding,
    maxCx: Math.ceil(maxX / cellSize) + padding,
    minCy: Math.floor(minY / cellSize) - padding,
    maxCy: Math.ceil(maxY / cellSize) + padding,
  };
}

export function listCellsInBounds(bounds: CellBounds): CellId[] {
  const cells: CellId[] = [];
  for (let cy = bounds.minCy; cy <= bounds.maxCy; cy++) {
    for (let cx = bounds.minCx; cx <= bounds.maxCx; cx++) {
      cells.push({ cx, cy });
    }
  }
  return cells;
}

// ponytail: self-check — fails in devtools if layout math regresses.
(() => {
  const p = stereographicUnwrap({ x: 5, y: 0, z: 0 }, 5);
  console.assert(p.z === 0 && p.x > 0, "stereographicUnwrap");
  console.assert(textureIndexForCell(4, 2, 10) === 0, "textureIndexForCell");
})();
