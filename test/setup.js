import { vi } from 'vitest';

// Track RAF IDs for leak detection
global.rafIds = new Set();
global.originalRAF = global.requestAnimationFrame;
global.originalCAF = global.cancelAnimationFrame;

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((callback) => {
  const id = Math.random();
  global.rafIds.add(id);
  setTimeout(() => callback(performance.now()), 16);
  return id;
});

// Mock cancelAnimationFrame
global.cancelAnimationFrame = vi.fn((id) => {
  global.rafIds.delete(id);
});

// Mock performance
global.performance = global.performance || {};
global.performance.now = global.performance.now || (() => Date.now());

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords() {
    return [];
  }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock canvas context
HTMLCanvasElement.prototype.getContext = vi.fn((type) => {
  if (type === 'webgl' || type === 'webgl2') {
    return {
      canvas: {},
      drawingBufferWidth: 1024,
      drawingBufferHeight: 768,
      getExtension: vi.fn(),
      getParameter: vi.fn(),
      createTexture: vi.fn(),
      createProgram: vi.fn(),
      createShader: vi.fn(),
      shaderSource: vi.fn(),
      compileShader: vi.fn(),
      attachShader: vi.fn(),
      linkProgram: vi.fn(),
      useProgram: vi.fn(),
      getAttribLocation: vi.fn(),
      getUniformLocation: vi.fn(),
      clear: vi.fn(),
      clearColor: vi.fn(),
      enable: vi.fn(),
      disable: vi.fn(),
      viewport: vi.fn(),
      bindTexture: vi.fn(),
      texImage2D: vi.fn(),
      texParameteri: vi.fn(),
      drawArrays: vi.fn(),
      drawElements: vi.fn(),
    };
  }
  return {
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn(),
    putImageData: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    translate: vi.fn(),
    transform: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
  };
});

// Mock Image
global.Image = class {
  constructor() {
    setTimeout(() => {
      if (this.onload) this.onload();
    }, 10);
  }
};

// Reset RAF tracking between tests
beforeEach(() => {
  global.rafIds.clear();
});

afterEach(() => {
  // Check for RAF leaks
  if (global.rafIds.size > 0) {
    console.warn(`RAF leak detected: ${global.rafIds.size} uncancelled animation frames`);
  }
});
