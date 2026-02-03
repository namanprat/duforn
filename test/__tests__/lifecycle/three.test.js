import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createBackground, cleanupDOM } from '../../mocks/dom.js';

// Mock dependencies before imports
vi.mock('three', async () => import('../../mocks/three.js'));
vi.mock('three-stdlib', async () => {
  const threeMock = await import('../../mocks/three.js');
  return { GLTFLoader: threeMock.GLTFLoader };
});
vi.mock('gsap', async () => import('../../mocks/gsap.js'));
vi.mock('gsap/ScrollTrigger', async () => {
  const gsapMock = await import('../../mocks/gsap.js');
  return { ScrollTrigger: gsapMock.ScrollTrigger };
});
vi.mock('postprocessing', () => ({
  EffectComposer: class EffectComposer {
    constructor() {
      this._disposed = false;
    }
    dispose() {
      this._disposed = true;
    }
    render() {}
    setSize() {}
  },
  RenderPass: class RenderPass {},
  ShaderPass: class ShaderPass {
    constructor() {
      this.material = {
        dispose: vi.fn(),
        uniforms: {}
      };
    }
  },
  OutputPass: class OutputPass {}
}));

describe('Three.js WebGL Background Lifecycle', () => {
  let webgl, destroyWebgl;

  beforeEach(async () => {
    cleanupDOM();
    createBackground();

    // Dynamic import after mocks are set up
    const module = await import('../../../scripts/three.js');
    webgl = module.default;
    destroyWebgl = module.destroyWebgl;
  });

  afterEach(() => {
    if (destroyWebgl) {
      destroyWebgl();
    }
    cleanupDOM();
    vi.clearAllMocks();
  });

  it('should initialize only once with isRunning guard', () => {
    webgl();
    webgl(); // Second call should be ignored

    const bg = document.getElementById('background');
    const canvases = bg.querySelectorAll('canvas');
    expect(canvases.length).toBe(1); // Only one canvas created
  });

  it('should create renderer and attach to #background', () => {
    webgl();

    const bg = document.getElementById('background');
    expect(bg.querySelector('canvas')).toBeTruthy();
  });

  it('should start animation loop with RAF', () => {
    const rafSpy = vi.spyOn(global, 'requestAnimationFrame');

    webgl();

    expect(rafSpy).toHaveBeenCalled();
  });

  it('should add resize handler', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

    webgl();

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'resize',
      expect.any(Function)
    );
  });

  it('should add mousemove handler', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

    webgl();

    const mousemoveCalls = addEventListenerSpy.mock.calls.filter(
      call => call[0] === 'mousemove'
    );
    expect(mousemoveCalls.length).toBeGreaterThan(0);
  });

  it('should cancel RAF on destroy', () => {
    const cafSpy = vi.spyOn(global, 'cancelAnimationFrame');

    webgl();
    destroyWebgl();

    expect(cafSpy).toHaveBeenCalled();
  });

  it('should remove event listeners on destroy', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    webgl();
    destroyWebgl();

    // Should remove resize listener
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'resize',
      expect.any(Function)
    );
  });

  it('should remove canvas from DOM on destroy', () => {
    webgl();

    const bg = document.getElementById('background');
    expect(bg.querySelector('canvas')).toBeTruthy();

    destroyWebgl();

    expect(bg.querySelector('canvas')).toBeFalsy();
  });

  it('should be idempotent (safe to call destroy twice)', () => {
    webgl();
    destroyWebgl();

    expect(() => destroyWebgl()).not.toThrow();
  });

  it('should handle multiple init/destroy cycles', () => {
    webgl();
    destroyWebgl();

    webgl();
    destroyWebgl();

    const bg = document.getElementById('background');
    expect(bg.querySelector('canvas')).toBeFalsy();
  });

  it('should not initialize without #background element', () => {
    cleanupDOM(); // Remove background element

    expect(() => webgl()).not.toThrow();
  });
});
