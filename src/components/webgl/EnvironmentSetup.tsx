// @ts-nocheck
import React from "react";
import { Environment } from "@react-three/drei";

/**
 * HDR environment, optional solid background, fog, shadow catcher.
 * @param {string} [hdrFiles="/home.hdr"] — root-relative HDR path for drei's Environment `files`
 * @param {boolean} [showHdriBackground=false] — when true, HDR fills scene.background (omit solid color)
 * @param {number|string} [fogColor=0xe6e4dc]
 * @param {number} [fogDensity=0.0165]
 * @param {number} [backgroundColor=0xe8e6de] — scene clear color when showHdriBackground is false
 */
export default function EnvironmentSetup({
  hdrFiles = "/home.hdr",
  showHdriBackground = false,
  backgroundColor = 0xe8e6de,
  fogColor = 0xe6e4dc,
  fogDensity = 0.0165,
  showShadowCatcher = true,
}) {
  return (
    <>
      <Environment files={hdrFiles} background={showHdriBackground} />
      {!showHdriBackground ? <color attach="background" args={[backgroundColor]} /> : null}

      {fogDensity > 1e-6 ? <fogExp2 attach="fog" color={fogColor} density={fogDensity} /> : null}

      {showShadowCatcher ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.35, -5]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <shadowMaterial transparent opacity={0.16} />
        </mesh>
      ) : null}
    </>
  );
}
