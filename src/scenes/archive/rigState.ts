import { ARCHIVE_CONFIG } from "./archiveConfig";
import type { CellId } from "./archiveLayout";

export const rigState = {
  zoom: ARCHIVE_CONFIG.globeZoom,
  yaw: 0,
  pitch: 0,
  yawTarget: 0,
  pitchTarget: 0,
  isDragging: false,

  morph: 0,
  morphTarget: 0,
  isMorphing: false,

  gridPan: { x: 0, y: 0 },
  gridPanTarget: { x: 0, y: 0 },

  /** Virtual cell per mesh slot — filled each frame in grid mode. */
  gridSlots: [] as CellId[],
};

export function resetRigToOrb() {
  rigState.zoom = ARCHIVE_CONFIG.globeZoom;
  rigState.gridPan.x = 0;
  rigState.gridPan.y = 0;
  rigState.gridPanTarget.x = 0;
  rigState.gridPanTarget.y = 0;
}

export function resetRigToGlobe() {
  resetRigToOrb();
}
