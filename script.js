import barba from '@barba/core';
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import SplitType from 'split-type'


var getTime = function() {
    document.getElementById("time").innerHTML = new Date().toLocaleString("en-IN", {
        timeZone: 'Asia/Kolkata',
        timeStyle: 'long',
        hourCycle: 'h24'
    })
};

function magnet() {
    var magnets = document.querySelectorAll('.magnetic')
    var strength = 35

    magnets.forEach((magnet) => {
        magnet.addEventListener('mousemove', moveMagnet);
        magnet.addEventListener('mouseout', function(event) {
            gsap.to(event.currentTarget, 1, {
                x: 0,
                y: 0,
                ease: "power4.inOut",
            })
        });
    });

    function moveMagnet(event) {
        var magnetButton = event.currentTarget
        var bounding = magnetButton.getBoundingClientRect()

        gsap.to(magnetButton, 1, {
            x: (((event.clientX - bounding.left) / magnetButton.offsetWidth) - 0.5) * strength,
            y: (((event.clientY - bounding.top) / magnetButton.offsetHeight) - 0.5) * strength,
            ease: "power4.inOut",
        })
    };
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
        }, "<").to("#overlay", {
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
            duration: 1,
            x: "-100%",
            stagger: 0.07,
            autoAlpha: 0,
            scrollTrigger: {
                scrub: 4,
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
                //  markers: true,
            },
            delay: 1,
            opacity: 0.1,
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
    })
}

function aboutReveal() {
    gsap.from("#about-2 svg path", {
        y: "105%",
        delay: 1,
        ease: "power4.inOut",
        stagger: {
            amount: 0.25
        },
        duration: 2,
    });
    const splitTypes = document.querySelectorAll("[about-split]")
    splitTypes.forEach((char, i) => {
        const text = new SplitType(char, {
            types: 'words'
        })

        gsap.from(text.words, {
            y: "120%",
        ease: "power4.inOut",
            delay: 1.75,
            duration: 1.35,
            opacity: 0,
            stagger: 0.005,
        })
    })
}

function delay(n) {
    n = n || 1500;
    return new Promise((done) => {
        setTimeout(() => {
            done();
        }, n);
    });
};
function contactReveal() {
    gsap.from("#foot svg path", {
        y: "105%",
        ease: "power4.inOut",
        stagger: {
            amount: 0.25
        },
        duration: 2,
        scrollTrigger: {
            // markers: true,
        }
    });
}
barba.init({
    sync: true,
    transitions: [{
        once(data) {
            console.log("once");
            loader(); //Initial page load, plays one time when user visits website
            navScroll(); //Hides elements of the navbar on scroll
            textReveal(); //text reveal, added this to reset the state on other page load
            lineReveal(); //Reveals div borders scrollTrigger, added to reset state
            buttonAnimation();

        },
        async leave(data) {
            console.log("leave");
            const done = this.async();
            transition(); //animation between pages
            window.scrollTo(0, 0); //doesn't seem to work
            console.log("scroll q")
            await delay(2000);
            done();
        },
        async enter(data) {
            textReveal();
            aboutReveal();
            navScroll();
            contactReveal();

        },
        async after(data) {
            console.log("after");
            navScroll();
            textReveal();
            valueSet();
            lineReveal();
            contactReveal();
        },
        async beforeLeave(data) {
            //window.scrollTo(0, 0); //doesn't seem to work
            //console.log("scroll 0")
        },
    }, ],
})


gsap.registerPlugin(ScrollTrigger);
gsap.config({
    nullTargetWarn: false
});

valueSet();
textReveal();
buttonAnimation();
overlayAnimation();
lineReveal();
aboutReveal();
magnet();
getTime();
setInterval(getTime, 1000);