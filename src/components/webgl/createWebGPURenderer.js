import { ACESFilmicToneMapping, SRGBColorSpace, WebGLRenderer } from "three";
import { logWebGPU, logWebGPUOnce } from "../../lib/webgpu/debugWebGPU.js";

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

function configureRenderer(renderer, { alpha }) {
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight, false);

  if ("shadowMap" in renderer && renderer.shadowMap) {
    renderer.shadowMap.enabled = true;
  }

  if ("setClearAlpha" in renderer) {
    renderer.setClearAlpha(alpha ? 0 : 1);
  }
}

function createWebGLRenderer(defaultProps, { alpha }) {
  const renderer = new WebGLRenderer({
    canvas: defaultProps.canvas,
    antialias: true,
    alpha,
    powerPreference: "high-performance",
  });

  renderer.__rendererType = "webgl";
  configureRenderer(renderer, { alpha });
  logWebGPU("renderer", "Created WebGL renderer", {
    alpha,
    canvas: defaultProps.canvas?.id || "anonymous-canvas",
  });
  return renderer;
}

export function createWebGLRendererAlpha(defaultProps) {
  return createWebGLRenderer(defaultProps, { alpha: true });
}

export function createWebGLRendererOpaque(defaultProps) {
  return createWebGLRenderer(defaultProps, { alpha: false });
}

async function createBestRenderer(defaultProps, { alpha = false } = {}) {
  if (await canUseWebGPU()) {
    try {
      const { WebGPURenderer } = await import("three/webgpu");
      const renderer = new WebGPURenderer({
        canvas: defaultProps.canvas,
        antialias: true,
        alpha,
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

export function getRendererType(renderer) {
  if (!renderer) return "unknown";
  if (renderer.__rendererType) return renderer.__rendererType;
  if (renderer.isWebGPURenderer) return "webgpu";
  if (renderer.isWebGLRenderer) return "webgl";
  return "unknown";
}

export function isWebGPURenderer(renderer) {
  return getRendererType(renderer) === "webgpu";
}

export function isWebGLRenderer(renderer) {
  return getRendererType(renderer) === "webgl";
}

export default function createWebGPURenderer(defaultProps) {
  return createBestRenderer(defaultProps, { alpha: false });
}

export function createWebGPURendererAlpha(defaultProps) {
  return createBestRenderer(defaultProps, { alpha: true });
}

export function createRendererAlpha(defaultProps) {
  return createBestRenderer(defaultProps, { alpha: true });
}

export function createRendererOpaque(defaultProps) {
  return createBestRenderer(defaultProps, { alpha: false });
}
