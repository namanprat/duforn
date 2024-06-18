import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Draggable from "gsap/Draggable";
import SplitType from 'split-type'
import Lenis from 'lenis'
import {Gradient} from './Gradient.js';
import InfiniteMarquee from 'vanilla-infinite-marquee';


new InfiniteMarquee({
	element: '.marquee-container',
	speed: 50000,
	// smoothEdges: true,
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
          date.innerText = '[ 4 ]'
          body.classList.remove('hovered')
          link.classList.remove('hovered')
        })
      })


const gradient = new Gradient();
gradient.initGradient('#gradient-canvas');


// function horizontalScroll() {
//     const container = document.querySelector("#project-row");
//     console.log(container.offsetWidth)

//     function getScrollAmount() {
//         let containerWidth = container.scrollWidth;
//         return -(containerWidth - window.innerWidth);
//     }
//     let mm = gsap.matchMedia();
//     mm.add("(min-width: 850px)", () => {
//         const tween = gsap.to(container, {
//             x: getScrollAmount,
//             duration: 3,
//             ease: "none",
//         });

//         ScrollTrigger.create({
//             trigger: "#project-wrapper",
//             start: "clamp(top)",
//             end: () => `+=${getScrollAmount() * -1}`,
//             animation: tween,
//             scrub: true,
//             invalidateOnRefresh: true,
//         })
//     })
// }

