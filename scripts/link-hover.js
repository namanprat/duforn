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

const linkInstances = new WeakMap();

let haptics = null;

export function getHaptics() {
  if (!haptics) haptics = new WebHaptics({ debug: true });
  return haptics;
}

export function triggerHapticFeedback(preset = 'nudge') {
  return getHaptics().trigger(preset);
}

export function bindHapticTap(target, preset = 'nudge') {
  if (!target) return () => {};

  if (isTouchDevice) {
    let lastPointerDownAt = 0;

    const handlePointerDown = () => {
      lastPointerDownAt = Date.now();
      triggerHapticFeedback(preset);
    };

    const handleClick = () => {
      if (Date.now() - lastPointerDownAt < MOBILE_CLICK_GUARD_MS) return;
      triggerHapticFeedback(preset);
    };

    target.addEventListener('pointerdown', handlePointerDown, { passive: true });
    target.addEventListener('click', handleClick);

    return () => {
      target.removeEventListener('pointerdown', handlePointerDown);
      target.removeEventListener('click', handleClick);
    };
  }

  const handleClick = () => {
    triggerHapticFeedback(preset);
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
  const links = document.querySelectorAll(LINK_SELECTOR);

  links.forEach((link) => {
    if (shouldSkipLink(link)) return;

    const originalText = (link.textContent || '').trim();
    if (!originalText) return;

    if (isTouchDevice) {
      const cleanupTapHaptics = bindHapticTap(link, 'nudge');

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
      if (link.getAttribute('aria-current') === 'page') return;

      timeline?.kill();
      timeline = animateChars(baseChars, hoverChars, true);
      getHaptics().trigger([{ duration: 10 }], { intensity: 1 });
    };

    const handleLeave = () => {
      if (link.getAttribute('aria-current') === 'page') return;

      timeline?.kill();
      timeline = animateChars(baseChars, hoverChars, false);
    };

    const handleClick = () => {
      getHaptics().trigger([
        { duration: 80, intensity: 0.8 },
        { delay: 80, duration: 50, intensity: 0.3 },
      ]);
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

    const cleanupTapHaptics = bindHapticTap(item, 'selection');

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
