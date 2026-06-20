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

/** Default WebGPU device caps; home.hdr is 10000×5000 (~400 MB staging upload). */
const DEFAULT_MAX_TEXTURE_2D = 8192;
const DEFAULT_MAX_BUFFER_SIZE = 268435456;

function buildRequiredDeviceLimits(adapter) {
  const requiredLimits = {};
  const adapterLimits = adapter.limits;

  // Large HDR env maps (e.g. /home.hdr) need raised texture + staging buffer limits.
  if (adapterLimits.maxTextureDimension2D > DEFAULT_MAX_TEXTURE_2D) {
    requiredLimits.maxTextureDimension2D = adapterLimits.maxTextureDimension2D;
  }
  if (adapterLimits.maxBufferSize > DEFAULT_MAX_BUFFER_SIZE) {
    requiredLimits.maxBufferSize = adapterLimits.maxBufferSize;
  }

  return requiredLimits;
}

async function createWebGPUDevice() {
  if (typeof navigator === "undefined" || !navigator.gpu) return null;
  const adapter = await navigator.gpu.requestAdapter({
    powerPreference: "high-performance",
  });
  if (!adapter) return null;

  const requiredFeatures = [];
  if (adapter.features.has("float32-filterable")) {
    requiredFeatures.push("float32-filterable");
  }

  const requiredLimits = buildRequiredDeviceLimits(adapter);

  try {
    return await adapter.requestDevice({
      requiredFeatures,
      requiredLimits,
    });
  } catch (error) {
    logWebGPU("renderer", "WebGPU device request with raised limits failed", {
      requiredLimits,
      error: error instanceof Error ? error.message : String(error),
    });
    try {
      return await adapter.requestDevice({
        requiredFeatures,
        requiredLimits: {},
      });
    } catch {
      return null;
    }
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

export function createRendererOpaque(defaultProps) {
  return createBestRenderer(defaultProps, { alpha: false });
}
