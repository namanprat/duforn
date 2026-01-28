import gsap from 'gsap';

/**
 * Button Hover Animation Module
 *
 * Transforms a pill-shaped button into a square layout on hover:
 * - Initial: [Pill Container + Text] [Circle Icon on right]
 * - Hover: [Square Icon on left] [Rectangle Container + Text]
 *
 * CONFIGURATION:
 * - SWIPE_DISTANCE: How far icons travel during swipe (in pixels)
 * - DURATION: Total animation duration (in seconds)
 * - EASE: GSAP easing function for smooth motion
 * - BORDER_RADIUS_PILL: Initial rounded border-radius
 * - BORDER_RADIUS_SQUARE: Final sharp border-radius
 */

// ============================================
// ANIMATION CONFIGURATION
// Adjust these values to tweak the animation
// ============================================

const CONFIG = {
  // Swipe distance for icon elements (pixels)
  SWIPE_DISTANCE: 80,

  // Container shift distance on hover (pixels)
  // This shifts the white box to the right to make room for square icon
  CONTAINER_SHIFT: 84,

  // Animation timing (seconds)
  DURATION: 0.5,

  // Easing curve - smooth, confident motion
  EASE: 'power2.inOut',

  // Border radius values for container
  BORDER_RADIUS_PILL: '50px',
  BORDER_RADIUS_SQUARE: '0px',

  // Icon size (matches CSS)
  ICON_SIZE: 72
};

// Store instances for cleanup
const btnInstances = new WeakMap();

/**
 * Initializes the button hover animation
 */
export function initBtnHover() {
  const buttons = document.querySelectorAll('.btn');

  buttons.forEach(btn => {
    if (btnInstances.has(btn)) return;

    setupButtonStructure(btn);

    const elements = {
      wrapper: btn,
      container: btn.querySelector('.btn-container'),
      text: btn.querySelector('.btn-text'),
      circleIcon: btn.querySelector('.btn-icon-circle'),
      squareIcon: btn.querySelector('.btn-icon-square')
    };

    if (!elements.container || !elements.circleIcon || !elements.squareIcon) {
      console.warn('Button missing required elements:', btn);
      return;
    }

    setInitialState(elements);

    let tl = null;

    const handleEnter = () => {
      tl?.kill();
      tl = createHoverTimeline(elements, true);
    };

    const handleLeave = () => {
      tl?.kill();
      tl = createHoverTimeline(elements, false);
    };

    btn.addEventListener('mouseenter', handleEnter);
    btn.addEventListener('mouseleave', handleLeave);

    btnInstances.set(btn, {
      elements,
      handleEnter,
      handleLeave,
      timeline: () => tl
    });
  });
}

/**
 * Sets up the button's internal structure:
 * [Square Icon (hidden)] [Container with Text] [Circle Icon]
 */
function setupButtonStructure(btn) {
  if (btn.querySelector('.btn-container')) return;

  const originalContent = btn.textContent.trim();
  btn.innerHTML = '';

  // Create square icon (sibling, on the LEFT, hidden initially)
  const squareIcon = document.createElement('span');
  squareIcon.className = 'btn-icon-square';
  squareIcon.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 17L17 7M17 7H8M17 7V16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;

  // Create main container (the pill/rectangle with text)
  const container = document.createElement('span');
  container.className = 'btn-container';

  const textSpan = document.createElement('span');
  textSpan.className = 'btn-text';
  textSpan.textContent = originalContent;

  container.appendChild(textSpan);

  // Create circle icon (sibling, on the RIGHT, visible initially)
  const circleIcon = document.createElement('span');
  circleIcon.className = 'btn-icon-circle';
  circleIcon.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 17L17 7M17 7H8M17 7V16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;

  // Order: [Square] [Container] [Circle]
  btn.appendChild(squareIcon);
  btn.appendChild(container);
  btn.appendChild(circleIcon);
}

/**
 * Sets initial GSAP states
 */
function setInitialState(elements) {
  const { container, circleIcon, squareIcon } = elements;

  // Container: pill shape, centered position
  gsap.set(container, {
    borderRadius: CONFIG.BORDER_RADIUS_PILL,
    x: 0
  });

  // Circle icon: visible
  gsap.set(circleIcon, {
    x: 0,
    opacity: 1,
    scale: 1
  });

  // Square icon: hidden, shifted left
  gsap.set(squareIcon, {
    x: -CONFIG.SWIPE_DISTANCE,
    opacity: 0,
    scale: 0.9
  });
}

/**
 * Creates the hover animation timeline
 */
function createHoverTimeline(elements, isHover) {
  const { container, circleIcon, squareIcon } = elements;
  const tl = gsap.timeline();

  if (isHover) {
    // HOVER IN:
    // - Circle exits right
    // - Square enters from left
    // - Container morphs to rectangle and shifts right
    tl
      .to(container, {
        borderRadius: CONFIG.BORDER_RADIUS_SQUARE,
        x: CONFIG.CONTAINER_SHIFT / 2, // Shift right to balance with square icon
        duration: CONFIG.DURATION,
        ease: CONFIG.EASE
      }, 0)
      .to(circleIcon, {
        x: CONFIG.SWIPE_DISTANCE,
        opacity: 0,
        scale: 0.9,
        duration: CONFIG.DURATION,
        ease: CONFIG.EASE
      }, 0)
      .to(squareIcon, {
        x: 0,
        opacity: 1,
        scale: 1,
        duration: CONFIG.DURATION,
        ease: CONFIG.EASE
      }, 0);

  } else {
    // HOVER OUT: Reverse
    tl
      .to(container, {
        borderRadius: CONFIG.BORDER_RADIUS_PILL,
        x: 0,
        duration: CONFIG.DURATION,
        ease: CONFIG.EASE
      }, 0)
      .to(squareIcon, {
        x: -CONFIG.SWIPE_DISTANCE,
        opacity: 0,
        scale: 0.9,
        duration: CONFIG.DURATION,
        ease: CONFIG.EASE
      }, 0)
      .to(circleIcon, {
        x: 0,
        opacity: 1,
        scale: 1,
        duration: CONFIG.DURATION,
        ease: CONFIG.EASE
      }, 0);
  }

  return tl;
}

/**
 * Cleans up button hover animations
 */
export function destroyBtnHover() {
  const buttons = document.querySelectorAll('.btn');

  buttons.forEach(btn => {
    const instance = btnInstances.get(btn);

    if (instance) {
      instance.timeline()?.kill();
      btn.removeEventListener('mouseenter', instance.handleEnter);
      btn.removeEventListener('mouseleave', instance.handleLeave);

      if (instance.elements.container) {
        gsap.set(instance.elements.container, { clearProps: 'borderRadius,x' });
      }
      if (instance.elements.squareIcon) {
        gsap.set(instance.elements.squareIcon, { clearProps: 'x,opacity,scale' });
      }
      if (instance.elements.circleIcon) {
        gsap.set(instance.elements.circleIcon, { clearProps: 'x,opacity,scale' });
      }

      btnInstances.delete(btn);
    }
  });
}
