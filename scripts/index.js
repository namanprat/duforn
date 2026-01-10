import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initMiddleCarousel } from "./middle-carousel.js";

gsap.registerPlugin(ScrollTrigger);

// Initialize all index page features
function initIndex() {
  const container = document.querySelector('[data-barba="container"]');
  const namespace = container?.dataset.barbaNamespace;
  
  // Only initialize middle carousel on home page
  if (namespace === 'home') {
    // Add small delay to ensure DOM is ready and element has dimensions
    requestAnimationFrame(() => {
      initMiddleCarousel();
    });
  }

  // Hero Elements Fade Out on Scroll (only on home page)
  if (namespace === 'home') {
    const heroElements = document.querySelectorAll('.hero .hero-contain');
    if (heroElements.length > 0) {
      gsap.to(heroElements, {
        autoAlpha: 0,
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom 85%',
          scrub: true,
        }
      });
    }
  }
}

export { initIndex };
