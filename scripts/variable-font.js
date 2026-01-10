import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getOrSplit } from "./text-reveal.js";

gsap.registerPlugin(ScrollTrigger);

// Module state
let mm = null;
let cachedData = [];
let resizeTimeout = null;

const MAX_DISTANCE = 300;
const MAX_FONT_WEIGHT = 800;
const MIN_FONT_WEIGHT = 500;
const WEIGHT_RANGE = MAX_FONT_WEIGHT - MIN_FONT_WEIGHT;

function initVariableFont() {
  // Create the gsap-matchMedia instance
  mm = gsap.matchMedia();
  
  mm.add("(min-width: 992px)", () => {
    const fontweightItems = document.querySelectorAll(
      "[data-animate='font-weight'], [data-animate='font-weight-reverse']"
    );

    fontweightItems.forEach((item) => {
      const split = getOrSplit(item);
      const isReverse = item.getAttribute('data-animate') === 'font-weight-reverse';
      const targets = isReverse ? split.chars : split.words;

      // Set initial weight: reverse items thick, regular items light
      gsap.set(targets, { fontWeight: isReverse ? MAX_FONT_WEIGHT : MIN_FONT_WEIGHT });

      // Cache target data with bounds
      const targetData = Array.from(targets).map(target => ({
        element: target,
        bounds: null,
        centerX: 0,
        centerY: 0
      }));

      // Calculate and cache bounds
      const updateBounds = () => {
        targetData.forEach(data => {
          const bounds = data.element.getBoundingClientRect();
          data.bounds = bounds;
          data.centerX = bounds.left + bounds.width / 2;
          data.centerY = bounds.top + bounds.height / 2;
        });
      };

      updateBounds();

      // Store for cleanup and resize
      const itemData = {
        item,
        targetData,
        isReverse,
        updateBounds,
        rafId: null,
        mouseX: null,
        mouseY: null,
        isHovering: false
      };

      cachedData.push(itemData);

      // RAF-based update loop for smooth performance
      const updateWeights = () => {
        if (!itemData.isHovering) return;

        const mouseX = itemData.mouseX;
        const mouseY = itemData.mouseY;

        targetData.forEach(data => {
          const distance = Math.hypot(
            data.centerX - mouseX,
            data.centerY - mouseY
          );

          let newFontWeight;

          if (isReverse) {
            // Menu: Thick (800) -> Thin (500)
            newFontWeight = distance < MAX_DISTANCE
              ? MIN_FONT_WEIGHT + (distance / MAX_DISTANCE) * WEIGHT_RANGE
              : MAX_FONT_WEIGHT;
          } else {
            // Regular: Thin (500) -> Thick (800)
            newFontWeight = distance < MAX_DISTANCE
              ? MAX_FONT_WEIGHT - (distance / MAX_DISTANCE) * WEIGHT_RANGE
              : MIN_FONT_WEIGHT;
          }

          gsap.to(data.element, {
            duration: 0.2,
            ease: "power1.out",
            fontWeight: newFontWeight,
            overwrite: "auto"
          });
        });

        itemData.rafId = requestAnimationFrame(updateWeights);
      };

      // Mousemove: just store coords, RAF handles updates
      const onMouseMove = (e) => {
        itemData.mouseX = e.clientX;
        itemData.mouseY = e.clientY;
        
        if (!itemData.isHovering) {
          itemData.isHovering = true;
          itemData.rafId = requestAnimationFrame(updateWeights);
        }
      };

      const onMouseLeave = () => {
        itemData.isHovering = false;
        if (itemData.rafId) {
          cancelAnimationFrame(itemData.rafId);
          itemData.rafId = null;
        }

        const targetWeight = isReverse ? MAX_FONT_WEIGHT : MIN_FONT_WEIGHT;
        targetData.forEach(data => {
          gsap.to(data.element, {
            duration: 0.5,
            ease: "power2.out",
            fontWeight: targetWeight,
            overwrite: "auto"
          });
        });
      };

      item.addEventListener("mousemove", onMouseMove);
      item.addEventListener("mouseleave", onMouseLeave);

      // Store handlers for cleanup
      itemData.onMouseMove = onMouseMove;
      itemData.onMouseLeave = onMouseLeave;
    });

    // Recalculate bounds on resize (debounced)
    const onResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        cachedData.forEach(data => data.updateBounds());
      }, 150);
    };

    window.addEventListener("resize", onResize);
    
    // Store cleanup
    return () => {
      window.removeEventListener("resize", onResize);
      cachedData.forEach(data => {
        if (data.rafId) cancelAnimationFrame(data.rafId);
        data.item.removeEventListener("mousemove", data.onMouseMove);
        data.item.removeEventListener("mouseleave", data.onMouseLeave);
      });
      cachedData = [];
    };
  });
}

function destroyVariableFont() {
  if (mm) {
    mm.revert();
    mm = null;
  }
  cachedData.forEach(data => {
    if (data.rafId) cancelAnimationFrame(data.rafId);
  });
  cachedData = [];
  clearTimeout(resizeTimeout);
}

document.addEventListener("DOMContentLoaded", () => {
  initVariableFont();
});

export { initVariableFont, destroyVariableFont };