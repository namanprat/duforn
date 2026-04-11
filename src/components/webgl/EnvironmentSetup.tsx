// @ts-nocheck
import React from "react";
import { Environment } from "@react-three/drei";

/**
 * Home-page environment: warm cream fog, HDR lighting, shadow catcher.
 */
export default function EnvironmentSetup() {
  return (
    <>
      <Environment files="/home.hdr" background={false} />
      <color attach="background" args={[0xe8e6de]} />

      <fogExp2 attach="fog" color={0xe6e4dc} density={0.0165} />

      {/* Shadow catcher */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.35, -5]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <shadowMaterial transparent opacity={0.16} />
      </mesh>
    </>
  );
}
