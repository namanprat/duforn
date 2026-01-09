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
    gsap.set(originalSplit.chars, { yPercent: 0 });
    gsap.set(italicSplit.chars, { yPercent: 100 });
    
    // Store animation timeline
    let hoverTl = null;
    
    // Hover in
    link.addEventListener('mouseenter', () => {
      if (hoverTl) hoverTl.kill();
      
      hoverTl = gsap.timeline();
      
      // Stagger original text up and out
      hoverTl.to(originalSplit.chars, {
        yPercent: -100,
        duration: 0.5,
        ease: 'power2.inOut',
        stagger: 0.02
      }, 0);
      
      // Stagger italic text up into view
      hoverTl.to(italicSplit.chars, {
        yPercent: 0,
        duration: 0.5,
        ease: 'power2.inOut',
        stagger: 0.02
      }, 0);
    });
    
    // Hover out
    link.addEventListener('mouseleave', () => {
      if (hoverTl) hoverTl.kill();
      
      hoverTl = gsap.timeline();
      
      // Reverse: bring original text back down
      hoverTl.to(originalSplit.chars, {
        yPercent: 0,
        duration: 0.5,
        ease: 'power2.inOut',
        stagger: 0.02
      }, 0);
      
      // Reverse: move italic text back down
      hoverTl.to(italicSplit.chars, {
        yPercent: 100,
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
