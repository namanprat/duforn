import { type ReactNode } from "react";
import {
  ChromaticAberration,
  EffectComposer,
  ToneMapping,
} from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { usePostFxControlsStore } from "../store/postFx";

/**
 * Post stack: chromatic aberration on a linear HDR buffer, then linear → sRGB.
 */
export default function ScenePostFX({ children }: { children?: ReactNode }) {
  const ca = usePostFxControlsStore((s) => s.controls.chromaticAberration);

  return (
    <EffectComposer multisampling={0} stencilBuffer={false}>
      {ca.enabled ? (
        <ChromaticAberration
          offset={[ca.offset, ca.offset]}
          radialModulation={ca.radialModulation}
          modulationOffset={ca.modulationOffset}
        />
      ) : null}
      <ToneMapping mode={ToneMappingMode.LINEAR} />
      {children}
    </EffectComposer>
  );
}
