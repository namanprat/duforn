// @ts-nocheck
import React, { useState } from "react";
import {
  DEFAULT_WORK_SCENE_CONTROLS,
  useWorkSceneControlsStore,
} from "../../store/workSceneControls";

const CONTROL_SECTIONS = [
  {
    key: "scene",
    title: "Scene",
    fields: [
      { path: "scene.exposure", label: "Exposure", min: 0.4, max: 1.6, step: 0.01 },
      { path: "scene.background", label: "Background", type: "color" },
      { path: "scene.fogColor", label: "Fog Color", type: "color" },
      { path: "scene.fogDensity", label: "Fog Density", min: 0, max: 0.12, step: 0.001 },
    ],
  },
  {
    key: "model",
    title: "Model",
    fields: [
      { path: "model.x", label: "X", min: -8, max: 8, step: 0.01 },
      { path: "model.y", label: "Y", min: -12, max: 4, step: 0.01 },
      { path: "model.z", label: "Z", min: -30, max: -4, step: 0.1 },
      { path: "model.scale", label: "Scale", min: 0.2, max: 2.4, step: 0.01 },
      { path: "model.roughnessScale", label: "Roughness", min: 0.2, max: 2, step: 0.01 },
      { path: "model.metalnessScale", label: "Metalness", min: 0, max: 2, step: 0.01 },
      { path: "model.envReflection", label: "Env Reflection", min: 0, max: 3, step: 0.01 },
      { path: "model.clearcoat", label: "Clearcoat", min: 0, max: 1, step: 0.01 },
      {
        path: "model.clearcoatRoughness",
        label: "Clearcoat Roughness",
        min: 0,
        max: 1,
        step: 0.01,
      },
    ],
  },
  {
    key: "effects",
    title: "Effects",
    fields: [
      { path: "effects.bloomStrength", label: "Bloom", min: 0, max: 0.12, step: 0.001 },
      {
        path: "effects.vignetteDarkness",
        label: "Vignette",
        min: 0,
        max: 0.4,
        step: 0.005,
      },
      {
        path: "effects.chromaticShift",
        label: "Chromatic",
        min: 0,
        max: 0.01,
        step: 0.0001,
      },
      { path: "effects.dofMaxBlur", label: "DOF Blur", min: 0, max: 0.02, step: 0.0001 },
    ],
  },
  {
    key: "particles",
    title: "Particles",
    fields: [
      { path: "particles.count", label: "Count", min: 0, max: 400, step: 1, integer: true },
      { path: "particles.color", label: "Color", type: "color" },
      { path: "particles.size", label: "Size", min: 0.005, max: 0.25, step: 0.001 },
      { path: "particles.opacity", label: "Opacity", min: 0, max: 1, step: 0.01 },
      { path: "particles.xHalf", label: "Bounds X", min: 1, max: 20, step: 0.1 },
      { path: "particles.yMin", label: "Y Min", min: -12, max: 4, step: 0.1 },
      { path: "particles.yMax", label: "Y Max", min: -2, max: 12, step: 0.1 },
      { path: "particles.zMin", label: "Z Min", min: -30, max: 0, step: 0.1 },
      { path: "particles.zMax", label: "Z Max", min: -6, max: 12, step: 0.1 },
      { path: "particles.xAmplitude", label: "X Sway", min: 0, max: 2, step: 0.01 },
      { path: "particles.zAmplitude", label: "Z Sway", min: 0, max: 2, step: 0.01 },
      { path: "particles.xSpeed", label: "X Speed", min: 0, max: 2, step: 0.01 },
      { path: "particles.zSpeed", label: "Z Speed", min: 0, max: 2, step: 0.01 },
      { path: "particles.ySpeed", label: "Rise Speed", min: 0, max: 2, step: 0.01 },
    ],
  },
  {
    key: "lights",
    title: "Lights",
    fields: [
      { path: "lights.keyX", label: "Key X", min: -20, max: 20, step: 0.1 },
      { path: "lights.keyY", label: "Key Y", min: -4, max: 24, step: 0.1 },
      { path: "lights.keyZ", label: "Key Z", min: -24, max: 24, step: 0.1 },
      { path: "lights.keyIntensity", label: "Key Power", min: 0, max: 2400, step: 10 },
      { path: "lights.keyColor", label: "Key Color", type: "color" },
      { path: "lights.keyAngle", label: "Key Angle", min: 0.1, max: 1.4, step: 0.001 },
      { path: "lights.keyPenumbra", label: "Key Penumbra", min: 0, max: 1, step: 0.01 },
      { path: "lights.keyDecay", label: "Key Decay", min: 0, max: 4, step: 0.01 },
      { path: "lights.fillX", label: "Fill X", min: -20, max: 20, step: 0.1 },
      { path: "lights.fillY", label: "Fill Y", min: -4, max: 24, step: 0.1 },
      { path: "lights.fillZ", label: "Fill Z", min: -24, max: 24, step: 0.1 },
      { path: "lights.fillIntensity", label: "Fill Power", min: 0, max: 2400, step: 10 },
      { path: "lights.fillColor", label: "Fill Color", type: "color" },
      { path: "lights.fillAngle", label: "Fill Angle", min: 0.1, max: 1.4, step: 0.001 },
      { path: "lights.fillPenumbra", label: "Fill Penumbra", min: 0, max: 1, step: 0.01 },
      { path: "lights.fillDecay", label: "Fill Decay", min: 0, max: 4, step: 0.01 },
      { path: "lights.pointX", label: "Point X", min: -24, max: 24, step: 0.1 },
      { path: "lights.pointY", label: "Point Y", min: -12, max: 12, step: 0.1 },
      { path: "lights.pointZ", label: "Point Z", min: -24, max: 24, step: 0.1 },
      { path: "lights.pointIntensity", label: "Point Power", min: 0, max: 8, step: 0.01 },
      { path: "lights.pointColor", label: "Point Color", type: "color" },
      { path: "lights.pointDecay", label: "Point Decay", min: 0, max: 4, step: 0.01 },
      { path: "lights.pointDistance", label: "Point Distance", min: 0, max: 60, step: 0.1 },
      { path: "lights.ambientIntensity", label: "Ambient", min: 0, max: 2, step: 0.01 },
      { path: "lights.ambientColor", label: "Ambient Color", type: "color" },
      { path: "lights.shadowOpacity", label: "Shadow Opacity", min: 0, max: 0.5, step: 0.01 },
    ],
  },
  {
    key: "strip",
    title: "Strip",
    fields: [
      { path: "strip.x", label: "X", min: -4, max: 4, step: 0.01 },
      { path: "strip.y", label: "Y", min: -4, max: 4, step: 0.01 },
      { path: "strip.z", label: "Z", min: -12, max: 2, step: 0.01 },
      { path: "strip.scale", label: "Scale", min: 0.2, max: 1.4, step: 0.01 },
      {
        path: "strip.visibleItems",
        label: "Visible Items",
        min: 3,
        max: 11,
        step: 1,
        integer: true,
      },
      { path: "strip.gapSize", label: "Gap", min: 0.01, max: 0.3, step: 0.001 },
      { path: "strip.curveRadius", label: "Curve Radius", min: 4, max: 24, step: 0.01 },
      { path: "strip.curveAmount", label: "Curve Amount", min: 0.4, max: 2.8, step: 0.01 },
      { path: "strip.stripHeight", label: "Height", min: 1, max: 10, step: 0.01 },
      { path: "strip.stripYOffset", label: "Y Offset", min: -6, max: 6, step: 0.01 },
      { path: "strip.bottomSway", label: "Bottom Sway", min: 0, max: 1.2, step: 0.01 },
      { path: "strip.depthOffset", label: "Depth Offset", min: -2, max: 2, step: 0.01 },
      { path: "strip.roughness", label: "Roughness", min: 0.05, max: 1, step: 0.01 },
      { path: "strip.sheenR", label: "Sheen R", min: 0, max: 1.5, step: 0.01 },
      { path: "strip.sheenG", label: "Sheen G", min: 0, max: 1.5, step: 0.01 },
      { path: "strip.sheenB", label: "Sheen B", min: 0, max: 1.5, step: 0.01 },
      { path: "strip.subsurfaceStr", label: "Subsurface", min: 0, max: 1, step: 0.01 },
      { path: "strip.windStrength", label: "Wind", min: 0, max: 16, step: 0.01 },
      { path: "strip.flutterAmplitude", label: "Flutter Amp", min: 0, max: 1, step: 0.001 },
      { path: "strip.flutterFrequency", label: "Flutter Freq", min: 0, max: 30, step: 0.01 },
      { path: "strip.revealDuration", label: "Reveal Duration", min: 0.2, max: 4, step: 0.01 },
      { path: "strip.revealDelay", label: "Reveal Delay", min: 0, max: 2, step: 0.01 },
      { path: "strip.revealNoiseScale", label: "Reveal Noise", min: 0.5, max: 14, step: 0.1 },
      {
        path: "strip.revealEdgeSoftness",
        label: "Reveal Softness",
        min: 0.01,
        max: 0.45,
        step: 0.005,
      },
      { path: "strip.gravityScale", label: "Gravity", min: 0, max: 10, step: 0.01 },
      { path: "strip.shearStrength", label: "Shear", min: 0, max: 1.5, step: 0.01 },
      { path: "strip.constraintMix", label: "Constraint", min: 0.2, max: 1.2, step: 0.01 },
      {
        path: "strip.wheelSensitivity",
        label: "Wheel Sense",
        min: 0.0005,
        max: 0.01,
        step: 0.0001,
      },
      { path: "strip.dragSensitivity", label: "Drag Sense", min: 0.001, max: 0.02, step: 0.0001 },
      {
        path: "strip.dragVelocityScale",
        label: "Drag Velocity",
        min: 0.001,
        max: 0.02,
        step: 0.0001,
      },
      { path: "strip.scrollLerp", label: "Scroll Lerp", min: 0.02, max: 0.3, step: 0.001 },
      { path: "strip.scrollDamping", label: "Scroll Damp", min: 0.7, max: 0.99, step: 0.001 },
      { path: "strip.scrollDraggingDamping", label: "Drag Damp", min: 0.6, max: 0.99, step: 0.001 },
      { path: "strip.snapVelocityThreshold", label: "Snap Vel", min: 0.001, max: 0.1, step: 0.001 },
      { path: "strip.snapLerp", label: "Snap Lerp", min: 0, max: 0.4, step: 0.001 },
      { path: "strip.snapEpsilon", label: "Snap Epsilon", min: 0.0001, max: 0.05, step: 0.0001 },
    ],
  },
];

