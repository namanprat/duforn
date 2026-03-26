import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { configureTexture } from "../../scripts/runtime/assets.js";

gsap.registerPlugin(ScrollTrigger);

/* ------------------------------------------------------------------ */
/*  Scramble-reveal shader                                             */
/*  Smooth left-to-right sweep with organic noise edge.                */
/*  Grey → full color, invisible → visible.                            */
/*  No pixelation — works at per-pixel level with smooth value noise.  */
/* ------------------------------------------------------------------ */

const REVEAL_VERTEX = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const REVEAL_FRAGMENT = `
  uniform sampler2D uTex;
  uniform float uReveal;
  uniform float uEdge;
  uniform float uNoiseScale;
  uniform float uNoiseStrength;
  uniform float uGreyLevel;
  varying vec2 vUv;

  // Smooth value noise for organic edge
  float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  void main() {
    vec4 color = texture2D(uTex, vUv);

    // Smooth noise — organic irregular edge
    float n = noise(vUv * uNoiseScale) * uNoiseStrength;

    // Left-to-right sweep
    float pad = uEdge + 0.1;
    float sweep = uReveal * (1.0 + pad * 2.0) - pad;
    float threshold = vUv.x + n;
    float progress = sweep - threshold;

    // Resolve: 0 = grey/faded, 1 = sharp/full color
    float resolved = smoothstep(0.0, uEdge, progress);

    // Visibility: appears just ahead of the resolve front
    float visible = smoothstep(-uEdge * 0.5, uEdge * 0.15, progress);

    // Grey → full color
    float luma = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    color.rgb = mix(vec3(luma) * uGreyLevel, color.rgb, resolved);

    gl_FragColor = vec4(color.rgb, visible);
  }
`;

function createRevealMaterial(texture) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    vertexShader: REVEAL_VERTEX,
    fragmentShader: REVEAL_FRAGMENT,
    uniforms: {
      uTex: { value: texture },
      uReveal: { value: 0 },
      uEdge: { value: 0.12 },
      uNoiseScale: { value: 10.0 },
      uNoiseStrength: { value: 0.15 },
      uGreyLevel: { value: 0.55 },
    },
  });
}

function FilmImagePlane({ imgElement, revealControls }) {
  const meshRef = useRef();
  const textureRef = useRef(null);
  const materialRef = useRef(null);
  const triggerRef = useRef(null);
  const tweenRef = useRef(null);
  const controlsRef = useRef(revealControls);
  controlsRef.current = revealControls;
  const [ready, setReady] = useState(false);
  const { gl } = useThree();

  useEffect(() => {
    const source = imgElement.currentSrc || imgElement.src;
    if (!source) return;
    let cancelled = false;

    const loader = new THREE.TextureLoader();
    loader.load(
      source,
      (tex) => {
        if (cancelled) return;
        configureTexture(tex, { renderer: gl });
        textureRef.current = tex;
        imgElement.style.opacity = "0";

        const mat = createRevealMaterial(tex);
        materialRef.current = mat;
        setReady(true);
      },
      undefined,
      () => {
        imgElement.style.opacity = "";
      },
    );

    return () => {
      cancelled = true;
      imgElement.style.opacity = "";
      textureRef.current?.dispose();
      textureRef.current = null;
      materialRef.current?.dispose();
      materialRef.current = null;
    };
  }, [gl, imgElement]);

  // ScrollTrigger: fire-once animation when image enters viewport
  useEffect(() => {
    if (!ready || !materialRef.current) return;

    const triggerEl = imgElement.closest(".coverimg, .project-img");
    if (!triggerEl) return;

    const trigger = ScrollTrigger.create({
      trigger: triggerEl,
      start: "top 85%",
      once: true,
      onEnter: () => {
        tweenRef.current = gsap.to(materialRef.current.uniforms.uReveal, {
          value: 1,
          duration: controlsRef.current.duration,
          ease: "power2.inOut",
        });
      },
    });

    triggerRef.current = trigger;

    return () => {
      trigger.kill();
      triggerRef.current = null;
      tweenRef.current?.kill();
      tweenRef.current = null;
    };
  }, [ready, imgElement]);

  useFrame(() => {
    if (!meshRef.current) return;

    const rect = imgElement.getBoundingClientRect();
    const isVisible = rect.width > 0 && rect.height > 0;
    meshRef.current.visible = isVisible;
    if (!isVisible) return;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const x = rect.left - w / 2 + rect.width / 2;
    const y = -rect.top + h / 2 - rect.height / 2;

    const tex = textureRef.current;
    const textureWidth = tex?.image?.width || rect.width;
    const textureHeight = tex?.image?.height || rect.height;
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

    // Sync GUI controls → uniforms
    const u = materialRef.current.uniforms;
    u.uEdge.value = revealControls.edge;
    u.uNoiseScale.value = revealControls.noiseScale;
    u.uNoiseStrength.value = revealControls.noiseStrength;
    u.uGreyLevel.value = revealControls.greyLevel;
  });

  if (!ready) return null;

  return (
    <mesh ref={meshRef} renderOrder={1}>
      <planeGeometry args={[1, 1]} />
      <primitive object={materialRef.current} attach="material" />
    </mesh>
  );
}

export default function FilmImagePlanes({ revealControls }) {
  const [images, setImages] = useState([]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const targets = document.querySelectorAll(".coverimg img, .project-img img");
      setImages(Array.from(targets));
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <>
      {images.map((img, i) => (
        <FilmImagePlane key={i} imgElement={img} revealControls={revealControls} />
      ))}
    </>
  );
}
