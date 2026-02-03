import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createLeakDetector } from '../../helpers/memory-leak-detector.js';

describe('Memory Leak Detection', () => {
  let detector;

  beforeEach(() => {
    detector = createLeakDetector();
    detector.start();
  });

  afterEach(() => {
    detector.stop();
  });

  it('should detect RAF leaks', () => {
    const id = requestAnimationFrame(() => {});

    expect(detector.hasRAFLeaks()).toBe(true);
    expect(detector.getRAFCount()).toBe(1);

    cancelAnimationFrame(id);

    expect(detector.hasRAFLeaks()).toBe(false);
  });

  it('should detect event listener leaks', () => {
    const handler = () => {};
    window.addEventListener('resize', handler);

    expect(detector.hasListenerLeaks()).toBe(true);
    expect(detector.getListenerCount()).toBeGreaterThan(0);

    window.removeEventListener('resize', handler);

    expect(detector.hasListenerLeaks()).toBe(false);
  });

  it('should provide detailed listener information', () => {
    const handler = () => {};
    window.addEventListener('resize', handler);

    const details = detector.getListenerDetails();
    expect(details['Window:resize']).toBe(1);
  });

  it('should track multiple RAF IDs', () => {
    const id1 = requestAnimationFrame(() => {});
    const id2 = requestAnimationFrame(() => {});
    const id3 = requestAnimationFrame(() => {});

    expect(detector.getRAFCount()).toBe(3);

    cancelAnimationFrame(id1);
    cancelAnimationFrame(id2);
    cancelAnimationFrame(id3);

    expect(detector.getRAFCount()).toBe(0);
  });

  it('should track multiple listeners', () => {
    const handler1 = () => {};
    const handler2 = () => {};

    window.addEventListener('resize', handler1);
    window.addEventListener('scroll', handler2);

    expect(detector.getListenerCount()).toBe(2);

    window.removeEventListener('resize', handler1);
    window.removeEventListener('scroll', handler2);

    expect(detector.getListenerCount()).toBe(0);
  });

  it('should assert no leaks when clean', () => {
    expect(detector.assertNoLeaks()).toBe(true);
  });

  it('should fail assertion when leaks exist', () => {
    requestAnimationFrame(() => {});

    expect(detector.assertNoLeaks()).toBe(false);
  });

  it('should reset tracking', () => {
    requestAnimationFrame(() => {});
    window.addEventListener('resize', () => {});

    detector.reset();

    // Reset clears tracking but doesn't cancel/remove
    expect(detector.getRAFCount()).toBe(0);
    expect(detector.getListenerCount()).toBe(0);
  });
});
