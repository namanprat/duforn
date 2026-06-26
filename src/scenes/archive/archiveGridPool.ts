import { ARCHIVE_CONFIG, ARCHIVE_GRID_CELL_SIZE } from "./archiveConfig";
import {
  listCellsInBounds,
  visibleCellBounds,
  type CellId,
} from "./archiveLayout";

/** Assign each mesh slot to a visible grid cell (recycled when panning). */
export function assignGridSlots(
  slots: CellId[],
  panX: number,
  panY: number,
  viewportW: number,
  viewportH: number,
  cameraZ: number,
  fovDeg: number,
): void {
  const aspect = viewportW / Math.max(viewportH, 1);
  const bounds = visibleCellBounds(
    panX,
    panY,
    cameraZ,
    fovDeg,
    aspect,
    ARCHIVE_GRID_CELL_SIZE,
  );
  const cells = listCellsInBounds(bounds);
  if (!cells.length) return;

  while (slots.length < ARCHIVE_CONFIG.tileCount) {
    slots.push({ cx: 0, cy: 0 });
  }

  for (let i = 0; i < ARCHIVE_CONFIG.tileCount; i++) {
    slots[i] = cells[i % cells.length]!;
  }
}
