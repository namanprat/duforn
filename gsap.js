import barba from '@barba/core';

function valueSet() {
    gsap.set("#overlay-bg", {
        autoAlpha: 0,
    });
    gsap.set("#divider", {
        width:0,
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
        // opacity: 0,
    });
    const splitTypes = document.querySelectorAll("[loader-split]")
        splitTypes.forEach((char,i) => {
            const text = new SplitType(char, { types: 'chars'})
            var tl = gsap.timeline();
            tl.from(text.chars, {
                y: "-100",
                ease: "power4.inOut",
                duration: 2,
                //  opacity: 0,
                  stagger: 0.1,
             })
             .to(text.chars, {
                y: "100",
                ease: "power4.inOut",
                duration: 2,
                //  opacity: 0,
                  stagger: 0.1
             })
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
     mm.add("(min-width: 900px)", () => {
        gsap.to("#nav-cluster a", {
        ease: "power4.inOut",
        duration: 2,
        x: "-100%",
        stagger: 0.07,
        autoAlpha: 0,
            scrollTrigger: {
                scrub: 1,
                trigger: 'nav',
                start: "top",
                scroller: "body",
                // markers: true,
            }
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
                    //  markers: true,
                 },
                 delay: 1,
                 opacity: 0.2,
                 stagger: 1,
             })
        })
}

function lineReveal() {
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
    delay: 0.75,
    ease: "power4.inOut",
    duration: 1.5,
    stagger: 0.05
})
}
function delay(n) {
    n = n || 1500;
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
            once(data) {
                console.log("once");
                loader(); //Initial page load, plays one time when user visits website
                navScroll();//Hides elements of the navbar on scroll
                textReveal();//text reveal, added this to reset the state on other page load
                lineReveal();//Reveals div borders scrollTrigger, added to reset state
                buttonAnimation();
            },
            async leave(data) {
                console.log("leave");
                // const done = this.async();
                transition();//animation between pages
                await delay(2000);
                // done();
            },
            async enter(data) {
                window.scrollTo(0,0);//doesn't seem to work
                console.log("scroll 0")
                textReveal();
                aboutReveal();
                navScroll();
            },
            async after(data) {
                console.log("after");
                navScroll();
                textReveal();
                valueSet();
                lineReveal();
            },
        },
    ],

})


gsap.registerPlugin(ScrollTrigger);
gsap.config({nullTargetWarn: false});
// gsap.registerPlugin(ScrollToPlugin);





valueSet();
textReveal();
buttonAnimation();
overlayAnimation();
lineReveal();
// aboutReveal();