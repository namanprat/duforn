import { type ReactNode } from "react";
import { EffectComposer, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";

/** Minimal post stack for the About helmet canvas — no dissolve/CA from the main scene. */
export default function AboutPostFX({ children }: { children?: ReactNode }) {
  return (
    <EffectComposer multisampling={0} stencilBuffer={false}>
      <ToneMapping mode={ToneMappingMode.LINEAR} />
      {children}
    </EffectComposer>
  );
}
