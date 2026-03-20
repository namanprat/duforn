import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { configureTexture } from "../../scripts/runtime/assets.js";
import { isWebGPURenderer } from "../components/webgl/createWebGPURenderer.js";
import { logWebGPUOnce } from "../lib/webgpu/debugWebGPU.js";

const sharedPointer = new THREE.Vector2(-9999, -9999);

function createWebGLMaterial(texture) {
  return new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      uTex: { value: texture },
      uCursorUV: { value: new THREE.Vector2(-1, -1) },
      uBlurRadius: { value: 0.15 },
      uBlurStrength: { value: 0.008 },
      uGrainStrength: { value: 0.08 },
      uTime: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uTex;
      uniform vec2 uCursorUV;
      uniform float uBlurRadius;
      uniform float uBlurStrength;
      uniform float uGrainStrength;
      uniform float uTime;
      varying vec2 vUv;

      float random(vec2 st) {
        return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      void main() {
        vec4 baseColor = texture2D(uTex, vUv);
        float d = distance(vUv, uCursorUV);
        float t = smoothstep(uBlurRadius, 0.0, d);
        vec2 off = vec2(uBlurStrength);

        vec4 blurred =
          texture2D(uTex, vUv + vec2(off.x, 0.0)) +
          texture2D(uTex, vUv - vec2(off.x, 0.0)) +
          texture2D(uTex, vUv + vec2(0.0, off.y)) +
          texture2D(uTex, vUv - vec2(0.0, off.y)) +
          texture2D(uTex, vUv + off) +
          texture2D(uTex, vUv - off) +
          texture2D(uTex, vUv + vec2(off.x, -off.y)) +
          texture2D(uTex, vUv + vec2(-off.x, off.y));

        blurred /= 8.0;

        float grain = (random(vUv * 200.0 + uTime) - 0.5) * uGrainStrength;
        vec4 blurredWithGrain = blurred + vec4(vec3(grain), 0.0);
        vec4 result = mix(baseColor, blurredWithGrain, t);
        gl_FragColor = vec4(result.rgb, baseColor.a);
      }
    `,
  });
}

function FilmImagePlane({ imgElement }) {
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
      logWebGPUOnce("film-imageplanes-webgpu", "FilmImagePlanes", "Building WebGPU TSL image-plane materials");
      const { MeshBasicNodeMaterial } = await import("three/webgpu");
      const tsl = await import("three/tsl");
      const {
        Fn,
        float,
        vec2,
        vec4,
        uniform,
        uv,
        texture: tslTexture,
        uniformTexture,
        mix,
        smoothstep,
        fract,
        sin,
        dot,
      } = tsl;

      if (cancelled) return null;

      const uniforms = {
        uTex: uniformTexture(texture),
        uCursorUV: uniform(new THREE.Vector2(-1, -1)),
        uBlurRadius: uniform(0.15),
        uBlurStrength: uniform(0.008),
        uGrainStrength: uniform(0.08),
        uTime: uniform(0),
      };

      const fragmentFn = Fn(() => {
        const coord = uv();
        const baseColor = tslTexture(uniforms.uTex, coord);
        const d = coord.sub(uniforms.uCursorUV).length();
        const t = smoothstep(uniforms.uBlurRadius, float(0), d);
        const off = uniforms.uBlurStrength;

        const s1 = tslTexture(uniforms.uTex, coord.add(vec2(off, float(0))));
        const s2 = tslTexture(uniforms.uTex, coord.add(vec2(off.negate(), float(0))));
        const s3 = tslTexture(uniforms.uTex, coord.add(vec2(float(0), off)));
        const s4 = tslTexture(uniforms.uTex, coord.add(vec2(float(0), off.negate())));
        const s5 = tslTexture(uniforms.uTex, coord.add(vec2(off, off)));
        const s6 = tslTexture(uniforms.uTex, coord.add(vec2(off.negate(), off.negate())));
        const s7 = tslTexture(uniforms.uTex, coord.add(vec2(off, off.negate())));
        const s8 = tslTexture(uniforms.uTex, coord.add(vec2(off.negate(), off)));

        const blurred = s1.add(s2).add(s3).add(s4).add(s5).add(s6).add(s7).add(s8).div(8);
        const seed = coord.mul(vec2(12.9898, 78.233)).add(uniforms.uTime);
        const noise = fract(sin(dot(seed, vec2(12.9898, 78.233))).mul(43758.5453));
        const grain = noise.sub(0.5).mul(uniforms.uGrainStrength);
        const blurredWithGrain = blurred.add(vec4(grain, grain, grain, float(0)));
        const result = mix(baseColor, blurredWithGrain, t);

        return vec4(result.rgb, baseColor.a);
      });

      const webgpuMaterial = new MeshBasicNodeMaterial({ transparent: true });
      webgpuMaterial.fragmentNode = fragmentFn();

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

          logWebGPUOnce("film-imageplanes-webgl", "FilmImagePlanes", "Using WebGL shader image-plane materials");
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
    }
  });

  if (!material) return null;

  return (
    <mesh ref={meshRef} renderOrder={1}>
      <planeGeometry args={[1, 1]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

export default function FilmImagePlanes({ containerRef }) {
  const [images, setImages] = useState([]);

  useEffect(() => {
    const container = containerRef?.current;
    if (!container) return;

    const raf = requestAnimationFrame(() => {
      const targets = container.querySelectorAll(".coverimg img, .project-img img");
      setImages(Array.from(targets));
    });

    return () => cancelAnimationFrame(raf);
  }, [containerRef]);

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
        <FilmImagePlane key={i} imgElement={img} />
      ))}
    </>
  );
}
