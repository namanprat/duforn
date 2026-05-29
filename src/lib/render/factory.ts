// @ts-nocheck
import { SRGBColorSpace, WebGLRenderer } from "three";
import { logWebGPU, logWebGPUOnce } from "../gpu/debug";
import { getClampedPixelRatio } from "./pixelRatio";
import { getStableViewportSize } from "../viewport/stableViewport";

let webgpuSupportPromise;
const ENABLE_WEBGPU = true;

async function canUseWebGPU() {
  if (!ENABLE_WEBGPU) return false;
  if (webgpuSupportPromise) return webgpuSupportPromise;

  webgpuSupportPromise = (async () => {
    if (typeof navigator === "undefined" || !navigator.gpu) return false;
    if (typeof GPUCanvasContext === "undefined") return false;

    try {
      const adapter = await navigator.gpu.requestAdapter();
      logWebGPUOnce("adapter-check", "renderer", "WebGPU adapter probe completed", {
        adapterAvailable: Boolean(adapter),
      });
      return Boolean(adapter);
    } catch {
      return false;
    }
  })();

  return webgpuSupportPromise;
}

async function createWebGPUDevice() {
  if (typeof navigator === "undefined" || !navigator.gpu) return null;
  const adapter = await navigator.gpu.requestAdapter({
    powerPreference: "high-performance",
  });
  if (!adapter) return null;

  try {
    return await adapter.requestDevice({
      requiredFeatures: [],
      requiredLimits: {},
    });
  } catch {
    return null;
  }
}

function configureRenderer(renderer, { alpha }) {
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.setPixelRatio(getClampedPixelRatio(2));
  const { width, height } = getStableViewportSize();
  renderer.setSize(width, height, false);

  if ("setClearAlpha" in renderer) {
    renderer.setClearAlpha(alpha ? 0 : 1);
  }
}

function createWebGLRenderer(defaultProps, { alpha }) {
  const renderer = new WebGLRenderer({
    canvas: defaultProps.canvas,
    alpha,
    powerPreference: "high-performance",
    preserveDrawingBuffer: true,
  });

  renderer.__rendererType = "webgl";
  configureRenderer(renderer, { alpha });
  logWebGPU("renderer", "Created WebGL renderer", {
    alpha,
    canvas: defaultProps.canvas?.id || "anonymous-canvas",
  });
  return renderer;
}

async function createBestRenderer(defaultProps, { alpha = false } = {}) {
  if (await canUseWebGPU()) {
    try {
      const device = await createWebGPUDevice();
      if (!device) {
        logWebGPU("renderer", "WebGPU device request failed, falling back to WebGL", {
          alpha,
        });
        return createWebGLRenderer(defaultProps, { alpha });
      }

      const { WebGPURenderer } = await import("three/webgpu");
      const renderer = new WebGPURenderer({
        canvas: defaultProps.canvas,
        alpha,
        device,
      });

      await renderer.init();
      renderer.__rendererType = "webgpu";
      configureRenderer(renderer, { alpha });
      logWebGPU("renderer", "Created WebGPU renderer", {
        alpha,
        canvas: defaultProps.canvas?.id || "anonymous-canvas",
      });
      return renderer;
    } catch (error) {
      logWebGPU("renderer", "WebGPU init failed, falling back to WebGL", {
        alpha,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  logWebGPU("renderer", "Using WebGL fallback renderer", {
    alpha,
    reason: "WebGPU unavailable or initialization failed",
  });
  return createWebGLRenderer(defaultProps, { alpha });
}

export function createRendererAlpha(defaultProps) {
  return createBestRenderer(defaultProps, { alpha: true });
}

export function createRendererOpaque(defaultProps) {
  return createBestRenderer(defaultProps, { alpha: false });
}
