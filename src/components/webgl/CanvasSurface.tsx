// @ts-nocheck
import React from "react";
import { Canvas } from "@react-three/fiber";
import { getClampedPixelRatio } from "../../lib/rendering/canvasPixelRatio";
import { useStableViewportSize } from "../../lib/viewport/useStableViewportSize";

export function getCanvasDpr(limit = 2) {
  return getClampedPixelRatio(limit);
}

export default function CanvasSurface({
  id,
  pointerEvents = "none",
  background = "transparent",
  dpr = getCanvasDpr(),
  children,
  wrapperProps = {},
  ...canvasProps
}) {
  const stableViewport = useStableViewportSize();
  const { className: wrapperClassName, style: wrapperStyle, ...restWrapperProps } = wrapperProps;
  const surfaceClassName = [
    "canvas-surface",
    pointerEvents === "auto" ? "canvas-surface--interactive" : "",
    background !== "transparent" ? "canvas-surface--filled" : "",
    wrapperClassName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      id={id}
      className={surfaceClassName}
      style={{
        width: stableViewport.width,
        height: stableViewport.height,
        ...wrapperStyle,
      }}
      {...restWrapperProps}
    >
      <Canvas dpr={dpr} {...canvasProps}>
        {children}
      </Canvas>
    </div>
  );
}
