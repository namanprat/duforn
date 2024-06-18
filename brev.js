import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";


function valueSt() {
    gsap.set('#gallery-bg', { clipPath: 'inset(0 0 0 0)' });
    gsap.set('#gallery-title h1', { y: "0%" });
    gsap.set('#chips-xl li', { y: "0%" });
}
function animateGallery() {
    var tl = gsap.timeline({
        scrollTrigger: {
            trigger: "#gallery-media",
            start: 'top 2.5%',
            end: '+=8000 bottom',
            scrub: true,
            pin: true,
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



gsap.registerPlugin(ScrollTrigger);
animateGallery();
valueSt();
