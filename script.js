// import barba from '@barba/core';
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import SplitType from 'split-type'
import Swiper from 'swiper';
import LocomotiveScroll from 'locomotive-scroll';
import 'swiper/css';


const locomotiveScroll = new LocomotiveScroll({
    lenisOptions: {
        wrapper: window,
        content: document.documentElement,
        lerp: 0.3,
        duration: 1.2,
        // orientation: 'vertical',
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
        loopedSlides: 6,
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
    gsap.set("#divider", {
        width: 0,
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
    tl.to("#bar", {
        duration: 1.25,
        scaleY: 1,
        transformOrigin: "top",
        ease: "power4.inOut",
        stagger: 0.07,
        delay: 1,
    }).to("#bar", {
        transformOrigin: "bottom",
        duration: 1.25,
        scaleY: 0,
        ease: "power4.inOut",
        stagger: 0.07,
    })
}

function overlayAnimation() {
    var tl = gsap.timeline({
        paused: true,
        reversed: true
    });
    tl.to("#home", {
            autoAlpha: 0,
            duration: 1,
            ease: "power4.inOut",
        }, "<")
        .to("#nav-cluster a", {
            ease: "power4.inOut",
            duration: 1,
            x: "-100%",
            stagger: 0.07,
            autoAlpha: 0
        }, "<")
        .to("#overlay", {
            ease: "power4.inOut",
            duration: 0.75,
            autoAlpha: 1
        }, "<")
        .to("#seperator", {
            duration: 2.25,
            ease: "power4.inOut",
            stagger: 0.065,
            width: "100%",
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
    // const hamburger = document.getElementById("hamburger");
    toggleBtn.onclick = function(e) {
        // hamburger.classList.toggle("active");
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

function blurReveal() {
    ScrollTrigger.batch(".blur", {
        trigger: "img",
        start: "top center",
        duration: 0.3,
        onEnter: (batch) =>
            gsap.to(batch, {
                scale: 1,
                filter: "blur(0px)",

            }),
    });
}

function opacityReveal() {
    const splitTypes = document.querySelectorAll("[text-split]")
    splitTypes.forEach((char, i) => {
        const text = new SplitType(char, {
            types: 'words'
        })

        gsap.from(text.words, {
            scrollTrigger: {
                trigger: "#about",
                start: 'top top',
                end: "bottom bottom",
                scrub: true,
            },
            opacity: 0.15,
            stagger: 1,
        })
    })
}

function textReveal() {
    gsap.from("#desc-v2 h1", {
        opacity: 0,
        duration: 2,
        ease: "power4.inOut",
        stagger: 0.09,
        y: "100%",
    })
}

function lineReveal() {
    gsap.to("#divider", {
        opacity: 1,
        width: "100%",
        duration: 2.2,
        ease: "power4.inOut",
        stagger: 0.1,
        scrollTrigger: {
            trigger: ".divider",
            start: 'top 90%',

        }
    })
}

function aboutReveal() {
    const splitTypes = document.querySelectorAll("[header-split]")
    splitTypes.forEach((char, i) => {
        const text = new SplitType(char, {
            types: 'words'
        })

        gsap.from(text.words, {
            scrollTrigger: {
                trigger: "section",
                start: 'top',
                end: "bottom bottom",
                scrub: true,
                markers: true,
            },
            opacity: 0.15,
            stagger: 1,
        })
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

navScroll(); //Hides elements of the navbar on scroll
            textReveal(); //text reveal, added this to reset the state on other page load
            lineReveal(); //Reveals div borders scrollTrigger, added to reset state
            blurReveal();
            workReveal();
            opacityReveal();
            swiperInit();
valueSet();
buttonAnimation();
overlayAnimation();
aboutReveal();

