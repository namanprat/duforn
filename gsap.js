import barba from '@barba/core';

function valueSet() {
    gsap.set("#overlay-bg", {
        autoAlpha: 0,
       // x: "100%"
    });
};
function loader() {
    var tl = gsap.timeline();
    tl.to(".loader", {
        delay: 3,
        duration: 2,
        ease: "power4.inOut",
        scale: 0,
        // opacity: 0,
    })
}
function loaderText() {
    const splitTypes = document.querySelectorAll("[loader-split]")
        splitTypes.forEach((char,i) => {
            const text = new SplitType(char, { types: 'chars'})
            var tl = gsap.timeline();
            tl.from(text.chars, {
                y: "-100",
                ease: "power4.inOut",
                duration: 3,
                //  opacity: 0,
                  stagger: 0.1,
                  delay: 1,
             })
             .to(text.chars, {
                y: "100",
                ease: "power4.inOut",
                duration: 3,
                //  opacity: 0,
                  stagger: 0.1
             })
        })
}
function transition() {
    var tl = gsap.timeline();
    tl.to("#bar", {
        duration: 1.5,
        transformOrigin: "top",
        ease: "power4.inOut",
        height: "100%",
        stagger: 0.025,
    }).from("#bar", {
        duration: 1.5,
        transformOrigin: "bottom",
        ease: "power4.inOut",
        height: 0,
        stagger: 0.025,
    })
}
function overlayAnimation() {
    var tl = gsap.timeline({
        paused: true,
        reversed: true
    });
    tl.to("#nav-cluster a", {
        ease: "power4.inOut",
        duration: 1,
        x: "-100%",
        stagger: 0.07,
        autoAlpha: 0
    }, "<").to("#overlay-bg", {
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
}

function navScroll() {
    let mm = gsap.matchMedia();
     mm.add("(min-width: 1000px)", () => {
        gsap.to("#nav-cluster a", {
        // ease: "power4.inOut",
        duration: 2,
        x: "-100%",
        stagger: 0.07,
        autoAlpha: 0,
            scrollTrigger: {
                scrub: 1,
                trigger: '#nav-cluster',
                start: "top",
                scroller: "body",
                // markers: true,
            }
        })
    })
};

function navFade() {
    let mm = gsap.matchMedia();
    mm.add("(max-width: 1000px)", () => {
        gsap.set("#nav-cluster a", {
            autoAlpha: 0
        })
    })
};
function textReveal() {
    const splitTypes = document.querySelectorAll("[text-split]")
        splitTypes.forEach((char,i) => {
            const text = new SplitType(char, { types: 'words'})

            gsap.from(text.words, {
                 scrollTrigger: {
                     trigger: "#about",
                     start: 'top top',
                     end: "bottom bottom",
                     scrub: true,
                 },
                 delay: 1,
                 opacity: 0.2,
                 stagger: 1,
             })
        })
}
function titleReveal() {
    gsap.from("#zoom-in h1", {
        scrollTrigger: {
            trigger: "#about",
            start: 'top 70%',
        },
                y: "100%",
                ease: "power4.inOut",
                duration: 1.5,
                  stagger: 0.1
             })
}

function workReveal() {
    gsap.to("#divider", {
        duration: 2.25,
        ease: "power4.inOut",
        stagger: 0.065,
        width: "100%",
        scrollTrigger: {

            trigger: ".divider",
            start: 'top 90%',

        }
    }
    )
}
function aboutReveal() {
gsap.from("#about-header *", {
    y: "100%",
    ease: "power4.inOut",
    duration: 1.5,
    stagger: 0.05
})
}
function delay(n) {
    n = n || 0;
    return new Promise((done) => 
        {
            setTimeout(() => {
                done();
            }, n);
        });
};

barba.init({
    sync: true,
    transitions: [
        {
        async leave(data) {
            const done = this.async();
            transition();
            await delay(1000);
            done();
        },
    },
],
});




gsap.registerPlugin(ScrollTrigger);
gsap.config({nullTargetWarn: false});
valueSet();
// loader();
buttonAnimation();
overlayAnimation();
navScroll();
navFade();
textReveal();
// workReveal();
loaderText();
// aboutReveal();