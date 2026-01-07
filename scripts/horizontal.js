      import gsap from "gsap";
      import { Draggable } from "gsap/Draggable";
      import { lenis } from "./lenis-scroll.js";

      // register plugin as early as possible
      gsap.registerPlugin(Draggable);

      function horizontalScroll() {
        const timeline = document.querySelector(".timeline");
        const scroller = document.querySelector(".scroller");
        const container = document.querySelector(".horizontal-container");
        if (!timeline || !scroller || !container) {
          console.warn("horizontalScroll: missing required DOM elements", { timeline, scroller, container });
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
        Draggable.create(scroller, {
          type: "x",
          bounds: {
            minX: gap,
            maxX: sizes.maxDragX + gap,
          },
          onDrag: function () {
            const progress = (this.x - gap) / sizes.maxDragX;
            updateContainerPosition(clamp(progress, 0, 1));
          },
        });

        // map vertical scroll to horizontal movement
        function onScroll() {
          sizes = computeSizes();
          const progress = clamp(window.scrollY / sizes.totalScrollHeight, 0, 1);
          updateContainerPosition(progress);

          // move scroller to match
          const newScrollerX = gap + progress * sizes.maxDragX;
          gsap.to(scroller, { x: newScrollerX, duration: 0.1, overwrite: "auto" });
        }

        // small helper
        function clamp(v, a, b) {
          return Math.min(b, Math.max(a, v));
        }

        function updateContainerPosition(progress) {
          const x = -sizes.maxContainerScroll * progress;
          gsap.to(container, { x: x, duration: 0.15, ease: "power2.out", overwrite: "auto" });
        }

        // Lenis integration if available
        if (typeof lenis !== "undefined" && lenis && typeof lenis.on === "function") {
          lenis.on("scroll", () => {
            onScroll();
          });
        } else {
          // fallback to native scroll
          window.addEventListener("scroll", onScroll, { passive: true });
        }

        // handle resize
        let resizeTimer;
        window.addEventListener("resize", () => {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(() => {
            updateSpacer();
            sizes = computeSizes();
            onScroll();
          }, 120);
        });

        // initial position
        onScroll();
      }

      // main execution
      document.addEventListener("DOMContentLoaded", () => {
        horizontalScroll();
      });