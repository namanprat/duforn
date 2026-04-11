// @ts-nocheck
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { registerArchiveBurnOverlay } from "../../lib/animation/archiveBurnRoute";

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

const vertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = /* glsl */ `
uniform sampler2D tDiffuse;
uniform float uProgress;
uniform float uTime;
uniform float uRimIntensity;
uniform float uNoiseAmp;
uniform float uSimpleFade;
varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = m * p * 2.0;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv;
  vec3 snap = texture2D(tDiffuse, uv).rgb;

  if (uSimpleFade > 0.5) {
    gl_FragColor = vec4(snap, 1.0 - uProgress);
    return;
  }

  float dist = length(uv - vec2(0.5));
  float n = fbm(uv * 6.5 + uTime * 0.08);
  float edge = dist - uProgress * 0.95 + n * uNoiseAmp;
  float solid = smoothstep(-0.04, 0.07, edge);
  float rimBand =
    smoothstep(0.0, 0.055, edge) * (1.0 - smoothstep(0.055, 0.14, edge));

  float a = solid;
  vec3 rimCol = vec3(1.0) * rimBand * uRimIntensity * (0.65 + 0.35 * n);
  vec3 outRgb = snap * a + rimCol;
  float outA = max(a, rimBand * 0.88);

  gl_FragColor = vec4(outRgb, outA);
}
`;

function setRendererSize(renderer, width, height) {
  const w = Math.max(1, Math.floor(width));
  const h = Math.max(1, Math.floor(height));
  renderer.setSize(w, h, false);
  renderer.domElement.style.width = `${w}px`;
  renderer.domElement.style.height = `${h}px`;
}

export default function ArchiveBurnOverlay() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "high-performance",
      preserveDrawingBuffer: true,
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        uProgress: { value: 0 },
        uTime: { value: 0 },
        uRimIntensity: { value: 1.1 },
        uNoiseAmp: { value: 0.14 },
        uSimpleFade: { value: 0 },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let texture = null;
    let rafDissolve = 0;

    const renderFrame = () => {
      renderer.render(scene, camera);
    };

    const onResize = () => {
      if (getComputedStyle(mount).display === "none") return;
      setRendererSize(renderer, window.innerWidth, window.innerHeight);
      renderFrame();
    };

    window.addEventListener("resize", onResize);

    const api = {
      /**
       * @param {HTMLCanvasElement} captureCanvas
       */
      showFromCanvas(captureCanvas) {
        if (texture) {
          texture.dispose();
          texture = null;
        }
        texture = new THREE.CanvasTexture(captureCanvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.needsUpdate = true;
        material.uniforms.tDiffuse.value = texture;
        material.uniforms.uProgress.value = 0;
        material.uniforms.uTime.value = 0;
        mount.style.display = "block";
        mount.style.pointerEvents = "auto";
        setRendererSize(renderer, window.innerWidth, window.innerHeight);
        renderFrame();
      },

      /**
       * @param {object} opts
       * @param {number} opts.durationMs
       * @param {boolean} [opts.simpleFade]
       * @param {number} [opts.rimIntensity]
       * @param {number} [opts.noiseAmp]
       */
      playDissolve(opts) {
        const { durationMs, simpleFade = false, rimIntensity = 1.1, noiseAmp = 0.14 } = opts;

        cancelAnimationFrame(rafDissolve);
        material.uniforms.uSimpleFade.value = simpleFade ? 1 : 0;
        material.uniforms.uRimIntensity.value = rimIntensity;
        material.uniforms.uNoiseAmp.value = noiseAmp;
        material.uniforms.uProgress.value = 0;

        return new Promise((resolve) => {
          const start = performance.now();
          const tick = (now) => {
            const t = Math.min(1, (now - start) / durationMs);
            const eased = easeOutCubic(t);
            material.uniforms.uProgress.value = eased;
            material.uniforms.uTime.value = now * 0.001;
            renderFrame();
            if (t < 1) {
              rafDissolve = requestAnimationFrame(tick);
            } else {
              rafDissolve = 0;
              resolve();
            }
          };
          rafDissolve = requestAnimationFrame(tick);
        });
      },

      hide() {
        cancelAnimationFrame(rafDissolve);
        rafDissolve = 0;
        if (texture) {
          texture.dispose();
          texture = null;
        }
        material.uniforms.tDiffuse.value = null;
        mount.style.display = "none";
        mount.style.pointerEvents = "none";
      },
    };

    registerArchiveBurnOverlay(api);

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(rafDissolve);
      registerArchiveBurnOverlay(null);
      if (texture) texture.dispose();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="archive-burn-overlay"
      data-archive-burn-exclude="true"
      aria-hidden="true"
    />
  );
}
