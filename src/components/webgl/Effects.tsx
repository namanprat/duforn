// @ts-nocheck
import { useFrame, useThree } from "@react-three/fiber";
import React, { useEffect, useRef } from "react";
import { logWebGPU } from "../../lib/webgpu/debugWebGPU";

export default function Effects({
  bloomStrength = 0.045,
  vignetteDarkness = 0.15,
  chromaticShift = 0.003,
  dofMaxBlur = 0.008,
  aoResolutionScale = 0.5,
  aoRadius = 0.25,
  aoSamples = 16,
  /** 0 = skip GTAO multiply on lit rgb (e.g. work cloth TSL); 1 = full GTAO. */
  ambientOcclusionStrength = 1,
}) {
  const { gl, scene, camera } = useThree();
  const ppRef = useRef(null);
  const uniformsRef = useRef(null);
  const aoPassRef = useRef(null);
  const disabledRef = useRef(false);

  useFrame(() => {
    if (disabledRef.current) return;

    const u = uniformsRef.current;
    if (u) {
      u.uBloomStrength.value = bloomStrength;
      u.uVignetteDarkness.value = vignetteDarkness;
      u.uChromaticShift.value = chromaticShift;
      u.uDofMaxBlur.value = dofMaxBlur;
      u.uAmbientOcclusionStrength.value = ambientOcclusionStrength;
    }

    const aoPass = aoPassRef.current;
    if (aoPass) {
      aoPass.resolutionScale = aoResolutionScale;
      aoPass.radius.value = aoRadius;
      aoPass.samples.value = aoSamples;
    }

    if (ppRef.current) {
      try {
        ppRef.current.render();
      } catch {
        disabledRef.current = true;
        ppRef.current.dispose();
        ppRef.current = null;
        uniformsRef.current = null;
        aoPassRef.current = null;
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
          mrt,
          output,
          normalView,
        } = await import("three/tsl");
        const { bloom } = await import("three/addons/tsl/display/BloomNode.js");
        const { ao } = await import("three/addons/tsl/display/GTAONode.js");

        if (cancelled) return;

        /** MRT + view normals break some MeshBasicNodeMaterial (work cloth) scene color; skip full GTAO path. */
        const skipGtao = ambientOcclusionStrength <= 0;

        const uniforms = {
          uBloomStrength: uniform(bloomStrength),
          uVignetteDarkness: uniform(vignetteDarkness),
          uChromaticShift: uniform(chromaticShift),
          uCaEdgeStart: uniform(0.2),
          uCaEdgeEnd: uniform(0.7),
          uDofMaxBlur: uniform(dofMaxBlur),
          uAmbientOcclusionStrength: uniform(ambientOcclusionStrength),
        };

        const scenePass = pass(scene, camera);
        if (!skipGtao) {
          scenePass.setMRT(
            mrt({
              output,
              normal: normalView,
            }),
          );
        }

        const scenePassColor = scenePass.getTextureNode("output");

        let postColor;
        let aoPass = null;

        if (skipGtao) {
          postColor = scenePassColor;
        } else {
          const scenePassDepth = scenePass.getTextureNode("depth");
          const scenePassNormal = scenePass.getTextureNode("normal");

          aoPass = ao(scenePassDepth, scenePassNormal, camera);
          aoPass.resolutionScale = aoResolutionScale;
          aoPass.radius.value = aoRadius;
          aoPass.samples.value = aoSamples;

          // RedFormat AO: only .r holds the factor; vec4*vec4 would zero G/B → red tint.
          const aoTex = aoPass.getTextureNode();
          postColor = Fn(() => {
            const coord = uv();
            const color = vec4(scenePassColor.sample(coord));
            const aoFactor = aoTex.sample(coord).r;
            const litRgb = mix(
              color.rgb,
              color.rgb.mul(aoFactor),
              uniforms.uAmbientOcclusionStrength,
            );
            return vec4(litRgb, color.a);
          })();
        }

        const bloomPass = bloom(postColor, uniforms.uBloomStrength, 0.3, 1.0);
        let postNode = postColor.add(bloomPass);

        const dofInput = convertToTexture(postNode);
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
        postNode = dof();

        const vignette = Fn(([color]) => {
          const centered = uv().sub(0.5).mul(2);
          const v = float(1).sub(dot(centered, centered).mul(uniforms.uVignetteDarkness));
          const mask = smoothstep(float(0), float(1), clamp(v, 0, 1));
          return vec4(color.rgb.mul(mask), color.a);
        });
        postNode = vignette(postNode);

        const caInput = convertToTexture(postNode);
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
        postNode = chromaticAb();

        if (cancelled) return;

        const pp = new RenderPipeline(gl);
        pp.outputNode = postNode;
        ppRef.current = pp;
        uniformsRef.current = uniforms;
        aoPassRef.current = aoPass;
        logWebGPU(
          "Effects",
          skipGtao
            ? "WebGPU post-processing pipeline ready (bloom, DOF, vignette, chromatic; GTAO off)"
            : "WebGPU post-processing pipeline ready (bloom, GTAO, DOF, vignette, chromatic)",
        );
      } catch {
        disabledRef.current = true;
        ppRef.current = null;
        uniformsRef.current = null;
        aoPassRef.current = null;
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
      aoPassRef.current = null;
    };
  }, [gl, scene, camera, ambientOcclusionStrength]);

  return null;
}
