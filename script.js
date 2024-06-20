// Import required libraries and modules
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Draggable from 'gsap/Draggable';
import SplitType from 'split-type';
import Lenis from 'lenis';
import { Gradient } from './Gradient.js';
import InfiniteMarquee from 'vanilla-infinite-marquee';
import barba from '@barba/core';

// Initialize infinite marquee
const marquee = new InfiniteMarquee({
    element: '.marquee-container',
    speed: 50000,
    direction: 'left',
    gap: '2rem',
    duplicateCount: 2,
    mobileSettings: {
      direction: 'top',
      speed: 20000
    }
  });

  const title = document.querySelector('#work-title .h1')
      const links = document.querySelectorAll('#brev a')
      const date = document.querySelector('#work-title span')
      const body = document.querySelector('body')
      links.forEach((link) => {
        link.addEventListener('mouseenter', () => {
          title.innerText = link.getAttribute('data-title')
          date.innerText = link.getAttribute('data-year')
          body.classList.add('hovered')
          link.classList.add('hovered')
        })
        link.addEventListener('mouseleave', () => {
          title.innerText = 'Featured Work'
          date.innerText = '[ 5 ]'
          body.classList.remove('hovered')
          link.classList.remove('hovered')
        })
      })
      
// Initialize gradient
const gradient = new Gradient();
gradient.initGradient('#gradient-canvas');

// Initialize Lenis smooth scrolling
const lenisInit = () => {
  const lenis = new Lenis({
    lerp: 0.05,
    smoothWheel: true
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add(time => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
};

// Set initial values for elements
const valueSet = () => {
  gsap.set('#overlay', { autoAlpha: 0 });
  gsap.set('#overlay-bg', { autoAlpha: 0 });
  gsap.set('#nav-cluster a', { x: 0, autoAlpha: 1 });

  const mm = gsap.matchMedia();
  mm.add('(max-width: 900px)', () => gsap.set('#nav-cluster a', { autoAlpha: 0 }));
};

// Transition animation for the bar
function transition() {
  const tl = gsap.timeline();
  tl.to('#bar .sweep-left', {
    duration: 1.25,
    scaleX: 1,
    transformOrigin: 'left',
    ease: 'power4.inOut',
    stagger: 0.07,
    delay: 1
  }, '<')
    .to('#bar .sweep-right', {
      duration: 1.25,
      scaleX: 1,
      transformOrigin: 'right',
      ease: 'power4.inOut',
      stagger: 0.07,
      delay: 1
    }, '<')
    .to('#bar', {
      duration: 1.25,
      ease: 'power4.inOut',
      autoAlpha: 0
    });
}

// Animation for the overlay
function overlayAnimation() {
  const tl = gsap.timeline({
    paused: true,
    reversed: true
  });

  // Uncomment this section to animate text split
  // const splitTypes = document.querySelectorAll("[text-split]")
  // splitTypes.forEach((char, i) => {
  //     const text = new SplitType(char, {
  //         types: 'words'
  //     })

  //     tl.from(text.words, {
  //         y: "-100%",
  //         opacity: 0,
  //         duration: 2,
  //         ease: "power4.inOut",
  //         stagger: {
  //             amount: 0.5,
  //         },
  //     }, "<")
  // })

  tl.from('#menu-cluster .text', {
    y: '100%',
    delay: -1,
    opacity: 0,
    duration: 2.2,
    ease: 'power4.inOut',
    stagger: 0.12
  }, '<')
    .to('#nav-cluster a', {
      ease: 'power4.inOut',
      duration: 1,
      x: '100%',
      stagger: 0.07,
      autoAlpha: 0
    }, '<')
    .to('#overlay-bg', {
      ease: 'power4.inOut',
      duration: 0.75,
      autoAlpha: 1
    }, '<')
    .to('line', {
      duration: 2.5,
      ease: 'power4.inOut',
      stagger: 0.065,
      width: '100%'
      // opacity: 0,
    }, '<');

  Array.from(document.querySelectorAll('.menu-close, .menu-open')).forEach(e =>
    e.addEventListener('click', function () {
      tl.reversed() ? tl.play() : tl.reverse();
    })
  );
}

// Animation for the button
function buttonAnimation() {
  overlayAnimation();
  const tl = gsap.timeline({
    paused: true,
    reversed: true
  });
  const toggleBtn = document.getElementById('menu');
  toggleBtn.onclick = function (e) {
    tl.reversed(!tl.reversed());
  };
}

// Animation for navigation on scroll
function navScroll() {
  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', () => {
    gsap.to('#nav-cluster a', {
      ease: 'power4.inOut',
      duration: 1,
      x: '-100%',
      stagger: 0.07,
      autoAlpha: 0,
      scrollTrigger: {
        scrub: 4,
        trigger: 'nav',
        start: 'top',
        scroller: 'body'
      }
    });
  });
}

// Fade animation for hero section
function heroFade() {
  gsap.to('.fade', {
    opacity: 0,
    ease: 'power4.inOut',
    scrollTrigger: {
      scrub: true,
      trigger: 'main',
      end: 'bottom 55%'
    }
  });
}

// Reveal animation for dividers
function dividerReveal() {
  ScrollTrigger.batch('#divider', {
    trigger: 'section',
    start: 'top 90%',
    onEnter: batch =>
      gsap.to(batch, {
        opacity: 1,
        stagger: 0.15,
        width: '100%',
        duration: 2.1,
        ease: 'power4.inOut'
      })
  });
}

// Reveal animation for about section
function aboutReveal() {
  gsap.from('#header-layout .h1', {
    opacity: 0,
    y: '-100%',
    duration: 2.2,
    ease: 'power4.inOut',
    stagger: 0.1,
    scrollTrigger: {
      trigger: '#desc-v3',
      start: 'top 80%'
    }
  });
}

// Initialize drag functionality for project frames
function initDrag() {
  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', () => {
    gsap.from('.polaroid-frame', {
      duration: 2,
      scale: 0,
      ease: 'expo.inOut',
      onComplete: drag,
      stagger: 0.09
    });
  });
}