function getValue(source, path) {
  return path.split(".").reduce((current, key) => current?.[key], source);
}

function formatValue(value, step = 0.01) {
  if (typeof value === "string") return value;
  if (step >= 1) return String(Math.round(value));
  if (step >= 0.1) return value.toFixed(1);
  if (step >= 0.01) return value.toFixed(2);
  if (step >= 0.001) return value.toFixed(3);
  return value.toFixed(4);
}

function parseFieldValue(field, rawValue) {
  if (field.type === "color") return rawValue;
  const parsed = field.integer ? Number.parseInt(rawValue, 10) : Number.parseFloat(rawValue);
  if (Number.isNaN(parsed)) {
    return getValue(DEFAULT_WORK_SCENE_CONTROLS, field.path);
  }
  return parsed;
}

function NumberField({ field, value, onChange }) {
  return (
    <>
      <input
        type="range"
        min={field.min}
        max={field.max}
        step={field.step}
        value={value}
        onChange={(event) => onChange(field, event.target.value)}
        style={{ width: "100%" }}
      />
      <input
        type="number"
        min={field.min}
        max={field.max}
        step={field.step}
        value={value}
        onChange={(event) => onChange(field, event.target.value)}
        style={{
          width: "100%",
          marginTop: 6,
          border: "1px solid rgba(255, 255, 255, 0.14)",
          background: "rgba(14, 14, 14, 0.86)",
          color: "#f6f0e9",
          borderRadius: 8,
          padding: "6px 8px",
        }}
      />
    </>
  );
}

