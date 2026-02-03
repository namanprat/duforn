import { vi } from 'vitest';

// Track html2canvas calls
export const html2canvasCalls = [];

// Mock html2canvas function
const html2canvas = vi.fn((element, options = {}) => {
  const call = { element, options };
  html2canvasCalls.push(call);

  return new Promise((resolve) => {
    setTimeout(() => {
      const canvas = document.createElement('canvas');
      canvas.width = options.width || 1024;
      canvas.height = options.height || 768;

      // Add toDataURL if not present
      if (!canvas.toDataURL) {
        canvas.toDataURL = vi.fn(() => 'data:image/png;base64,mock');
      }

      resolve(canvas);
    }, 10);
  });
});

export function resetHtml2canvasTracking() {
  html2canvasCalls.length = 0;
  html2canvas.mockClear();
}

export default html2canvas;
