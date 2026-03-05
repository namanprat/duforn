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

const TRANSFORM_ORIGIN = "50% 50% -10px";
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
  if (isTouchDevice) return;
  const navLinks = document.querySelectorAll(LINK_SELECTOR);

  navLinks.forEach(link => {
    // Skip if already initialized or excluded
    if (link.id === 'time' || link.classList.contains('menu-toggle-btn') || linkInstances.has(link)) return;

    const originalText = (link.textContent || '').trim();
    if (!originalText) return;

    // Ensure block-level box model for 3D rotation effect
    link.style.display = 'inline-block';

    gsap.set(link, {
      position: 'relative',
      overflow: 'hidden',
      perspective: 800
    });

    // Use original text directly so it can wrap on multiple lines,
    // avoiding non-breaking space replacement that forces single lines.
    const normalizedText = originalText;

    // Create dual text structure
    const originalSpan = createTextSpan(normalizedText, false);
    const italicSpan = createTextSpan(normalizedText, true);

    link.textContent = '';
    link.appendChild(originalSpan);
    link.appendChild(italicSpan);

    // Split once and reuse
    const originalSplit = new SplitText(originalSpan, { type: 'chars' });
    const italicSplit = new SplitText(italicSpan, { type: 'chars' });

    // Initial positions
    gsap.set(originalSplit.chars, {
      rotationX: 0,
      opacity: 1,
      transformOrigin: TRANSFORM_ORIGIN,
      backfaceVisibility: 'hidden'
    });

    gsap.set(italicSplit.chars, {
      rotationX: -90,
      opacity: 0,
      transformOrigin: TRANSFORM_ORIGIN,
      backfaceVisibility: 'hidden'
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
    display: 'block',
    width: '100%',
    height: '100%',
    textAlign: 'center',
    ...(isItalic && {
      position: 'absolute',
      top: 0,
      left: 0,
      fontStyle: 'normal',
      width: '100%'
    })
  });

  return span;
}

function animateChars(originalChars, italicChars, isHover) {
  const tl = gsap.timeline();

  if (isHover) {
    tl.to(originalChars, {
      rotationX: 90,
      opacity: 0,
      ...ANIM_CONFIG
    }, 0)
      .to(italicChars, {
        rotationX: 0,
        opacity: 1,
        ...ANIM_CONFIG
      }, 0);
  } else {
    tl.to(originalChars, {
      rotationX: 0,
      opacity: 1,
      ...ANIM_CONFIG
    }, 0)
      .to(italicChars, {
        rotationX: -90,
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
      if (instance.getTween) {
        const activeTween = instance.getTween();
        if (activeTween) activeTween.kill();
      }
      instance.originalSplit.revert();
      instance.italicSplit.revert();

      // Remove listeners
      link.removeEventListener('mouseenter', instance.handleEnter);
      link.removeEventListener('mouseleave', instance.handleLeave);
      link.removeEventListener('click', instance.handleClick);

      // Clear WeakMap entry
      linkInstances.delete(link);
    }

    // Restore original text
    const firstSpan = link.querySelector('span');
    if (firstSpan) {
      const text = firstSpan.textContent;
      link.textContent = text;
      gsap.set(link, { clearProps: 'all' });
    }
  });
}
