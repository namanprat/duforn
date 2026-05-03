// @ts-nocheck
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";

/**
 * Archive route: minimal lit cube (UnifiedCanvas branch only).
 */
export default function ArchiveScene() {
  const meshRef = useRef(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.35;
    }
  });

  return (
    <>
      <color attach="background" args={["#0a0a0c"]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 5]} intensity={1.2} color="#ffffff" />
      <directionalLight position={[-3, 2, -4]} intensity={0.35} color="#8899ff" />
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <boxGeometry args={[1.15, 1.15, 1.15]} />
        <meshStandardMaterial color="#c4cad4" metalness={0.25} roughness={0.45} />
      </mesh>
    </>
  );
}
