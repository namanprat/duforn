import React, { useState } from "react";
import {
  DEFAULT_TEST_SCENE_CONTROLS,
  useTestSceneControlsStore,
} from "../../store/testSceneControls.js";

const SECTIONS = [
  {
    key: "model",
    title: "Model (gang.glb)",
    fields: [
      { path: "model.x", label: "Position X", min: -12, max: 12, step: 0.05 },
      { path: "model.y", label: "Position Y", min: -8, max: 8, step: 0.05 },
      { path: "model.z", label: "Position Z", min: -20, max: 20, step: 0.05 },
      { path: "model.scale", label: "Uniform scale", min: 0.05, max: 4, step: 0.01 },
    ],
  },
  {
    key: "water",
    title: "Water meshes",
    fields: [
      { path: "water.x", label: "Offset X", min: -8, max: 8, step: 0.02 },
      { path: "water.y", label: "Offset Y", min: -4, max: 4, step: 0.02 },
      { path: "water.z", label: "Offset Z", min: -8, max: 8, step: 0.02 },
      { path: "water.scale", label: "Uniform scale", min: 0.05, max: 4, step: 0.01 },
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
  return value.toFixed(3);
}

function parseFieldValue(field, rawValue) {
  const parsed = Number.parseFloat(rawValue);
  if (Number.isNaN(parsed)) {
    return getValue(DEFAULT_TEST_SCENE_CONTROLS, field.path);
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

export default function TestSceneControls() {
  const [collapsed, setCollapsed] = useState(false);
  const controls = useTestSceneControlsStore((s) => s.controls);
  const resetControls = useTestSceneControlsStore((s) => s.resetControls);
  const setControl = useTestSceneControlsStore((s) => s.setControl);

  const handleChange = (field, rawValue) => {
    setControl(field.path, parseFieldValue(field, rawValue));
  };

  return (
    <aside
      data-test-scene-controls="true"
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
            /test
          </div>
          <div style={{ fontSize: 18, lineHeight: 1.1 }}>Scene 3D</div>
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
            onClick={() => setCollapsed((v) => !v)}
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
        SECTIONS.map((section) => (
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
            <div style={{ display: "grid", gap: 10, padding: "4px 0 8px" }}>
              {section.fields.map((field) => {
                const value = getValue(controls, field.path);
                return (
                  <label key={field.path} style={{ display: "grid", gap: 4, fontSize: 12 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 8,
                        color: "rgba(246, 240, 233, 0.82)",
                      }}
                    >
                      <span>{field.label}</span>
                      <span style={{ opacity: 0.65 }}>{formatValue(value, field.step)}</span>
                    </div>
                    <NumberField field={field} value={value} onChange={handleChange} />
                  </label>
                );
              })}
            </div>
          </details>
        ))}
    </aside>
  );
}
