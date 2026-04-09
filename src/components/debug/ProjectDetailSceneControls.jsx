import React, { useState } from "react";
import {
  DEFAULT_PROJECT_DETAIL_SCENE_CONTROLS,
  useProjectDetailSceneControlsStore,
} from "../../store/projectDetailSceneControls.js";

const CONTROL_SECTIONS = [
  {
    key: "renderer",
    title: "Renderer",
    fields: [{ path: "renderer.exposure", label: "Exposure", min: 0.4, max: 2, step: 0.01 }],
  },
  {
    key: "effects",
    title: "Post FX",
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
    key: "projectBg",
    title: "Project BG",
    fields: [
      { path: "projectBg.x", label: "X", min: -10, max: 10, step: 0.01 },
      { path: "projectBg.y", label: "Y", min: -10, max: 10, step: 0.01 },
      { path: "projectBg.z", label: "Z", min: -10, max: 10, step: 0.01 },
      { path: "projectBg.scale", label: "Scale", min: 0.2, max: 2.5, step: 0.01 },
      {
        path: "projectBg.rotationZ",
        label: "Rotate Z",
        min: -180,
        max: 180,
        step: 1,
        integer: true,
      },
      { path: "projectBg.cameraFov", label: "Camera FOV", min: 12, max: 70, step: 0.1 },
      { path: "projectBg.coverScale", label: "Cover Scale", min: 0.7, max: 1.5, step: 0.01 },
      {
        path: "projectBg.cameraZOffset",
        label: "Camera Z Offset",
        min: -8,
        max: 8,
        step: 0.01,
      },
      { path: "projectBg.scrollDrift", label: "Scroll Drift", min: 0, max: 1, step: 0.01 },
      { path: "projectBg.scrollLag", label: "Scroll Lag", min: 0.2, max: 8, step: 0.1 },
    ],
  },
  {
    key: "trail",
    title: "Trail",
    fields: [
      { path: "trail.size", label: "Texture Size", min: 128, max: 1024, step: 64, integer: true },
      { path: "trail.fadeAlpha", label: "Fade", min: 0, max: 0.2, step: 0.001 },
      { path: "trail.blurPx", label: "Blur", min: 0, max: 24, step: 0.1 },
      { path: "trail.radiusFactor", label: "Radius", min: 0.02, max: 0.4, step: 0.001 },
      {
        path: "trail.gradientScale",
        label: "Gradient Scale",
        min: 0.5,
        max: 6,
        step: 0.01,
      },
      { path: "trail.smudgeStrength", label: "Smudge", min: 0, max: 1.25, step: 0.01 },
      { path: "trail.smudgeBlurPx", label: "Smudge Blur", min: 0, max: 6, step: 0.05 },
      { path: "trail.roughness", label: "Edge Roughness", min: 0, max: 1, step: 0.01 },
      { path: "trail.stampAlpha", label: "Stamp Alpha", min: 0.1, max: 1, step: 0.01 },
    ],
  },
  {
    key: "hover",
    title: "Hover Light",
    fields: [
      { path: "hover.lightStrength", label: "Light", min: 0, max: 1, step: 0.01 },
      { path: "hover.shadowStrength", label: "Shadow", min: 0, max: 1, step: 0.01 },
      { path: "hover.shadowSoftness", label: "Softness", min: 0.05, max: 1, step: 0.01 },
    ],
  },
  {
    key: "projectBgFallback",
    title: "Project BG Fallback",
    fields: [
      { path: "projectBgFallback.pointerLerp", label: "Pointer Lerp", min: 1, max: 16, step: 0.1 },
      {
        path: "projectBgFallback.swirlStrength",
        label: "Swirl Strength",
        min: 0,
        max: 0.4,
        step: 0.001,
      },
      {
        path: "projectBgFallback.swirlDensity",
        label: "Swirl Density",
        min: 0.2,
        max: 10,
        step: 0.01,
      },
      { path: "projectBgFallback.distortion", label: "Distortion", min: 0, max: 0.5, step: 0.001 },
      {
        path: "projectBgFallback.pointerInfluence",
        label: "Pointer Influence",
        min: 0,
        max: 0.5,
        step: 0.001,
      },
      {
        path: "projectBgFallback.fadeStrength",
        label: "Fade Strength",
        min: 0,
        max: 1,
        step: 0.001,
      },
      {
        path: "projectBgFallback.largeNoiseScale",
        label: "Large Noise",
        min: 0.2,
        max: 8,
        step: 0.01,
      },
      {
        path: "projectBgFallback.mediumNoiseScale",
        label: "Medium Noise",
        min: 0.2,
        max: 12,
        step: 0.01,
      },
      {
        path: "projectBgFallback.fineNoiseScale",
        label: "Fine Noise",
        min: 0.2,
        max: 18,
        step: 0.01,
      },
      { path: "projectBgFallback.colorOuter", label: "Outer", type: "color" },
      { path: "projectBgFallback.colorMid", label: "Mid", type: "color" },
      { path: "projectBgFallback.colorCore", label: "Core", type: "color" },
      { path: "projectBgFallback.colorShade", label: "Shade", type: "color" },
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
    return getValue(DEFAULT_PROJECT_DETAIL_SCENE_CONTROLS, field.path);
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

export default function ProjectDetailSceneControls() {
  const [collapsed, setCollapsed] = useState(false);
  const controls = useProjectDetailSceneControlsStore((state) => state.controls);
  const resetControls = useProjectDetailSceneControlsStore((state) => state.resetControls);
  const setControl = useProjectDetailSceneControlsStore((state) => state.setControl);

  const handleChange = (field, rawValue) => {
    setControl(field.path, parseFieldValue(field, rawValue));
  };

  return (
    <aside
      data-lenis-prevent="true"
      onWheelCapture={(event) => event.stopPropagation()}
      onTouchMoveCapture={(event) => event.stopPropagation()}
      style={{
        position: "fixed",
        top: 88,
        right: 16,
        zIndex: 30,
        width: "min(360px, calc(100vw - 24px))",
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
            Film Scene
          </div>
          <div style={{ fontSize: 18, lineHeight: 1.1 }}>Project BG Controls</div>
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
