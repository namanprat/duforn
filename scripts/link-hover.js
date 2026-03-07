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

const TEXT_LINK_SELECTOR = '.nav-wrap a, .bottom-nav-wrap a, .contact-contain a';
const HAPTIC_TARGET_SELECTOR = 'a[href], button, [role="button"]';

let delegatedHapticsInitialized = false;
let lastTouchTarget = null;
let lastTouchTimestamp = 0;
let handleDelegatedHover = null;
let handleDelegatedTouchStart = null;
let handleDelegatedClick = null;

// Shared haptics instance – debug:true produces synthesised audio clicks
// on devices without the Vibration API (i.e. desktop browsers).
let haptics = null;

export function getHaptics() {
  if (!haptics) haptics = new WebHaptics({ debug: true });
  return haptics;
}

export function initLinkHover() {
  initDelegatedHaptics();

  const navLinks = document.querySelectorAll(TEXT_LINK_SELECTOR);

  navLinks.forEach(link => {
    // Skip if already initialized or excluded
    if (link.id === 'time' || link.classList.contains('menu-toggle-btn') || linkInstances.has(link)) return;

    if (isTouchDevice) {
      linkInstances.set(link, {});
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
    };

    const handleLeave = () => {
      if (link.getAttribute('aria-current') === 'page') return;

      tl?.kill();
      tl = animateChars(originalSplit.chars, italicSplit.chars, false);
    };

    link.addEventListener('mouseenter', handleEnter);
    link.addEventListener('mouseleave', handleLeave);

    // Store for cleanup (include tween getter for destroy)
    const instance = {
      originalSplit,
      italicSplit,
      handleEnter,
      handleLeave,
      getTween: () => tl,
    };
    linkInstances.set(link, instance);
  });
}

function initDelegatedHaptics() {
  if (delegatedHapticsInitialized) return;

  handleDelegatedHover = (event) => {
    if (isTouchDevice) return;

    const target = getHapticTarget(event.target);
    if (!target) return;

    const previousTarget = getHapticTarget(event.relatedTarget);
    if (previousTarget === target) return;

    getHaptics().trigger('light');
  };

  handleDelegatedTouchStart = (event) => {
    const target = getHapticTarget(event.target);
    if (!target) return;

    lastTouchTarget = target;
    lastTouchTimestamp = Date.now();
    getHaptics().trigger('nudge');
  };

  handleDelegatedClick = (event) => {
    const target = getHapticTarget(event.target);
    if (!target) return;

    const now = Date.now();
    const isSyntheticTouchClick = target === lastTouchTarget && now - lastTouchTimestamp < 700;
    if (isSyntheticTouchClick) return;

    getHaptics().trigger('nudge');
  };

  document.addEventListener('mouseover', handleDelegatedHover);
  document.addEventListener('touchstart', handleDelegatedTouchStart, { passive: true });
  document.addEventListener('click', handleDelegatedClick);
  delegatedHapticsInitialized = true;
}

function getHapticTarget(node) {
  if (!(node instanceof Element)) return null;

  const target = node.closest(HAPTIC_TARGET_SELECTOR);
  if (!target || !document.contains(target)) return null;
  if (target.id === 'time') return null;
  if (target.getAttribute('aria-hidden') === 'true') return null;
  if (target.matches('[disabled], [aria-disabled="true"]')) return null;

  return target;
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
  if (delegatedHapticsInitialized) {
    document.removeEventListener('mouseover', handleDelegatedHover);
    document.removeEventListener('touchstart', handleDelegatedTouchStart);
    document.removeEventListener('click', handleDelegatedClick);
    delegatedHapticsInitialized = false;
    lastTouchTarget = null;
    lastTouchTimestamp = 0;
    handleDelegatedHover = null;
    handleDelegatedTouchStart = null;
    handleDelegatedClick = null;
  }

  const navLinks = document.querySelectorAll(TEXT_LINK_SELECTOR);

  navLinks.forEach(link => {
    const instance = linkInstances.get(link);

    if (instance) {
      // Kill active tween before reverting splits
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
