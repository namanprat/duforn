import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initMiddleCarousel, destroyMiddleCarousel } from "./middle-carousel.js";

gsap.registerPlugin(ScrollTrigger);

let heroScrollTrigger = null;
let spotlightBgTrigger = null;
let currentBgState = 'dark'; // Track current background state

function initIndex() {
  initMiddleCarousel();

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

  // Section 2 (spotlight) background toggle - black/white
  const spotlightSection = document.querySelector('.spotlight');
  if (spotlightSection) {
    // Create toggle button for section 2 background
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'section-bg-toggle';
    toggleBtn.setAttribute('aria-label', 'Toggle background color');
    toggleBtn.innerHTML = '<span class="toggle-icon"></span>';
    spotlightSection.appendChild(toggleBtn);

    // Toggle handler
    toggleBtn.addEventListener('click', () => {
      if (currentBgState === 'dark') {
        spotlightSection.classList.add('spotlight--light');
        spotlightSection.classList.remove('spotlight--dark');
        currentBgState = 'light';
      } else {
        spotlightSection.classList.remove('spotlight--light');
        spotlightSection.classList.add('spotlight--dark');
        currentBgState = 'dark';
      }
    });

    // Initially set dark state
    spotlightSection.classList.add('spotlight--dark');

    // ScrollTrigger to animate toggle button appearance
    spotlightBgTrigger = ScrollTrigger.create({
      trigger: spotlightSection,
      start: 'top 80%',
      end: 'bottom 20%',
      onEnter: () => {
        gsap.to(toggleBtn, { autoAlpha: 1, duration: 0.3 });
      },
      onLeave: () => {
        gsap.to(toggleBtn, { autoAlpha: 0, duration: 0.3 });
      },
      onEnterBack: () => {
        gsap.to(toggleBtn, { autoAlpha: 1, duration: 0.3 });
      },
      onLeaveBack: () => {
        gsap.to(toggleBtn, { autoAlpha: 0, duration: 0.3 });
      }
    });

    // Initial hidden state for toggle button
    gsap.set(toggleBtn, { autoAlpha: 0 });
  }
}

function destroyIndex() {
  destroyMiddleCarousel();

  if (heroScrollTrigger) {
    heroScrollTrigger.kill();
    heroScrollTrigger = null;
  }

  if (spotlightBgTrigger) {
    spotlightBgTrigger.kill();
    spotlightBgTrigger = null;
  }

  // Remove toggle button if exists
  const toggleBtn = document.querySelector('.section-bg-toggle');
  if (toggleBtn) {
    toggleBtn.remove();
  }

  currentBgState = 'dark';
}

document.addEventListener("DOMContentLoaded", () => {
  initIndex();
});

export { initIndex, destroyIndex };
