function valueSet() {
    gsap.set("#overlay-bg", {
        autoAlpha: 0,
       // x: "100%"
    });
};

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

function contactReveal() {
    const splitTypes = document.querySelectorAll("[title-split]")
        splitTypes.forEach((char,i) => {
            const text = new SplitType(char, { types: 'chars'})

            gsap.from(text.chars, {
                y: "-100",
                ease: "power4.inOut",
                duration: 2,
                 opacity: 0,
                  stagger: 0.025
             })
        })
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

            trigger: "#work",
            start: 'top 95%',

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



gsap.registerPlugin(ScrollTrigger);
gsap.config({
    nullTargetWarn: false
    });
    valueSet();
    buttonAnimation();
    overlayAnimation();
    navScroll();
    navFade();
    textReveal();
    workReveal();
    contactReveal();
    aboutReveal();