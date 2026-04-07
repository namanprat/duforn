import React from "react";
import CanvasSurface from "./CanvasSurface.jsx";
import { createRendererAlpha, getRendererType } from "./createWebGPURenderer.js";
import { logWebGPU } from "../../lib/webgpu/debugWebGPU.js";
import SceneCompositor from "./SceneCompositor.jsx";

/**
 * The single, persistent R3F canvas for the entire app.
 *
 * Mounted exactly once at the layout level. Never keyed or remounted across
 * route changes. All page scenes live inside it as <SceneSlot> children of the
 * <SceneCompositor>, which owns the render loop and drives the slide-up wipe
 * between slots.
 *
 * Renderer is WebGPU-first via createRendererAlpha (with WebGL fallback), so
 * the compositor's TSL NodeMaterial path stays consistent with the rest of the
 * project (Effects.jsx, ProjectBg.jsx).
 */
export default function PersistentCanvas({ children }) {
  return (
    <CanvasSurface
      id="background"
      gl={createRendererAlpha}
      shadows
      onCreated={({ gl }) => {
        logWebGPU("PersistentCanvas", "Canvas created", {
          rendererType: getRendererType(gl),
        });
      }}
    >
      <SceneCompositor>{children}</SceneCompositor>
    </CanvasSurface>
  );
}
