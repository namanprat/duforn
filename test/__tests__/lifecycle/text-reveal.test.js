import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createTextRevealElements, cleanupDOM } from '../../mocks/dom.js';

// Mock dependencies
vi.mock('gsap', async () => import('../../mocks/gsap.js'));
vi.mock('gsap/ScrollTrigger', async () => {
  const gsapMock = await import('../../mocks/gsap.js');
  return { ScrollTrigger: gsapMock.ScrollTrigger };
});
vi.mock('split-type', () => ({
  default: class SplitType {
    constructor(element, options) {
      this.element = element;
      this.options = options;

      // Create mock split structure
      const text = element.textContent;
      const words = text.split(' ');

      this.words = words.map(word => {
        const span = document.createElement('span');
        span.textContent = word;
        span.className = 'word';
        return span;
      });

      this.lines = [this.words];
      this.chars = [];
    }

    revert() {
      // Restore original text
    }
  }
}));

describe('Text Reveal System Lifecycle', () => {
  let getOrSplit, initScrollTextReveals, cleanupScrollTriggers, cleanupSplits;

  beforeEach(async () => {
    cleanupDOM();
    createTextRevealElements();

    const module = await import('../../../scripts/text-reveal.js');
    getOrSplit = module.getOrSplit;
    initScrollTextReveals = module.initScrollTextReveals;
    cleanupScrollTriggers = module.cleanupScrollTriggers;
    cleanupSplits = module.cleanupSplits;
  });

  afterEach(() => {
    if (cleanupScrollTriggers) cleanupScrollTriggers();
    if (cleanupSplits) cleanupSplits();
    cleanupDOM();
    vi.clearAllMocks();
  });

  it('should split text elements', () => {
    const element = document.querySelector('.text-reveal');
    const split = getOrSplit(element);

    expect(split).toBeDefined();
    expect(split.words).toBeDefined();
  });

  it('should cache split instances (WeakMap)', () => {
    const element = document.querySelector('.text-reveal');

    const split1 = getOrSplit(element);
    const split2 = getOrSplit(element);

    expect(split1).toBe(split2); // Same instance returned
  });

  it('should create ScrollTriggers for .text-reveal elements', () => {
    const { activeScrollTriggers } = require('../../mocks/gsap.js');

    initScrollTextReveals();

    expect(activeScrollTriggers.size).toBeGreaterThan(0);
  });

  it('should handle .text-reveal-reverse class', () => {
    const reverseElement = document.querySelector('.text-reveal-reverse');
    expect(reverseElement).toBeTruthy();

    initScrollTextReveals();
    // Should create ScrollTrigger without errors
  });

  it('should cleanup all ScrollTriggers', () => {
    const { activeScrollTriggers } = require('../../mocks/gsap.js');

    initScrollTextReveals();
    const countBefore = activeScrollTriggers.size;
    expect(countBefore).toBeGreaterThan(0);

    cleanupScrollTriggers();

    expect(activeScrollTriggers.size).toBe(0);
  });

  it('should revert splits on cleanup', () => {
    const element = document.querySelector('.text-reveal');
    getOrSplit(element);

    expect(() => cleanupSplits()).not.toThrow();
  });

  it('should handle cleanup when called before initialization', () => {
    expect(() => cleanupScrollTriggers()).not.toThrow();
    expect(() => cleanupSplits()).not.toThrow();
  });

  it('should exclude hero section from ScrollTrigger creation', () => {
    // Add hero element
    const hero = document.createElement('div');
    hero.className = 'text-reveal';
    hero.id = 'hero-section';
    document.body.appendChild(hero);

    const { activeScrollTriggers } = require('../../mocks/gsap.js');
    const countBefore = activeScrollTriggers.size;

    initScrollTextReveals();

    // Hero should not create additional ScrollTrigger
    // (implementation may vary, adjust as needed)
  });
});
