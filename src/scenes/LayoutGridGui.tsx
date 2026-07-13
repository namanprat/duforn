import { useControls } from "leva";

/**
 * Dev-only Leva panel to tune the grid's proportional margin/gutter live.
 * Writes the same `max(1rem, Nvw)` form the stylesheet ships (see --site--margin
 * / --site--gutter in styles.css); pairs with the Shift+G <GridOverlay>.
 */
export default function LayoutGridGui() {
  useControls("Grid", {
    marginVw: {
      label: "margin (vw)",
      value: 3.05,
      min: 0,
      max: 6,
      step: 0.05,
      onChange: (v: number) =>
        document.documentElement.style.setProperty("--site--margin", `max(1rem, ${v}vw)`),
    },
    gutterVw: {
      label: "gutter (vw)",
      value: 2.26,
      min: 0,
      max: 5,
      step: 0.05,
      onChange: (v: number) =>
        document.documentElement.style.setProperty("--site--gutter", `max(1rem, ${v}vw)`),
    },
  });

  return null;
}
