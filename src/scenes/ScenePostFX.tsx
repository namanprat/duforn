import { type ReactNode, useContext, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  EffectComposer,
  EffectComposerContext,
  ToneMapping,
} from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import DissolveTransition from "./transition/DissolveEffect";

const drawBufferSize = new THREE.Vector2();

/** @react-three/postprocessing sizes the composer to CSS pixels; match the GL drawing buffer. */
function SyncComposerDrawingBuffer() {
  const { gl, size, viewport } = useThree();
  const { composer } = useContext(EffectComposerContext);

  useEffect(() => {
    if (!composer) return;
    gl.getDrawingBufferSize(drawBufferSize);
    composer.setSize(drawBufferSize.x, drawBufferSize.y);
  }, [gl, composer, size.width, size.height, viewport.dpr]);

  return null;
}

/** Post stack: linear HDR buffer → sRGB, plus route dissolve when active. */
export default function ScenePostFX({ children }: { children?: ReactNode }) {
  return (
    <EffectComposer multisampling={0} stencilBuffer={false}>
      <SyncComposerDrawingBuffer />
      <ToneMapping mode={ToneMappingMode.LINEAR} />
      {children}
      {/* Live route dissolve — stylizes the final frame in-place when active. */}
      <DissolveTransition />
    </EffectComposer>
  );
}
