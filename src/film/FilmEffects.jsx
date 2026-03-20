import { useFrame, useThree } from "@react-three/fiber";
import React, { useEffect, useRef } from "react";
import { ChromaticAberration, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { Vector2 } from "three";
import { isWebGLRenderer } from "../components/webgl/createWebGPURenderer.js";
import { logWebGPUOnce, logWebGPU } from "../lib/webgpu/debugWebGPU.js";

function WebGLFilmEffects() {
  return (
    <EffectComposer multisampling={0} disableNormalPass>
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={new Vector2(0.0035, 0.0018)}
        radialModulation
        modulationOffset={0.16}
      />
      <Vignette offset={0.28} darkness={0.24} />
      <Noise blendFunction={BlendFunction.OVERLAY} opacity={0.02} />
    </EffectComposer>
  );
}

function WebGPUFilmEffects() {
  const { gl, scene, camera } = useThree();
  const ppRef = useRef(null);
  const uniformsRef = useRef(null);
  const disabledRef = useRef(false);

  useFrame((state) => {
    if (disabledRef.current) return;

    const u = uniformsRef.current;
    if (u) {
      u.uTime.value = state.clock.elapsedTime;
    }
    if (ppRef.current) {
      try {
        ppRef.current.render();
      } catch {
        disabledRef.current = true;
        ppRef.current.dispose();
        ppRef.current = null;
        uniformsRef.current = null;
      }
    }
  }, 1);

  useEffect(() => {
    let cancelled = false;

    async function buildPipeline() {
      try {
        const { RenderPipeline } = await import("three/webgpu");
        const { pass, Fn, float, vec2, vec4, uv, uniform, smoothstep, convertToTexture } =
          await import("three/tsl");
        const { film } = await import("three/addons/tsl/display/FilmNode.js");

        if (cancelled) return;

        const uniforms = {
          uTime: uniform(0),
          uGrain: uniform(0.015),
          uChromaticShift: uniform(0.0056),
          uCaEdgeStart: uniform(0.2),
          uCaEdgeEnd: uniform(0.75),
        };

        const scenePass = pass(scene, camera);
        const scenePassColor = scenePass.getTextureNode("output");

        let output = convertToTexture(scenePassColor);
        output = film(output, uniforms.uGrain);

        const caInput = convertToTexture(output);
        const chromaticAb = Fn(() => {
          const coord = uv();
          const center = vec2(0.5, 0.5);
          const offset = coord.sub(center);
          const dist = offset.length();
          const edge = smoothstep(uniforms.uCaEdgeStart, uniforms.uCaEdgeEnd, dist);
          const shift = uniforms.uChromaticShift.mul(edge);
          const dir = offset.normalize();
          const redUV = coord.add(dir.mul(shift));
          const blueUV = coord.sub(dir.mul(shift));
          const r = vec4(caInput.sample(redUV)).r;
          const centerSample = caInput.sample(coord);
          const b = vec4(caInput.sample(blueUV)).b;
          return vec4(r, centerSample.g, b, centerSample.a);
        });
        output = chromaticAb();

        if (cancelled) return;

        const pp = new RenderPipeline(gl);
        pp.outputNode = output;
        ppRef.current = pp;
        uniformsRef.current = uniforms;
        logWebGPU("FilmEffects", "WebGPU film post-processing pipeline ready");
      } catch {
        disabledRef.current = true;
        ppRef.current = null;
        uniformsRef.current = null;
      }
    }

    buildPipeline();

    return () => {
      cancelled = true;
      disabledRef.current = false;
      if (ppRef.current) {
        ppRef.current.dispose();
        ppRef.current = null;
      }
      uniformsRef.current = null;
    };
  }, [gl, scene, camera]);

  return null;
}

export default function FilmEffects() {
  const { gl } = useThree();
  logWebGPUOnce(`film-effects-${gl.uuid || "renderer"}`, "FilmEffects", "Resolved post-processing branch", {
    mode: isWebGLRenderer(gl) ? "webgl-postprocessing" : "webgpu-postprocessing",
  });

  if (isWebGLRenderer(gl)) {
    return <WebGLFilmEffects />;
  }

  return <WebGPUFilmEffects />;
}
