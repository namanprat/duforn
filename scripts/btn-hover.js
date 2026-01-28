import gsap from 'gsap';

/**
 * Button Hover Animation Module
 *
 * Transforms a pill-shaped button into a square on hover with a coordinated
 * swipe animation: orange circle exits right, orange square enters left,
 * while the container morphs from rounded to sharp corners.
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
  // Increase for more dramatic swipe, decrease for subtler effect
  SWIPE_DISTANCE: 60,

  // Animation timing (seconds)
  // Recommended range: 0.4 - 0.6 for premium feel
  DURATION: 0.5,

  // Easing curve - smooth, confident motion
  // Options: 'power2.inOut', 'power3.inOut', 'expo.inOut'
  EASE: 'power2.inOut',

  // Border radius values
  // PILL: Initial rounded state (matches button height for full pill)
  // SQUARE: Final sharp state (0 for perfect square, 4-8 for slight rounding)
  BORDER_RADIUS_PILL: '50px',
  BORDER_RADIUS_SQUARE: '4px',

  // Icon element sizing
  ICON_SIZE: 36,

  // Stagger offset for swipe elements (creates slight overlap feel)
  SWIPE_STAGGER: 0.05
};

// Store instances for cleanup
const btnInstances = new WeakMap();

/**
 * Initializes the button hover animation
 * Call this on page load and after page transitions
 */
export function initBtnHover() {
  const buttons = document.querySelectorAll('.btn');

  buttons.forEach(btn => {
    // Skip if already initialized
    if (btnInstances.has(btn)) return;

    // Setup button structure if not already set up
    setupButtonStructure(btn);

    // Get child elements
    const elements = {
      container: btn,
      text: btn.querySelector('.btn-text'),
      circleIcon: btn.querySelector('.btn-icon-circle'),
      squareIcon: btn.querySelector('.btn-icon-square')
    };

    // Validate structure
    if (!elements.circleIcon || !elements.squareIcon) {
      console.warn('Button missing icon elements:', btn);
      return;
    }

    // Set initial states
    setInitialState(elements);

    // Animation timeline reference
    let tl = null;

    // Event handlers
    const handleEnter = () => {
      tl?.kill();
      tl = createHoverTimeline(elements, true);
    };

    const handleLeave = () => {
      tl?.kill();
      tl = createHoverTimeline(elements, false);
    };

    // Attach listeners
    btn.addEventListener('mouseenter', handleEnter);
    btn.addEventListener('mouseleave', handleLeave);

    // Store for cleanup
    btnInstances.set(btn, {
      elements,
      handleEnter,
      handleLeave,
      timeline: () => tl
    });
  });
}

/**
 * Sets up the button's internal structure for animation
 * Wraps existing content and adds icon elements
 */
function setupButtonStructure(btn) {
  // Check if already structured
  if (btn.querySelector('.btn-text')) return;

  // Store original content
  const originalContent = btn.textContent.trim();

  // Clear button
  btn.innerHTML = '';

  // Create text wrapper
  const textSpan = document.createElement('span');
  textSpan.className = 'btn-text';
  textSpan.textContent = originalContent;

  // Create circle icon (visible by default, exits right on hover)
  const circleIcon = document.createElement('span');
  circleIcon.className = 'btn-icon-circle';
  circleIcon.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;

  // Create square icon (hidden by default, enters from left on hover)
  const squareIcon = document.createElement('span');
  squareIcon.className = 'btn-icon-square';
  squareIcon.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;

  // Assemble button
  btn.appendChild(textSpan);
  btn.appendChild(circleIcon);
  btn.appendChild(squareIcon);
}

/**
 * Sets initial GSAP states for all animated elements
 */
function setInitialState(elements) {
  const { container, circleIcon, squareIcon } = elements;

  // Container: pill shape with overflow hidden
  gsap.set(container, {
    borderRadius: CONFIG.BORDER_RADIUS_PILL,
    overflow: 'hidden',
    position: 'relative'
  });

  // Circle icon: visible, positioned right
  gsap.set(circleIcon, {
    x: 0,
    opacity: 1,
    scale: 1
  });

  // Square icon: hidden, positioned off-screen left
  gsap.set(squareIcon, {
    x: -CONFIG.SWIPE_DISTANCE,
    opacity: 0,
    scale: 0.8
  });
}

/**
 * Creates the hover animation timeline
 * @param {Object} elements - Button child elements
 * @param {boolean} isHover - true for hover-in, false for hover-out
 * @returns {gsap.core.Timeline}
 */
function createHoverTimeline(elements, isHover) {
  const { container, circleIcon, squareIcon } = elements;
  const tl = gsap.timeline();

  if (isHover) {
    // HOVER IN: Circle exits right, square enters from left, container squares up
    tl
      // Morph container from pill to square
      .to(container, {
        borderRadius: CONFIG.BORDER_RADIUS_SQUARE,
        duration: CONFIG.DURATION,
        ease: CONFIG.EASE
      }, 0)

      // Circle icon exits to the right
      .to(circleIcon, {
        x: CONFIG.SWIPE_DISTANCE,
        opacity: 0,
        scale: 0.8,
        duration: CONFIG.DURATION,
        ease: CONFIG.EASE
      }, 0)

      // Square icon enters from the left (slight stagger for swipe feel)
      .to(squareIcon, {
        x: 0,
        opacity: 1,
        scale: 1,
        duration: CONFIG.DURATION,
        ease: CONFIG.EASE
      }, CONFIG.SWIPE_STAGGER);

  } else {
    // HOVER OUT: Reverse - square exits left, circle enters from right, container pills up
    tl
      // Morph container back to pill
      .to(container, {
        borderRadius: CONFIG.BORDER_RADIUS_PILL,
        duration: CONFIG.DURATION,
        ease: CONFIG.EASE
      }, 0)

      // Square icon exits to the left
      .to(squareIcon, {
        x: -CONFIG.SWIPE_DISTANCE,
        opacity: 0,
        scale: 0.8,
        duration: CONFIG.DURATION,
        ease: CONFIG.EASE
      }, 0)

      // Circle icon enters from the right
      .to(circleIcon, {
        x: 0,
        opacity: 1,
        scale: 1,
        duration: CONFIG.DURATION,
        ease: CONFIG.EASE
      }, CONFIG.SWIPE_STAGGER);
  }

  return tl;
}

/**
 * Cleans up button hover animations
 * Call before page transitions to prevent memory leaks
 */
export function destroyBtnHover() {
  const buttons = document.querySelectorAll('.btn');

  buttons.forEach(btn => {
    const instance = btnInstances.get(btn);

    if (instance) {
      // Kill any running timeline
      instance.timeline()?.kill();

      // Remove event listeners
      btn.removeEventListener('mouseenter', instance.handleEnter);
      btn.removeEventListener('mouseleave', instance.handleLeave);

      // Reset GSAP properties
      gsap.set(btn, { clearProps: 'borderRadius,overflow' });

      // Clear from WeakMap
      btnInstances.delete(btn);
    }
  });
}
