import * as THREE from "three";

const GLB_WEIGHT = 0.75;
const HDR_WEIGHT = 0.1;
const WATER_WEIGHT = 0.1;
const COMPILE_WEIGHT = 0.05;

type SegmentState = {
  glb: number;
  hdr: number;
  water: number;
  compile: number;
};

let segmentState: SegmentState = { glb: 0, hdr: 0, water: 0, compile: 0 };
let emitProgress: ((progress: number) => void) | null = null;

function computeTotal(state: SegmentState): number {
  return (
    state.glb * GLB_WEIGHT +
    state.hdr * HDR_WEIGHT +
    state.water * WATER_WEIGHT +
    state.compile * COMPILE_WEIGHT
  );
}

function publish(): void {
  if (!emitProgress) return;
  emitProgress(Math.min(100, Math.round(computeTotal(segmentState) * 100)));
}

export function installBootProgressTracking(onProgress: (progress: number) => void): () => void {
  emitProgress = onProgress;
  segmentState = { glb: 0, hdr: 0, water: 0, compile: 0 };
  publish();

  const manager = THREE.DefaultLoadingManager;
  const prevOnProgress = manager.onProgress;
  const prevOnLoad = manager.onLoad;

  manager.onProgress = (url, loaded, total) => {
    prevOnProgress?.(url, loaded, total);
    if (url.includes("main_scene.glb") && total > 0) {
      segmentState.glb = loaded / total;
      publish();
    }
    if (url.includes("main.hdr") && total > 0) {
      segmentState.hdr = loaded / total;
      publish();
    }
  };

  manager.onLoad = (url) => {
    prevOnLoad?.(url);
    if (url.includes("main_scene.glb")) {
      segmentState.glb = 1;
      publish();
    }
    if (url.includes("main.hdr")) {
      segmentState.hdr = 1;
      publish();
    }
  };

  return () => {
    manager.onProgress = prevOnProgress;
    manager.onLoad = prevOnLoad;
    emitProgress = null;
  };
}

export function markGlbGeometryReady(): void {
  segmentState.glb = 1;
  publish();
}

export function reportHdrReady(): void {
  segmentState.hdr = 1;
  publish();
}

export function reportWaterReady(): void {
  segmentState.water = 1;
  publish();
}

export function reportCompileProgress(t: number): void {
  segmentState.compile = Math.max(0, Math.min(1, t));
  publish();
}

export function getBootSegmentState(): Readonly<SegmentState> {
  return segmentState;
}
