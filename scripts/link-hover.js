import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { WebHaptics } from 'web-haptics';
import { isCoarsePointerDevice } from './perf.js';

gsap.registerPlugin(SplitText);

// Shared animation config
const ANIM_CONFIG = {
  duration: 0.5,
  ease: 'power2.inOut',
  stagger: 0.02
};

const isTouchDevice = isCoarsePointerDevice();

// Store instances for cleanup
const linkInstances = new WeakMap();

// Shared haptics instance – debug:true produces synthesised audio clicks
// on devices without the Vibration API (i.e. desktop browsers).
let haptics = null;

export function getHaptics() {
  if (!haptics) haptics = new WebHaptics({ debug: true });
  return haptics;
}

const LINK_SELECTOR = '.nav-wrap a, .bottom-nav-wrap a, .contact-contain a';

export function initLinkHover() {
  const navLinks = document.querySelectorAll(LINK_SELECTOR);

  navLinks.forEach(link => {
    // Skip if already initialized or excluded
    if (link.id === 'time' || link.classList.contains('menu-toggle-btn') || linkInstances.has(link)) return;

    if (isTouchDevice) {
      const handleTouchStart = () => {
        getHaptics().trigger('nudge');
      };

      link.addEventListener('touchstart', handleTouchStart, { passive: true });
      linkInstances.set(link, { handleTouchStart });
      return;
    }

    const originalText = (link.textContent || '').trim();
    if (!originalText) return;

    gsap.set(link, {
      position: 'relative',
      display: 'inline-block'
    });

    // Create dual text structure
    const originalSpan = createTextSpan(originalText, false);
    const italicSpan = createTextSpan(originalText, true);

    link.textContent = '';
    link.appendChild(originalSpan);
    link.appendChild(italicSpan);

    // Split once and reuse
    const originalSplit = new SplitText(originalSpan, { type: 'chars' });
    const italicSplit = new SplitText(italicSpan, { type: 'chars' });

    // Initial positions: vertical "dive" animation instead of 3D flip.
    gsap.set(originalSplit.chars, {
      yPercent: 0,
      opacity: 1,
      display: 'inline-block'
    });

    gsap.set(italicSplit.chars, {
      yPercent: -110,
      opacity: 0,
      display: 'inline-block'
    });

    // Animation state
    let tl = null;

    // Event handlers
    const handleEnter = () => {
      if (link.getAttribute('aria-current') === 'page') return;

      tl?.kill();
      tl = animateChars(originalSplit.chars, italicSplit.chars, true);

      // Light haptic pulse on hover
      getHaptics().trigger([
        { duration: 10 },
      ], { intensity: 1 });
    };

    const handleClick = () => {
      // Stronger nudge haptic on click
      getHaptics().trigger([
        { duration: 80, intensity: 0.8 },
        { delay: 80, duration: 50, intensity: 0.3 },
      ]);
    };

    const handleLeave = () => {
      if (link.getAttribute('aria-current') === 'page') return;

      tl?.kill();
      tl = animateChars(originalSplit.chars, italicSplit.chars, false);
    };

    link.addEventListener('mouseenter', handleEnter);
    link.addEventListener('mouseleave', handleLeave);
    link.addEventListener('click', handleClick);

    // Store for cleanup (include tween getter for destroy)
    const instance = {
      originalSplit,
      italicSplit,
      handleEnter,
      handleLeave,
      handleClick,
      getTween: () => tl,
    };
    linkInstances.set(link, instance);
  });
}

function createTextSpan(text, isItalic) {
  const span = document.createElement('span');
  span.textContent = text;

  gsap.set(span, {
    display: 'inline-block',
    whiteSpace: 'pre-wrap',
    ...(isItalic && {
      position: 'absolute',
      top: 0,
      left: 0,
      fontStyle: 'normal',
    })
  });

  return span;
}

function animateChars(originalChars, italicChars, isHover) {
  const tl = gsap.timeline();

  if (isHover) {
    tl.to(originalChars, {
      yPercent: 110,
      opacity: 0,
      ...ANIM_CONFIG
    }, 0)
      .to(italicChars, {
        yPercent: 0,
        opacity: 1,
        ...ANIM_CONFIG
      }, 0);
  } else {
    tl.to(originalChars, {
      yPercent: 0,
      opacity: 1,
      ...ANIM_CONFIG
    }, 0)
      .to(italicChars, {
        yPercent: -110,
        opacity: 0,
        ...ANIM_CONFIG
      }, 0);
  }

  return tl;
}

export function destroyLinkHover() {
  const navLinks = document.querySelectorAll(LINK_SELECTOR);

  navLinks.forEach(link => {
    const instance = linkInstances.get(link);

    if (instance) {
      // Kill active tween before reverting splits
      if (instance.handleTouchStart) {
        link.removeEventListener('touchstart', instance.handleTouchStart);
      }

      if (instance.getTween) {
        const activeTween = instance.getTween();
        if (activeTween) activeTween.kill();
      }
      if (instance.originalSplit && instance.italicSplit) {
        instance.originalSplit.revert();
        instance.italicSplit.revert();
      }

      // Remove listeners
      if (instance.handleEnter) link.removeEventListener('mouseenter', instance.handleEnter);
      if (instance.handleLeave) link.removeEventListener('mouseleave', instance.handleLeave);
      if (instance.handleClick) link.removeEventListener('click', instance.handleClick);

      // Clear WeakMap entry
      linkInstances.delete(link);
    }

    // Restore original text
    const firstSpan = link.querySelector('span');
    if (firstSpan && !isTouchDevice) {
      const text = firstSpan.textContent;
      link.textContent = text;
      gsap.set(link, { clearProps: 'all' });
    }
  });
}
