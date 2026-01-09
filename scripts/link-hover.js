import gsap from 'gsap';
import SplitText from 'gsap/SplitText';

gsap.registerPlugin(SplitText);

export function initLinkHover() {
  // Target all nav links
  const navLinks = document.querySelectorAll('.nav-wrap a, .bottom-nav-wrap a, .btn a');
  
  navLinks.forEach(link => {
    if (link.id === 'time') return;
    if (link.querySelector('[data-link-hover-original]')) return;

    // Store original text
    const originalText = (link.textContent || '').trim();
    if (!originalText) return;
    
    // Create wrapper for stacking effect
    const computedDisplay = window.getComputedStyle(link).display;
    if (computedDisplay === 'inline') link.style.display = 'inline-block';
    link.style.position = 'relative';
    link.style.overflow = 'hidden';
    
    // Create original text element
    const originalSpan = document.createElement('span');
    originalSpan.dataset.linkHoverOriginal = 'true';
    originalSpan.textContent = originalText;
    originalSpan.style.display = 'block';
    originalSpan.style.whiteSpace = 'nowrap';
    
    // Create italicized text element
    const italicSpan = document.createElement('span');
    italicSpan.textContent = originalText;
    italicSpan.style.display = 'block';
    italicSpan.style.position = 'absolute';
    italicSpan.style.top = '0';
    italicSpan.style.left = '0';
    italicSpan.style.fontStyle = 'italic';
    italicSpan.style.width = '100%';
    italicSpan.style.whiteSpace = 'nowrap';
    
    // Clear and append new structure
    link.textContent = '';
    link.appendChild(originalSpan);
    link.appendChild(italicSpan);
    
    // Split text into characters for both spans
    const originalSplit = new SplitText(originalSpan, { type: 'chars' });
    const italicSplit = new SplitText(italicSpan, { type: 'chars' });
    
    // Set initial state
    // 3D setup
    gsap.set(link, { perspective: 800 });
    
    // Using a moderate depth to keep text relatively in place (preserving position)
    // while still achieving the 3D rolling effect.
    // -20px is approximately half a typical line-height/font-size for these links.
    const transformOrigin = "50% 50% -10px";

    gsap.set(originalSplit.chars, { 
      rotationX: 0, 
      opacity: 1, 
      transformOrigin: transformOrigin,
      backfaceVisibility: 'hidden'
    });
    
    gsap.set(italicSplit.chars, { 
      rotationX: -90, 
      opacity: 0, 
      transformOrigin: transformOrigin, 
      backfaceVisibility: 'hidden'
    });
    
    // Store animation timeline
    let hoverTl = null;
    
    // Hover in
    link.addEventListener('mouseenter', () => {
      if (hoverTl) hoverTl.kill();
      
      hoverTl = gsap.timeline();
      
      // Stagger original text: rotate out to top (90)
      hoverTl.to(originalSplit.chars, {
        rotationX: 90,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.inOut',
        stagger: 0.02
      }, 0);
      
      // Stagger italic text: rotate in from bottom (-90 -> 0)
      hoverTl.to(italicSplit.chars, {
        rotationX: 0,
        opacity: 1,
        duration: 0.5,
        ease: 'power2.inOut',
        stagger: 0.02
      }, 0);
    });
    
    // Hover out
    link.addEventListener('mouseleave', () => {
      if (hoverTl) hoverTl.kill();
      
      hoverTl = gsap.timeline();
      
      // Reverse: bring original text back
      hoverTl.to(originalSplit.chars, {
        rotationX: 0,
        opacity: 1,
        duration: 0.5,
        ease: 'power2.inOut',
        stagger: 0.02
      }, 0);
      
      // Reverse: move italic text away
      hoverTl.to(italicSplit.chars, {
        rotationX: -90,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.inOut',
        stagger: 0.02
      }, 0);
    });
  });
}

export function destroyLinkHover() {
  const navLinks = document.querySelectorAll('.nav-wrap a, .bottom-nav-wrap a, .btn a');
  
  navLinks.forEach(link => {
    // Remove event listeners by cloning and replacing
    const newLink = link.cloneNode(true);
    link.parentNode.replaceChild(newLink, link);
    
    // Restore original structure if needed
    if (newLink.querySelector('span')) {
      const originalText = newLink.querySelector('span').textContent;
      newLink.textContent = originalText;
      newLink.style.position = '';
      newLink.style.display = '';
      newLink.style.overflow = '';
    }
  });
}
