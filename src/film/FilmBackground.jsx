import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { isWebGPURenderer } from "../components/webgl/createWebGPURenderer.js";
import { logWebGPUOnce } from "../lib/webgpu/debugWebGPU.js";

function createWebGLBackgroundMaterial() {
  return new THREE.ShaderMaterial({
    depthWrite: false,
    depthTest: false,
    uniforms: {
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    },
    vertexShader: `
      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec2 uPointer;
      uniform vec2 uResolution;
      varying vec2 vUv;

      float random(vec2 st) {
        return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      void main() {
        vec2 uv = vUv;
        vec2 centered = uv - 0.5;
        centered.x *= uResolution.x / max(uResolution.y, 1.0);

        vec2 pointer = vec2(uPointer.x * 0.5, uPointer.y * 0.5);
        float pulse = exp(-7.0 * distance(centered, pointer));
        float wave = sin((centered.x + centered.y) * 8.0 + uTime * 0.6) * 0.03;
        float grain = (random(uv * uResolution.xy * 0.15 + uTime) - 0.5) * 0.035;

        vec3 base = vec3(0.97);
        vec3 low = vec3(0.88 + wave + grain);
        vec3 high = vec3(1.0);
        vec3 color = mix(base, low, 0.42 + wave);
        color = mix(color, high, pulse * 0.45);

        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });
}

export default function FilmBackground() {
  const { gl } = useThree();
  const systemRef = useRef(null);
  const mouseTargetRef = useRef(new THREE.Vector2(0, 0));
  const [displayMaterial, setDisplayMaterial] = useState(null);

  useEffect(() => {
    const onMouseMove = (e) => {
      mouseTargetRef.current.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -((e.clientY / window.innerHeight) * 2 - 1),
      );
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function buildWebGPUBackground() {
      logWebGPUOnce("film-background-webgpu", "FilmBackground", "Building WebGPU TSL background");
      const { RenderTarget, MeshBasicNodeMaterial } = await import("three/webgpu");
      const tsl = await import("three/tsl");
      const {
        Fn,
        float,
        vec2,
        vec3,
        vec4,
        uniform,
        uniformTexture,
        uv,
        texture,
        mix,
        clamp,
        smoothstep,
        pow,
        normalize,
        mx_noise_float,
      } = tsl;

      if (cancelled) return;

      const w = gl.domElement.width;
      const h = gl.domElement.height;

      const makeRT = (rw, rh) =>
        new RenderTarget(rw, rh, {
          magFilter: THREE.LinearFilter,
          minFilter: THREE.LinearFilter,
          generateMipmaps: false,
          type: THREE.HalfFloatType,
          format: THREE.RGBAFormat,
          colorSpace: THREE.LinearSRGBColorSpace,
          depthBuffer: false,
          stencilBuffer: false,
        });

      const rt0 = makeRT(w, h);
      const rt1 = makeRT(w, h);

      const prevColor = new THREE.Color();
      const prevAlpha = gl.getClearAlpha();
      gl.getClearColor(prevColor);
      gl.setClearColor(0xffffff, 1.0);
      const prevAutoClear = gl.autoClear;
      gl.autoClear = true;
      for (const rt of [rt0, rt1]) {
        gl.setRenderTarget(rt);
        gl.clear();
      }
      gl.setRenderTarget(null);
      gl.setClearColor(prevColor, prevAlpha);
      gl.autoClear = prevAutoClear;

      if (cancelled) {
        rt0.dispose();
        rt1.dispose();
        return;
      }

      const uMap = uniformTexture(rt0.texture);
      const uPointer = uniform(new THREE.Vector2(0, 0));
      const uDt = uniform(0.016);
      const uSpeed = uniform(0);
      const uTime = uniform(0);
      const uResolution = uniform(new THREE.Vector2(w, h));
      const uDisplay = uniformTexture(rt0.texture);

      const curlFn = Fn(([uvPos, freq, t]) => {
        const e = float(0.1);
        const seed = vec3(uvPos.mul(freq), t);
        const fyp = mx_noise_float(seed.add(vec3(0, e, 0)));
        const fyn = mx_noise_float(seed.sub(vec3(0, e, 0)));
        const fxp = mx_noise_float(seed.add(vec3(e, 0, 0)));
        const fxn = mx_noise_float(seed.sub(vec3(e, 0, 0)));
        return normalize(vec2(fyp.sub(fyn), fxn.sub(fxp)));
      }).setLayout({
        name: "curlFn",
        type: "vec2",
        inputs: [
          { name: "uvPos", type: "vec2" },
          { name: "freq", type: "float" },
          { name: "t", type: "float" },
        ],
      });

      const simFragFn = Fn(() => {
        const uvCoord = uv();
        const curl1 = curlFn(uvCoord, float(4.0), uTime.mul(0.1));
        const curl2 = curlFn(uvCoord, float(2.0), uTime.mul(0.1));
        const uv1 = uvCoord.add(curl1.mul(uDt).mul(0.3));
        const uv2 = uvCoord.add(curl2.mul(uDt).mul(0.15));

        const mapCol1 = texture(uMap, uv1).rgb;
        const mapCol2 = texture(uMap, uv2).rgb;
        const col = mix(mapCol1, mapCol2, 0.5).toVar();

        col.assign(mix(col, vec3(1.0), uDt.mul(2.0)));

        const aspect = uResolution.x.div(uResolution.y);
        const centeredUV = uvCoord.sub(0.5).mul(vec2(aspect.mul(2.0), 2.0)).toVar();
        const pointer = uPointer.mul(vec2(aspect, 1.0)).toVar();
        const d = centeredUV.sub(pointer).length();

        const speed = clamp(uSpeed.mul(2.0), float(0.075), float(0.25));
        const t = smoothstep(speed, float(0), d).mul(speed.mul(5.0));
        const t2 = pow(smoothstep(speed, float(0), d), float(10.0)).mul(speed.mul(5.0));
        const t3 = pow(smoothstep(speed, float(0), d), float(4.0)).mul(speed.mul(5.0));

        col.assign(mix(col, vec3(0.28), t));
        col.assign(mix(col, vec3(0.62), t3));
        col.assign(mix(col, vec3(1.0), t2));

        return vec4(clamp(col, vec3(0.0), vec3(1.0)), 1.0);
      });

      const simMat = new MeshBasicNodeMaterial({
        depthWrite: false,
        depthTest: false,
      });
      simMat.fragmentNode = simFragFn();

      const displayMat = new MeshBasicNodeMaterial({
        depthWrite: false,
        depthTest: false,
      });
      displayMat.fragmentNode = Fn(() => vec4(texture(uDisplay, uv()).rgb, 1.0))();

      if (cancelled) {
        rt0.dispose();
        rt1.dispose();
        simMat.dispose();
        displayMat.dispose();
        return;
      }

      const simScene = new THREE.Scene();
      const simCamera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0, 1);
      const simPlane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), simMat);
      simScene.add(simPlane);

      systemRef.current = {
        simScene,
        simCamera,
        simPlane,
        rt0,
        rt1,
        readRT: rt0,
        writeRT: rt1,
        uMap,
        uDisplay,
        uPointer,
        uDt,
        uSpeed,
        uTime,
        uResolution,
        simMat,
        displayMat,
      };

      setDisplayMaterial(displayMat);
    }

    function buildWebGLBackground() {
      logWebGPUOnce("film-background-webgl", "FilmBackground", "Using WebGL shader background fallback");
      const material = createWebGLBackgroundMaterial();
      systemRef.current = { displayMat: material };
      setDisplayMaterial(material);
    }

    if (isWebGPURenderer(gl)) {
      buildWebGPUBackground();
    } else {
      buildWebGLBackground();
    }

    return () => {
      cancelled = true;
      const sys = systemRef.current;
      if (!sys) return;

      sys.rt0?.dispose();
      sys.rt1?.dispose();
      sys.simMat?.dispose();
      sys.displayMat?.dispose();
      sys.simPlane?.geometry?.dispose();
      systemRef.current = null;
    };
  }, [gl]);

  useEffect(() => {
    const onResize = () => {
      const sys = systemRef.current;
      if (!sys) return;

      if (sys.uResolution?.value) {
        sys.uResolution.value.set(gl.domElement.width, gl.domElement.height);
      }

      sys.rt0?.setSize(gl.domElement.width, gl.domElement.height);
      sys.rt1?.setSize(gl.domElement.width, gl.domElement.height);
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [gl]);

  useFrame((state, delta) => {
    const sys = systemRef.current;
    if (!sys) return;

    if (!isWebGPURenderer(gl)) {
      if (sys.displayMat?.uniforms) {
        sys.displayMat.uniforms.uTime.value = state.clock.elapsedTime;
        sys.displayMat.uniforms.uPointer.value.lerp(mouseTargetRef.current, 0.06);
        sys.displayMat.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
      }
      return;
    }

    const prevSpeed = sys.uPointer.value.distanceTo(mouseTargetRef.current);
    sys.uPointer.value.lerp(mouseTargetRef.current, 0.06);
    sys.uSpeed.value = prevSpeed * 60;
    sys.uTime.value += delta;
    sys.uDt.value = delta;
    sys.uResolution.value.set(gl.domElement.width, gl.domElement.height);

    const prevTarget = gl.getRenderTarget();
    const prevAutoClear = gl.autoClear;
    gl.autoClear = false;

    sys.uMap.value = sys.readRT.texture;
    gl.setRenderTarget(sys.writeRT);
    gl.render(sys.simScene, sys.simCamera);
    gl.setRenderTarget(prevTarget);
    gl.autoClear = prevAutoClear;

    const tmp = sys.readRT;
    sys.readRT = sys.writeRT;
    sys.writeRT = tmp;
    sys.uDisplay.value = sys.readRT.texture;
  }, 0);

  if (!displayMaterial) return null;

  return (
    <mesh renderOrder={-1} scale={[window.innerWidth, window.innerHeight, 1]}>
      <planeGeometry args={[1, 1]} />
      <primitive object={displayMaterial} attach="material" />
    </mesh>
  );
}
