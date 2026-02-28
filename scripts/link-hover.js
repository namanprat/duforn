import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
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

// Prepare audio instance
const hoverAudio = new Audio('/hover.wav');
hoverAudio.volume = 0.5;

export function unlockHoverAudio() {
  if (isTouchDevice) return;
  hoverAudio.play()
    .then(() => { hoverAudio.pause(); hoverAudio.currentTime = 0; })
    .catch(() => { });
}

export function initLinkHover() {
  if (isTouchDevice) return;
  const navLinks = document.querySelectorAll('.nav-wrap a, .bottom-nav-wrap a');

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

    // Normalize spaces: replace regular spaces and braille spaces with non-breaking spaces
    // This ensures spaces are preserved during SplitText and don't collapse in flexbox
    const normalizedText = originalText.replace(/[\s\u2800]/g, '\u00A0');

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

      if (window.audioEnabled) {
        hoverAudio.currentTime = 0;
        hoverAudio.play().catch(e => {
          // Log but don't hard crash if it fails (e.g. strict browser policies)
          console.warn('Audio play failed:', e);
        });
      }
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

function createTextSpan(text, isItalic) {
  const span = document.createElement('span');
  span.textContent = text;

  gsap.set(span, {
    display: 'block',
    whiteSpace: 'nowrap',
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
  const navLinks = document.querySelectorAll('.nav-wrap a, .bottom-nav-wrap a');

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
