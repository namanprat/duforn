import gsap from "gsap";

/**
 * Preload images utility
 * @param {string} selector - CSS selector for images to preload
 * @returns {Promise} - Resolves when all images are loaded
 */
export function preloadImages(selector = "img") {
  return new Promise((resolve) => {
    const images = document.querySelectorAll(selector);
    if (images.length === 0) {
      resolve();
      return;
    }

    let loadedCount = 0;
    const totalImages = images.length;

    const checkComplete = () => {
      loadedCount++;
      if (loadedCount >= totalImages) {
        resolve();
      }
    };

    images.forEach((img) => {
      if (img.complete) {
        checkComplete();
      } else {
        img.addEventListener("load", checkComplete);
        img.addEventListener("error", checkComplete);
      }
    });

    // Fallback timeout to prevent hanging
    setTimeout(resolve, 5000);
  });
}

/**
 * Show loading indicator during page transition
 */
function showLoader() {
  let loader = document.querySelector(".transition-loader");
  if (!loader) {
    loader = document.createElement("div");
    loader.className = "transition-loader";
    loader.innerHTML = '<div class="transition-loader__spinner"></div>';
    document.querySelector(".transition-overlay")?.appendChild(loader);
  }
  gsap.set(loader, { opacity: 1, display: "flex" });
}

/**
 * Hide loading indicator
 */
function hideLoader() {
  const loader = document.querySelector(".transition-loader");
  if (loader) {
    gsap.to(loader, {
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        loader.style.display = "none";
      },
    });
  }
}

/**
 * Animate the leaving page (scale down with inner content scaling up)
 * @param {HTMLElement} container - The barba container element
 * @returns {Promise}
 */
export async function animateTransition(container) {
  const overlay = document.querySelector(".transition-overlay");

  // Show overlay
  if (overlay) {
    gsap.set(overlay, { display: "block", backgroundColor: "#000" });
  }

  // Show loader while next page loads
  showLoader();

  return new Promise((resolve) => {
    const tl = gsap.timeline({
      defaults: {
        duration: 1.1,
        ease: "power2.inOut",
      },
      onComplete: resolve,
    });

    // Scale down the current page container
    tl.to(
      container,
      {
        scale: 0.4,
        opacity: 0,
        duration: 1.1,
        ease: "power2.inOut",
      },
      0
    );

    // Scale up the inner content (images) for parallax effect
    const innerImages = container.querySelectorAll("img, .slide__img, video");
    if (innerImages.length > 0) {
      tl.to(
        innerImages,
        {
          scale: 1.5,
          duration: 1.1,
          ease: "power2.inOut",
        },
        0
      );
    }
  });
}

/**
 * Animate the entering page (slide in from bottom)
 * @param {HTMLElement} container - The barba container element
 * @returns {Promise}
 */
export async function revealTransition(container) {
  const overlay = document.querySelector(".transition-overlay");

  // Preload images in the new container
  await preloadImages(`[data-barba="container"] img`);

  // Hide loader
  hideLoader();

  // Set initial state for incoming container
  gsap.set(container, {
    yPercent: 100,
    scale: 1,
    opacity: 1,
  });

  // Set initial state for inner images
  const innerImages = container.querySelectorAll("img, .slide__img, video");
  gsap.set(innerImages, {
    scale: 1.5,
    yPercent: -30,
  });

  return new Promise((resolve) => {
    const tl = gsap.timeline({
      onComplete: () => {
        // Hide overlay
        if (overlay) {
          gsap.set(overlay, { display: "none" });
        }
        // Reset any transforms
        gsap.set(container, { clearProps: "all" });
        gsap.set(innerImages, { clearProps: "all" });
        resolve();
      },
    });

    // Slide in the new page from bottom
    tl.to(
      container,
      {
        yPercent: 0,
        duration: 1,
        ease: "expo.out",
      },
      0
    );

    // Animate inner images
    tl.to(
      innerImages,
      {
        scale: 1,
        yPercent: 0,
        duration: 1.1,
        ease: "expo.out",
      },
      0
    );
  });
}

/**
 * Close menu if open before transition
 */
export function closeMenuIfOpen() {
  const menuToggleBtn = document.querySelector(".menu-toggle-btn");
  if (menuToggleBtn && menuToggleBtn.classList.contains("menu-open")) {
    menuToggleBtn.click();
  }
}

export default { revealTransition, animateTransition, closeMenuIfOpen, preloadImages };
