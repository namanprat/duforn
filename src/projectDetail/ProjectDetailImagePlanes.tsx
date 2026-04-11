// @ts-nocheck
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { configureTexture } from "../../scripts/runtime/assets";

gsap.registerPlugin(ScrollTrigger);

function getCoverUvTransform({ textureWidth, textureHeight, frameWidth, frameHeight }) {
  const safeTextureWidth = Math.max(textureWidth || 1, 1);
  const safeTextureHeight = Math.max(textureHeight || 1, 1);
  const safeFrameWidth = Math.max(frameWidth || 1, 1);
  const safeFrameHeight = Math.max(frameHeight || 1, 1);
  const textureAspect = safeTextureWidth / safeTextureHeight;
  const frameAspect = safeFrameWidth / safeFrameHeight;
  const scale = { x: 1, y: 1 };
  const offset = { x: 0, y: 0 };

  if (textureAspect > frameAspect) {
    scale.x = frameAspect / textureAspect;
    offset.x = (1 - scale.x) * 0.5;
  } else if (textureAspect < frameAspect) {
    scale.y = textureAspect / frameAspect;
    offset.y = (1 - scale.y) * 0.5;
  }

  return { scale, offset };
}

async function createRevealMaterial(texture) {
  const tsl = await import("three/tsl");
  const { MeshBasicNodeMaterial } = await import("three/webgpu");
  const {
    Fn,
    float,
    vec3,
    uv,
    uniform,
    uniformTexture,
    texture: textureNode,
    mix,
    smoothstep,
    dot,
    mx_noise_float,
  } = tsl;

  const uniforms = {
    uTex: uniformTexture(texture),
    uReveal: uniform(0),
    uEdge: uniform(0.12),
    uNoiseScale: uniform(10.0),
    uNoiseStrength: uniform(0.15),
    uGreyLevel: uniform(0.55),
    uTime: uniform(0),
    uUvScale: uniform(new THREE.Vector2(1, 1)),
    uUvOffset: uniform(new THREE.Vector2(0, 0)),
  };

  const material = new MeshBasicNodeMaterial({
    transparent: true,
    depthWrite: false,
  });

  material.colorNode = Fn(() => {
    const coord = uv();
    const sampleCoord = coord.mul(uniforms.uUvScale).add(uniforms.uUvOffset);
    const sample = textureNode(uniforms.uTex, sampleCoord);
    const animatedNoise = mx_noise_float(
      vec3(coord.mul(uniforms.uNoiseScale), uniforms.uTime.mul(0.08).add(coord.y.mul(0.35))),
    );
    const threshold = coord.x.add(animatedNoise.mul(uniforms.uNoiseStrength));
    const sweep = smoothstep(float(-1), float(1), uniforms.uReveal.mul(2).sub(1))
      .mul(float(1).add(uniforms.uEdge.mul(2)))
      .sub(uniforms.uEdge);
    const progress = sweep.sub(threshold);
    const resolved = smoothstep(float(0), uniforms.uEdge, progress);
    const luma = dot(sample.rgb, vec3(0.299, 0.587, 0.114));
    const grey = vec3(luma.mul(uniforms.uGreyLevel));
    return mix(grey, sample.rgb, resolved);
  })();

  material.opacityNode = Fn(() => {
    const coord = uv();
    const sampleCoord = coord.mul(uniforms.uUvScale).add(uniforms.uUvOffset);
    const sample = textureNode(uniforms.uTex, sampleCoord);
    const animatedNoise = mx_noise_float(
      vec3(coord.mul(uniforms.uNoiseScale), uniforms.uTime.mul(0.08).add(coord.y.mul(0.35))),
    );
    const threshold = coord.x.add(animatedNoise.mul(uniforms.uNoiseStrength));
    const sweep = smoothstep(float(-1), float(1), uniforms.uReveal.mul(2).sub(1))
      .mul(float(1).add(uniforms.uEdge.mul(2)))
      .sub(uniforms.uEdge);
    const progress = sweep.sub(threshold);
    const visible = smoothstep(
      uniforms.uEdge.negate().mul(0.8),
      uniforms.uEdge.mul(0.18),
      progress,
    );
    return visible.mul(sample.a);
  })();

  return { material, uniforms };
}

