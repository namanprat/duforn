// @ts-nocheck
import { useControls, folder, button } from "leva";
import { useWebglStore } from "../store/webgl";
import { useHomeSceneControlsStore } from "../store/homeScene";

const RAD_TO_DEG = 180 / Math.PI;
const DEG_TO_RAD = Math.PI / 180;

/**
 * Dev-only Leva panel for the main GLB transform (main route).
 * Wires to the existing `model` controls applied in Main.tsx.
 */
export default function MainSceneGui() {
  const activePage = useWebglStore((s) => s.activePage);
  const setControl = useHomeSceneControlsStore((s) => s.setControl);
  const resetControls = useHomeSceneControlsStore((s) => s.resetControls);
  const model = useHomeSceneControlsStore((s) => s.controls.model);
  const env = useHomeSceneControlsStore((s) => s.controls.env);

  useControls(
    "Scene",
    {
      skybox: {
        value: env?.skybox ?? true,
        onChange: (v) => setControl("env.skybox", v),
      },
    },
    { collapsed: true },
    { render: () => activePage === "main" },
  );

  useControls(
    "Main GLB",
    {
      Position: folder({
        x: {
          value: model.x,
          min: -80,
          max: 80,
          step: 0.01,
          onChange: (v) => setControl("model.x", v),
        },
        y: {
          value: model.y,
          min: -80,
          max: 80,
          step: 0.01,
          onChange: (v) => setControl("model.y", v),
        },
        z: {
          value: model.z,
          min: -80,
          max: 80,
          step: 0.01,
          onChange: (v) => setControl("model.z", v),
        },
      }),
      Rotation: folder({
        rxDeg: {
          label: "x (deg)",
          value: model.rx * RAD_TO_DEG,
          min: -180,
          max: 180,
          step: 0.5,
          onChange: (v) => setControl("model.rx", v * DEG_TO_RAD),
        },
        ryDeg: {
          label: "y (deg)",
          value: model.ry * RAD_TO_DEG,
          min: -180,
          max: 180,
          step: 0.5,
          onChange: (v) => setControl("model.ry", v * DEG_TO_RAD),
        },
        rzDeg: {
          label: "z (deg)",
          value: model.rz * RAD_TO_DEG,
          min: -180,
          max: 180,
          step: 0.5,
          onChange: (v) => setControl("model.rz", v * DEG_TO_RAD),
        },
      }),
      scale: {
        value: model.scale,
        min: 0.01,
        max: 50,
        step: 0.01,
        onChange: (v) => setControl("model.scale", v),
      },
      Reset: button(() => resetControls()),
      "Log values": button(() => {
        const m = useHomeSceneControlsStore.getState().controls.model;
        console.info("[Main GLB]", JSON.stringify(m, null, 2));
      }),
    },
    { collapsed: false },
    { render: () => activePage === "main" },
  );

  return null;
}
