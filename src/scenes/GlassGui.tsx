import { button, useControls } from "leva";
import { useGlassControlsStore } from "../store/glass";

/** Dev-only Leva panel for the window glass material. */
export default function GlassGui() {
  const setControl = useGlassControlsStore((s) => s.setControl);
  const resetControls = useGlassControlsStore((s) => s.resetControls);
  const g = useGlassControlsStore((s) => s.controls);

  useControls(
    "Glass",
    {
      color: { value: g.color, onChange: (v) => setControl("color", v) },
      transmission: {
        value: g.transmission,
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (v) => setControl("transmission", v),
      },
      roughness: {
        value: g.roughness,
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (v) => setControl("roughness", v),
      },
      metalness: {
        value: g.metalness,
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (v) => setControl("metalness", v),
      },
      ior: { value: g.ior, min: 1, max: 2.333, step: 0.01, onChange: (v) => setControl("ior", v) },
      thickness: {
        value: g.thickness,
        min: 0,
        max: 3,
        step: 0.01,
        onChange: (v) => setControl("thickness", v),
      },
      envMapIntensity: {
        label: "reflection",
        value: g.envMapIntensity,
        min: 0,
        max: 4,
        step: 0.05,
        onChange: (v) => setControl("envMapIntensity", v),
      },
      reflectivity: {
        value: g.reflectivity,
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (v) => setControl("reflectivity", v),
      },
      opacity: {
        value: g.opacity,
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (v) => setControl("opacity", v),
      },
      "Reset defaults": button(() => resetControls()),
      "Log values": button(() => {
        console.info(
          "[Glass]",
          JSON.stringify(useGlassControlsStore.getState().controls, null, 2),
        );
      }),
    },
    { collapsed: false },
  );

  return null;
}
