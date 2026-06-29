import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import {
  DISSOLVE_DURATION,
  useDissolveTransitionStore,
} from "../../store/routeTransition";
import {
  COVER_FRAGMENT_SHADER,
  COVER_FRAGMENT_SHADER_REVERSE,
  COVER_VERTEX_SHADER,
} from "./transitionShaders";
import { applyDissolveUniforms } from "./transitionUniforms";
import { imageSizeFromTexture } from "./captureFrame";
import "./transitionUniforms.selfcheck";

type DissolveRuntime = {
  rendererTop: THREE.WebGLRenderer;
  rendererBottom: THREE.WebGLRenderer;
  materialTop: THREE.ShaderMaterial;
  materialBottom: THREE.ShaderMaterial;
  sceneTop: THREE.Scene;
  sceneBottom: THREE.Scene;
  camera: THREE.OrthographicCamera;
  rafId: number;
  tween: gsap.core.Tween | null;
};

function createLayer(
  container: HTMLDivElement,
  fragmentShader: string,
  texture: THREE.Texture,
  zIndex: string,
): Pick<DissolveRuntime, "rendererTop" | "materialTop" | "sceneTop"> & {
  renderer: THREE.WebGLRenderer;
  material: THREE.ShaderMaterial;
  scene: THREE.Scene;
} {
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  camera.position.z = 1;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);
  renderer.domElement.style.position = "absolute";
  renderer.domElement.style.inset = "0";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.style.zIndex = zIndex;

  const imageResolution = imageSizeFromTexture(texture);
  const uniforms = {
    uTexture: { value: texture },
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    uImageResolution: { value: imageResolution },
    uDissolve: { value: 0 },
    uCenter: { value: new THREE.Vector2(0.5, 0.5) },
    uTime: { value: 0 },
    uGrayscale: { value: 0 },
    uEdgeIntensity: { value: 0 },
    uEdgeBrightness: { value: 1 },
    uBrightness: { value: 0 },
    uDarkness: { value: 1 },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: COVER_VERTEX_SHADER,
    fragmentShader,
    transparent: true,
  });

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  scene.add(mesh);

  return { renderer, material, scene, rendererTop: renderer, materialTop: material, sceneTop: scene };
}

function applyBottomTexture(material: THREE.ShaderMaterial, texture: THREE.Texture) {
  material.uniforms.uTexture.value = texture;
  material.uniforms.uImageResolution.value = imageSizeFromTexture(texture);
}

export default function DissolveTransitionOverlay() {
  const active = useDissolveTransitionStore((s) => s.active);
  const runId = useDissolveTransitionStore((s) => s.runId);
  const setProgress = useDissolveTransitionStore((s) => s.setProgress);
  const finish = useDissolveTransitionStore((s) => s.finish);

  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const runtimeRef = useRef<DissolveRuntime | null>(null);

  // ponytail: runId only — bottomTexture swap at midpoint must not restart tween
  useEffect(() => {
    if (!active || !topRef.current || !bottomRef.current) return;

    const { topTexture, bottomTexture } = useDissolveTransitionStore.getState();
    if (!topTexture || !bottomTexture) return;

    const topContainer = topRef.current;
    const bottomContainer = bottomRef.current;
    topContainer.replaceChildren();
    bottomContainer.replaceChildren();

    const top = createLayer(topContainer, COVER_FRAGMENT_SHADER, topTexture, "2");
    const bottom = createLayer(bottomContainer, COVER_FRAGMENT_SHADER_REVERSE, bottomTexture, "1");

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;

    const runtime: DissolveRuntime = {
      rendererTop: top.renderer,
      rendererBottom: bottom.renderer,
      materialTop: top.material,
      materialBottom: bottom.material,
      sceneTop: top.scene,
      sceneBottom: bottom.scene,
      camera,
      rafId: 0,
      tween: null,
    };
    runtimeRef.current = runtime;

    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      runtime.rendererTop.setSize(w, h);
      runtime.rendererBottom.setSize(w, h);
      runtime.materialTop.uniforms.uResolution.value.set(w, h);
      runtime.materialBottom.uniforms.uResolution.value.set(w, h);
    };
    window.addEventListener("resize", onResize);

    const progress = { value: 0 };
    runtime.tween = gsap.to(progress, {
      value: 1,
      duration: DISSOLVE_DURATION,
      ease: "none",
      onUpdate: () => setProgress(progress.value),
      onComplete: () => finish(),
    });

    let appliedBottom = bottomTexture;
    const loop = (time: number) => {
      const state = useDissolveTransitionStore.getState();
      if (state.bottomTexture && state.bottomTexture !== appliedBottom) {
        appliedBottom = state.bottomTexture;
        applyBottomTexture(runtime.materialBottom, appliedBottom);
      }
      applyDissolveUniforms(
        runtime.materialTop,
        runtime.materialBottom,
        state.progress,
        time * 0.001,
        state.bottomReveal,
      );
      runtime.rendererBottom.render(runtime.sceneBottom, camera);
      runtime.rendererTop.render(runtime.sceneTop, camera);
      runtime.rafId = requestAnimationFrame(loop);
    };
    runtime.rafId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(runtime.rafId);
      runtime.tween?.kill();
      runtime.materialTop.dispose();
      runtime.materialBottom.dispose();
      runtime.rendererTop.dispose();
      runtime.rendererBottom.dispose();
      topContainer.replaceChildren();
      bottomContainer.replaceChildren();
      runtimeRef.current = null;
    };
  }, [active, runId, setProgress, finish]);

  if (!active) return null;

  return (
    <div className="dissolve_transition_overlay" aria-hidden>
      <div ref={bottomRef} className="dissolve_transition_layer dissolve_transition_layer--bottom" />
      <div ref={topRef} className="dissolve_transition_layer dissolve_transition_layer--top" />
    </div>
  );
}
