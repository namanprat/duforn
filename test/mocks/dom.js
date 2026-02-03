// DOM helper utilities for tests

export function createBarbaContainer(namespace = 'home', content = '') {
  const wrapper = document.createElement('div');
  wrapper.setAttribute('data-barba', 'wrapper');
  wrapper.className = 'page-wrap';

  const container = document.createElement('main');
  container.setAttribute('data-barba', 'container');
  container.setAttribute('data-barba-namespace', namespace);
  container.innerHTML = content;

  wrapper.appendChild(container);
  document.body.appendChild(wrapper);

  return { wrapper, container };
}

export function createBackground() {
  const bg = document.createElement('div');
  bg.id = 'background';
  document.body.appendChild(bg);
  return bg;
}

export function createTextRevealElements() {
  const elements = [];

  // Create text-reveal elements
  const reveal = document.createElement('div');
  reveal.className = 'text-reveal';
  reveal.textContent = 'Sample text for reveal animation';
  document.body.appendChild(reveal);
  elements.push(reveal);

  // Create text-reveal-reverse elements
  const revealReverse = document.createElement('div');
  revealReverse.className = 'text-reveal-reverse';
  revealReverse.textContent = 'Sample text for reverse reveal';
  document.body.appendChild(revealReverse);
  elements.push(revealReverse);

  return elements;
}

export function createWorkPageElements() {
  const container = document.createElement('div');
  container.className = 'work-container';

  const slider = document.createElement('div');
  slider.className = 'work-slider';
  slider.id = 'work-slider';
  container.appendChild(slider);

  const wheel = document.createElement('div');
  wheel.className = 'thumbnail-wheel';
  wheel.id = 'thumbnail-wheel';
  container.appendChild(wheel);

  const slideTitle = document.createElement('div');
  slideTitle.className = 'slide-title';
  slideTitle.id = 'slide-title';
  container.appendChild(slideTitle);

  document.body.appendChild(container);

  return { container, slider, wheel, slideTitle };
}

export function createMenu() {
  const nav = document.createElement('nav');
  nav.className = 'nav-wrap';

  const menuBtn = document.createElement('button');
  menuBtn.className = 'menu-btn';
  menuBtn.textContent = 'Menu';
  nav.appendChild(menuBtn);

  const menu = document.createElement('div');
  menu.className = 'menu';

  const menuLinks = document.createElement('div');
  menuLinks.className = 'menu-links';
  menuLinks.innerHTML = `
    <a href="/" data-barba-link>Home</a>
    <a href="/work" data-barba-link>Work</a>
    <a href="/archive" data-barba-link>Archive</a>
    <a href="/contact" data-barba-link>Contact</a>
  `;
  menu.appendChild(menuLinks);
  nav.appendChild(menu);

  document.body.appendChild(nav);

  return { nav, menuBtn, menu, menuLinks };
}

export function createTransitionOverlay() {
  const transition = document.createElement('div');
  transition.className = 'transition';

  const overlay = document.createElement('div');
  overlay.className = 'transition-overlay';
  transition.appendChild(overlay);

  document.body.appendChild(transition);

  return { transition, overlay };
}

export function cleanupDOM() {
  document.body.innerHTML = '';
}
