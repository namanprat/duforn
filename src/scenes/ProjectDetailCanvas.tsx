import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import ProjectDetailScene from "../projectDetail/ProjectDetailScene";

/** Fixed background for project detail routes (money-me, etc.). */
export default function ProjectDetailCanvas() {
  return (
    <div className="scene_canvas_wrap scene_canvas_wrap--interactive">
      <Canvas
        orthographic
        gl={{ antialias: true, stencil: false }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.0;
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
      >
        <Suspense fallback={null}>
          <ProjectDetailScene />
        </Suspense>
      </Canvas>
    </div>
  );
}
