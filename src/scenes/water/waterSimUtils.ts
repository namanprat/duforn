// Quality is a single device-independent config now (no tiers). The fixed sim /
// caustics resolutions live in poolWaterDefaults (SIM_RES, CAUSTICS_SIZE).

export function uvToSimGrid(
  uv: { x: number; y: number },
  nw: number,
  nh: number = nw,
): { gx: number; gy: number } {
  return {
    gx: Math.min(Math.max(uv.x, 0), 1) * Math.max(nw - 1, 0),
    gy: Math.min(Math.max(uv.y, 0), 1) * Math.max(nh - 1, 0),
  };
}
