import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let heroScrollTrigger = null;

function initIndex() {
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
  if (heroScrollTrigger) {
    heroScrollTrigger.kill();
    heroScrollTrigger = null;
  }
}

export { initIndex, destroyIndex };
