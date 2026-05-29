// @ts-nocheck
import React from "react";
import { PerspectiveCamera } from "@react-three/drei";
import NotFound from "./NotFound";
import ProjectDetailScene from "../projectDetail/Scene";
import { useWebglStore } from "../store/webgl";

export function ProjectDetailCanvasBranch() {
  const quality = useWebglStore((s) => s.qualityProfile);

  return (
    <>
      <ProjectDetailScene projectBgRenderScale={quality.projectBgRenderScale} />
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