function lenisInit() {
    const lenis = new Lenis({
        lerp: 0.05,
        smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
};


function valueSet() {
    gsap.set("#overlay", {autoAlpha: 0,});
    gsap.set("#overlay-bg", { autoAlpha: 0,});
    gsap.set("#nav-cluster a", {x: 0,autoAlpha: 1,});

    let mm = gsap.matchMedia();
    mm.add("(max-width: 900px)", () => {gsap.set("#nav-cluster a", {autoAlpha: 0})});
    
    gsap.set('#gallery-bg', { clipPath: 'inset(0 0 0 0)' });
    gsap.set('#gallery-title h1', { y: "0%" });
    gsap.set('#chips-xl li', { y: "0%" });
};

function transition() {
    var tl = gsap.timeline();
    tl.to("#bar .sweep-left", {
            duration: 1.25,
            scaleX: 1,
            transformOrigin: "left",
            ease: "power4.inOut",
            stagger: 0.07,
            delay: 1,
        }, "<")
        .to("#bar .sweep-right", {
            duration: 1.25,
            scaleX: 1,
            transformOrigin: "right",
            ease: "power4.inOut",
            stagger: 0.07,
            delay: 1,
        }, "<")
        .to("#bar", {
            duration: 1.25,
            ease: "power4.inOut",
            autoAlpha: 0,
        })
}

function overlayAnimation() {
    var tl = gsap.timeline({
        paused: true,
        reversed: true
    });
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
    tl.from("#menu-cluster .text", {
        y: "100%",
        delay: -1,
        opacity: 0,
        duration: 2.2,
        ease: "power4.inOut",
        stagger: 0.12,
    }, "<")
    tl.to("#nav-cluster a", {
            ease: "power4.inOut",
            duration: 1,
            x: "100%",
            stagger: 0.07,
            autoAlpha: 0,
        }, "<")
        .to("#overlay-bg", {
            ease: "power4.inOut",
            duration: 0.75,
            autoAlpha: 1
        }, "<")
        .to("#div", {
            duration: 2.5,
            ease: "power4.inOut",
            stagger: 0.065,
            width: "100%",
            // opacity: 0,
        }, "<");

        Array.from(document.querySelectorAll(".menu-close, .menu-open")).forEach(e => e.addEventListener("click", function() {
            tl.reversed() ? tl.play() : tl.reverse()
    }))
};

function buttonAnimation() {
    overlayAnimation();
    var tl = gsap.timeline({
        paused: true,
        reversed: true
    });
    const toggleBtn = document.getElementById("menu");
    toggleBtn.onclick = function(e) {
        tl.reversed(!tl.reversed())
    }
};

function navScroll() {
    let mm = gsap.matchMedia();
    mm.add("(min-width: 900px)", () => {
        gsap.to("#nav-cluster a", {
            ease: "power4.inOut",
            duration: 1,
            x: "-100%",
            stagger: 0.07,
            autoAlpha: 0,
            scrollTrigger: {
                scrub: 4,
                trigger: 'nav',
                start: "top",
                scroller: "body",
            }
        })
    })
};

function heroFade() {
    gsap.to(".fade", {
        opacity: 0,

        ease: "power4.inOut",
        // stagger: 0.1,
        scrollTrigger: {
            scrub: true,
            trigger: "main",
           // markers: true,
            //start: 'top 10%',
            end: 'bottom 55%',
        }
    })
}
function dividerReveal() {
    ScrollTrigger.batch("#divider", {
        trigger: "section",
        //markers: true,
        start: 'top 90%',
        onEnter: (batch) =>
            gsap.to(batch, {
                opacity: 1,
                stagger: 0.15,
                width: "100%",
                duration: 2.1,
                ease: "power4.inOut",
            }),
    })
}

function aboutReveal() {
    gsap.from("#header-layout .h1", {
        opacity: 0,
        y: "-100%",
        duration: 2.2,
        ease: "power4.inOut",
        stagger: 0.1,
        scrollTrigger: {
            trigger: "#desc-v3",
            start: 'top 80%',
        }
    })
}

function animateGallery() {
    var tl = gsap.timeline({
        scrollTrigger: {
            trigger: "#gallery-media",
            start: 'top 2.5%',
            end: '+=8000 bottom',
            scrub: true,
            pin: "#gallery-media",
            //markers: true,
        },
    });

    tl
    .from('#gallery-bg img',{
        duration: 1,
        scale: 1.2,
    },'<-0.3'
    )

    .to('#gallery-bg',{
        clipPath: 'inset(0 0 100% 0)',
    },'>-0.2'
    )

     .to('#gallery-title h1',{
        y: "-100%",
        opacity: 0,

     },'>-0.7'
     )
     
    .to('#chips-xl li',{
        y: "-100%",
        opacity: 0,
        stagger: 0.07,
    },'>-0.7'
    )
}

function initDrag() {
    let mm = gsap.matchMedia();
    mm.add("(min-width: 900px)", () => {

    gsap.from(".polaroid-frame", {
        duration: 2,
        scale: 0,
        ease: 'expo.inOut',
        onComplete: drag,
        stagger: 0.09,
    })
    })
};

function drag() {
    Draggable.create(".project_wrapper", {
        type: 'x,y',
        bounds: window,
        onDragStart: function () {
            gsap.to(".polaroid-frame", {
                duration: 0.2,
                scale: 1.05,
                ease: 'power1.out',
            });
        },
        onDragEnd: function () {
            gsap.to(".polaroid-frame", {
                duration: 0.2,
                scale: 1,
                ease: 'power1.out',
            });
        },
    });
}

const isMobile = window.matchMedia('(max-width: 900px)').matches;

//  const gridBox = document.querySelectorAll('.polaroid-frame');
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

function menuHover() {
    let elements = document.querySelectorAll(".text");

      elements.forEach((element) => {
        let innerText = element.innerText;
        element.innerHTML = "";

        let textContainer = document.createElement("div");
        textContainer.classList.add("block");

        for (let letter of innerText) {
          let span = document.createElement("span");
          span.innerText = letter.trim() === "" ? "\xa0" : letter;
          span.classList.add("letter");
          textContainer.appendChild(span);
        }

        element.appendChild(textContainer);
        element.appendChild(textContainer.cloneNode(true));
      });

      elements.forEach((element) => {
        element.addEventListener("mouseover", () => {
          element.classList.remove("play");
        });
      });
}


gsap.registerPlugin(ScrollTrigger, Draggable);
gsap.config({
    nullTargetWarn: false
});

lenisInit()
navScroll();
animateGallery();
heroFade();
dividerReveal();
valueSet();
buttonAnimation();
aboutReveal();
initDrag();
// if (!isMobile) hoverBoxes();
if (!isMobile) menuHover();


