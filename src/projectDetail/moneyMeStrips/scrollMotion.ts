import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import {
  FRAME_HEIGHT_COLLAPSE,
  PARALLAX_STAGGER,
  PARALLAX_TRAVEL_RATIO,
  ROTATION_DEG,
  SCROLL_RANGE,
  STRIP_FRAME_ASPECT_H,
  STRIP_FRAME_ASPECT_W,
} from "./config";
import type { StripLayout } from "./layout";

gsap.registerPlugin(ScrollTrigger);

export type FrameHeights = {
  full: number;
  min: number;
};

/** Full showcase height: 16:9 from width, capped by computed max-height. */
export function measureStripFullHeight(anchor: HTMLElement): number {
  const width = anchor.offsetWidth || anchor.getBoundingClientRect().width;
  const fromAspect = width * (STRIP_FRAME_ASPECT_H / STRIP_FRAME_ASPECT_W);

  const maxHeight = getComputedStyle(anchor).maxHeight;
  if (maxHeight && maxHeight !== "none") {
    const parsed = parseFloat(maxHeight);
    if (!Number.isNaN(parsed)) {
      return Math.min(fromAspect, parsed);
    }
  }

  return fromAspect;
}

function applyFrameHeight(anchor: HTMLElement, height: number) {
  anchor.style.height = `${height}px`;
}

export function setupStripScrollMotion({
  anchor,
  meshes,
  layout,
  viewportHeight,
}: {
  anchor: HTMLElement;
  meshes: (THREE.Mesh | null)[];
  layout: StripLayout;
  frameHeight: number;
  viewportHeight: number;
}): gsap.Context {
  const heights: FrameHeights = {
    full: measureStripFullHeight(anchor),
    min: 0,
  };
  heights.min = heights.full * FRAME_HEIGHT_COLLAPSE.minRatio;

  anchor.style.aspectRatio = "auto";
  applyFrameHeight(anchor, heights.full);

  const travel = heights.full * PARALLAX_TRAVEL_RATIO || viewportHeight * PARALLAX_TRAVEL_RATIO;
  const theta = THREE.MathUtils.degToRad(ROTATION_DEG);
  const axisX = -Math.sin(theta);
  const axisY = Math.cos(theta);

  const refreshHeights = () => {
    heights.full = measureStripFullHeight(anchor);
    heights.min = heights.full * FRAME_HEIGHT_COLLAPSE.minRatio;
  };

  return gsap.context(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: anchor,
        start: SCROLL_RANGE.start,
        end: SCROLL_RANGE.end,
        scrub: true,
        invalidateOnRefresh: true,
        onRefreshInit: refreshHeights,
        onUpdate: (self) => {
          const h = heights.full + (heights.min - heights.full) * self.progress;
          applyFrameHeight(anchor, h);
        },
      },
    });

    meshes.forEach((mesh, i) => {
      if (!mesh) return;
      const placement = layout.placements[i];
      if (!placement) return;

      const { x: baseX, y: baseY, parallaxDir: dir } = placement;
      mesh.position.x = baseX + travel * dir * axisX;
      mesh.position.y = baseY + travel * dir * axisY;

      tl.to(
        mesh.position,
        {
          x: baseX - travel * dir * axisX,
          y: baseY - travel * dir * axisY,
          ease: "none",
          duration: 1,
        },
        i * PARALLAX_STAGGER,
      );
    });

    ScrollTrigger.refresh();
  }, anchor);
}
