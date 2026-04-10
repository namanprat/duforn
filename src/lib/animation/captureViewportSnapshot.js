import { domToCanvas } from "modern-screenshot";

const DEFAULT_MAX_CAPTURE_WIDTH = 1920;

/**
 * Rasterize the viewport (DOM + composited canvases) for use as a burn-transition texture.
 * @param {object} [options]
 * @param {HTMLElement} [options.root]
 * @param {number} [options.maxWidth]
 * @returns {Promise<HTMLCanvasElement>}
 */
export async function captureViewportSnapshot(options = {}) {
  const root = options.root ?? document.body;
  const maxWidth = options.maxWidth ?? DEFAULT_MAX_CAPTURE_WIDTH;

  const vw = Math.max(1, window.innerWidth);
  const scale = Math.min(1, maxWidth / vw);

  return domToCanvas(root, {
    scale,
    maximumCanvasSize: 8192,
    filter(node) {
      if (node instanceof Element && node.hasAttribute("data-archive-burn-exclude")) {
        return false;
      }
      return true;
    },
  });
}
