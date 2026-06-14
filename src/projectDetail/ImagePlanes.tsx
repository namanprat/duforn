// @ts-nocheck
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { configureTexture } from "../../scripts/runtime/assets";
import { pickGpuBranchAsync } from "../lib/render";
import {
  buildProjectDetailImageMaterialWebGl,
  buildProjectDetailImageMaterialWebGpu,
} from "./imageMaterials";
import {
  buildProjectDetailRevealMaterialWebGl,
  buildProjectDetailRevealMaterialWebGpu,
} from "./revealMaterials";
import { PROJECT_DETAIL_COVER_SCALE_SETTINGS } from "./sceneConfig";

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

function getZoomedCoverUvTransform({ scale, offset }, zoom) {
  const safeZoom = Math.max(zoom || 1, 0.0001);
  const zoomedScale = {
    x: scale.x / safeZoom,
    y: scale.y / safeZoom,
  };

  return {
    scale: zoomedScale,
    offset: {
      x: offset.x + (scale.x - zoomedScale.x) * 0.5,
      y: offset.y + (scale.y - zoomedScale.y) * 0.5,
    },
  };
}

function getInteractionMode(imgElement) {
  return imgElement.closest("[data-film-plane-interaction='scroll-scale']")
    ? "scroll-scale"
    : "reveal";
}

function useImagePlaneMaterial({ gl, imgElement, mode }) {
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

    const materialBuilders =
      mode === "scroll-scale"
        ? {
            webgpu: (texture) => buildProjectDetailImageMaterialWebGpu(texture),
            webgl: (texture) => buildProjectDetailImageMaterialWebGl(texture),
          }
        : {
            webgpu: (texture) => buildProjectDetailRevealMaterialWebGpu(texture),
            webgl: (texture) => buildProjectDetailRevealMaterialWebGl(texture),
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
          const system = await pickGpuBranchAsync(gl, {
            webgpu: () => materialBuilders.webgpu(texture),
            webgl: () => materialBuilders.webgl(texture),
          });

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
  }, [gl, imgElement, mode]);

  return { ready, systemRef };
}

// Exp-damping rate for the scroll zoom — higher = snappier follow.
const SCROLL_SCALE_DAMPING = 10;

function ProjectDetailImagePlane({ imgElement, revealControls }) {
  const meshRef = useRef(null);
  const triggerRef = useRef(null);
  const tweenRef = useRef(null);
  const controlsRef = useRef(revealControls);
  const scrollScaleTargetRef = useRef(PROJECT_DETAIL_COVER_SCALE_SETTINGS.from);
  const scrollScaleRef = useRef(PROJECT_DETAIL_COVER_SCALE_SETTINGS.from);
  const { gl } = useThree();
  const mode = getInteractionMode(imgElement);
  const { ready, systemRef } = useImagePlaneMaterial({ gl, imgElement, mode });
  const [revealComplete, setRevealComplete] = useState(false);

  controlsRef.current = revealControls;

  useEffect(() => {
    if (!ready || !systemRef.current) return;

    const triggerElement = imgElement.closest("[data-film-plane-trigger='true']");
    if (!triggerElement) return;

    if (mode === "scroll-scale") {
      const { from, to, scrollStart, scrollEnd } = PROJECT_DETAIL_COVER_SCALE_SETTINGS;
      const trigger = ScrollTrigger.create({
        trigger: triggerElement,
        start: scrollStart,
        end: scrollEnd,
        scrub: true,
        onUpdate: (self) => {
          scrollScaleTargetRef.current = gsap.utils.interpolate(from, to, self.progress);
        },
      });

      triggerRef.current = trigger;

      return () => {
        trigger.kill();
        triggerRef.current = null;
      };
    }

    const revealTarget = systemRef.current.uniforms.uReveal;

    const trigger = ScrollTrigger.create({
      trigger: triggerElement,
      start: "top 82%",
      once: true,
      onEnter: () => {
        tweenRef.current = gsap.to(revealTarget, {
          value: 1,
          duration: controlsRef.current.duration,
          ease: `steps(${controlsRef.current.steps})`,
          onComplete: () => {
            imgElement.style.opacity = "";
            imgElement.style.visibility = "";
            setRevealComplete(true);
          },
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
  }, [gl, imgElement, mode, ready]);

  useFrame((state, delta) => {
    if (mode === "reveal" && revealComplete) return;
    if (!meshRef.current || !systemRef.current) return;

    const rect = imgElement.getBoundingClientRect();
    const isVisible = rect.width > 0 && rect.height > 0;
    meshRef.current.visible = isVisible;
    if (!isVisible) return;

    if (mode === "scroll-scale") {
      const dt = Math.min(delta, 0.05);
      scrollScaleRef.current = THREE.MathUtils.lerp(
        scrollScaleRef.current,
        scrollScaleTargetRef.current,
        1 - Math.exp(-SCROLL_SCALE_DAMPING * dt),
      );
    }

    const { width, height } = state.size;
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
    if (mode === "reveal") {
      uniforms.uEdge.value = revealControls.edge;
      uniforms.uNoiseScale.value = revealControls.noiseScale;
      uniforms.uNoiseStrength.value = revealControls.noiseStrength;
      uniforms.uGreyLevel.value = revealControls.greyLevel;
      uniforms.uTime.value = state.clock.elapsedTime;
    }

    const uvTransform =
      mode === "scroll-scale"
        ? getZoomedCoverUvTransform({ scale, offset }, scrollScaleRef.current)
        : { scale, offset };

    uniforms.uUvScale.value.set(uvTransform.scale.x, uvTransform.scale.y);
    uniforms.uUvOffset.value.set(uvTransform.offset.x, uvTransform.offset.y);
  });

  if (!ready || !systemRef.current) return null;
  if (mode === "reveal" && revealComplete) return null;

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
