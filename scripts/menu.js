import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { getLenis } from "./lenis-scroll.js";

gsap.registerPlugin(SplitText);

let isMenuOpen = false;
let isAnimating = false;
let menuParent = null;
let menuInitialized = false;
let menuOverlayClickHandler = null;
let menuToggleClickHandler = null;
let menuKeydownHandler = null;
let cachedMenuItems = null;
let cachedMenuBoxes = null;
let cachedMenuToggleBtn = null;
const splits = new Map();
const receiptCloseHandlers = new WeakMap();

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
  isAnimating = true;
  if (cachedMenuToggleBtn) {
    cachedMenuToggleBtn.setAttribute("aria-expanded", "true");
    cachedMenuToggleBtn.setAttribute("aria-label", "Close menu");
  }
  if (menuParent) {
    menuParent.setAttribute("aria-hidden", "false");
  }

  cachedMenuBoxes.forEach(box => {
    box.style.pointerEvents = "all";
  });

  if (menuParent) menuParent.style.pointerEvents = "all";
  gsap.to(menuParent, { autoAlpha: 1, duration: 0.3 });
  if (cachedMenuToggleBtn) cachedMenuToggleBtn.classList.add("menu-open");

  // disable scrolling
  if (getLenis()) {
    getLenis().stop();
  }

  if (cachedMenuBoxes.length) {
    gsap.to(cachedMenuBoxes, {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      duration: 0.3,
      onComplete: () => {
        isAnimating = false;
      },
    });
  } else {
    isAnimating = false;
  }

  // animate menu items (simple fade in)
  cachedMenuItems.forEach((item) => {
    gsap.set(item, { opacity: 1, transform: "translateY(0%)" });
  });

  function playMenuReveal() {
    cachedMenuItems.forEach((item, index) => {
      const split = getOrSplit(item);
      gsap.fromTo(
        split.chars,
        {
          y: -100,
          opacity: 0,
        },
        {
          y: 0,
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
  isAnimating = true;
  if (cachedMenuToggleBtn) {
    cachedMenuToggleBtn.setAttribute("aria-expanded", "false");
    cachedMenuToggleBtn.setAttribute("aria-label", "Open menu");
  }
  if (menuParent) {
    menuParent.setAttribute("aria-hidden", "true");
  }

  cachedMenuBoxes.forEach(box => {
    box.style.pointerEvents = "none";
  });

  if (menuParent) menuParent.style.pointerEvents = "none";
  if (cachedMenuToggleBtn) cachedMenuToggleBtn.classList.remove("menu-open");

  // enable scrolling
  if (getLenis()) {
    getLenis().start();
  }

  if (cachedMenuBoxes.length) {
    gsap.to(cachedMenuBoxes, {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
      duration: 0.3,
      onComplete: () => {
        gsap.set(cachedMenuItems, { opacity: 0, transform: "translateY(100%)" });
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
  } else {
    isAnimating = false;
  }

  isMenuOpen = false;
}

// main execution
function initMenu() {
  if (menuInitialized) return;
  menuInitialized = true;
  cachedMenuToggleBtn = document.querySelector(".menu-toggle-btn");
  cachedMenuBoxes = document.querySelectorAll(".menu-box");
  cachedMenuItems = document.querySelectorAll(".menu-item");
  const receiptCloseButtons = document.querySelectorAll(".receipt-close");

  // reference menu-parent and initialize its state
  menuParent = document.querySelector('.menu-wrap');
  if (menuParent) {
    menuParent.style.pointerEvents = 'none';
    gsap.set(menuParent, { autoAlpha: 0 });
    // click on blank space (menuParent itself) closes the popup
    menuOverlayClickHandler = (e) => {
      if (e.target === menuParent && isMenuOpen && !isAnimating) {
        closeMenu();
      }
    };
    menuParent.addEventListener('click', menuOverlayClickHandler);
  }

  if (cachedMenuToggleBtn) {
    menuToggleClickHandler = (e) => {
      if (isAnimating) {
        gsap.killTweensOf([...cachedMenuBoxes, ...cachedMenuItems]);
        isAnimating = false;
      }

      if (!isMenuOpen) {
        openMenu();
      } else {
        closeMenu();
      }
    };
    cachedMenuToggleBtn.addEventListener("click", menuToggleClickHandler);
  }
  menuKeydownHandler = (event) => {
    if (event.key === "Escape" && isMenuOpen && !isAnimating) {
      closeMenu();
      cachedMenuToggleBtn?.focus();
    }
  };
  document.addEventListener("keydown", menuKeydownHandler);

  receiptCloseButtons.forEach((button) => {
    const onClick = (event) => {
      event.preventDefault();
      if (isMenuOpen && !isAnimating) {
        closeMenu();
      }
    };
    button.addEventListener("click", onClick);
    receiptCloseHandlers.set(button, onClick);
  });

  // Populate receipt datetime with current time
  const receiptDatetime = document.getElementById('receipt-datetime');
  if (receiptDatetime) {
    const now = new Date();
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const day = days[now.getDay()];
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yy = String(now.getFullYear()).slice(-2);
    let hours = now.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const hh = String(hours).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const sec = String(now.getSeconds()).padStart(2, '0');
    receiptDatetime.textContent = `${day} ${dd}/${mm}/${yy} ${hh}:${min}:${sec} ${ampm}`;
  }
}

function destroyMenu() {
  const receiptCloseButtons = document.querySelectorAll(".receipt-close");

  // Kill any active animations
  if (cachedMenuBoxes && cachedMenuItems) {
    gsap.killTweensOf([...cachedMenuBoxes, ...cachedMenuItems, menuParent]);
  }

  if (cachedMenuToggleBtn && menuToggleClickHandler) {
    cachedMenuToggleBtn.removeEventListener("click", menuToggleClickHandler);
  }
  if (menuKeydownHandler) {
    document.removeEventListener("keydown", menuKeydownHandler);
  }
  if (menuParent && menuOverlayClickHandler) {
    menuParent.removeEventListener("click", menuOverlayClickHandler);
  }
  receiptCloseButtons.forEach((button) => {
    const onClick = receiptCloseHandlers.get(button);
    if (onClick) {
      button.removeEventListener("click", onClick);
      receiptCloseHandlers.delete(button);
    }
  });
  
  // Revert all SplitText instances
  splits.forEach(split => {
    if (split && split.revert) {
      split.revert();
    }
  });
  splits.clear();
  
  // Reset state
  isMenuOpen = false;
  isAnimating = false;
  menuInitialized = false;
  menuOverlayClickHandler = null;
  menuToggleClickHandler = null;
  menuKeydownHandler = null;
  cachedMenuItems = null;
  cachedMenuBoxes = null;
  cachedMenuToggleBtn = null;
}

export { initMenu, destroyMenu };
