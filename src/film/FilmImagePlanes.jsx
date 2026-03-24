import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { configureTexture } from "../../scripts/runtime/assets.js";
import { isWebGPURenderer } from "../components/webgl/createWebGPURenderer.js";
import { logWebGPUOnce } from "../lib/webgpu/debugWebGPU.js";

gsap.registerPlugin(ScrollTrigger);

const sharedPointer = new THREE.Vector2(-9999, -9999);

function createWebGLMaterial(texture) {
  return new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      uTex: { value: texture },
      uCursorUV: { value: new THREE.Vector2(-1, -1) },
      uBlurRadius: { value: 0.25 },
      uBlurStrength: { value: 0.014 },
      uGrainStrength: { value: 0.06 },
      uTime: { value: 0 },
      uReveal: { value: 0 },
      uRevealEdge: { value: 0.15 },
    },
    vertexShader: `
      uniform float uReveal;
      uniform float uTime;
      varying vec2 vUv;

      void main() {
        vUv = uv;

        // Fabric wave vertex displacement — amplitude peaks at mid-reveal.
        // Displaced in X (primary) and Y (secondary) — Z is invisible in orthographic.
        float amplitude = sin(uReveal * 3.14159265) * 0.055;
        float dispX = sin(uv.y * 7.0 + uTime * 2.2) * amplitude;
        float dispY = cos(uv.x * 5.0 - uTime * 1.5) * amplitude * 0.45;

        vec3 displaced = position + vec3(dispX, dispY, 0.0);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uTex;
      uniform vec2 uCursorUV;
      uniform float uBlurRadius;
      uniform float uBlurStrength;
      uniform float uGrainStrength;
      uniform float uTime;
      uniform float uReveal;
      uniform float uRevealEdge;
      varying vec2 vUv;

      float random(vec2 st) {
        return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      void main() {
        // Ripple reveal distortion
        float wipePos = uReveal * (1.0 + uRevealEdge * 2.0) - uRevealEdge;
        // Reversed smoothstep: wipeMask=0 when uReveal=0, sweeps top-to-bottom as uReveal→1
        float wipeMask = smoothstep(wipePos + uRevealEdge, wipePos - uRevealEdge, vUv.y);

        float edgeDist = abs(vUv.y - wipePos);
        float edgeProximity = 1.0 - smoothstep(0.0, uRevealEdge * 3.0, edgeDist);
        float ripple = sin(edgeDist * 40.0 - uTime * 3.0) * edgeProximity * 0.015 * (1.0 - uReveal);
        vec2 distortedUv = clamp(vUv + vec2(ripple, ripple * 0.5), 0.0, 1.0);

        // Base color with distorted UVs
        vec4 baseColor = texture2D(uTex, distortedUv);

        // Cursor blur
        float d = distance(distortedUv, uCursorUV);
        float t = smoothstep(uBlurRadius, 0.0, d);
        vec2 off = vec2(uBlurStrength);

        vec4 blurred =
          texture2D(uTex, distortedUv + vec2(off.x, 0.0)) +
          texture2D(uTex, distortedUv - vec2(off.x, 0.0)) +
          texture2D(uTex, distortedUv + vec2(0.0, off.y)) +
          texture2D(uTex, distortedUv - vec2(0.0, off.y)) +
          texture2D(uTex, distortedUv + off) +
          texture2D(uTex, distortedUv - off) +
          texture2D(uTex, distortedUv + vec2(off.x, -off.y)) +
          texture2D(uTex, distortedUv + vec2(-off.x, off.y));
        blurred /= 8.0;

        // Film grain
        float grain = (random(distortedUv * 200.0 + uTime) - 0.5) * uGrainStrength;
        vec4 blurredWithGrain = blurred + vec4(vec3(grain), 0.0);
        vec4 result = mix(baseColor, blurredWithGrain, t);

        // Apply wipe alpha
        float alpha = wipeMask * result.a;
        gl_FragColor = vec4(result.rgb, alpha);
      }
    `,
  });
}

