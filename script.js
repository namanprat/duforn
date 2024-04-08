import barba from '@barba/core';
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import SplitType from 'split-type'
import Swiper from 'swiper';
import LocomotiveScroll from 'locomotive-scroll';
import 'swiper/css';
import {Gradient} from './Gradient.js';

const gradient = new Gradient();
gradient.initGradient('#gradient-canvas');

function horizontalScroll() {
    const container = document.querySelector("#project-row");
    console.log(container.offsetWidth)

    function getScrollAmount() {
        let containerWidth = container.scrollWidth;
        return -(containerWidth - window.innerWidth);
    }
    let mm = gsap.matchMedia();
    mm.add("(min-width: 850px)", () => {
        const tween = gsap.to(container, {
            x: getScrollAmount,
            duration: 3,
            ease: "none",
        });

        ScrollTrigger.create({
            trigger: "#project-wrapper",
            start: "clamp(top)",
            end: () => `+=${getScrollAmount() * -1}`,
            animation: tween,
            scrub: true,
            invalidateOnRefresh: true,
        })
    })
}

    const locomotiveScroll = new LocomotiveScroll({
        lenisOptions: {
            wrapper: window,
            content: document.documentElement,
            lerp: 0.3,
            duration: 1.2,
            gestureOrientation: 'vertical',
            smoothWheel: true,
            smoothTouch: false,
            wheelMultiplier: 1,
            touchMultiplier: 2,
            normalizeWheel: true,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
        },
    });

function swiperInit() {
    var swiper = new Swiper(".swiper-container", {
        loopedSlides: 4,
        loop: true,
        slidesPerView: "auto",
        freeMode: true,
        mousewheel: {
            releaseOnEdges: true,
        },
    });
}

function valueSet() {
    gsap.set("#overlay", {
        autoAlpha: 0,
    });
    gsap.set("#overlay-bg", {
        autoAlpha: 0,
    });
    gsap.set("#nav-cluster a", {
        x: 0,
        autoAlpha: 1,
    });

    let mm = gsap.matchMedia();
    mm.add("(max-width: 900px)", () => {
        gsap.set("#nav-cluster a", {
            autoAlpha: 0
        })
    });
};

function loader() {
    var tl = gsap.timeline();
    tl.to(".loader", {
        delay: 3,
        duration: 2,
        ease: "power4.inOut",
        scale: 0,
        opacity: 0.3,
    });
    const splitTypes = document.querySelectorAll("[loader-split]")
    splitTypes.forEach((char, i) => {
        const text = new SplitType(char, {
            types: 'chars'
        })
        var tl = gsap.timeline();
        tl.from(text.chars, {
                y: "-100%",
                ease: "power4.inOut",
                duration: 2,
                stagger: 0.1,
            })
            .to(text.chars, {
                opacity: 0,
                y: "100%",
            })
    })
}

function introReveal() {
    var tl = gsap.timeline();
    tl
        .from("#intro-logo svg path", {
            ease: "power4.inOut",
            y: "100%",
            delay: 0.25,
            duration: 2,
            opacity: 0,
            stagger: 0.06
        })
}

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
    const splitTypes = document.querySelectorAll("[text-split]")
    splitTypes.forEach((char, i) => {
        const text = new SplitType(char, {
            types: 'chars'
        })

        tl.from(text.chars, {
            y: "-100%",
            opacity: 0,
            duration: 2,
            ease: "power4.inOut",
            stagger: {
                amount: 0.5,
            },
        }, "<")
    })
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
            opacity: 0,
        }, "<");


    Array.from(document.querySelectorAll(".menu-open")).forEach(e => e.addEventListener("click", function() {
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
            start: 'top 90%',
        }
    })
}

function workReveal() {
    var tl = gsap.timeline();
    tl

        .from(".swiper-wrapper a", {
            opacity: 0,
            y: "100%",
            duration: 2.2,
            ease: "power4.inOut",
            stagger: 0.1,
        }, "<")
    const splitTypes = document.querySelectorAll("[project-split]")
    splitTypes.forEach((char, i) => {
        const text = new SplitType(char, {
            types: 'words'
        })

        gsap.from(text.words, {
            y: "-100%",
            delay: 1.2,
            opacity: 0,
            duration: 1.7,
            ease: "power4.inOut",
            stagger: 0.1,
        })
    })

}

gsap.registerPlugin(ScrollTrigger);
gsap.config({
    nullTargetWarn: false
});

function delay(n) {
    n = n || 1500;
    return new Promise((done) => {
        setTimeout(() => {
            done();
        }, n);
    });
};

navScroll(); //Hides elements of the navbar on scroll
// aboutTextReveal(); //text reveal, added this to reset the state on other page load
dividerReveal(); //Reveals div borders scrollTrigger, added to reset state
workReveal();
swiperInit();
valueSet();
buttonAnimation();
aboutReveal();
horizontalScroll();