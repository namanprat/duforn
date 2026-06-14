// @ts-nocheck
/**
 * Per-route 3D branches for the unified `#background` canvas (see Canvas.tsx).
 * Swap subtrees here — do not add nested R3F Canvas components for page content.
 */
import React from "react";
import { PerspectiveCamera } from "@react-three/drei";
import NotFound from "./NotFound";
import ProjectDetailScene from "../projectDetail/Scene";

export function ProjectDetailCanvasBranch() {
  return (
    <>
      <ProjectDetailScene />
    </>
  );
}

export function NotFoundCanvasBranch() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 1.35]} fov={34} />
      <NotFound />
    </>
  );
}