function FilmImagePlane({ imgElement, progressMapRef, index }) {
  const meshRef = useRef();
  const textureRef = useRef(null);
  const materialRef = useRef(null);
  const { gl } = useThree();
  const [material, setMaterial] = useState(null);
  const uniformsRef = useRef(null);

  useEffect(() => {
    const source = imgElement.currentSrc || imgElement.src;
    if (!source) return;

    let cancelled = false;

    async function buildWebGPUTextureMaterial(texture) {
      logWebGPUOnce(
        "film-imageplanes-webgpu",
        "FilmImagePlanes",
        "Building WebGPU TSL image-plane materials",
      );
      const { MeshBasicNodeMaterial } = await import("three/webgpu");
      const tsl = await import("three/tsl");
      const {
        Fn,
        float,
        vec2,
        vec3,
        vec4,
        uniform,
        uv,
        texture: tslTexture,
        uniformTexture,
        mix,
        smoothstep,
        fract,
        sin,
        cos,
        dot,
        abs: tslAbs,
        clamp: tslClamp,
        positionLocal,
        PI,
      } = tsl;

      if (cancelled) return null;

      const uniforms = {
        uTex: uniformTexture(texture),
        uCursorUV: uniform(new THREE.Vector2(-1, -1)),
        uBlurRadius: uniform(0.25),
        uBlurStrength: uniform(0.014),
        uGrainStrength: uniform(0.06),
        uTime: uniform(0),
        uReveal: uniform(0),
        uRevealEdge: uniform(0.15),
      };

      const fragmentFn = Fn(() => {
        const coord = uv();

        // Ripple reveal
        const wipePos = uniforms.uReveal
          .mul(uniforms.uRevealEdge.mul(2).add(1))
          .sub(uniforms.uRevealEdge);
        // Reversed smoothstep: wipeMask=0 when uReveal=0, sweeps top-to-bottom as uReveal→1
        const wipeMask = smoothstep(
          wipePos.add(uniforms.uRevealEdge), // from (high)
          wipePos.sub(uniforms.uRevealEdge), // to (low) — reversed
          coord.y,
        );

        const edgeDist = tslAbs(coord.y.sub(wipePos));
        const edgeProximity = float(1).sub(
          smoothstep(float(0), uniforms.uRevealEdge.mul(3), edgeDist),
        );
        const ripple = sin(edgeDist.mul(40).sub(uniforms.uTime.mul(3)))
          .mul(edgeProximity)
          .mul(0.015)
          .mul(float(1).sub(uniforms.uReveal));
        const distortedCoord = tslClamp(
          coord.add(vec2(ripple, ripple.mul(0.5))),
          float(0),
          float(1),
        );

        // Base color
        const baseColor = tslTexture(uniforms.uTex, distortedCoord);

        // Cursor blur
        const d = distortedCoord.sub(uniforms.uCursorUV).length();
        const t = smoothstep(uniforms.uBlurRadius, float(0), d);
        const off = uniforms.uBlurStrength;

        const s1 = tslTexture(uniforms.uTex, distortedCoord.add(vec2(off, float(0))));
        const s2 = tslTexture(uniforms.uTex, distortedCoord.add(vec2(off.negate(), float(0))));
        const s3 = tslTexture(uniforms.uTex, distortedCoord.add(vec2(float(0), off)));
        const s4 = tslTexture(uniforms.uTex, distortedCoord.add(vec2(float(0), off.negate())));
        const s5 = tslTexture(uniforms.uTex, distortedCoord.add(vec2(off, off)));
        const s6 = tslTexture(uniforms.uTex, distortedCoord.add(vec2(off.negate(), off.negate())));
        const s7 = tslTexture(uniforms.uTex, distortedCoord.add(vec2(off, off.negate())));
        const s8 = tslTexture(uniforms.uTex, distortedCoord.add(vec2(off.negate(), off)));

        const blurred = s1.add(s2).add(s3).add(s4).add(s5).add(s6).add(s7).add(s8).div(8);

        // Grain
        const seed = distortedCoord.mul(vec2(12.9898, 78.233)).add(uniforms.uTime);
        const noise = fract(sin(dot(seed, vec2(12.9898, 78.233))).mul(43758.5453));
        const grain = noise.sub(0.5).mul(uniforms.uGrainStrength);
        const blurredWithGrain = blurred.add(vec4(grain, grain, grain, float(0)));
        const result = mix(baseColor, blurredWithGrain, t);

        return vec4(result.rgb, wipeMask.mul(baseColor.a));
      });

      const webgpuMaterial = new MeshBasicNodeMaterial({ transparent: true });
      webgpuMaterial.fragmentNode = fragmentFn();

      // Fabric wave vertex displacement — displaced in X/Y (Z is invisible in orthographic).
      // Amplitude peaks at mid-reveal, settles to zero when fully revealed.
      const amplitude = sin(uniforms.uReveal.mul(Math.PI)).mul(0.055);
      const uvCoord2 = uv();
      const dispX = sin(uvCoord2.y.mul(7.0).add(uniforms.uTime.mul(2.2))).mul(amplitude);
      const dispY = cos(uvCoord2.x.mul(5.0).sub(uniforms.uTime.mul(1.5)))
        .mul(amplitude)
        .mul(0.45);
      webgpuMaterial.positionNode = positionLocal.add(vec3(dispX, dispY, float(0)));

      return { material: webgpuMaterial, uniforms };
    }

    async function build() {
      const loader = new THREE.TextureLoader();
      loader.load(
        source,
        async (tex) => {
          if (cancelled) return;

          configureTexture(tex, { renderer: gl });
          textureRef.current = tex;
          imgElement.style.opacity = "0";

          if (isWebGPURenderer(gl)) {
            const result = await buildWebGPUTextureMaterial(tex);
            if (!result || cancelled) return;
            uniformsRef.current = result.uniforms;
            materialRef.current = result.material;
            setMaterial(result.material);
            return;
          }

          logWebGPUOnce(
            "film-imageplanes-webgl",
            "FilmImagePlanes",
            "Using WebGL shader image-plane materials",
          );
          const webglMaterial = createWebGLMaterial(tex);
          uniformsRef.current = webglMaterial.uniforms;
          materialRef.current = webglMaterial;
          setMaterial(webglMaterial);
        },
        undefined,
        () => {
          imgElement.style.opacity = "";
        },
      );
    }

    build();

    return () => {
      cancelled = true;
      imgElement.style.opacity = "";
      if (textureRef.current) {
        textureRef.current.dispose();
        textureRef.current = null;
      }
      if (materialRef.current) {
        materialRef.current.dispose();
        materialRef.current = null;
      }
      uniformsRef.current = null;
    };
  }, [gl, imgElement]);

  useFrame((state) => {
    if (!meshRef.current) return;

    const rect = imgElement.getBoundingClientRect();
    const isVisible = rect.width > 0 && rect.height > 0;
    meshRef.current.visible = isVisible;
    if (!isVisible) return;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const x = rect.left - w / 2 + rect.width / 2;
    const y = -rect.top + h / 2 - rect.height / 2;

    const texture = textureRef.current;
    const textureWidth = texture?.image?.width || rect.width;
    const textureHeight = texture?.image?.height || rect.height;
    const textureAspect = textureWidth / Math.max(textureHeight, 1);
    const rectAspect = rect.width / Math.max(rect.height, 1);

    let renderWidth = rect.width;
    let renderHeight = rect.height;
    if (textureAspect > rectAspect) {
      renderHeight = rect.width / textureAspect;
    } else {
      renderWidth = rect.height * textureAspect;
    }

    meshRef.current.position.set(x, y, 0);
    meshRef.current.scale.set(renderWidth, renderHeight, 1);

    const uniforms = uniformsRef.current;
    if (uniforms) {
      const cursorUVx = (sharedPointer.x - rect.left) / rect.width;
      const cursorUVy = (sharedPointer.y - rect.top) / rect.height;
      const cursorUniform = uniforms.uCursorUV.value;

      uniforms.uTime.value = state.clock.elapsedTime;
      cursorUniform.set(cursorUVx, 1 - cursorUVy);

      // Drive reveal from ScrollTrigger progress
      const targetReveal = progressMapRef.current[index] ?? 0;
      const currentReveal =
        typeof uniforms.uReveal.value === "number"
          ? uniforms.uReveal.value
          : uniforms.uReveal.value;
      const nextReveal = currentReveal + (targetReveal - currentReveal) * 0.08;
      uniforms.uReveal.value = nextReveal;
    }
  });

  if (!material) return null;

  return (
    <mesh ref={meshRef} renderOrder={1}>
      <planeGeometry args={[1, 1, 40, 40]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

export default function FilmImagePlanes({ containerRef }) {
  const [images, setImages] = useState([]);
  const progressMapRef = useRef({});
  const triggersRef = useRef([]);

  // Discover DOM images
  useEffect(() => {
    const container = containerRef?.current;
    if (!container) return;

    const raf = requestAnimationFrame(() => {
      const targets = container.querySelectorAll(".coverimg img, .project-img img");
      setImages(Array.from(targets));
    });

    return () => cancelAnimationFrame(raf);
  }, [containerRef]);

  // Create ScrollTrigger instances per image
  useEffect(() => {
    if (images.length === 0) return;

    const triggers = images.map((img, i) => {
      const triggerEl = img.closest(".coverimg, .project-img");
      if (!triggerEl) return null;

      progressMapRef.current[i] = 0;

      return ScrollTrigger.create({
        trigger: triggerEl,
        start: "top 85%",
        end: "top 25%",
        onUpdate: (self) => {
          progressMapRef.current[i] = self.progress;
        },
      });
    });

    triggersRef.current = triggers;

    return () => {
      triggers.forEach((t) => t?.kill());
      triggersRef.current = [];
      progressMapRef.current = {};
    };
  }, [images]);

  // Global mouse tracking for cursor blur
  useEffect(() => {
    const onMouseMove = (e) => {
      sharedPointer.set(e.clientX, e.clientY);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  return (
    <>
      {images.map((img, i) => (
        <FilmImagePlane key={i} imgElement={img} progressMapRef={progressMapRef} index={i} />
      ))}
    </>
  );
}
