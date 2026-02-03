import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createWorkPageElements, cleanupDOM } from '../../mocks/dom.js';

// Mock dependencies
vi.mock('gsap', async () => import('../../mocks/gsap.js'));
vi.mock('gsap/Draggable', async () => {
  const gsapMock = await import('../../mocks/gsap.js');
  return { Draggable: gsapMock.Draggable };
});

// Mock work items data
vi.mock('../../../data/work-items.js', () => ({
  workItems: [
    { id: 1, title: 'Project 1', image: '/work/work-1.jpg' },
    { id: 2, title: 'Project 2', image: '/work/work-2.jpg' },
    { id: 3, title: 'Project 3', image: '/work/work-3.jpg' },
  ]
}));

describe('Work Page Lifecycle', () => {
  let initWork, destroyWork;

  beforeEach(async () => {
    cleanupDOM();
    createWorkPageElements();

    const module = await import('../../../scripts/work.js');
    initWork = module.initWork;
    destroyWork = module.destroyWork;
  });

  afterEach(() => {
    if (destroyWork) {
      destroyWork();
    }
    cleanupDOM();
    vi.clearAllMocks();
  });

  it('should initialize work slider', () => {
    initWork();

    const slider = document.getElementById('work-slider');
    expect(slider).toBeTruthy();
  });

  it('should initialize thumbnail wheel', () => {
    initWork();

    const wheel = document.getElementById('thumbnail-wheel');
    expect(wheel).toBeTruthy();
  });

  it('should start animation loop', () => {
    const rafSpy = vi.spyOn(global, 'requestAnimationFrame');

    initWork();

    expect(rafSpy).toHaveBeenCalled();
  });

  it('should add scroll handler', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

    initWork();

    const scrollCalls = addEventListenerSpy.mock.calls.filter(
      call => call[0] === 'scroll'
    );
    expect(scrollCalls.length).toBeGreaterThan(0);
  });

  it('should add resize handler', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

    initWork();

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'resize',
      expect.any(Function)
    );
  });

  it('should cancel RAF on destroy', () => {
    const cafSpy = vi.spyOn(global, 'cancelAnimationFrame');

    initWork();
    destroyWork();

    expect(cafSpy).toHaveBeenCalled();
  });

  it('should remove event listeners on destroy', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    initWork();
    destroyWork();

    expect(removeEventListenerSpy).toHaveBeenCalled();
  });

  it('should clear DOM content on destroy', () => {
    initWork();

    const slider = document.getElementById('work-slider');
    const wheel = document.getElementById('thumbnail-wheel');

    // Assume content is added
    slider.innerHTML = '<div>Content</div>';
    wheel.innerHTML = '<div>Content</div>';

    destroyWork();

    expect(slider.innerHTML).toBe('');
    expect(wheel.innerHTML).toBe('');
  });

  it('should be idempotent (safe to call destroy twice)', () => {
    initWork();
    destroyWork();

    expect(() => destroyWork()).not.toThrow();
  });

  it('should handle multiple init/destroy cycles', () => {
    initWork();
    destroyWork();

    initWork();
    destroyWork();

    // No errors thrown
  });

  it('should cleanup before re-initialization', () => {
    initWork();
    initWork(); // Calls cleanupWork internally

    // Should not cause errors
  });
});
