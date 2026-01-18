import gsap from 'gsap';
import SplitText from 'gsap/SplitText';

gsap.registerPlugin(SplitText);

// Shared animation config
const ANIM_CONFIG = {
  duration: 0.5,
  ease: 'power2.inOut',
  stagger: 0.02
};

const TRANSFORM_ORIGIN = "50% 50% -10px";

// Store instances for cleanup
const linkInstances = new WeakMap();

export function initLinkHover() {
  // Include .btn itself because buttons are anchors now
  const navLinks = document.querySelectorAll('.nav-wrap a, .bottom-nav-wrap a, .btn, .btn a');
  
  navLinks.forEach(link => {
    // Skip if already initialized or excluded
    if (link.id === 'time' || linkInstances.has(link)) return;

    const originalText = (link.textContent || '').trim();
    if (!originalText) return;
    
    // Setup link structure
    const display = getComputedStyle(link).display;
    if (display === 'inline') link.style.display = 'inline-block';

    const isButton = link.classList.contains('btn');
    const baseLayout = isButton
      ? { display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }
      : {};
    gsap.set(link, {
      position: 'relative',
      overflow: 'hidden',
      perspective: 800,
      ...baseLayout
    });

    // Normalize spaces: replace regular spaces and braille spaces with non-breaking spaces
    // This ensures spaces are preserved during SplitText and don't collapse in flexbox
    const normalizedText = originalText.replace(/[\s\u2800]/g, '\u00A0');

    // Create dual text structure
    const originalSpan = createTextSpan(normalizedText, false, isButton);
    const italicSpan = createTextSpan(normalizedText, true, isButton);
    
    link.textContent = '';
    link.appendChild(originalSpan);
    link.appendChild(italicSpan);
    
    // Split once and reuse
    const originalSplit = new SplitText(originalSpan, { type: 'chars' });
    const italicSplit = new SplitText(italicSpan, { type: 'chars' });

    // Fix spaces for buttons where flexbox collapses them
    if (isButton) {
      [originalSplit.chars, italicSplit.chars].forEach(chars => {
        chars.forEach(char => {
          // Check for regular space, non-breaking space, and braille blank
          if (char.textContent === ' ' || char.textContent === '\u00A0' || char.textContent === '⠀') {
             gsap.set(char, { whiteSpace: 'pre', display: 'inline-block', minWidth: '0.3em' });
          }
        });
      });
    }
    
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
      tl?.kill();
      tl = animateChars(originalSplit.chars, italicSplit.chars, true);
    };
    
    const handleLeave = () => {
      tl?.kill();
      tl = animateChars(originalSplit.chars, italicSplit.chars, false);
    };
    
    link.addEventListener('mouseenter', handleEnter);
    link.addEventListener('mouseleave', handleLeave);
    
    // Store for cleanup
    linkInstances.set(link, {
      originalSplit,
      italicSplit,
      handleEnter,
      handleLeave
    });
  });
}

function createTextSpan(text, isItalic, isButton) {
  const span = document.createElement('span');
  // Replace regular spaces with non-breaking spaces to prevent collapse in flex containers
  span.textContent = isButton ? text.replace(/ /g, '\u00A0') : text;

  gsap.set(span, {
    display: isButton ? 'flex' : 'block',
    alignItems: isButton ? 'center' : 'initial',
    justifyContent: isButton ? 'center' : 'initial',
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
  const navLinks = document.querySelectorAll('.nav-wrap a, .bottom-nav-wrap a, .btn, .btn a');
  
  navLinks.forEach(link => {
    const instance = linkInstances.get(link);
    
    if (instance) {
      // Kill animations
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