// Drag functionality for project frames
function drag() {
  Draggable.create('.project_wrapper', {
    type: 'x,y',
    bounds: window,
    onDragStart: function () {
      gsap.to('.polaroid-frame', {
        duration: 0.2,
        scale: 1.05,
        ease: 'power1.out'
      });
    },
    onDragEnd: function () {
      gsap.to('.polaroid-frame', {
        duration: 0.2,
        scale: 1,
        ease: 'power1.out'
      });
    }
  });
}

// Check if the device is mobile
const isMobile = window.matchMedia('(max-width: 900px)').matches;

// Uncomment this section to add hover effects for project frames
// const gridBox = document.querySelectorAll('.polaroid-frame');
// function hoverBoxes() {
//     gridBox.forEach((box) => {
//         box.addEventListener('mouseenter', () => {
//             gridBox.forEach((otherBox) => {
//                 if (otherBox !== box) {
//                     otherBox.style.opacity = '0';
//                     otherBox.style.scale = "1";
//                 } else {
//                     otherBox.style.opacity = '1';
//                     otherBox.style.scale = "1.05";
//                 }
//             });
//         });

//         box.addEventListener('mouseleave', () => {
//             gridBox.forEach((otherBox) => {
//                 otherBox.style.opacity = '1';
//                 otherBox.style.scale = "1";
//             });
//         });
//     });
// }

// Add hover effects for menu items
function menuHover() {
  const elements = document.querySelectorAll('.text');

  elements.forEach(element => {
    const innerText = element.innerText;
    element.innerHTML = '';

    const textContainer = document.createElement('div');
    textContainer.classList.add('block');

    for (const letter of innerText) {
      const span = document.createElement('span');
      span.innerText = letter.trim() === '' ? '\xa0' : letter;
      span.classList.add('letter');
      textContainer.appendChild(span);
    }

    element.appendChild(textContainer);
    element.appendChild(textContainer.cloneNode(true));
  });

  elements.forEach(element => {
    element.addEventListener('mouseover', () => {
      element.classList.remove('play');
    });
  });
}

//Time
var getTime = function() {
  document.getElementById("time").innerHTML = new Date().toLocaleString("en-IN", {
      timeZone: 'Asia/Kolkata',
      timeStyle: 'long',
      hourCycle: 'h24'
  })
};
getTime();
setInterval(getTime, 1000);

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, Draggable);
gsap.config({
  nullTargetWarn: false
});

//Barba
//barba.init({})

// Call functions
lenisInit();
navScroll();
heroFade();
dividerReveal();
valueSet();
buttonAnimation();
aboutReveal();
initDrag();
// if (!isMobile) hoverBoxes();
if (!isMobile) menuHover();
