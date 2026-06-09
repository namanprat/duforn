// @ts-nocheck
import { useControls, folder, button } from "leva";
import { useWebglStore } from "../../store/webgl";
import { useHomeSceneControlsStore } from "../../store/homeScene";
import { logFloorMeshes } from "./wallHoverDebug";

/**
 * Dev-only Leva panel for wall hover glow (main / work / contact routes).
 */
export default function WallHoverGui() {
  const activePage = useWebglStore((s) => s.activePage);
  const setControl = useHomeSceneControlsStore((s) => s.setControl);
  const resetControls = useHomeSceneControlsStore((s) => s.resetControls);
  const wallHover = useHomeSceneControlsStore((s) => s.controls.wallHover);

  useControls(
    "Wall Hover",
    {
      enabled: {
        value: wallHover.enabled,
        onChange: (v) => setControl("wallHover.enabled", v),
      },
      Debug: folder({
        showDebugBlob: {
          label: "red debug blob",
          value: wallHover.showDebugBlob,
          onChange: (v) => setControl("wallHover.showDebugBlob", v),
        },
        debugBlobSize: {
          value: wallHover.debugBlobSize,
          min: 0.1,
          max: 3,
          step: 0.05,
          onChange: (v) => setControl("wallHover.debugBlobSize", v),
        },
        logHits: {
          value: wallHover.logHits,
          onChange: (v) => setControl("wallHover.logHits", v),
        },
        debugAlwaysOn: {
          label: "always on (center ray)",
          value: wallHover.debugAlwaysOn,
          onChange: (v) => setControl("wallHover.debugAlwaysOn", v),
        },
        "Log floor mesh": button(() => logFloorMeshes()),
      }),
      useDecalGlow: {
        label: "decal glow (phase 2)",
        value: wallHover.useDecalGlow,
        onChange: (v) => setControl("wallHover.useDecalGlow", v),
      },
      Glow: folder({
        innerRadius: {
          value: wallHover.innerRadius,
          min: 0,
          max: 2,
          step: 0.05,
          onChange: (v) => setControl("wallHover.innerRadius", v),
        },
        hoverRadius: {
          label: "decal radius",
          value: wallHover.hoverRadius,
          min: 0.5,
          max: 12,
          step: 0.1,
          onChange: (v) => setControl("wallHover.hoverRadius", v),
        },
        glowIntensity: {
          value: wallHover.glowIntensity,
          min: 0,
          max: 3,
          step: 0.05,
          onChange: (v) => setControl("wallHover.glowIntensity", v),
        },
        glowColor: {
          value: wallHover.glowColor,
          onChange: (v) => setControl("wallHover.glowColor", v),
        },
        strengthLerp: {
          value: wallHover.strengthLerp,
          min: 1,
          max: 20,
          step: 0.5,
          onChange: (v) => setControl("wallHover.strengthLerp", v),
        },
      }),
      Liquid: folder({
        noiseScale: {
          value: wallHover.noiseScale,
          min: 0.2,
          max: 8,
          step: 0.1,
          onChange: (v) => setControl("wallHover.noiseScale", v),
        },
        noiseSpeed: {
          value: wallHover.noiseSpeed,
          min: 0,
          max: 2,
          step: 0.05,
          onChange: (v) => setControl("wallHover.noiseSpeed", v),
        },
        pulseRate: {
          value: wallHover.pulseRate,
          min: 0,
          max: 4,
          step: 0.1,
          onChange: (v) => setControl("wallHover.pulseRate", v),
        },
      }),
      Reset: button(() => resetControls()),
      "Log values": button(() => {
        const w = useHomeSceneControlsStore.getState().controls.wallHover;
        console.info("[Wall Hover]", JSON.stringify(w, null, 2));
      }),
    },
    { collapsed: false },
    {
      render: () =>
        activePage === "main" ||
        activePage === "work" ||
        activePage === "contact" ||
        activePage === "viewer",
    },
  );

  return null;
}
