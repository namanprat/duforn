// @ts-nocheck
import { useControls, button } from "leva";
import { useWebglStore } from "../../store/webgl";
import { useHomeSceneControlsStore } from "../../store/homeScene";

/**
 * Dev-only Leva panels for the pool water + caustics (main / work / contact).
 */
export default function CausticsGui() {
  const activePage = useWebglStore((s) => s.activePage);
  const setControl = useHomeSceneControlsStore((s) => s.setControl);
  const caustics = useHomeSceneControlsStore((s) => s.controls.caustics);
  const water = useHomeSceneControlsStore((s) => s.controls.water);

  const renderOnHome = () =>
    activePage === "main" || activePage === "work" || activePage === "contact";

  useControls(
    "Pool Water",
    {
      hdrReflection: {
        label: "HDR reflection",
        value: water.hdrReflection ?? false,
        onChange: (v) => setControl("water.hdrReflection", v),
      },
      exposure: {
        value: water.exposure,
        min: 0,
        max: 2,
        step: 0.01,
        onChange: (v) => setControl("water.exposure", v),
      },
      tintR: {
        value: water.tintR,
        min: 0,
        max: 2,
        step: 0.01,
        onChange: (v) => setControl("water.tintR", v),
      },
      tintG: {
        value: water.tintG,
        min: 0,
        max: 2,
        step: 0.01,
        onChange: (v) => setControl("water.tintG", v),
      },
      tintB: {
        value: water.tintB,
        min: 0,
        max: 2,
        step: 0.01,
        onChange: (v) => setControl("water.tintB", v),
      },
      fresnelBase: {
        value: water.fresnelBase,
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (v) => setControl("water.fresnelBase", v),
      },
      refractionOffset: {
        value: water.refractionOffset,
        min: 0,
        max: 0.3,
        step: 0.005,
        onChange: (v) => setControl("water.refractionOffset", v),
      },
      waterClarity: {
        value: water.waterClarity,
        min: 0,
        max: 2,
        step: 0.01,
        onChange: (v) => setControl("water.waterClarity", v),
      },
      "Log values": button(() => {
        const w = useHomeSceneControlsStore.getState().controls.water;
        console.info("[Pool Water]", JSON.stringify(w, null, 2));
      }),
    },
    { collapsed: true },
    { render: renderOnHome },
  );

  useControls(
    "Pool Caustics",
    {
      enabled: {
        value: caustics.enabled,
        onChange: (v) => setControl("caustics.enabled", v),
      },
      strength: {
        value: caustics.strength,
        min: 0,
        max: 4,
        step: 0.05,
        onChange: (v) => setControl("caustics.strength", v),
      },
      depth: {
        value: caustics.depth,
        min: 0.02,
        max: 1,
        step: 0.01,
        onChange: (v) => setControl("caustics.depth", v),
      },
      normalScale: {
        value: caustics.normalScale,
        min: 0,
        max: 800,
        step: 10,
        onChange: (v) => setControl("caustics.normalScale", v),
      },
      maxIntensity: {
        value: caustics.maxIntensity,
        min: 1,
        max: 10,
        step: 0.1,
        onChange: (v) => setControl("caustics.maxIntensity", v),
      },
      gain: {
        value: caustics.gain,
        min: 0,
        max: 4,
        step: 0.05,
        onChange: (v) => setControl("caustics.gain", v),
      },
      "Log values": button(() => {
        const c = useHomeSceneControlsStore.getState().controls.caustics;
        console.info("[Pool Caustics]", JSON.stringify(c, null, 2));
      }),
    },
    { collapsed: true },
    { render: renderOnHome },
  );

  return null;
}
