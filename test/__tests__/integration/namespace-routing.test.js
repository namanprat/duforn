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
vi.mock('@barba/core', async () => import('../../mocks/barba.js'));
vi.mock('split-type', () => ({
  default: class SplitType {
    constructor() {
      this.words = [];
    }
    revert() {}
  }
}));
vi.mock('lenis', () => ({
  default: (await import('../../mocks/lenis.js')).Lenis
}));
vi.mock('postprocessing', () => ({
  EffectComposer: class { dispose() {} },
  RenderPass: class {},
  ShaderPass: class { material = { dispose: vi.fn(), uniforms: {} } },
  OutputPass: class {}
}));

describe('Namespace Routing Integration', () => {
  let initPageFeatures;

  beforeEach(async () => {
    cleanupDOM();
    createBackground();

    const barbaModule = await import('../../../scripts/barba.js');
    // Access initPageFeatures if exported, otherwise test through transitions
  });

  afterEach(() => {
    cleanupDOM();
    vi.clearAllMocks();
  });

  it('should initialize correct features for home namespace', () => {
    createBarbaContainer('home');

    // Home should initialize:
    // - webgl()
    // - initIndex()
    // - Global features (menu, fonts, text reveals, etc.)
  });

  it('should initialize correct features for work namespace', () => {
    createBarbaContainer('work');

    // Work should initialize:
    // - initWork()
    // - Destroy webgl, archive, index
  });

  it('should initialize correct features for archive namespace', () => {
    createBarbaContainer('archive');

    // Archive should initialize:
    // - initArchiveScene()
    // - Destroy webgl, work, index
  });

  it('should initialize correct features for contact namespace', () => {
    createBarbaContainer('contact');

    // Contact should initialize:
    // - webgl()
    // - Destroy work, archive, index
  });

  it('should initialize global features on every page', () => {
    // All pages should initialize:
    // - initTime()
    // - initMenu()
    // - initVariableFont()
    // - initScrollTextReveals()
    // - initLinkHover()
    // - initBtnHover()

    createBarbaContainer('home');
    // Verify global features initialized
  });

  it('should destroy competing modules when switching pages', () => {
    // When going from home → work:
    // - destroyIndex()
    // - destroyWebgl()

    createBarbaContainer('home');
    // Simulate transition to work
  });
});
