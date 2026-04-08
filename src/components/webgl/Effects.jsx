import { useFrame, useThree } from "@react-three/fiber";
import React, { useEffect, useRef } from "react";
import { logWebGPU } from "../../lib/webgpu/debugWebGPU.js";

export default function Effects({
  bloomStrength = 0.045,
  vignetteDarkness = 0.15,
  chromaticShift = 0.003,
  dofMaxBlur = 0.008,
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
    disabledRef.current = false;

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

        if (cancelled) return;

        const uniforms = {
          uBloomStrength: uniform(bloomStrength),
          uVignetteDarkness: uniform(vignetteDarkness),
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
          const blurred = sharp
            .add(s0)
            .add(s1)
            .add(s2)
            .add(s3)
            .add(s4)
            .add(s5)
            .add(s6)
            .add(s7)
            .div(float(9));
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
  }, [gl, scene, camera]);

  return null;
}
