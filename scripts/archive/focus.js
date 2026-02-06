// Archive focus mode handling
import gsap from "gsap";
import { CONFIG } from "./config.js";
import { state } from "./state.js";
import { updateFocusCell, updateFocusIndex } from "./renderer.js";
import { archiveItems as projects } from "../../data/archive-items.js";

// DOM element cache
const elements = {
  overlay: null,
  title: null,
  year: null,
  description: null,
  category: null,
  panel: null,
};

// Helper function for text index calculation
const texIndexForCell = (cellX, cellY, count) => {
  return ((cellX + cellY * 3) % count + count) % count;
};

// Find the nearest cell containing a specific image index
function findNearestCellForIndex(targetIndex, centerX, centerY) {
  let bestCell = { x: 0, y: 0 };
  let minDist = Infinity;
  const radius = 20;

  const cx = Math.round(centerX);
  const cy = Math.round(centerY);

  for (let x = cx - radius; x <= cx + radius; x++) {
    for (let y = cy - radius; y <= cy + radius; y++) {
      const idx = texIndexForCell(x, y, projects.length);

      if (idx === targetIndex) {
        const dist = (x - centerX) ** 2 + (y - centerY) ** 2;
        if (dist < minDist) {
          minDist = dist;
          bestCell = { x, y };
        }
      }
    }
  }

  return bestCell;
}

// Wrap text characters for animation
function wrapChars(text) {
  return text
    .split("")
    .map((c) => `<span style="display:inline-block; will-change: transform;">${c === " " ? "&nbsp;" : c}</span>`)
    .join("");
}

// Animate title text transition
function animateTitle(element, newText) {
  if (!element.querySelector("span")) {
    element.innerHTML = wrapChars(element.textContent);
  }

  const oldChars = element.querySelectorAll("span");

  gsap.to(oldChars, {
    y: "100%",
    opacity: 0,
    stagger: 0.015,
    duration: 0.25,
    ease: "power2.in",
    onComplete: () => {
      element.innerHTML = wrapChars(newText);
      const newChars = element.querySelectorAll("span");
      gsap.fromTo(
        newChars,
        { y: "100%", opacity: 0 },
        { y: "0%", opacity: 1, stagger: 0.015, duration: 0.25, ease: "power2.out" }
      );
    },
  });
}

// Update the focus panel DOM content
function updateFocusPanel(index) {
  const project = projects[index];
  if (!project) return;

  // Cache DOM elements on first use
  if (!elements.overlay) {
    elements.overlay = document.getElementById("archive-overlay");
    elements.title = document.querySelector(".archive-focus-title");
    elements.year = document.querySelector(".archive-focus-year");
    elements.description = document.querySelector(".archive-focus-description");
    elements.category = document.querySelector(".archive-focus-category");
    elements.panel = document.querySelector(".archive-focus-panel");
  }

  const { overlay, title, year, description, category } = elements;

  if (title) {
    // Check if already active and content differs - animate transition
    if (overlay?.classList.contains("active") && title.textContent.replace(/\u00a0/g, " ") !== project.title) {
      animateTitle(title, project.title);
    } else {
      title.innerHTML = wrapChars(project.title);
      gsap.set(title.querySelectorAll("span"), { y: "0%", opacity: 1 });
    }
  }

  if (year) {
    year.textContent = project.year || "";
  }

  if (description) {
    description.textContent = project.description || "";
  }

  if (category) {
    category.textContent = project.category || "";
  }

  // Show overlay
  if (overlay) {
    overlay.classList.add("active");
  }
}

// Hide the focus panel
function hideFocusPanel() {
  if (!elements.overlay) {
    elements.overlay = document.getElementById("archive-overlay");
  }

  if (elements.overlay) {
    elements.overlay.classList.remove("active");
  }
}

// Enter focus mode for a specific image
export function enterFocus(index, cellX, cellY) {
  // Don't re-enter same cell
  if (
    state.focusedIndex === index &&
    state.currentFocusCell.x === cellX &&
    state.currentFocusCell.y === cellY
  ) {
    return;
  }

  state.focusedIndex = index;
  state.currentFocusCell = { x: cellX, y: cellY };

  // Update shader uniforms
  updateFocusIndex(index);
  updateFocusCell(cellX, cellY);

  // Animate focus state
  gsap.to(state.focusState, {
    value: 1,
    duration: CONFIG.focusEnterDuration,
    ease: "power2.out",
  });

  // Zoom in when focusing
  gsap.to(state.dragZoom, {
    value: 1.1,
    duration: CONFIG.focusEnterDuration,
    ease: "power2.out",
  });

  // Center the focused cell
  const gridCellSize = CONFIG.cellSize * CONFIG.cellSpacing;
  state.targetOffset.x = (cellX + 0.5) * gridCellSize;
  state.targetOffset.y = (cellY + 0.5) * gridCellSize;

  // Update DOM
  updateFocusPanel(index);
}

// Exit focus mode
export function exitFocus() {
  if (state.focusedIndex === -1) return;

  state.focusedIndex = -1;
  state.currentFocusCell = { x: -9999, y: -9999 };

  // Update shader uniforms
  updateFocusCell(-9999, -9999);

  // Animate focus state
  gsap.to(state.focusState, {
    value: 0,
    duration: CONFIG.focusExitDuration,
    ease: "power2.out",
  });

  // Zoom out
  gsap.to(state.dragZoom, {
    value: 1,
    duration: CONFIG.focusExitDuration,
    ease: "power2.out",
  });

  // Hide DOM overlay
  hideFocusPanel();
}

// Navigate to previous/next image in focus mode
export function navigateFocus(direction) {
  if (state.focusedIndex === -1) return;

  let nextIndex = state.focusedIndex + direction;

  // Wrap around
  if (nextIndex >= projects.length) nextIndex = 0;
  if (nextIndex < 0) nextIndex = projects.length - 1;

  // Find nearest cell with this image
  const nextCell = findNearestCellForIndex(nextIndex, state.currentFocusCell.x, state.currentFocusCell.y);

  enterFocus(nextIndex, nextCell.x, nextCell.y);
}

// Clear cached DOM elements (call on destroy)
export function clearFocusElements() {
  elements.overlay = null;
  elements.title = null;
  elements.year = null;
  elements.description = null;
  elements.category = null;
  elements.panel = null;
}
