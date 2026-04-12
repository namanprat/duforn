// @ts-nocheck
import React from "react";
import { Canvas } from "@react-three/fiber";

export function getCanvasDpr(limit = 2) {
  if (typeof window === "undefined") return 1;
  return Math.min(window.devicePixelRatio || 1, limit);
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
  const { className: wrapperClassName, ...restWrapperProps } = wrapperProps;
  const surfaceClassName = [
    "canvas-surface",
    pointerEvents === "auto" ? "canvas-surface--interactive" : "",
    background !== "transparent" ? "canvas-surface--filled" : "",
    wrapperClassName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div id={id} className={surfaceClassName} {...restWrapperProps}>
      <Canvas dpr={dpr} {...canvasProps}>
        {children}
      </Canvas>
    </div>
  );
}
