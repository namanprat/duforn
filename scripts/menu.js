import { getLenis } from "./lenis-scroll.js";
import { bindHapticTap } from "./link-hover.js";

let isMenuOpen = false;
let isAnimating = false;
let menuParent = null;
let menuInitialized = false;
let menuOverlayClickHandler = null;
let menuToggleClickHandler = null;
let menuKeydownHandler = null;
let cachedMenuToggleBtn = null;
let closeTransitionHandler = null;
let menuToggleHapticCleanup = null;
const receiptCloseHandlers = new WeakMap();
const receiptCloseHapticCleanups = new WeakMap();

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

  if (cachedMenuToggleBtn) cachedMenuToggleBtn.classList.add("menu-open");

  // CSS-driven: add class — transitions handle the animation
  if (menuParent) menuParent.classList.add("is-open");

  // disable scrolling
  if (getLenis()) {
    getLenis().stop();
  }

  // clip-path transition on .menu-box determines when open animation is done
  const firstBox = menuParent?.querySelector(".menu-box");
  if (firstBox) {
    const onEnd = (e) => {
      if (e.propertyName === "clip-path") {
        isAnimating = false;
        firstBox.removeEventListener("transitionend", onEnd);
      }
    };
    firstBox.addEventListener("transitionend", onEnd);
  } else {
    isAnimating = false;
  }

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

  if (cachedMenuToggleBtn) cachedMenuToggleBtn.classList.remove("menu-open");

  // CSS-driven: remove class — transitions handle the animation
  if (menuParent) menuParent.classList.remove("is-open");

  // enable scrolling
  if (getLenis()) {
    getLenis().start();
  }

  // The close sequence: clip-path closes (0.3s) then backdrop fades (0.25s after 0.3s delay)
  // Total close duration: ~0.55s — listen for opacity transitionend on the wrap
  if (menuParent) {
    // Remove any previous handler
    if (closeTransitionHandler) {
      menuParent.removeEventListener("transitionend", closeTransitionHandler);
    }
    closeTransitionHandler = (e) => {
      if (e.target === menuParent && e.propertyName === "opacity") {
        isAnimating = false;
        menuParent.removeEventListener("transitionend", closeTransitionHandler);
        closeTransitionHandler = null;
      }
    };
    menuParent.addEventListener("transitionend", closeTransitionHandler);
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
  const receiptCloseButtons = document.querySelectorAll(".receipt-close");

  // reference menu-parent — CSS handles the default hidden state
  menuParent = document.querySelector('.menu-wrap');
  if (menuParent) {
    // click on blank space (menuParent itself) closes the popup
    menuOverlayClickHandler = (e) => {
      if (e.target === menuParent && isMenuOpen && !isAnimating) {
        closeMenu();
      }
    };
    menuParent.addEventListener('click', menuOverlayClickHandler);
  }

  if (cachedMenuToggleBtn) {
    menuToggleClickHandler = () => {
      if (isAnimating) {
        // Force-finish any in-progress transition
        isAnimating = false;
      }

      if (!isMenuOpen) {
        openMenu();
      } else {
        closeMenu();
      }
    };
    cachedMenuToggleBtn.addEventListener("click", menuToggleClickHandler);
    menuToggleHapticCleanup = bindHapticTap(cachedMenuToggleBtn, 'selection');
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
    receiptCloseHapticCleanups.set(button, bindHapticTap(button, 'selection'));
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

  if (cachedMenuToggleBtn && menuToggleClickHandler) {
    cachedMenuToggleBtn.removeEventListener("click", menuToggleClickHandler);
  }
  if (menuToggleHapticCleanup) {
    menuToggleHapticCleanup();
    menuToggleHapticCleanup = null;
  }
  if (menuKeydownHandler) {
    document.removeEventListener("keydown", menuKeydownHandler);
  }
  if (menuParent && menuOverlayClickHandler) {
    menuParent.removeEventListener("click", menuOverlayClickHandler);
  }
  if (menuParent && closeTransitionHandler) {
    menuParent.removeEventListener("transitionend", closeTransitionHandler);
    closeTransitionHandler = null;
  }
  receiptCloseButtons.forEach((button) => {
    const onClick = receiptCloseHandlers.get(button);
    if (onClick) {
      button.removeEventListener("click", onClick);
      receiptCloseHandlers.delete(button);
    }
    const cleanupHaptics = receiptCloseHapticCleanups.get(button);
    if (cleanupHaptics) {
      cleanupHaptics();
      receiptCloseHapticCleanups.delete(button);
    }
  });

  // Ensure menu is closed visually
  if (menuParent) menuParent.classList.remove("is-open");

  // Reset state
  isMenuOpen = false;
  isAnimating = false;
  menuInitialized = false;
  menuOverlayClickHandler = null;
  menuToggleClickHandler = null;
  menuKeydownHandler = null;
  cachedMenuToggleBtn = null;
}

function closeMenuIfOpen() {
  if (isMenuOpen && !isAnimating) {
    closeMenu();
  }
}

export { initMenu, destroyMenu, closeMenuIfOpen };
