import { Environment } from "@react-three/drei";

interface EnvProps {
  hdrFiles?: string;
  showHdriBackground?: boolean;
  backgroundColor?: number | string;
  fogColor?: number | string;
  fogDensity?: number;
  showShadowCatcher?: boolean;
}

/**
 * HDR environment with optional solid fallback background and fog.
 */
export default function Env({
  hdrFiles = "/main.hdr",
  showHdriBackground = true,
  backgroundColor = 0xe8e6de,
  fogColor = 0xe6e4dc,
  fogDensity = 0.0165,
  showShadowCatcher = true,
}: EnvProps) {
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
