import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initMiddleCarousel, destroyMiddleCarousel } from "./middle-carousel.js";

gsap.registerPlugin(ScrollTrigger);

let heroScrollTrigger = null;

// Initialize all index page features
function initIndex() {
  // Initialize Middle Carousel
  initMiddleCarousel();

  // Hero Elements Fade Out on Scroll
  const heroElements = document.querySelectorAll('.hero .hero-contain');
  if (heroElements.length) {
    heroScrollTrigger = ScrollTrigger.create({
      trigger: '.hero',
      start: 'top top',
      end: 'bottom 85%',
      scrub: true,
      onUpdate: (self) => {
        gsap.set(heroElements, { autoAlpha: 1 - self.progress });
      }
    });
  }
}

function destroyIndex() {
  // Destroy Middle Carousel
  destroyMiddleCarousel();
  
  // Kill hero ScrollTrigger
  if (heroScrollTrigger) {
    heroScrollTrigger.kill();
    heroScrollTrigger = null;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initIndex();
});

export { initIndex, destroyIndex };
