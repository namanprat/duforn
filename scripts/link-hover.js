import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { WebHaptics } from 'web-haptics';
import { isCoarsePointerDevice } from './perf.js';

gsap.registerPlugin(SplitText);

const ANIM_CONFIG = {
  duration: 0.5,
  ease: 'power2.inOut',
  stagger: 0.02,
};

const isTouchDevice = isCoarsePointerDevice();
const LINK_SELECTOR = '.nav-wrap a, .bottom-nav-wrap a, .contact-contain a';
const MOBILE_CLICK_GUARD_MS = 450;
export const CLICK_HAPTIC_PATTERN = [
  { duration: 80, intensity: 0.8 },
  { delay: 80, duration: 50, intensity: 0.3 },
];

const linkInstances = new WeakMap();

let haptics = null;
let hapticsUnlocked = !isTouchDevice;
let hapticsUnlockBound = false;

export function getHaptics() {
  if (!haptics) haptics = new WebHaptics({ debug: true });
  return haptics;
}

function unlockHaptics() {
  hapticsUnlocked = true;
}

export function ensureHapticsUnlock() {
  if (hapticsUnlockBound || hapticsUnlocked) return;

  const markUnlocked = () => {
    unlockHaptics();
    window.removeEventListener('pointerdown', markUnlocked, true);
    window.removeEventListener('keydown', markUnlocked, true);
  };

  // Capture-phase unlock ensures the first trusted gesture unlocks before any button/link handler fires.
  window.addEventListener('pointerdown', markUnlocked, { capture: true, passive: true });
  window.addEventListener('keydown', markUnlocked, { capture: true });
  hapticsUnlockBound = true;
}

export function triggerHapticFeedback(pattern = CLICK_HAPTIC_PATTERN) {
  if (!hapticsUnlocked) return Promise.resolve();
  return getHaptics().trigger(pattern);
}

export function bindHapticTap(target, pattern = CLICK_HAPTIC_PATTERN) {
  if (!target) return () => {};

  if (isTouchDevice) {
    let lastPointerDownAt = 0;

    const handlePointerDown = () => {
      lastPointerDownAt = Date.now();
      triggerHapticFeedback(pattern);
    };

    const handleClick = () => {
      if (Date.now() - lastPointerDownAt < MOBILE_CLICK_GUARD_MS) return;
      triggerHapticFeedback(pattern);
    };

    target.addEventListener('pointerdown', handlePointerDown, { passive: true });
    target.addEventListener('click', handleClick);

    return () => {
      target.removeEventListener('pointerdown', handlePointerDown);
      target.removeEventListener('click', handleClick);
    };
  }

  const handleClick = () => {
    triggerHapticFeedback(pattern);
  };

  target.addEventListener('click', handleClick);
  return () => {
    target.removeEventListener('click', handleClick);
  };
}

function shouldSkipLink(link) {
  if (linkInstances.has(link)) return true;
  if (link.id === 'time') return true;
  if (link.classList.contains('menu-item')) return true;
  return false;
}

function wrapCharsWithMasks(chars) {
  return chars.map((charNode) => {
    if (charNode.textContent === ' ') {
      charNode.textContent = '\u00A0';
    }

    const mask = document.createElement('span');
    Object.assign(mask.style, {
      display: 'inline-block',
      overflow: 'hidden',
      verticalAlign: 'top',
      lineHeight: '1em',
      pointerEvents: 'none',
    });

    const parent = charNode.parentNode;
    if (parent) {
      parent.insertBefore(mask, charNode);
      mask.appendChild(charNode);
    }

    gsap.set(charNode, {
      display: 'inline-block',
      willChange: 'transform, opacity',
      force3D: true,
      pointerEvents: 'none',
    });

    return charNode;
  });
}

function animateChars(baseChars, hoverChars, isHover) {
  const tl = gsap.timeline();

  if (isHover) {
    // Current text exits upward, hover text enters from bottom.
    tl.to(baseChars, {
      yPercent: -110,
      opacity: 0,
      ...ANIM_CONFIG,
    }, 0)
      .to(hoverChars, {
        yPercent: 0,
        opacity: 1,
        ...ANIM_CONFIG,
      }, 0);
  } else {
    tl.to(baseChars, {
      yPercent: 0,
      opacity: 1,
      ...ANIM_CONFIG,
    }, 0)
      .to(hoverChars, {
        yPercent: 110,
        opacity: 0,
        ...ANIM_CONFIG,
      }, 0);
  }

  return tl;
}

