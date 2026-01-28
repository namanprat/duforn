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
  // Circle exits right, square enters from left
  SWIPE_DISTANCE: 100,

  // Animation timing (seconds)
  // Recommended range: 0.4 - 0.6 for premium feel
  DURATION: 0.5,

  // Easing curve - smooth, confident motion
  // Options: 'power2.inOut', 'power3.inOut', 'expo.inOut'
  EASE: 'power2.inOut',

  // Border radius values for container
  // PILL: Initial rounded state (high value for pill shape)
  // SQUARE: Final sharp state (0 for perfect square)
  BORDER_RADIUS_PILL: '50px',
  BORDER_RADIUS_SQUARE: '0px',

  // Icon size (matches CSS)
  ICON_SIZE: 72,

  // Padding adjustment for hover state
  PADDING_INITIAL: '0 40px',
  PADDING_HOVER: '0 40px 0 92px' // Extra left padding to accommodate square icon
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
      wrapper: btn,
      container: btn.querySelector('.btn-container'),
      text: btn.querySelector('.btn-text'),
      circleIcon: btn.querySelector('.btn-icon-circle'),
      squareIcon: btn.querySelector('.btn-icon-square')
    };

    // Validate structure
    if (!elements.container || !elements.circleIcon || !elements.squareIcon) {
      console.warn('Button missing required elements:', btn);
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
  if (btn.querySelector('.btn-container')) return;

  // Store original content
  const originalContent = btn.textContent.trim();

  // Clear button
  btn.innerHTML = '';

  // Create main container (the pill/rectangle)
  const container = document.createElement('span');
  container.className = 'btn-container';

  // Create text wrapper
  const textSpan = document.createElement('span');
  textSpan.className = 'btn-text';
  textSpan.textContent = originalContent;

  // Create square icon (hidden initially, enters from left on hover)
  const squareIcon = document.createElement('span');
  squareIcon.className = 'btn-icon-square';
  squareIcon.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 17L17 7M17 7H8M17 7V16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;

  // Assemble container
  container.appendChild(squareIcon);
  container.appendChild(textSpan);

  // Create circle icon (positioned OUTSIDE container on right, visible initially)
  const circleIcon = document.createElement('span');
  circleIcon.className = 'btn-icon-circle';
  circleIcon.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 17L17 7M17 7H8M17 7V16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;

  // Assemble button
  btn.appendChild(container);
  btn.appendChild(circleIcon);
}

/**
 * Sets initial GSAP states for all animated elements
 */
function setInitialState(elements) {
  const { container, circleIcon, squareIcon } = elements;

  // Container: pill shape
  gsap.set(container, {
    borderRadius: CONFIG.BORDER_RADIUS_PILL,
    padding: CONFIG.PADDING_INITIAL
  });

  // Circle icon: visible, positioned to the right of container
  gsap.set(circleIcon, {
    x: 0,
    opacity: 1,
    scale: 1
  });

  // Square icon: hidden, positioned off to the left
  gsap.set(squareIcon, {
    x: -CONFIG.SWIPE_DISTANCE,
    opacity: 0,
    scale: 0.9
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
    // HOVER IN:
    // - Circle exits to the right
    // - Square enters from left
    // - Container morphs from pill to square with left padding for icon
    tl
      // Morph container from pill to square
      .to(container, {
        borderRadius: CONFIG.BORDER_RADIUS_SQUARE,
        padding: CONFIG.PADDING_HOVER,
        duration: CONFIG.DURATION,
        ease: CONFIG.EASE
      }, 0)

      // Circle icon exits to the right
      .to(circleIcon, {
        x: CONFIG.SWIPE_DISTANCE,
        opacity: 0,
        scale: 0.9,
        duration: CONFIG.DURATION,
        ease: CONFIG.EASE
      }, 0)

      // Square icon enters from the left
      .to(squareIcon, {
        x: 0,
        opacity: 1,
        scale: 1,
        duration: CONFIG.DURATION,
        ease: CONFIG.EASE
      }, 0);

  } else {
    // HOVER OUT:
    // - Square exits to the left
    // - Circle enters from right
    // - Container morphs back to pill
    tl
      // Morph container back to pill
      .to(container, {
        borderRadius: CONFIG.BORDER_RADIUS_PILL,
        padding: CONFIG.PADDING_INITIAL,
        duration: CONFIG.DURATION,
        ease: CONFIG.EASE
      }, 0)

      // Square icon exits to the left
      .to(squareIcon, {
        x: -CONFIG.SWIPE_DISTANCE,
        opacity: 0,
        scale: 0.9,
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
      }, 0);
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
      if (instance.elements.container) {
        gsap.set(instance.elements.container, { clearProps: 'borderRadius,padding' });
      }

      // Clear from WeakMap
      btnInstances.delete(btn);
    }
  });
}
