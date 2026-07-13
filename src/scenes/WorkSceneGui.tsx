import { button, folder, useControls } from "leva";
import { useWorkSceneControlsStore } from "../store/workScene";

const RAD_TO_DEG = 180 / Math.PI;
const DEG_TO_RAD = Math.PI / 180;

/** Dev-only Leva panel for work-page cloth strip transform. */
export default function WorkSceneGui({ enabled }: { enabled: boolean }) {
  const setControl = useWorkSceneControlsStore((s) => s.setControl);
  const resetControls = useWorkSceneControlsStore((s) => s.resetControls);
  const strip = useWorkSceneControlsStore((s) => s.controls.strip);

  useControls(
    "Work Strip",
    {
      scrollEnabled: {
        label: "scroll",
        value: strip.scrollEnabled,
        onChange: (v) => setControl("strip.scrollEnabled", v),
      },
      Position: folder({
        x: {
          value: strip.x,
          min: -100,
          max: 100,
          step: 0.01,
          onChange: (v) => setControl("strip.x", v),
        },
        y: {
          value: strip.y,
          min: -40,
          max: 40,
          step: 0.01,
          onChange: (v) => setControl("strip.y", v),
        },
        z: {
          value: strip.z,
          min: -100,
          max: 100,
          step: 0.01,
          onChange: (v) => setControl("strip.z", v),
        },
      }),
      Rotation: folder({
        rxDeg: {
          label: "x (deg)",
          value: strip.rx * RAD_TO_DEG,
          min: -180,
          max: 180,
          step: 0.5,
          onChange: (v) => setControl("strip.rx", v * DEG_TO_RAD),
        },
        ryDeg: {
          label: "y (deg)",
          value: strip.ry * RAD_TO_DEG,
          min: -180,
          max: 180,
          step: 0.5,
          onChange: (v) => setControl("strip.ry", v * DEG_TO_RAD),
        },
        rzDeg: {
          label: "z (deg)",
          value: strip.rz * RAD_TO_DEG,
          min: -180,
          max: 180,
          step: 0.5,
          onChange: (v) => setControl("strip.rz", v * DEG_TO_RAD),
        },
      }),
      scale: {
        value: strip.scale,
        min: 0.1,
        max: 10,
        step: 0.01,
        onChange: (v) => setControl("strip.scale", v),
      },
      curveRadius: {
        label: "curve radius",
        value: strip.curveRadius,
        min: 1,
        max: 50,
        step: 0.1,
        onChange: (v) => setControl("strip.curveRadius", v),
      },
      height: {
        value: strip.stripHeight,
        min: 0.5,
        max: 20,
        step: 0.1,
        onChange: (v) => setControl("strip.stripHeight", v),
      },
      visibleItems: {
        label: "panels",
        value: strip.visibleItems ?? 7,
        min: 3,
        max: 12,
        step: 1,
        onChange: (v) => setControl("strip.visibleItems", v),
      },
      "Cloth Physics": folder({
        windEnabled: {
          label: "wind",
          value: strip.windEnabled !== false,
          onChange: (v) => setControl("strip.windEnabled", v),
        },
        windStrength: {
          value: strip.windStrength,
          min: 0,
          max: 4,
          step: 0.01,
          onChange: (v) => setControl("strip.windStrength", v),
          render: (get) => get("Work Strip.Cloth Physics.windEnabled"),
        },
        flutterAmplitude: {
          value: strip.flutterAmplitude,
          min: 0,
          max: 0.3,
          step: 0.001,
          onChange: (v) => setControl("strip.flutterAmplitude", v),
        },
        flutterFrequency: {
          value: strip.flutterFrequency,
          min: 0,
          max: 40,
          step: 0.1,
          onChange: (v) => setControl("strip.flutterFrequency", v),
        },
        gravityScale: {
          value: strip.gravityScale,
          min: 0,
          max: 4,
          step: 0.01,
          onChange: (v) => setControl("strip.gravityScale", v),
        },
      }),
      Debug: folder({
        showStripBack: {
          label: "show strip back",
          value: strip.showStripBack === true,
          onChange: (v) => setControl("strip.showStripBack", v),
        },
        loopPreview: {
          label: "see loop",
          value: strip.loopPreview === true,
          onChange: (v) => setControl("strip.loopPreview", v),
        },
        loopScrollSpeed: {
          label: "loop speed",
          value: strip.loopScrollSpeed ?? 0.02,
          min: 0.002,
          max: 0.2,
          step: 0.002,
          onChange: (v) => setControl("strip.loopScrollSpeed", v),
          render: (get) => get("Work Strip.Debug.loopPreview"),
        },
      }),
      "Exposure / Levels": folder({
        exposure: {
          label: "exposure (stops)",
          value: strip.exposure,
          min: -3,
          max: 3,
          step: 0.01,
          onChange: (v) => setControl("strip.exposure", v),
        },
        levelsInLow: {
          label: "in black",
          value: strip.levelsInLow,
          min: 0,
          max: 1,
          step: 0.01,
          onChange: (v) => setControl("strip.levelsInLow", v),
        },
        levelsInHigh: {
          label: "in white",
          value: strip.levelsInHigh,
          min: 0,
          max: 1,
          step: 0.01,
          onChange: (v) => setControl("strip.levelsInHigh", v),
        },
        levelsGamma: {
          label: "gamma",
          value: strip.levelsGamma,
          min: 0.1,
          max: 4,
          step: 0.01,
          onChange: (v) => setControl("strip.levelsGamma", v),
        },
        levelsOutLow: {
          label: "out black",
          value: strip.levelsOutLow,
          min: 0,
          max: 1,
          step: 0.01,
          onChange: (v) => setControl("strip.levelsOutLow", v),
        },
        levelsOutHigh: {
          label: "out white",
          value: strip.levelsOutHigh,
          min: 0,
          max: 1,
          step: 0.01,
          onChange: (v) => setControl("strip.levelsOutHigh", v),
        },
      }),
      "Color Levels": folder({
        brightness: {
          value: strip.brightness,
          min: 0,
          max: 2,
          step: 0.01,
          onChange: (v) => setControl("strip.brightness", v),
        },
        contrast: {
          value: strip.contrast,
          min: 0,
          max: 2,
          step: 0.01,
          onChange: (v) => setControl("strip.contrast", v),
        },
        saturation: {
          value: strip.saturation,
          min: 0,
          max: 2,
          step: 0.01,
          onChange: (v) => setControl("strip.saturation", v),
        },
      }),
      Material: folder({
        opacity: {
          value: strip.opacity,
          min: 0,
          max: 1,
          step: 0.01,
          onChange: (v) => setControl("strip.opacity", v),
        },
        shadeMin: {
          label: "shade min",
          value: strip.shadeMin,
          min: 0,
          max: 2,
          step: 0.01,
          onChange: (v) => setControl("strip.shadeMin", v),
        },
        shadeMax: {
          label: "shade max",
          value: strip.shadeMax,
          min: 0,
          max: 2,
          step: 0.01,
          onChange: (v) => setControl("strip.shadeMax", v),
        },
        baseLight: {
          label: "base light",
          value: strip.baseLight,
          min: 0,
          max: 2,
          step: 0.01,
          onChange: (v) => setControl("strip.baseLight", v),
        },
        loosenessLight: {
          label: "looseness light",
          value: strip.loosenessLight,
          min: 0,
          max: 1,
          step: 0.01,
          onChange: (v) => setControl("strip.loosenessLight", v),
        },
        centerLight: {
          label: "center light",
          value: strip.centerLight,
          min: 0,
          max: 0.5,
          step: 0.01,
          onChange: (v) => setControl("strip.centerLight", v),
        },
        rimStrength: {
          label: "rim",
          value: strip.rimStrength,
          min: 0,
          max: 0.3,
          step: 0.005,
          onChange: (v) => setControl("strip.rimStrength", v),
        },
        edgeFade: {
          label: "edge fade",
          value: strip.edgeFade,
          min: 0,
          max: 0.2,
          step: 0.005,
          onChange: (v) => setControl("strip.edgeFade", v),
        },
      }),
      "Reset strip": button(() => resetControls()),
      "Log strip": button(() => {
        const values = useWorkSceneControlsStore.getState().controls.strip;
        console.info("[Work Strip]", JSON.stringify(values, null, 2));
      }),
    },
    { collapsed: false },
    { render: () => enabled },
  );

  return null;
}
