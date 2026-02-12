import gsap from 'gsap';

/**
 * Button Hover Animation Module
 *
 * All elements move: square slides in, container shifts, circle slides out
 * Border-radius morphs with proper easing
 */

const btnInstances = new WeakMap();

const isTouchDevice = () => {
  return (('ontouchstart' in window) ||
     (navigator.maxTouchPoints > 0) ||
     (navigator.msMaxTouchPoints > 0));
};

function getConfig() {
  const rootStyles = getComputedStyle(document.documentElement);
  return {
    ICON_SIZE: parseFloat(rootStyles.getPropertyValue('--btn-icon-size')) || 44,
    GAP: parseFloat(rootStyles.getPropertyValue('--btn-gap')) || 10,
  };
}

export function initBtnHover() {
  if (isTouchDevice()) {
    if (import.meta.env.DEV) console.log('Touch device detected - skipping button hover animations');
    return;
  }

  const buttons = document.querySelectorAll('.btn');

  buttons.forEach(btn => {
    if (btnInstances.has(btn)) return;

    const elements = {
      btn: btn,
      container: btn.querySelector('.btn-container'),
      text: btn.querySelector('.btn-text'),
      circleIcon: btn.querySelector('.btn-icon-circle'),
      squareIcon: btn.querySelector('.btn-icon-square')
    };

    if (!elements.container || !elements.circleIcon || !elements.squareIcon) {
      console.warn('Button missing required elements:', btn);
      return;
    }

    const config = getConfig();
    elements.config = config;

    setInitialState(elements);

    let tl = null;

    const handleEnter = () => {
      if (tl) tl.kill();
      tl = animateHover(elements, true);
    };

    const handleLeave = () => {
      if (tl) tl.kill();
      tl = animateHover(elements, false);
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

function setInitialState(elements) {
  const { container, circleIcon, squareIcon, config } = elements;

  const iconSize = squareIcon.getBoundingClientRect().height || config.ICON_SIZE;
  elements.iconSize = iconSize;

  // Calculate border radius in pixels for smoother animation
  const pillRadius = iconSize / 2;
  const squareRadius = iconSize * 0.05; // 5% of icon size

  elements.pillRadius = pillRadius;
  elements.squareRadius = squareRadius;

  // Container: pill shape, no offset
  gsap.set(container, {
    x: 0,
    borderRadius: `${pillRadius}px`
  });

  // Circle icon: visible on right with gap
  gsap.set(circleIcon, {
    x: config.GAP,
    opacity: 1,
    borderRadius: '50%'
  });

  // Square icon: hidden off-screen on left
  gsap.set(squareIcon, {
    x: '-100%',
    opacity: 0,
    borderRadius: '50%'
  });
}

function animateHover(elements, isHover) {
  const { container, circleIcon, squareIcon, config } = elements;
  const iconSize = elements.iconSize || config.ICON_SIZE;
  const gap = config.GAP;
  const totalOffset = iconSize + gap;
  const pillRadius = elements.pillRadius;
  const squareRadius = elements.squareRadius;

  const tl = gsap.timeline({
    defaults: {
      duration: 0.4,
      ease: 'power4.inOut'
    }
  });

  if (isHover) {
    // HOVER IN: All elements move
    tl
      // Square icon slides in from left and morphs to square
      .to(squareIcon, {
        x: 0,
        opacity: 1,
        borderRadius: `${squareRadius}px`
      }, 0)
      // Container shifts right and morphs to rectangle
      .to(container, {
        x: totalOffset,
        borderRadius: `${squareRadius}px`
      }, 0)
      // Circle icon moves right and fades out
      .to(circleIcon, {
        x: totalOffset * 0.5,
        opacity: 0
      }, 0);
  } else {
    // HOVER OUT: All elements return
    tl
      // Square icon slides out to left and morphs to circle
      .to(squareIcon, {
        x: '-100%',
        opacity: 0,
        borderRadius: '50%'
      }, 0)
      // Container returns and morphs to pill
      .to(container, {
        x: 0,
        borderRadius: `${pillRadius}px`
      }, 0)
      // Circle icon returns with gap and fades in
      .to(circleIcon, {
        x: gap,
        opacity: 1
      }, 0);
  }

  return tl;
}

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