export function initLinkHover() {
  ensureHapticsUnlock();
  const links = document.querySelectorAll(LINK_SELECTOR);

  links.forEach((link) => {
    if (shouldSkipLink(link)) return;

    const originalText = (link.textContent || '').trim();
    if (!originalText) return;

    if (isTouchDevice) {
      const cleanupTapHaptics = bindHapticTap(link, CLICK_HAPTIC_PATTERN);

      linkInstances.set(link, {
        mode: 'touch',
        originalText,
        cleanupTapHaptics,
      });

      return;
    }

    const root = document.createElement('span');
    Object.assign(root.style, {
      position: 'relative',
      display: 'inline-block',
      pointerEvents: 'none',
      verticalAlign: 'baseline',
    });

    const baseLayer = document.createElement('span');
    baseLayer.textContent = originalText;
    Object.assign(baseLayer.style, {
      display: 'inline-block',
      whiteSpace: 'nowrap',
      pointerEvents: 'none',
    });

    const hoverLayer = document.createElement('span');
    hoverLayer.textContent = originalText;
    Object.assign(hoverLayer.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      display: 'inline-block',
      whiteSpace: 'nowrap',
      pointerEvents: 'none',
    });

    root.appendChild(baseLayer);
    root.appendChild(hoverLayer);

    link.textContent = '';
    link.appendChild(root);

    const baseSplit = new SplitText(baseLayer, { type: 'chars' });
    const hoverSplit = new SplitText(hoverLayer, { type: 'chars' });

    const baseChars = wrapCharsWithMasks(baseSplit.chars);
    const hoverChars = wrapCharsWithMasks(hoverSplit.chars);

    gsap.set(baseChars, {
      yPercent: 0,
      opacity: 1,
    });

    gsap.set(hoverChars, {
      yPercent: 110,
      opacity: 0,
    });

    let timeline = null;

    const handleEnter = () => {
      timeline?.kill();
      timeline = animateChars(baseChars, hoverChars, true);
      getHaptics().trigger([{ duration: 10 }], { intensity: 1 });
    };

    const handleLeave = () => {
      timeline?.kill();
      timeline = animateChars(baseChars, hoverChars, false);
    };

    const handleClick = () => {
      triggerHapticFeedback(CLICK_HAPTIC_PATTERN);
    };

    link.addEventListener('mouseenter', handleEnter);
    link.addEventListener('mouseleave', handleLeave);
    link.addEventListener('click', handleClick);

    linkInstances.set(link, {
      mode: 'desktop',
      originalText,
      baseSplit,
      hoverSplit,
      getTimeline: () => timeline,
      handleEnter,
      handleLeave,
      handleClick,
    });
  });

  // Menu items — haptic only (no char-flip, their internal DOM is complex)
  document.querySelectorAll('.menu-item').forEach((item) => {
    if (linkInstances.has(item)) return;

    const cleanupTapHaptics = bindHapticTap(item, CLICK_HAPTIC_PATTERN);

    linkInstances.set(item, {
      mode: 'haptic-only',
      cleanupTapHaptics,
    });
  });
}

export function destroyLinkHover() {
  const links = document.querySelectorAll(LINK_SELECTOR);

  links.forEach((link) => {
    const instance = linkInstances.get(link);
    if (!instance) return;

    if (instance.mode === 'touch') {
      instance.cleanupTapHaptics?.();
      linkInstances.delete(link);
      return;
    }

    const activeTimeline = instance.getTimeline?.();
    if (activeTimeline) activeTimeline.kill();

    if (instance.handleEnter) link.removeEventListener('mouseenter', instance.handleEnter);
    if (instance.handleLeave) link.removeEventListener('mouseleave', instance.handleLeave);
    if (instance.handleClick) link.removeEventListener('click', instance.handleClick);

    instance.baseSplit?.revert?.();
    instance.hoverSplit?.revert?.();

    link.textContent = instance.originalText;
    linkInstances.delete(link);
  });

  // Clean up menu item haptic handlers
  document.querySelectorAll('.menu-item').forEach((item) => {
    const instance = linkInstances.get(item);
    if (!instance) return;
    instance.cleanupTapHaptics?.();
    linkInstances.delete(item);
  });
}
