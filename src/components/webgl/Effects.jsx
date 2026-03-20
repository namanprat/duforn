import { useFrame, useThree } from "@react-three/fiber";
import React, { useEffect, useRef } from "react";
import {
  Bloom,
  ChromaticAberration,
  DepthOfField,
  EffectComposer,
  Noise,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { Vector2 } from "three";
import { isWebGLRenderer, getRendererType } from "./createWebGPURenderer.js";
import { useWebglStore } from "../../store/webgl.js";
import { logWebGPU } from "../../lib/webgpu/debugWebGPU.js";

function WebGLEffects({ bloomStrength, vignetteDarkness, grain, chromaticShift, dofMaxBlur }) {
  return (
    <EffectComposer multisampling={0} disableNormalPass>
      <Bloom intensity={bloomStrength * 2.8} luminanceThreshold={0.72} luminanceSmoothing={0.32} />
      <DepthOfField
        focusDistance={0.018}
        focalLength={0.02}
        bokehScale={Math.max(dofMaxBlur * 12, 0.01)}
        height={480}
      />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={new Vector2(chromaticShift, chromaticShift * 0.45)}
        radialModulation
        modulationOffset={0.2}
      />
      <Vignette offset={0.35} darkness={vignetteDarkness} />
      <Noise blendFunction={BlendFunction.OVERLAY} opacity={grain} />
    </EffectComposer>
  );
}

function WebGPUEffects({
  bloomStrength,
  vignetteDarkness,
  grain,
  chromaticShift,
  dofMaxBlur,
}) {
  const { gl, scene, camera } = useThree();
  const ppRef = useRef(null);
  const uniformsRef = useRef(null);
  const disabledRef = useRef(false);

  useFrame(() => {
    if (disabledRef.current) return;

    const u = uniformsRef.current;
    if (u) {
      u.uBloomStrength.value = bloomStrength;
      u.uVignetteDarkness.value = vignetteDarkness;
      u.uGrain.value = grain;
      u.uChromaticShift.value = chromaticShift;
      u.uDofMaxBlur.value = dofMaxBlur;
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
        const {
          pass,
          Fn,
          float,
          vec2,
          vec4,
          uv,
          dot,
          uniform,
          smoothstep,
          clamp,
          convertToTexture,
          mix,
        } = await import("three/tsl");
        const { bloom } = await import("three/addons/tsl/display/BloomNode.js");
        const { film } = await import("three/addons/tsl/display/FilmNode.js");

        if (cancelled) return;

        const uniforms = {
          uBloomStrength: uniform(bloomStrength),
          uVignetteDarkness: uniform(vignetteDarkness),
          uGrain: uniform(grain),
          uChromaticShift: uniform(chromaticShift),
          uCaEdgeStart: uniform(0.2),
          uCaEdgeEnd: uniform(0.7),
          uDofMaxBlur: uniform(dofMaxBlur),
        };

        const scenePass = pass(scene, camera);
        const scenePassColor = scenePass.getTextureNode("output");

        const bloomPass = bloom(scenePassColor, uniforms.uBloomStrength, 0.3, 1.0);
        let output = scenePassColor.add(bloomPass);

        const dofInput = convertToTexture(output);
        const dof = Fn(() => {
          const coord = uv();
          const center = vec2(0.5, 0.5);
          const dist = coord.sub(center).length();
          const edgeFactor = smoothstep(float(0.3), float(0.8), dist);
          const blur = edgeFactor.mul(uniforms.uDofMaxBlur);
          const sharp = dofInput.sample(coord);
          const s0 = dofInput.sample(coord.add(vec2(blur, float(0))));
          const s1 = dofInput.sample(coord.add(vec2(blur.mul(0.707), blur.mul(0.707))));
          const s2 = dofInput.sample(coord.add(vec2(float(0), blur)));
          const s3 = dofInput.sample(coord.add(vec2(blur.mul(-0.707), blur.mul(0.707))));
          const s4 = dofInput.sample(coord.add(vec2(blur.negate(), float(0))));
          const s5 = dofInput.sample(coord.add(vec2(blur.mul(-0.707), blur.mul(-0.707))));
          const s6 = dofInput.sample(coord.add(vec2(float(0), blur.negate())));
          const s7 = dofInput.sample(coord.add(vec2(blur.mul(0.707), blur.mul(-0.707))));
          const blurred = sharp.add(s0).add(s1).add(s2).add(s3).add(s4).add(s5).add(s6).add(s7).div(float(9));
          return mix(sharp, blurred, edgeFactor);
        });
        output = dof();

        const vignette = Fn(([color]) => {
          const centered = uv().sub(0.5).mul(2);
          const v = float(1).sub(dot(centered, centered).mul(uniforms.uVignetteDarkness));
          const mask = smoothstep(float(0), float(1), clamp(v, 0, 1));
          return vec4(color.rgb.mul(mask), color.a);
        });
        output = vignette(output);

        output = convertToTexture(output);
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
        logWebGPU("Effects", "WebGPU post-processing pipeline ready");
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
  }, [gl, scene, camera, bloomStrength, vignetteDarkness, grain, chromaticShift, dofMaxBlur]);

  return null;
}

export default function Effects({
  bloomStrength = 0.045,
  vignetteDarkness = 0.15,
  grain = 0.03,
  chromaticShift = 0.003,
  dofMaxBlur = 0.008,
}) {
  const { gl } = useThree();
  const setRendererType = useWebglStore((state) => state.setRendererType);

  useEffect(() => {
    setRendererType(getRendererType(gl));
    logWebGPU("Effects", "Resolved post-processing branch", {
      rendererType: getRendererType(gl),
      mode: isWebGLRenderer(gl) ? "webgl-postprocessing" : "webgpu-postprocessing",
    });
  }, [gl, setRendererType]);

  if (isWebGLRenderer(gl)) {
    return (
      <WebGLEffects
        bloomStrength={bloomStrength}
        vignetteDarkness={vignetteDarkness}
        grain={grain}
        chromaticShift={chromaticShift}
        dofMaxBlur={dofMaxBlur}
      />
    );
  }

  return (
    <WebGPUEffects
      bloomStrength={bloomStrength}
      vignetteDarkness={vignetteDarkness}
      grain={grain}
      chromaticShift={chromaticShift}
      dofMaxBlur={dofMaxBlur}
    />
  );
}
