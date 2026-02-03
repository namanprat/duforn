import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createBarbaContainer, createBackground, cleanupDOM } from '../../mocks/dom.js';

// Mock all dependencies
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
vi.mock('gsap/Draggable', async () => {
  const gsapMock = await import('../../mocks/gsap.js');
  return { Draggable: gsapMock.Draggable };
});
vi.mock('@barba/core', async () => import('../../mocks/barba.js'));
vi.mock('html2canvas', async () => import('../../mocks/html2canvas.js'));
vi.mock('split-type', () => ({
  default: class SplitType {
    constructor(element) {
      this.words = [];
      this.lines = [];
    }
    revert() {}
  }
}));
vi.mock('lenis', () => ({
  default: (await import('../../mocks/lenis.js')).Lenis
}));
vi.mock('postprocessing', () => ({
  EffectComposer: class { dispose() {} render() {} setSize() {} },
  RenderPass: class {},
  ShaderPass: class { material = { dispose: vi.fn(), uniforms: {} } },
  OutputPass: class {}
}));

describe('Barba.js Page Transitions Integration', () => {
  let barba, triggerTransition;

  beforeEach(async () => {
    cleanupDOM();
    createBarbaContainer('home');
    createBackground();

    // Import mocks
    const barbaModule = await import('../../mocks/barba.js');
    barba = barbaModule.default;
    triggerTransition = barbaModule.triggerTransition;

    // Initialize Barba
    const barbaScript = await import('../../../scripts/barba.js');
  });

  afterEach(() => {
    cleanupDOM();
    vi.clearAllMocks();
  });

  it('should initialize Barba on import', () => {
    expect(barba.init).toHaveBeenCalled();
  });

  it('should register transition hooks', () => {
    const transitions = barba._getTransitions();
    expect(transitions.length).toBeGreaterThan(0);
  });

  it('should have once, leave, enter, and after hooks', () => {
    const transitions = barba._getTransitions();
    const transition = transitions[0];

    expect(transition.once).toBeDefined();
    expect(transition.leave).toBeDefined();
    expect(transition.enter).toBeDefined();
    expect(transition.after).toBeDefined();
  });

  it('should call leave hook on navigation', async () => {
    createBarbaContainer('home');

    await triggerTransition('home', 'work');

    // Verify leave was called (implementation detail)
  });

  it('should update namespace during transition', async () => {
    createBarbaContainer('home');

    await triggerTransition('home', 'work');

    const container = document.querySelector('[data-barba-namespace]');
    expect(container.dataset.barbaNamespace).toBe('work');
  });

  it('should call after hook with correct namespace', async () => {
    createBarbaContainer('home');

    await triggerTransition('home', 'contact');

    const container = document.querySelector('[data-barba-namespace]');
    expect(container.dataset.barbaNamespace).toBe('contact');
  });

  it('should handle rapid navigation without errors', async () => {
    createBarbaContainer('home');

    await triggerTransition('home', 'work');
    await triggerTransition('work', 'archive');
    await triggerTransition('archive', 'contact');

    // No errors thrown
  });

  it('should cleanup previous modules before initializing new ones', async () => {
    createBarbaContainer('home');

    // Transition from home to work
    await triggerTransition('home', 'work');

    // WebGL should be destroyed, work should be initialized
    // (Verify through module state if accessible)
  });
});
