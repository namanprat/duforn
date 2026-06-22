import { button, folder, useControls } from "leva";
import { POOL_PLANE_DEFAULTS, POOL_WATER_DEFAULTS } from "./water/config/poolWaterDefaults";

/** Dev-only Leva — exposure + generated-plane alignment (read each frame in WaterRipples). */
export default function WaterGui() {
  const w = POOL_WATER_DEFAULTS;
  const p = POOL_PLANE_DEFAULTS;

  useControls("Water", {
    exposure: {
      value: w.exposure,
      min: 0.25,
      max: 2.5,
      step: 0.01,
      onChange: (v: number) => {
        w.exposure = v;
      },
    },
    hdrBlend: {
      label: "HDR blend",
      value: w.hdrBlend,
      min: 0,
      max: 1,
      step: 0.01,
      onChange: (v: number) => {
        w.hdrBlend = v;
      },
    },
    planarSkyFill: {
      label: "sky fill",
      value: w.planarSkyFill,
      min: 0,
      max: 1,
      step: 0.01,
      onChange: (v: number) => {
        w.planarSkyFill = v;
      },
    },
    Alignment: folder(
      {
        planeInset: {
          label: "inset",
          value: p.inset,
          min: 0.85,
          max: 1.05,
          step: 0.005,
          onChange: (v: number) => {
            p.inset = v;
          },
        },
        planeRimDrop: {
          label: "rim drop",
          value: p.rimDrop,
          min: 0,
          max: 0.25,
          step: 0.005,
          onChange: (v: number) => {
            p.rimDrop = v;
          },
        },
        planeOffsetX: {
          label: "offset X",
          value: p.offsetX,
          min: -2,
          max: 2,
          step: 0.01,
          onChange: (v: number) => {
            p.offsetX = v;
          },
        },
        planeOffsetY: {
          label: "offset Y",
          value: p.offsetY,
          min: -0.5,
          max: 0.5,
          step: 0.005,
          onChange: (v: number) => {
            p.offsetY = v;
          },
        },
        planeOffsetZ: {
          label: "offset Z",
          value: p.offsetZ,
          min: -2,
          max: 2,
          step: 0.01,
          onChange: (v: number) => {
            p.offsetZ = v;
          },
        },
      },
      { collapsed: true },
    ),
    "Log detection": button(() => {
      console.info("[Water] plane alignment", { ...p });
      console.info("[Water] exposure", w.exposure, "hdrBlend", w.hdrBlend, "planarSkyFill", w.planarSkyFill);
    }),
  });

  return null;
}
