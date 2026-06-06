// @ts-nocheck
import { useControls, folder, button } from "leva";
import { useWebglStore } from "../store/webgl";
import { useHomeSceneControlsStore } from "../store/homeScene";

const RAD_TO_DEG = 180 / Math.PI;
const DEG_TO_RAD = Math.PI / 180;

/**
 * Dev-only Leva panel for the home pool spotlight (main route).
 */
export default function HomeSceneSpotLightGui() {
  const activePage = useWebglStore((s) => s.activePage);
  const setControl = useHomeSceneControlsStore((s) => s.setControl);
  const resetControls = useHomeSceneControlsStore((s) => s.resetControls);
  const spot = useHomeSceneControlsStore((s) => s.controls.spotlight);

  useControls(
    "Home Spotlight",
    {
      Position: folder({
        x: {
          value: spot.x,
          min: -80,
          max: 80,
          step: 0.01,
          onChange: (v) => setControl("spotlight.x", v),
        },
        y: {
          value: spot.y,
          min: -20,
          max: 40,
          step: 0.01,
          onChange: (v) => setControl("spotlight.y", v),
        },
        z: {
          value: spot.z,
          min: -80,
          max: 80,
          step: 0.01,
          onChange: (v) => setControl("spotlight.z", v),
        },
      }),
      Target: folder({
        targetX: {
          value: spot.targetX,
          min: -80,
          max: 80,
          step: 0.1,
          onChange: (v) => setControl("spotlight.targetX", v),
        },
        targetY: {
          value: spot.targetY,
          min: -20,
          max: 80,
          step: 0.01,
          onChange: (v) => setControl("spotlight.targetY", v),
        },
        targetZ: {
          value: spot.targetZ,
          min: -80,
          max: 80,
          step: 0.1,
          onChange: (v) => setControl("spotlight.targetZ", v),
        },
      }),
      intensity: {
        value: spot.intensity,
        min: 0,
        max: 80,
        step: 0.1,
        onChange: (v) => setControl("spotlight.intensity", v),
      },
      color: {
        value: spot.color,
        onChange: (v) => setControl("spotlight.color", v),
      },
      distance: {
        value: spot.distance,
        min: 0,
        max: 200,
        step: 0.5,
        onChange: (v) => setControl("spotlight.distance", v),
      },
      angleDeg: {
        label: "angle (deg)",
        value: spot.angle * RAD_TO_DEG,
        min: 5,
        max: 90,
        step: 0.5,
        onChange: (v) => setControl("spotlight.angle", v * DEG_TO_RAD),
      },
      penumbra: {
        value: spot.penumbra,
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (v) => setControl("spotlight.penumbra", v),
      },
      decay: {
        value: spot.decay,
        min: 0,
        max: 4,
        step: 0.05,
        onChange: (v) => setControl("spotlight.decay", v),
      },
      castShadow: {
        value: spot.castShadow,
        onChange: (v) => setControl("spotlight.castShadow", v),
      },
      showInspectorCamera: {
        value: spot.showInspectorCamera,
        onChange: (v) => setControl("spotlight.showInspectorCamera", v),
      },
      Reset: button(() => resetControls()),
      "Log values": button(() => {
        const s = useHomeSceneControlsStore.getState().controls.spotlight;
        console.info("[Home Spotlight]", JSON.stringify(s, null, 2));
      }),
    },
    { collapsed: false },
    { render: () => activePage === "main" || activePage === "viewer" },
  );

  return null;
}
