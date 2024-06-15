import gsap from "gsap";
import Draggable from "gsap/Draggable"

function initDrag() {
    gsap.from(".polaroid-frame", {
        duration: 1.7,
        scale: 0,
        ease: 'expo.inOut',
        onComplete: drag,
        stagger: 0.08,
    });
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
};


gsap.registerPlugin(Draggable);
initDrag();





