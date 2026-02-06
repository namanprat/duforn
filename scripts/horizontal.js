import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { lenis } from "./lenis-scroll.js";

// register plugin as early as possible
gsap.registerPlugin(Draggable);

let draggableInstance = null;
let scrollHandler = null;
let resizeHandler = null;
let lenisScrollHandler = null;

export function initHorizontal() {
  const timeline = document.querySelector(".timeline");
  const scroller = document.querySelector(".scroller");
  const container = document.querySelector(".horizontal-container");
  if (!timeline || !scroller || !container) {
    console.warn("initHorizontal: missing required DOM elements", { timeline, scroller, container });
    return;
  }

  const gap = parseInt(window.getComputedStyle(document.body).fontSize) || 16;

  // helper: update spacer height so page has vertical scroll equal to horizontal content
  function updateSpacer() {
    let spacer = document.getElementById("horizontal-spacer");
    if (!spacer) {
      spacer = document.createElement("div");
      spacer.id = "horizontal-spacer";
      spacer.style.width = "1px";
      spacer.style.pointerEvents = "none";
      document.body.appendChild(spacer);
    }

    // total horizontal scrollable distance
    const totalHorizontal = Math.max(0, container.scrollWidth - window.innerWidth);

    // make vertical scroll height roughly proportional to horizontal extent
    // add viewport height to ensure full scroll
    const spacerHeight = totalHorizontal + window.innerHeight;
    spacer.style.height = spacerHeight + "px";
  }

  function createMarkers(count = 50) {
    // don't duplicate markers
    if (timeline.querySelector(".marker")) return;
    for (let i = 0; i < count; i++) {
      const marker = document.createElement("div");
      marker.classList.add("marker");
      timeline.appendChild(marker);
    }
  }

  createMarkers(50);
  updateSpacer();

  // compute sizes used for mapping
  function computeSizes() {
    return {
      timelineWidth: timeline.offsetWidth,
      scrollerWidth: scroller.offsetWidth,
      maxDragX: Math.max(0, timeline.offsetWidth - scroller.offsetWidth - 2 * gap),
      maxContainerScroll: Math.max(0, container.scrollWidth - window.innerWidth),
      totalScrollHeight: Math.max(1, document.documentElement.scrollHeight - window.innerHeight),
    };
  }

  let sizes = computeSizes();

  // Draggable for manual interaction
  draggableInstance = Draggable.create(scroller, {
    type: "x",
    bounds: {
      minX: gap,
      maxX: sizes.maxDragX + gap,
    },
    onDrag: function () {
      const progress = (this.x - gap) / sizes.maxDragX;
      updateContainerPosition(clamp(progress, 0, 1));
    },
  })[0];

  // small helper
  function clamp(v, a, b) {
    return Math.min(b, Math.max(a, v));
  }

  function updateContainerPosition(progress) {
    const x = -sizes.maxContainerScroll * progress;
    gsap.to(container, { x: x, duration: 0.15, ease: "power2.out", overwrite: "auto" });
  }

  // map vertical scroll to horizontal movement
  scrollHandler = function() {
    sizes = computeSizes();
    const progress = clamp(window.scrollY / sizes.totalScrollHeight, 0, 1);
    updateContainerPosition(progress);

    // move scroller to match
    const newScrollerX = gap + progress * sizes.maxDragX;
    gsap.to(scroller, { x: newScrollerX, duration: 0.1, overwrite: "auto" });
  };

  // Lenis integration if available
  if (typeof lenis !== "undefined" && lenis && typeof lenis.on === "function") {
    lenisScrollHandler = () => scrollHandler();
    lenis.on("scroll", lenisScrollHandler);
  } else {
    // fallback to native scroll
    window.addEventListener("scroll", scrollHandler, { passive: true });
  }

  // handle resize
  let resizeTimer;
  resizeHandler = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      updateSpacer();
      sizes = computeSizes();
      scrollHandler();
    }, 120);
  };
  window.addEventListener("resize", resizeHandler);

  // initial position
  scrollHandler();
}

export function destroyHorizontal() {
  // Kill Draggable
  if (draggableInstance) {
    draggableInstance.kill();
    draggableInstance = null;
  }

  // Remove scroll listeners
  if (scrollHandler) {
    if (typeof lenis !== "undefined" && lenis && typeof lenis.off === "function" && lenisScrollHandler) {
      lenis.off("scroll", lenisScrollHandler);
      lenisScrollHandler = null;
    } else {
      window.removeEventListener("scroll", scrollHandler);
    }
    scrollHandler = null;
  }

  // Remove resize listener
  if (resizeHandler) {
    window.removeEventListener("resize", resizeHandler);
    resizeHandler = null;
  }

  // Remove spacer element
  const spacer = document.getElementById("horizontal-spacer");
  if (spacer && spacer.parentNode) {
    spacer.parentNode.removeChild(spacer);
  }

  // Kill any GSAP tweens on container
  const container = document.querySelector(".horizontal-container");
  if (container) {
    gsap.killTweensOf(container);
  }
  const scroller = document.querySelector(".scroller");
  if (scroller) {
    gsap.killTweensOf(scroller);
  }
}