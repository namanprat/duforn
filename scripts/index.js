import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initMiddleCarousel } from "./middle-carousel.js";

gsap.registerPlugin(ScrollTrigger);

// Initialize all index page features
function initIndex() {
  // Initialize Middle Carousel
  initMiddleCarousel();

  // Hero Elements Fade Out on Scroll
  const heroElements = document.querySelectorAll('.hero .hero-contain');
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

document.addEventListener("DOMContentLoaded", () => {
  initIndex();
});

export { initIndex };
