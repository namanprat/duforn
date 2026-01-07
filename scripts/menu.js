import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { lenis } from "./lenis-scroll.js";

gsap.registerPlugin(SplitText);

let isMenuOpen = false;
let isAnimating = false;
let menuParent = null;
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

// menu functions
function openMenu() {
  const menuBox = document.querySelector(".menu-box");
  const menuToggleBtn = document.querySelector(".menu-toggle-btn");
  const menuItems = document.querySelectorAll(".menu-item");

  isAnimating = true;
  if (menuBox) menuBox.style.pointerEvents = "all";
  if (menuParent) menuParent.style.pointerEvents = "all";
  gsap.to(menuParent, { autoAlpha: 1, duration: 0.3 });
  if (menuToggleBtn) menuToggleBtn.classList.add("menu-open");

  // disable scrolling
  if (lenis) {
    lenis.stop();
  }

  if (menuBox) {
    gsap.to(menuBox, {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      duration: 0.3,
      onComplete: () => {
        isAnimating = false;
      },
    });
  }

  // animate menu items (simple fade in)
  menuItems.forEach((item) => {
    gsap.set(item, { opacity: 1, transform: "translateY(0%)" });
  });

  function playMenuReveal() {
    const menuItems = document.querySelectorAll(".menu-item");
    menuItems.forEach((item, index) => {
      const split = getOrSplit(item);
      gsap.fromTo(
        split.chars,
        {x: 10,
          y: -100,
          filter: "blur(5px)",
          opacity: 0,
        },
        {
          x: 0,
         y: 0,
          filter: "blur(0px)",
          opacity: 1,
          duration: 1,
          stagger: 0.05,
          ease: "power2.out",
          delay: index * 0.1,
        }
      );
    });
  }
  playMenuReveal();
  isMenuOpen = true;
}

function closeMenu() {
  const menuBox = document.querySelector(".menu-box");
  const menuToggleBtn = document.querySelector(".menu-toggle-btn");
  const menuItems = document.querySelectorAll(".menu-item");

  isAnimating = true;
  if (menuBox) menuBox.style.pointerEvents = "none";
  if (menuParent) menuParent.style.pointerEvents = "none";
  if (menuToggleBtn) menuToggleBtn.classList.remove("menu-open");

  // enable scrolling
  if (lenis) {
    lenis.start();
  }

  if (menuBox) {
    gsap.to(menuBox, {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
      duration: 0.3,
      onComplete: () => {
        gsap.set(menuItems, { opacity: 0, transform: "translateY(100%)" });
        if (menuParent) {
          gsap.to(menuParent, {
            autoAlpha: 0,
            duration: 0.25,
            onComplete: () => {
              isAnimating = false;
            },
          });
        } else {
          isAnimating = false;
        }
      },
    });
  }

  isMenuOpen = false;
}

// main execution
function initMenu() {
  const menuToggleBtn = document.querySelector(".menu-toggle-btn");
  const menuBox = document.querySelector(".menu-box");
  const menuItems = document.querySelectorAll(".menu-item");

  // reference menu-parent and initialize its state
  menuParent = document.querySelector('.menu-wrap');
  if (menuParent) {
    menuParent.style.pointerEvents = 'none';
    gsap.set(menuParent, { autoAlpha: 0 });
    // click on blank space (menuParent itself) closes the popup
    menuParent.addEventListener('click', (e) => {
      if (e.target === menuParent && isMenuOpen && !isAnimating) {
        closeMenu();
      }
    });
  }

  if (menuToggleBtn) {
    menuToggleBtn.addEventListener("click", (e) => {
      e.preventDefault(); // Prevent navigation if it's a link
      if (isAnimating) {
        gsap.killTweensOf([menuBox, menuItems]);
        isAnimating = false;
      }

      if (!isMenuOpen) {
        openMenu();
      } else {
        closeMenu();
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initMenu();
});

export { initMenu };

