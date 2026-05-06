// @ts-nocheck
import React, { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { isWebGLRenderer, isWebGPURenderer } from "../../lib/rendering";
import { useWebglStore } from "../../store/webgl";

function getPageSsaoMultiplier(activePage) {
  if (activePage === "projectDetail") return 0.72;
  if (activePage === "work") return 1;
  if (activePage === "archive") return 0.88;
  return 0.82;
}

export default function GlobalPostFX({ activePage }) {
  const { gl, scene, camera, size } = useThree();
  const quality = useWebglStore((s) => s.qualityProfile);
  const ssaoEnabled = useWebglStore((s) => s.ssaoEnabled);

  const webgpuFxRef = useRef(null);
  const webglFxRef = useRef(null);
  const prevSizeRef = useRef({ width: 0, height: 0 });

  useEffect(() => {
    let cancelled = false;

    webgpuFxRef.current?.pipeline?.dispose?.();
    webgpuFxRef.current = null;
    webglFxRef.current?.composer?.dispose?.();
    webglFxRef.current = null;

    if (!ssaoEnabled || activePage === "test" || activePage === "notFound") return undefined;

    async function setupWebGPU() {
      const [{ RenderPipeline }, tsl, gtaoModule] = await Promise.all([
        import("three/webgpu"),
        import("three/tsl"),
        import("three/addons/tsl/display/GTAONode.js"),
      ]);
      if (cancelled) return;

      const { pass, mrt, output, normalView } = tsl;
      const { ao } = gtaoModule;

      const scenePass = pass(scene, camera);
      scenePass.setMRT(
        mrt({
          output,
          normal: normalView,
        }),
      );

      const sceneColor = scenePass.getTextureNode("output");
      const sceneNormal = scenePass.getTextureNode("normal");
      const sceneDepth = scenePass.getTextureNode("depth");
      const aoPass = ao(sceneDepth, sceneNormal, camera);
      aoPass.resolutionScale = quality.ssaoResolutionScale;
      aoPass.radius.value = quality.ssaoRadius;
      aoPass.scale.value = quality.ssaoIntensity * getPageSsaoMultiplier(activePage);
      aoPass.samples.value = quality.ssaoSamples;
      aoPass.setSize(size.width, size.height);

      const pipeline = new RenderPipeline(gl);
      // GTAO node is a float occlusion signal; multiply directly to avoid RGB-channel masking artifacts.
      pipeline.outputNode = sceneColor.mul(aoPass);
      pipeline.needsUpdate = true;

      webgpuFxRef.current = { pipeline, aoPass };
      prevSizeRef.current = { width: 0, height: 0 };
    }

    async function setupWebGL() {
      const [{ EffectComposer }, { RenderPass }, { GTAOPass }, { OutputPass }] = await Promise.all([
        import("three/addons/postprocessing/EffectComposer.js"),
        import("three/addons/postprocessing/RenderPass.js"),
        import("three/addons/postprocessing/GTAOPass.js"),
        import("three/addons/postprocessing/OutputPass.js"),
      ]);
      if (cancelled) return;

      const composer = new EffectComposer(gl);
      const renderPass = new RenderPass(scene, camera);
      const gtaoPass = new GTAOPass(
        scene,
        camera,
        Math.max(1, Math.round(size.width * quality.ssaoResolutionScale)),
        Math.max(1, Math.round(size.height * quality.ssaoResolutionScale)),
      );
      gtaoPass.blendIntensity = quality.ssaoIntensity * getPageSsaoMultiplier(activePage);
      if (gtaoPass?.gtaoMaterial?.uniforms?.radius) {
        gtaoPass.gtaoMaterial.uniforms.radius.value = quality.ssaoRadius;
      }
      if (gtaoPass?.gtaoMaterial?.uniforms?.samples) {
        gtaoPass.gtaoMaterial.uniforms.samples.value = quality.ssaoSamples;
      }
      const outputPass = new OutputPass();

      composer.addPass(renderPass);
      composer.addPass(gtaoPass);
      composer.addPass(outputPass);
      composer.setSize(size.width, size.height);

      webglFxRef.current = { composer, gtaoPass };
      prevSizeRef.current = { width: 0, height: 0 };
    }

    if (isWebGPURenderer(gl)) {
      void setupWebGPU();
    } else if (isWebGLRenderer(gl)) {
      void setupWebGL();
    }

    return () => {
      cancelled = true;
      webgpuFxRef.current?.pipeline?.dispose?.();
      webgpuFxRef.current = null;
      webglFxRef.current?.composer?.dispose?.();
      webglFxRef.current = null;
    };
  }, [
    activePage,
    camera,
    gl,
    quality.ssaoIntensity,
    quality.ssaoRadius,
    quality.ssaoResolutionScale,
    quality.ssaoSamples,
    scene,
    size.height,
    size.width,
    ssaoEnabled,
  ]);

  useFrame(() => {
    const sizeChanged =
      size.width !== prevSizeRef.current.width || size.height !== prevSizeRef.current.height;

    if (!ssaoEnabled) {
      gl.render(scene, camera);
      return;
    }

    if (webgpuFxRef.current?.pipeline) {
      const aoPass = webgpuFxRef.current.aoPass;
      aoPass.resolutionScale = quality.ssaoResolutionScale;
      aoPass.radius.value = quality.ssaoRadius;
      aoPass.scale.value = quality.ssaoIntensity * getPageSsaoMultiplier(activePage);
      aoPass.samples.value = quality.ssaoSamples;
      if (sizeChanged) {
        aoPass.setSize(size.width, size.height);
        prevSizeRef.current = { width: size.width, height: size.height };
      }
      webgpuFxRef.current.pipeline.render();
      return;
    }

    if (webglFxRef.current?.composer) {
      const gtaoPass = webglFxRef.current.gtaoPass;
      gtaoPass.blendIntensity = quality.ssaoIntensity * getPageSsaoMultiplier(activePage);
      if (gtaoPass?.gtaoMaterial?.uniforms?.radius) {
        gtaoPass.gtaoMaterial.uniforms.radius.value = quality.ssaoRadius;
      }
      if (sizeChanged) {
        webglFxRef.current.composer.setSize(size.width, size.height);
        prevSizeRef.current = { width: size.width, height: size.height };
      }
      webglFxRef.current.composer.render();
      return;
    }

    // While async FX graph loads, keep default scene rendering active.
    gl.render(scene, camera);
  }, 1);

  return null;
}
