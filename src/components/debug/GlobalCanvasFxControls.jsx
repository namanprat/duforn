import React, { useState } from "react";
import {
  DEFAULT_GLOBAL_CANVAS_FX_CONTROLS,
  useGlobalCanvasFxControlsStore,
} from "../../store/globalCanvasFxControls.js";

function getValue(source, path) {
  return path.split(".").reduce((current, key) => current?.[key], source);
}

function parseValue(path, rawValue) {
  if (path.endsWith(".enabled")) return Boolean(rawValue);
  if (path.endsWith(".monochrome")) return Boolean(rawValue);
  if (path.endsWith(".blendMode")) return String(rawValue);
  if (path.endsWith(".tint")) return String(rawValue);
  const parsed = Number.parseFloat(rawValue);
  if (Number.isNaN(parsed)) return getValue(DEFAULT_GLOBAL_CANVAS_FX_CONTROLS, path);
  return parsed;
}

export default function GlobalCanvasFxControls() {
  const [collapsed, setCollapsed] = useState(true);
  const controls = useGlobalCanvasFxControlsStore((s) => s.controls);
  const setControl = useGlobalCanvasFxControlsStore((s) => s.setControl);
  const resetControls = useGlobalCanvasFxControlsStore((s) => s.resetControls);

  const handleChange = (path, rawValue) => {
    setControl(path, parseValue(path, rawValue));
  };

  return (
    <aside
      data-lenis-prevent="true"
      onWheelCapture={(event) => event.stopPropagation()}
      onTouchMoveCapture={(event) => event.stopPropagation()}
      style={{
        position: "fixed",
        top: 88,
        left: 16,
        zIndex: 30,
        width: "min(320px, calc(100vw - 24px))",
        maxHeight: "calc(100vh - 104px)",
        overflow: "auto",
        overscrollBehavior: "contain",
        WebkitOverflowScrolling: "touch",
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
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}
      >
        <div>
          <div style={{ fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase" }}>
            Global Canvas
          </div>
          <div style={{ fontSize: 18, lineHeight: 1.1 }}>Grain</div>
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

      {!collapsed ? (
        <div style={{ display: "grid", gap: 10, paddingTop: 12 }}>
          <label
            style={{
              display: "block",
              padding: 10,
              borderRadius: 12,
              background: "rgba(255,255,255,0.04)",
            }}
          >
            <div
              style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 8 }}
            >
              <span style={{ fontSize: 13 }}>Enabled</span>
              <span style={{ fontSize: 12, color: "rgba(246, 240, 233, 0.64)" }}>
                {String(controls.grain.enabled)}
              </span>
            </div>
            <input
              type="checkbox"
              checked={controls.grain.enabled}
              onChange={(e) => handleChange("grain.enabled", e.target.checked)}
            />
          </label>

          {[
            { path: "grain.opacity", label: "Opacity", min: 0, max: 1, step: 0.01 },
            { path: "grain.intensity", label: "Amount", min: 0, max: 0.35, step: 0.001 },
            { path: "grain.scale", label: "Scale", min: 0.6, max: 10, step: 0.01 },
            { path: "grain.speed", label: "Drift Speed", min: 0, max: 2.5, step: 0.01 },
            { path: "grain.fps", label: "Randomize FPS", min: 6, max: 60, step: 1 },
            { path: "grain.contrast", label: "Contrast", min: 0.5, max: 2.5, step: 0.01 },
          ].map((field) => {
            const value = getValue(controls, field.path);
            return (
              <label
                key={field.path}
                style={{
                  display: "block",
                  padding: 10,
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.04)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    marginBottom: 8,
                  }}
                >
                  <span style={{ fontSize: 13 }}>{field.label}</span>
                  <span style={{ fontSize: 12, color: "rgba(246, 240, 233, 0.64)" }}>
                    {typeof value === "number"
                      ? value.toFixed(field.step >= 0.01 ? 2 : 3)
                      : String(value)}
                  </span>
                </div>
                <input
                  type="range"
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  value={value}
                  onChange={(e) => handleChange(field.path, e.target.value)}
                  style={{ width: "100%" }}
                />
              </label>
            );
          })}

          <label
            style={{
              display: "block",
              padding: 10,
              borderRadius: 12,
              background: "rgba(255,255,255,0.04)",
            }}
          >
            <div
              style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 8 }}
            >
              <span style={{ fontSize: 13 }}>Monochrome</span>
              <span style={{ fontSize: 12, color: "rgba(246, 240, 233, 0.64)" }}>
                {String(controls.grain.monochrome)}
              </span>
            </div>
            <input
              type="checkbox"
              checked={controls.grain.monochrome}
              onChange={(e) => handleChange("grain.monochrome", e.target.checked)}
            />
          </label>

          <label
            style={{
              display: "block",
              padding: 10,
              borderRadius: 12,
              background: "rgba(255,255,255,0.04)",
            }}
          >
            <div
              style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 8 }}
            >
              <span style={{ fontSize: 13 }}>Tint</span>
              <span style={{ fontSize: 12, color: "rgba(246, 240, 233, 0.64)" }}>
                {controls.grain.tint}
              </span>
            </div>
            <input
              type="color"
              value={controls.grain.tint}
              onChange={(e) => handleChange("grain.tint", e.target.value)}
              style={{
                width: "100%",
                height: 36,
                border: "none",
                background: "transparent",
                padding: 0,
              }}
              disabled={controls.grain.monochrome}
            />
          </label>

          <label
            style={{
              display: "block",
              padding: 10,
              borderRadius: 12,
              background: "rgba(255,255,255,0.04)",
            }}
          >
            <div
              style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 8 }}
            >
              <span style={{ fontSize: 13 }}>Blend Mode</span>
              <span style={{ fontSize: 12, color: "rgba(246, 240, 233, 0.64)" }}>
                {controls.grain.blendMode}
              </span>
            </div>
            <select
              value={controls.grain.blendMode}
              onChange={(e) => handleChange("grain.blendMode", e.target.value)}
              style={{
                width: "100%",
                border: "1px solid rgba(255, 255, 255, 0.14)",
                background: "rgba(14, 14, 14, 0.86)",
                color: "#f6f0e9",
                borderRadius: 8,
                padding: "8px 10px",
              }}
            >
              <option value="overlay">overlay</option>
              <option value="soft-light">soft-light</option>
              <option value="hard-light">hard-light</option>
              <option value="multiply">multiply</option>
              <option value="screen">screen</option>
              <option value="difference">difference</option>
            </select>
          </label>
        </div>
      ) : null}
    </aside>
  );
}