function useImagePlaneMaterial({ gl, imgElement }) {
  const [ready, setReady] = useState(false);
  const systemRef = useRef(null);

  useEffect(() => {
    const source = imgElement.currentSrc || imgElement.src;
    if (!source) return;

    let cancelled = false;
    const loader = new THREE.TextureLoader();
    const showDomFallback = () => {
      imgElement.style.opacity = "";
      imgElement.style.visibility = "";
    };
    const hideDomFallback = () => {
      imgElement.style.opacity = "0";
      imgElement.style.visibility = "hidden";
    };

    loader.load(
      source,
      async (texture) => {
        if (cancelled) {
          texture.dispose();
          return;
        }

        configureTexture(texture, { renderer: gl });

        try {
          const system = await createRevealMaterial(texture);

          if (cancelled) {
            system.material.dispose();
            texture.dispose();
            return;
          }

          systemRef.current = { ...system, texture };
          hideDomFallback();
          setReady(true);
        } catch {
          showDomFallback();
          texture.dispose();
        }
      },
      undefined,
      () => {
        showDomFallback();
      },
    );

    return () => {
      cancelled = true;
      showDomFallback();
      if (systemRef.current) {
        systemRef.current.material.dispose();
        systemRef.current.texture.dispose();
        systemRef.current = null;
      }
      setReady(false);
    };
  }, [gl, imgElement]);

  return { ready, systemRef };
}

function ProjectDetailImagePlane({ imgElement, revealControls }) {
  const meshRef = useRef(null);
  const triggerRef = useRef(null);
  const tweenRef = useRef(null);
  const controlsRef = useRef(revealControls);
  const { gl } = useThree();
  const { ready, systemRef } = useImagePlaneMaterial({ gl, imgElement });

  controlsRef.current = revealControls;

  useEffect(() => {
    if (!ready || !systemRef.current) return;

    const triggerElement = imgElement.closest("[data-film-plane-trigger='true']");
    if (!triggerElement) return;

    const revealTarget = systemRef.current.uniforms.uReveal;

    const trigger = ScrollTrigger.create({
      trigger: triggerElement,
      start: "top 82%",
      once: true,
      onEnter: () => {
        tweenRef.current = gsap.to(revealTarget, {
          value: 1,
          duration: controlsRef.current.duration,
          ease: "power2.out",
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
  }, [gl, imgElement, ready]);

  useFrame((state) => {
    if (!meshRef.current || !systemRef.current) return;

    const rect = imgElement.getBoundingClientRect();
    const isVisible = rect.width > 0 && rect.height > 0;
    meshRef.current.visible = isVisible;
    if (!isVisible) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const x = rect.left - width / 2 + rect.width / 2;
    const y = -rect.top + height / 2 - rect.height / 2;

    const texture = systemRef.current.texture;
    const textureWidth = texture?.image?.width || rect.width;
    const textureHeight = texture?.image?.height || rect.height;
    const { scale, offset } = getCoverUvTransform({
      textureWidth,
      textureHeight,
      frameWidth: rect.width,
      frameHeight: rect.height,
    });

    meshRef.current.position.set(x, y, 0);
    meshRef.current.scale.set(rect.width, rect.height, 1);

    const { uniforms } = systemRef.current;
    uniforms.uEdge.value = revealControls.edge;
    uniforms.uNoiseScale.value = revealControls.noiseScale;
    uniforms.uNoiseStrength.value = revealControls.noiseStrength;
    uniforms.uGreyLevel.value = revealControls.greyLevel;
    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uUvScale.value.set(scale.x, scale.y);
    uniforms.uUvOffset.value.set(offset.x, offset.y);
  });

  if (!ready || !systemRef.current) return null;

  return (
    <mesh ref={meshRef} renderOrder={2}>
      <planeGeometry args={[1, 1]} />
      <primitive object={systemRef.current.material} attach="material" />
    </mesh>
  );
}

export default function ProjectDetailImagePlanes({ revealControls }) {
  const [images, setImages] = useState([]);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      const targets = document.querySelectorAll("[data-film-plane-target='true']");
      setImages(Array.from(targets));
    });

    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <>
      {images.map((img, index) => (
        <ProjectDetailImagePlane
          key={img.currentSrc || img.src || `${img.alt}-${index}`}
          imgElement={img}
          revealControls={revealControls}
        />
      ))}
    </>
  );
}