export default function WorkSceneControls() {
  const [collapsed, setCollapsed] = useState(false);
  const controls = useWorkSceneControlsStore((state) => state.controls);
  const resetControls = useWorkSceneControlsStore((state) => state.resetControls);
  const setControl = useWorkSceneControlsStore((state) => state.setControl);

  const handleChange = (field, rawValue) => {
    setControl(field.path, parseFieldValue(field, rawValue));
  };

  return (
    <aside
      data-work-scene-controls="true"
      style={{
        position: "fixed",
        top: 88,
        right: 16,
        zIndex: 30,
        width: "min(360px, calc(100vw - 24px))",
        maxHeight: "calc(100vh - 104px)",
        overflow: "auto",
        padding: 12,
        borderRadius: 18,
        border: "1px solid rgba(255, 255, 255, 0.12)",
        background:
          "linear-gradient(180deg, rgba(16, 16, 16, 0.92) 0%, rgba(10, 10, 10, 0.86) 100%)",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.38)",
        backdropFilter: "blur(18px)",
        color: "#f6f0e9",
        pointerEvents: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          marginBottom: collapsed ? 0 : 12,
        }}
      >
        <div>
          <div style={{ fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase" }}>
            Work Scene
          </div>
          <div style={{ fontSize: 18, lineHeight: 1.1 }}>3D Controls</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={resetControls}
            style={{
              border: "1px solid rgba(255, 255, 255, 0.12)",
              background: "rgba(255, 255, 255, 0.06)",
              color: "inherit",
              borderRadius: 999,
              padding: "8px 12px",
              cursor: "pointer",
            }}
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            style={{
              border: "1px solid rgba(255, 255, 255, 0.12)",
              background: "rgba(255, 255, 255, 0.06)",
              color: "inherit",
              borderRadius: 999,
              padding: "8px 12px",
              cursor: "pointer",
              minWidth: 72,
            }}
          >
            {collapsed ? "Open" : "Hide"}
          </button>
        </div>
      </div>

      {!collapsed &&
        CONTROL_SECTIONS.map((section) => (
          <details key={section.key} open style={{ marginBottom: 10 }}>
            <summary
              style={{
                cursor: "pointer",
                fontSize: 12,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "rgba(246, 240, 233, 0.72)",
                padding: "8px 2px",
              }}
            >
              {section.title}
            </summary>
            <div
              style={{
                display: "grid",
                gap: 10,
                padding: "4px 0 8px",
              }}
            >
              {section.fields.map((field) => {
                const value = getValue(controls, field.path);

                return (
                  <label
                    key={field.path}
                    style={{
                      display: "block",
                      padding: 10,
                      borderRadius: 12,
                      background: "rgba(255, 255, 255, 0.04)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                        marginBottom: 8,
                      }}
                    >
                      <span style={{ fontSize: 13 }}>{field.label}</span>
                      <span style={{ fontSize: 12, color: "rgba(246, 240, 233, 0.64)" }}>
                        {formatValue(value, field.step)}
                      </span>
                    </div>

                    {field.type === "color" ? (
                      <input
                        type="color"
                        value={value}
                        onChange={(event) => handleChange(field, event.target.value)}
                        style={{
                          width: "100%",
                          height: 36,
                          border: "none",
                          background: "transparent",
                          padding: 0,
                        }}
                      />
                    ) : (
                      <NumberField field={field} value={value} onChange={handleChange} />
                    )}
                  </label>
                );
              })}
            </div>
          </details>
        ))}
    </aside>
  );
}
