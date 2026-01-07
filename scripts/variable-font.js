import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

const splits = new Map();

function getOrSplit(element) {
  if (splits.has(element)) return splits.get(element);
  // Split into lines, words, AND chars to support both animation types
  const split = new SplitText(element, { type: "lines, words, chars" });
  
  // Apply overflow hidden to lines (parents of words)
  if (split.lines) {
    split.lines.forEach(line => {
      line.style.overflow = "hidden";
    });
  }

  splits.set(element, split);
  return split;
}


function initVariableFont() {
  // Create the gsap-matchMedia instance
  let mm = gsap.matchMedia();
  mm.add("(min-width: 992px)", () => {
    const fontweightItems = document.querySelectorAll(
      "[data-animate='font-weight'], [data-animate='font-weight-reverse']"
    );
    const MAX_DISTANCE = 300; // Adjust the maximum distance for
    const MAX_FONT_WEIGHT = 800; // Maximum font weight
    const MIN_FONT_WEIGHT = 400; // Minimum font weight

    // Split up any text with the data attribute into individual
    fontweightItems.forEach((item) => {
      const split = getOrSplit(item);
      const isReverse = item.getAttribute('data-animate') === 'font-weight-reverse';
      const targets = isReverse ? split.chars : split.words;

      // Set initial weight for reverse (Menu) to be Thick
      if (isReverse) {
        gsap.set(targets, { fontWeight: MAX_FONT_WEIGHT });
      }

      item.addEventListener("mousemove", (e) => {
        targets.forEach((target) => {
          const bounds = target.getBoundingClientRect();
          const centerX = bounds.left + bounds.width / 2;
          const centerY = bounds.top + bounds.height / 2;
          const distance = Math.hypot(
            centerX - e.clientX,
            centerY - e.clientY
          );
          
          let newFontWeight;
          const weightRange = MAX_FONT_WEIGHT - MIN_FONT_WEIGHT;

           if (isReverse) {
            // Menu: Thick (800) -> Thin (400)
            if (distance < MAX_DISTANCE) {
              newFontWeight = MIN_FONT_WEIGHT + (distance / MAX_DISTANCE) * weightRange;
            } else {
              newFontWeight = MAX_FONT_WEIGHT;
            }
           } else {
            // Regular: Thin (400) -> Thick (800)
            if (distance < MAX_DISTANCE) {
              newFontWeight = MAX_FONT_WEIGHT - (distance / MAX_DISTANCE) * weightRange;
            } else {
              newFontWeight = MIN_FONT_WEIGHT;
            }
           }

          gsap.to(target, {
            duration: 0.2,
            ease: "power1.out",
            fontWeight: newFontWeight,
            overwrite: "auto", // Use auto to avoid killing the reveal animation
          });
        });
      });

      item.addEventListener("mouseleave", () => {
        const targetWeight = isReverse ? MAX_FONT_WEIGHT : MIN_FONT_WEIGHT;
        targets.forEach((target) => {
          gsap.to(target, {
            duration: 0.5,
            ease: "power2.out",
            fontWeight: targetWeight,
            overwrite: "auto",
          });
        });
      });
    });
  });


  // Spotlight text reveal animation
  const textReveal = document.querySelector(".text-reveal");
  if (textReveal) {
    const split = getOrSplit(textReveal);
    gsap.fromTo(
      split.words,
      {
        y: -100,
        filter: "blur(5px)",
        opacity: 0,
      },
      {
        y: 0,
        filter: "blur(0px)",
        opacity: 1,
        duration: 1,
        stagger: 0.05,
        ease: "power2.out",
        scrollTrigger: {
          trigger: textReveal,
          start: "top 80%",
        //   markers: true,
        },
      }
    );
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initVariableFont();
});

export { initVariableFont };