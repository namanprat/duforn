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
  // Icon size (2.75rem = 44px at default rem)
  ICON_SIZE: 44,

  // Gap between elements (5px)
  GAP: 5,

  // Animation timing (seconds)
  DURATION: 0.4,

  // Easing curve - smooth, responsive (no elastic or bounce)
  EASE: 'power2.inOut'
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
 * Sets initial GSAP states
 */
function setInitialState(elements) {
  const { container, circleIcon, squareIcon } = elements;

  // Container: pill shape, no transform
  gsap.set(container, {
    x: 0,
    borderRadius: '100vw'
  });

  // Circle icon: visible on right with gap spacing
  gsap.set(circleIcon, {
    x: CONFIG.GAP
  });

  // Square icon: clipped on left (-100% X)
  gsap.set(squareIcon, {
    x: '-100%'
  });
}

/**
 * Creates the hover animation timeline
 */
function createHoverTimeline(elements, isHover) {
  const { container, circleIcon, squareIcon } = elements;
  const tl = gsap.timeline();

  if (isHover) {
    // HOVER IN: All animations synchronized
    // - Square: slides in from -100% to 0
    // - Container: shifts right + becomes square
    // - Circle: pushes out to the right
    tl
      .to(squareIcon, {
        x: 0,
        duration: CONFIG.DURATION,
        ease: CONFIG.EASE
      }, 0)
      .to(container, {
        x: CONFIG.ICON_SIZE + CONFIG.GAP,
        borderRadius: 0,
        duration: CONFIG.DURATION,
        ease: CONFIG.EASE
      }, 0)
      .to(circleIcon, {
        x: '100%',
        duration: CONFIG.DURATION,
        ease: CONFIG.EASE
      }, 0);

  } else {
    // HOVER OUT: Reverse all animations
    // - Square: slides out to -100%
    // - Container: returns to origin + becomes pill
    // - Circle: returns to gap position
    tl
      .to(squareIcon, {
        x: '-100%',
        duration: CONFIG.DURATION,
        ease: CONFIG.EASE
      }, 0)
      .to(container, {
        x: 0,
        borderRadius: '100vw',
        duration: CONFIG.DURATION,
        ease: CONFIG.EASE
      }, 0)
      .to(circleIcon, {
        x: CONFIG.GAP,
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
        gsap.set(instance.elements.container, { clearProps: 'all' });
      }
      if (instance.elements.squareIcon) {
        gsap.set(instance.elements.squareIcon, { clearProps: 'all' });
      }
      if (instance.elements.circleIcon) {
        gsap.set(instance.elements.circleIcon, { clearProps: 'all' });
      }

      btnInstances.delete(btn);
    }
  });
}
