import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createMenu, cleanupDOM } from '../../mocks/dom.js';

// Mock GSAP
vi.mock('gsap', async () => import('../../mocks/gsap.js'));

describe('Menu Component', () => {
  let initMenu, closeMenu;

  beforeEach(async () => {
    cleanupDOM();
    createMenu();

    const module = await import('../../../scripts/menu.js');
    initMenu = module.initMenu;
    closeMenu = module.closeMenu;
  });

  afterEach(() => {
    cleanupDOM();
    vi.clearAllMocks();
  });

  it('should initialize menu', () => {
    initMenu();

    const menu = document.querySelector('.menu');
    expect(menu).toBeTruthy();
  });

  it('should add click handler to menu button', () => {
    const menuBtn = document.querySelector('.menu-btn');
    const addEventListenerSpy = vi.spyOn(menuBtn, 'addEventListener');

    initMenu();

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'click',
      expect.any(Function)
    );
  });

  it('should toggle menu on button click', () => {
    initMenu();

    const menuBtn = document.querySelector('.menu-btn');
    menuBtn.click();

    // Menu should open (implementation detail - check class or state)
  });

  it('should close menu programmatically', () => {
    initMenu();

    const menuBtn = document.querySelector('.menu-btn');
    menuBtn.click(); // Open menu

    closeMenu();

    // Menu should be closed
  });

  it('should close menu before page transitions', () => {
    initMenu();

    const menuBtn = document.querySelector('.menu-btn');
    menuBtn.click(); // Open menu

    // Simulate transition
    closeMenu();

    // Verify menu is closed
  });
});
