import React from "react";
import { vertexShader, fragmentShader } from "../../shaders/riverShader.js";

export default function RiverScene() {
  return (
    <mesh position={[0, 0, -5]}>
      <planeGeometry args={[18, 10, 1, 1]} />
      <shaderMaterial vertexShader={vertexShader} fragmentShader={fragmentShader} />
    </mesh>
  );
}
