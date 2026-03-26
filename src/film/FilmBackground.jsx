import React, { useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";

const TRAIL_SCALE = 0.25;

/* ------------------------------------------------------------------ */
/*  Noise utilities (shared GLSL)                                      */
/* ------------------------------------------------------------------ */

const NOISE_GLSL = `
  vec4 permute(vec4 x) { return mod(x * x * 34.0 + x, 289.0); }

  float snoise(vec3 v) {
    const vec2 C = 1.0 / vec2(6.0, 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod(i, 289.0);
    vec4 p = permute(
      permute(
        permute(i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0)
      )
      + i.x + vec4(0.0, i1.x, i2.x, 1.0)
    );
    vec3 ns = 0.142857142857 * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + (floor(b0) * 2.0 + 1.0).xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + (floor(b1) * 2.0 + 1.0).xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = inversesqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    return 0.5 + 12.0 * dot(m*m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  vec3 snoiseVec3(vec3 x) {
    return vec3(
      snoise(x) * 2.0 - 1.0,
      snoise(vec3(x.y - 19.1, x.z + 33.4, x.x + 47.2)) * 2.0 - 1.0,
      snoise(vec3(x.z + 74.2, x.x - 124.5, x.y + 99.4)) * 2.0 - 1.0
    );
  }

  vec3 curlNoise(vec3 p) {
    const float e = 0.1;
    vec3 dx = vec3(e, 0.0, 0.0);
    vec3 dy = vec3(0.0, e, 0.0);
    vec3 dz = vec3(0.0, 0.0, e);
    vec3 p_x0 = snoiseVec3(p - dx);
    vec3 p_x1 = snoiseVec3(p + dx);
    vec3 p_y0 = snoiseVec3(p - dy);
    vec3 p_y1 = snoiseVec3(p + dy);
    vec3 p_z0 = snoiseVec3(p - dz);
    vec3 p_z1 = snoiseVec3(p + dz);
    float x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;
    float y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;
    float z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;
    return normalize(vec3(x, y, z) / (2.0 * e));
  }
`;

/* ------------------------------------------------------------------ */
/*  Trail computation shader (ping-pong)                               */
/* ------------------------------------------------------------------ */

const TRAIL_FRAGMENT = `
  uniform vec2 uResolution;
  uniform sampler2D uMap;
  uniform vec2 uPointer;
  uniform float uDt;
  uniform float uSpeed;
  uniform float uTime;

  // GUI-driven uniforms
  uniform float uFadeRate;
  uniform float uAdvectionStrength1;
  uniform float uAdvectionStrength2;
  uniform float uSpeedMin;
  uniform float uSpeedMax;
  uniform float uSpeedScale;
  uniform vec3 uColorOuter;
  uniform vec3 uColorMid;
  uniform vec3 uColorCore;

  ${NOISE_GLSL}

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution;

    // Curl noise advection — organic trail movement
    vec2 uv2 = uv + curlNoise(vec3(uv * 4.0 + uTime * 0.1, uTime * 0.1)).xy * uDt * uAdvectionStrength2;
    uv += curlNoise(vec3(uv * 2.0 + uTime * 0.1, uTime * 0.1)).xy * uDt * uAdvectionStrength1;

    vec3 mapColor = texture2D(uMap, uv).rgb;
    vec3 mapColor2 = texture2D(uMap, uv2).rgb;

    // Aspect-corrected cursor distance
    vec2 centered = (uv - 0.5) * 2.0;
    centered.x *= uResolution.x / uResolution.y;
    vec2 pointer = uPointer;
    pointer.x *= uResolution.x / uResolution.y;
    float d = distance(centered, pointer);

    vec3 color = mix(mapColor, mapColor2, 0.5);

    // Fade toward white
    color = mix(color, vec3(1.0), uDt * uFadeRate);

    // Cursor trail — size scales with movement speed
    float speed = clamp(uSpeed * 2.0, uSpeedMin, uSpeedMax);
    float t  = smoothstep(speed, 0.0, d);
    float t2 = pow(t, 10.0);
    float t3 = pow(t, 4.0);
    float scale = speed * uSpeedScale;
    t  *= scale;
    t2 *= scale;
    t3 *= scale;

    // Trail colors (outer halo → mid → core)
    color = mix(color, uColorOuter, t);
    color = mix(color, uColorMid, t3);
    color = mix(color, uColorCore, t2);

    color = clamp(color, 0.0, 1.0);
    gl_FragColor = vec4(color, 1.0);
  }
`;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function FilmBackground({ controls }) {
  const { gl, size } = useThree();
  const pointerRef = useRef(new THREE.Vector2(0, 0));
  const pointerTargetRef = useRef(new THREE.Vector2(0, 0));
  const rtRef = useRef({ input: null, output: null });
  const initializedRef = useRef(false);

  // Fullscreen triangle geometry (clip-space, camera-independent)
  const fsGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3),
    );
    geo.setAttribute("uv", new THREE.BufferAttribute(new Float32Array([0, 0, 2, 0, 0, 2]), 2));
    return geo;
  }, []);

  // Dummy camera for manual renders (vertex shader ignores it)
  const dummyCamera = useMemo(() => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), []);

  // Trail scene (rendered manually, not part of R3F tree)
  const trailScene = useMemo(() => new THREE.Scene(), []);

  // Trail material
  const trailMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: `void main() { gl_Position = vec4(position, 1.0); }`,
        fragmentShader: TRAIL_FRAGMENT,
        depthWrite: false,
        depthTest: false,
        uniforms: {
          uResolution: { value: new THREE.Vector2(1, 1) },
          uMap: { value: null },
          uPointer: { value: new THREE.Vector2(0, 0) },
          uDt: { value: 0 },
          uSpeed: { value: 0 },
          uTime: { value: 0 },
          uFadeRate: { value: 1.5 },
          uAdvectionStrength1: { value: 0.15 },
          uAdvectionStrength2: { value: 0.3 },
          uSpeedMin: { value: 0.075 },
          uSpeedMax: { value: 0.25 },
          uSpeedScale: { value: 5.0 },
          uColorOuter: { value: new THREE.Vector3(0.78, 0.78, 0.8) },
          uColorMid: { value: new THREE.Vector3(0.85, 0.85, 0.87) },
          uColorCore: { value: new THREE.Vector3(0.72, 0.72, 0.75) },
        },
      }),
    [],
  );

  // Background display material (samples trail texture)
  const bgMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D uTrailMap;
          varying vec2 vUv;
          void main() {
            vec3 color = texture2D(uTrailMap, vUv).rgb;
            gl_FragColor = vec4(color, 1.0);
          }
        `,
        depthWrite: false,
        depthTest: false,
        uniforms: {
          uTrailMap: { value: null },
        },
      }),
    [],
  );

  // Setup trail mesh in manual scene
  useEffect(() => {
    const mesh = new THREE.Mesh(fsGeometry, trailMaterial);
    trailScene.add(mesh);
    return () => {
      trailScene.remove(mesh);
    };
  }, [fsGeometry, trailMaterial, trailScene]);

  // Create render targets
  useEffect(() => {
    const w = Math.max(1, Math.floor(size.width * TRAIL_SCALE));
    const h = Math.max(1, Math.floor(size.height * TRAIL_SCALE));

    const createRT = () =>
      new THREE.WebGLRenderTarget(w, h, {
        type: THREE.HalfFloatType,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        depthBuffer: false,
      });

    const rt1 = createRT();
    const rt2 = createRT();
    rtRef.current = { input: rt1, output: rt2 };
    initializedRef.current = false;

    trailMaterial.uniforms.uResolution.value.set(w, h);

    return () => {
      rt1.dispose();
      rt2.dispose();
      rtRef.current = { input: null, output: null };
    };
  }, [size, trailMaterial]);

  // Pointer tracking
  useEffect(() => {
    const onPointerMove = (event) => {
      pointerTargetRef.current.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        -((event.clientY / window.innerHeight) * 2 + 1) + 2,
      );
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, []);

  // Frame loop: ping-pong trail rendering
  useFrame((state, delta) => {
    const { input, output } = rtRef.current;
    if (!input || !output) return;

    // Initialize render targets to white on first frame
    if (!initializedRef.current) {
      const prevClear = new THREE.Color();
      gl.getClearColor(prevClear);
      const prevAlpha = gl.getClearAlpha();

      gl.setClearColor(0xffffff, 1);
      gl.setRenderTarget(input);
      gl.clear();
      gl.setRenderTarget(output);
      gl.clear();
      gl.setRenderTarget(null);

      gl.setClearColor(prevClear, prevAlpha);
      initializedRef.current = true;
    }

    const dt = Math.min(delta, 0.05);

    // Sync GUI controls → uniforms
    trailMaterial.uniforms.uFadeRate.value = controls.fadeRate;
    trailMaterial.uniforms.uAdvectionStrength1.value = controls.advection1;
    trailMaterial.uniforms.uAdvectionStrength2.value = controls.advection2;
    trailMaterial.uniforms.uSpeedMin.value = controls.speedMin;
    trailMaterial.uniforms.uSpeedMax.value = controls.speedMax;
    trailMaterial.uniforms.uSpeedScale.value = controls.speedScale;
    trailMaterial.uniforms.uColorOuter.value.set(
      controls.colorOuter.r / 255,
      controls.colorOuter.g / 255,
      controls.colorOuter.b / 255,
    );
    trailMaterial.uniforms.uColorMid.value.set(
      controls.colorMid.r / 255,
      controls.colorMid.g / 255,
      controls.colorMid.b / 255,
    );
    trailMaterial.uniforms.uColorCore.value.set(
      controls.colorCore.r / 255,
      controls.colorCore.g / 255,
      controls.colorCore.b / 255,
    );

    // Lerp pointer
    pointerRef.current.lerp(pointerTargetRef.current, dt * controls.pointerLerp);

    // Track cursor speed
    const prevPointer = trailMaterial.uniforms.uPointer.value;
    const dx = pointerRef.current.x - prevPointer.x;
    const dy = pointerRef.current.y - prevPointer.y;
    trailMaterial.uniforms.uSpeed.value = THREE.MathUtils.lerp(
      trailMaterial.uniforms.uSpeed.value,
      Math.sqrt(dx * dx + dy * dy),
      dt * 3,
    );

    // Update trail uniforms
    trailMaterial.uniforms.uTime.value = state.clock.elapsedTime;
    trailMaterial.uniforms.uDt.value = dt;
    trailMaterial.uniforms.uPointer.value.copy(pointerRef.current);
    trailMaterial.uniforms.uMap.value = input.texture;

    // Render trail to output RT
    gl.setRenderTarget(output);
    gl.render(trailScene, dummyCamera);
    gl.setRenderTarget(null);

    // Display trail on background
    bgMaterial.uniforms.uTrailMap.value = output.texture;

    // Swap
    rtRef.current = { input: output, output: input };
  });

  return (
    <mesh renderOrder={-1}>
      <primitive object={fsGeometry} attach="geometry" />
      <primitive object={bgMaterial} attach="material" />
    </mesh>
  );
}
