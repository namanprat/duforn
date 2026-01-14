import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initMiddleCarousel, destroyMiddleCarousel } from "./middle-carousel.js";

gsap.registerPlugin(ScrollTrigger);

let heroScrollTrigger = null;

function initIndex() {
  initMiddleCarousel();

   const heroElements = document.querySelectorAll('.hero .hero-contain');
   if (heroElements.length) {
     heroScrollTrigger = ScrollTrigger.create({
       trigger: '.hero',
       start: 'top top',
       end: 'bottom 85%',
       scrub: true,
  --typography-letter-spacing     onUpdate: (self) => {
         gsap.set(heroElements, { autoAlpha: 1 - self.progress });
       }
     });
   }
}

function destroyIndex() {
  destroyMiddleCarousel();
  
  if (heroScrollTrigger) {
    heroScrollTrigger.kill();
    heroScrollTrigger = null;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initIndex();
});

export { initIndex, destroyIndex };
