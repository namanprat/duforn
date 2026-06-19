import { useContext, useEffect, useLayoutEffect, useMemo } from "react";
import { applyProps, useThree } from "@react-three/fiber";
import { EffectComposerContext } from "@react-three/postprocessing";
import { N8AOPostPass } from "n8ao";
import type { PostFxControls } from "./config/postFxDefaults";

type AoControls = Omit<PostFxControls["ao"], "enabled">;

/**
 * Registers N8AOPostPass directly on the EffectComposer. The stock <N8AO />
 * primitive is not reliably picked up as a Pass under R3F v9, so AO never ran.
 */
export default function SceneN8AOPass({
  radius,
  intensity,
  distanceFalloff,
  aoSamples,
  denoiseSamples,
  denoiseRadius,
  halfRes,
  quality,
}: AoControls) {
  const { camera, scene } = useThree();
  const { composer } = useContext(EffectComposerContext);

  const pass = useMemo(() => new N8AOPostPass(scene, camera), [camera, scene]);

  useLayoutEffect(() => {
    composer.addPass(pass, 1);
    return () => {
      composer.removePass(pass);
    };
  }, [composer, pass]);

  useEffect(() => {
    return () => {
      pass.dispose();
    };
  }, [pass]);

  useLayoutEffect(() => {
    applyProps(pass.configuration, {
      aoRadius: radius,
      distanceFalloff,
      intensity,
      aoSamples,
      denoiseSamples,
      denoiseRadius,
      screenSpaceRadius: true,
      halfRes,
      depthAwareUpsampling: true,
      color: "black",
      transparencyAware: false,
    });
  }, [
    pass,
    radius,
    distanceFalloff,
    intensity,
    aoSamples,
    denoiseSamples,
    denoiseRadius,
    halfRes,
  ]);

  useLayoutEffect(() => {
    if (!quality) return;
    pass.setQualityMode((quality.charAt(0).toUpperCase() + quality.slice(1)) as "High");
  }, [pass, quality]);

  return null;
}
