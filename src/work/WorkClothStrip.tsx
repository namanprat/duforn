// @ts-nocheck
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";

import { createColorFallbackTexture, loadTextureAssets } from "../../scripts/runtime/assets";
import { getPreloadedTextures } from "../../scripts/work-preload";
import { workItems } from "../../data/work-items";
import { navigateTo } from "../lib/navigationBridge";
import { pickGpuBranch } from "../lib/rendering";
import { logWebGPUOnce } from "../lib/webgpu/debugWebGPU";
import { useWorkSceneControlsStore } from "../store/workSceneControls";
import { DEFAULT_GAP_SIZE, DEFAULT_VISIBLE_ITEMS } from "./workStripConfig";
import { getActiveStripItemIndex, resolveVisibleSlotAtUv } from "./workStripMath";

const NUM_UNIQUE = 6;

const COLS = 96;
const ROWS = 48;

// (hover removed)

function buildArcGeometry(cols, rows, arcRadius, arcSpan, height, yOffset) {
  const count = cols * rows;
  const positions = new Float32Array(count * 3);
  const uvs = new Float32Array(count * 2);
  const indices = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const u = c / (cols - 1);
      const v = r / (rows - 1);
      const i = r * cols + c;
      const angle = (u - 0.5) * arcSpan;

      positions[i * 3] = Math.sin(angle) * arcRadius;
      positions[i * 3 + 1] = yOffset + (v - 0.5) * height;
      positions[i * 3 + 2] = (Math.cos(angle) - 1) * arcRadius;
      uvs[i * 2] = u;
      uvs[i * 2 + 1] = v;
    }
  }

  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cols - 1; c++) {
      const a = r * cols + c;
      const b = a + 1;
      const d = (r + 1) * cols + c;
      const e = d + 1;
      indices.push(a, b, d, b, e, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

async function createWebGPUClothSystem(gl, textures, stripConfig) {
  logWebGPUOnce("work-cloth-webgpu-build", "WorkCloth", "Building WebGPU TSL cloth system", {
    textures: textures.length,
    itemsOnStrip: stripConfig.itemsOnStrip,
  });
  const { MeshBasicNodeMaterial } = await import("three/webgpu");
  const tsl = await import("three/tsl");
  const {
    Fn,
    float,
    vec2,
    vec3,
    vec4,
    int,
    uniform,
    uniformTexture,
    varying,
    positionLocal,
    normalLocal,
    uv,
    modelWorldMatrix,
    normalize,
    cross,
    dot,
    max,
    mix,
    step,
    pow,
    clamp,
    smoothstep,
    sin,
    cos,
    floor,
    fract,
    exp,
    mod,
    dFdx,
    dFdy,
    texture,
    mx_noise_float,
  } = tsl;
  const tslCameraPosition = tsl.cameraPosition;

  const PI = Math.PI;

  const uniforms = {
    uTime: uniform(0),
    uScrollOffset: uniform(0),
    uItemsOnStrip: uniform(stripConfig.itemsOnStrip),
    uNumUnique: uniform(stripConfig.numUnique),
    uGapSize: uniform(stripConfig.gapSize),
    uWindStrength: uniform(12.0),
    uGravityScale: uniform(2.0),
    uWaveFrequency: uniform(8.0),
    uWaveAmplitude: uniform(0.16),
    uClothSolidity: uniform(15.0),
    uRoughness: uniform(0.7),
    uSheenColor: uniform(new THREE.Color(0.93, 0.92, 0.9)),
    uSubsurfaceColor: uniform(new THREE.Color(0.97, 0.9, 0.82)),
    uSubsurfaceStr: uniform(0.35),
    uLightDir: uniform(new THREE.Vector3(0.25, 0.75, 0.9)),
    uOpacity: uniform(1.0),
    uTex0: uniformTexture(textures[0]),
    uTex1: uniformTexture(textures[1]),
    uTex2: uniformTexture(textures[2]),
    uTex3: uniformTexture(textures[3]),
    uTex4: uniformTexture(textures[4]),
    uTex5: uniformTexture(textures[5]),
  };

  const vWorldPos = varying(vec3(0), "vWorldPos");
  const vLooseness = varying(float(0), "vLooseness");

  const vertexFn = Fn(() => {
    const pos = positionLocal.toVar();
    const uvCoord = uv();
    const time = uniforms.uTime;
    const v = uvCoord.y;
    const u = uvCoord.x;
    const revealMix = float(1);
    const looseness = smoothstep(float(0), float(0.25), v);
    vLooseness.assign(looseness);
    const area = float(stripConfig.arcSpan * stripConfig.stripHeight);
    const mass = uniforms.uClothSolidity.mul(area).mul(0.02);
    const windSpeed = uniforms.uWindStrength.div(max(mass, float(0.01)));
    const t = time.mul(windSpeed);
    const windNoise = mx_noise_float(vec3(u.mul(2.0), v.mul(2.0), time.mul(0.1)))
      .mul(0.5)
      .add(0.5);
    const gravitySag = v.mul(v).mul(uniforms.uGravityScale).mul(0.08).mul(looseness);
    const windPush = looseness
      .mul(looseness)
      .mul(uniforms.uWaveAmplitude)
      .mul(0.5)
      .mul(windNoise.mul(0.4).add(0.6));
    const freq = uniforms.uWaveFrequency;
    const wave1 = sin(u.mul(freq).sub(t.mul(3.0))).mul(looseness);
    const wave2 = sin(v.mul(freq.mul(0.7)).sub(t.mul(2.0)))
      .mul(looseness)
      .mul(0.5);
    const wave3 = sin(u.mul(freq.mul(2.0)).add(v.mul(freq)).sub(t.mul(4.0)))
      .mul(looseness)
      .mul(0.25);
    const waveDisp = wave1.add(wave2).add(wave3).mul(uniforms.uWaveAmplitude).mul(revealMix);
    const flutter = sin(u.mul(freq.mul(3.0)).sub(t.mul(5.0)))
      .mul(cos(v.mul(freq.mul(2.0)).add(t.mul(1.5))))
      .mul(looseness)
      .mul(looseness)
      .mul(uniforms.uWaveAmplitude)
      .mul(0.15)
      .mul(revealMix);

    pos.y.subAssign(gravitySag.mul(revealMix));
    pos.z.addAssign(waveDisp.add(flutter));
    pos.z.addAssign(windPush.mul(revealMix));
    const lateralSway = sin(time.mul(0.18)).mul(looseness).mul(0.04).mul(revealMix);
    pos.x.addAssign(lateralSway);

    vWorldPos.assign(modelWorldMatrix.mul(vec4(pos, 1)).xyz);
    return pos;
  });

  const fragmentFn = Fn(() => {
    const uvCoord = uv();
    const worldPos = vWorldPos;
    const looseness = vLooseness;
    const dpdxVal = dFdx(worldPos);
    const dpdyVal = dFdy(worldPos);
    const foldNormal = normalize(cross(dpdxVal, dpdyVal));
    const geomNormal = normalLocal;
    const normal = normalize(mix(geomNormal, foldNormal, float(0.55)));
    const totalU = uvCoord.x.mul(uniforms.uItemsOnStrip).add(uniforms.uScrollOffset);
    const itemFract = fract(totalU);
    const itemIndex = floor(totalU);
    const wrappedIndex = mod(itemIndex, uniforms.uNumUnique).toVar();
    wrappedIndex.assign(
      mix(wrappedIndex, wrappedIndex.add(uniforms.uNumUnique), step(wrappedIndex, float(-0.001))),
    );
    const halfGap = uniforms.uGapSize.mul(0.5);
    const inGap = step(itemFract, halfGap).add(step(float(1).sub(halfGap), itemFract));
    inGap.greaterThan(float(0.5)).discard();
    const texU = itemFract.sub(halfGap).div(float(1).sub(uniforms.uGapSize));
    const texCoord = clamp(vec2(texU, uvCoord.y), vec2(0.001), vec2(0.999));
    const col = texture(uniforms.uTex0, texCoord).rgb.toVar();
    const idx = int(wrappedIndex);
    col.assign(mix(col, texture(uniforms.uTex1, texCoord).rgb, float(idx.equal(int(1)))));
    col.assign(mix(col, texture(uniforms.uTex2, texCoord).rgb, float(idx.equal(int(2)))));
    col.assign(mix(col, texture(uniforms.uTex3, texCoord).rgb, float(idx.equal(int(3)))));
    col.assign(mix(col, texture(uniforms.uTex4, texCoord).rgb, float(idx.equal(int(4)))));
    col.assign(mix(col, texture(uniforms.uTex5, texCoord).rgb, float(idx.equal(int(5)))));
    const luma = dot(col, vec3(0.299, 0.587, 0.114));
    col.assign(mix(vec3(luma), col, float(1.2)));
    const viewDir = normalize(tslCameraPosition.sub(worldPos));
    const lightDir = normalize(uniforms.uLightDir);
    const halfVec = normalize(viewDir.add(lightDir));
    const NdotV = max(float(0.001), dot(normal, viewDir));
    const NdotL = max(float(0.0), dot(normal, lightDir));
    const NdotH = max(float(0.001), dot(normal, halfVec));
    const r = clamp(uniforms.uRoughness, float(0.01), float(1.0));
    const r2 = r.mul(r);
    const cos2h = NdotH.mul(NdotH);
    const sin2h = float(1).sub(cos2h);
    const sin4h = sin2h.mul(sin2h);
    const ashikhminD = sin4h
      .add(float(4).mul(exp(cos2h.negate().div(max(sin2h.mul(r2), float(0.0001))))))
      .div(
        max(
          float(PI)
            .mul(float(1).add(float(4).mul(r2)))
            .mul(sin4h),
          float(0.1),
        ),
      );
    const ashikhminV = float(1).div(
      max(float(4).mul(NdotL.add(NdotV).sub(NdotL.mul(NdotV))), float(0.001)),
    );
    const specular = uniforms.uSheenColor.mul(ashikhminD).mul(ashikhminV).mul(NdotL);
    const wrap = NdotL.mul(0.5).add(0.5);
    const primaryLight = float(0.55).add(wrap.mul(0.45));
    const fillDir = normalize(vec3(-0.6, -0.2, 0.5));
    const fillNdotL = max(float(0), dot(normal, fillDir));
    const fillContrib = fillNdotL.mul(0.5).add(0.5).mul(0.08);
    const rimDir = normalize(vec3(-0.2, 0.1, float(-1.0)));
    const rimNdotL = max(float(0), dot(normal, rimDir));
    const rimContrib = rimNdotL.mul(0.5).add(0.5);
    const rimFinal = rimContrib.mul(rimContrib).mul(0.07);
    const diffuse = col.mul(primaryLight.add(fillContrib).add(rimFinal));
    const sheen = pow(float(1).sub(NdotV), float(2.6));
    const sheenContrib = uniforms.uSheenColor.mul(sheen).mul(0.15);
    const backlight = max(float(0), dot(normal.negate(), lightDir));
    const sssScatter = backlight.mul(backlight).mul(backlight);
    const subsurface = uniforms.uSubsurfaceColor
      .mul(sssScatter)
      .mul(uniforms.uSubsurfaceStr)
      .mul(looseness.mul(0.6).add(0.4));
    const finalColor = diffuse.add(specular.mul(0.3)).add(sheenContrib).add(subsurface).toVar();
    const foldDeviation = float(1).sub(
      max(float(0), dot(normalize(foldNormal), normalize(geomNormal))),
    );
    const aoFactor = smoothstep(float(-0.15), float(0.3), dot(foldNormal, vec3(0, 1, 0)));
    finalColor.mulAssign(float(0.85).add(aoFactor.mul(0.1)).sub(foldDeviation.mul(0.06)));
    const edgeFade = smoothstep(float(0), float(0.06), uvCoord.x).mul(
      smoothstep(float(0), float(0.06), float(1).sub(uvCoord.x)),
    );

    return vec4(finalColor, edgeFade.mul(uniforms.uOpacity));
  });

  const mat = new MeshBasicNodeMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: true,
    side: THREE.FrontSide,
  });
  mat.positionNode = vertexFn();
  mat.fragmentNode = fragmentFn();

  return { material: mat, uniforms };
}

function createWebGLClothSystem(_gl, textures, stripConfig) {
  logWebGPUOnce("work-cloth-webgl-build", "WorkCloth", "Using WebGL cloth fallback shader", {
    textures: textures.length,
    itemsOnStrip: stripConfig.itemsOnStrip,
  });
  const uniforms = {
    uTime: { value: 0 },
    uScrollOffset: { value: 0 },
    uGapSize: { value: stripConfig.gapSize },
    uItemsOnStrip: { value: stripConfig.itemsOnStrip },
    uNumUnique: { value: stripConfig.numUnique },
    uWaveAmplitude: { value: 0.08 },
    uWaveFrequency: { value: 13.0 },
    uWindStrength: { value: 5.5 },
    uOpacity: { value: 1.0 },
    uTex0: { value: textures[0] },
    uTex1: { value: textures[1] },
    uTex2: { value: textures[2] },
    uTex3: { value: textures[3] },
    uTex4: { value: textures[4] },
    uTex5: { value: textures[5] },
  };

  const material = new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.FrontSide,
    depthWrite: false,
    uniforms,
    vertexShader: `
      uniform float uTime;
      uniform float uWaveAmplitude;
      uniform float uWaveFrequency;
      uniform float uWindStrength;

      varying vec2 vUv;
      varying float vLooseness;

      void main() {
        vUv = uv;
        float revealMix = 1.0;
        float looseness = smoothstep(0.0, 0.25, uv.y);
        vLooseness = looseness;

        vec3 pos = position;
        float wind = uWindStrength * 0.01;
        float wave1 = sin(uv.x * uWaveFrequency - uTime * (2.0 + wind)) * looseness;
        float wave2 = sin((uv.x + uv.y) * (uWaveFrequency * 0.7) - uTime * 1.8) * looseness * 0.5;
        float flutter = sin(uv.x * (uWaveFrequency * 2.5) - uTime * 4.0) * looseness * looseness * 0.18;

        pos.y -= uv.y * uv.y * 0.16 * revealMix;
        pos.z += ((wave1 + wave2) * uWaveAmplitude + flutter) * revealMix;
        pos.x += sin(uTime * 0.18) * looseness * 0.04 * revealMix;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uTex0;
      uniform sampler2D uTex1;
      uniform sampler2D uTex2;
      uniform sampler2D uTex3;
      uniform sampler2D uTex4;
      uniform sampler2D uTex5;
      uniform float uScrollOffset;
      uniform float uGapSize;
      uniform float uItemsOnStrip;
      uniform float uNumUnique;
      uniform float uTime;
      uniform float uOpacity;

      varying vec2 vUv;
      varying float vLooseness;

      vec3 sampleStripTexture(int index, vec2 coord) {
        if (index == 0) return texture2D(uTex0, coord).rgb;
        if (index == 1) return texture2D(uTex1, coord).rgb;
        if (index == 2) return texture2D(uTex2, coord).rgb;
        if (index == 3) return texture2D(uTex3, coord).rgb;
        if (index == 4) return texture2D(uTex4, coord).rgb;
        return texture2D(uTex5, coord).rgb;
      }

      float hash21(vec2 p) {
        p = fract(p * vec2(123.34, 345.45));
        p += dot(p, p + 34.345);
        return fract(p.x * p.y);
      }

      float noise2(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        float a = hash21(i);
        float b = hash21(i + vec2(1.0, 0.0));
        float c = hash21(i + vec2(0.0, 1.0));
        float d = hash21(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }

      void main() {
        float totalU = vUv.x * uItemsOnStrip + uScrollOffset;
        float itemFloor = floor(totalU);
        float itemFract = fract(totalU);
        float halfGap = uGapSize * 0.5;

        if (itemFract < halfGap || itemFract > 1.0 - halfGap) {
          discard;
        }

        float texU = (itemFract - halfGap) / max(1.0 - uGapSize, 0.0001);
        vec2 texCoord = clamp(vec2(texU, vUv.y), vec2(0.001), vec2(0.999));

        int wrappedIndex = int(mod(itemFloor + uNumUnique, uNumUnique));
        vec3 color = sampleStripTexture(wrappedIndex, texCoord);

        float luma = dot(color, vec3(0.299, 0.587, 0.114));
        color = mix(vec3(luma), color, 1.2);

        float light = 0.75 + vLooseness * 0.2 + (1.0 - abs(vUv.x - 0.5) * 2.0) * 0.08;
        float rim = pow(1.0 - abs(vUv.x - 0.5) * 2.0, 2.0) * 0.05;
        float edgeFade = smoothstep(0.0, 0.06, vUv.x) * smoothstep(0.0, 0.06, 1.0 - vUv.x);
        gl_FragColor = vec4(color * light + rim, edgeFade * uOpacity);
      }
    `,
  });

  return { material, uniforms };
}

export function WorkClothStripScene() {
  const { gl } = useThree();
  const systemRef = useRef(null);
  const stripControls = useWorkSceneControlsStore((state) => state.controls.strip);
  const visibleItems = Math.max(1, stripControls.visibleItems ?? DEFAULT_VISIBLE_ITEMS);
  const gapSize = stripControls.gapSize ?? DEFAULT_GAP_SIZE;
  const strip = {
    x: stripControls.x,
    y: stripControls.y,
    z: stripControls.z,
    scale: stripControls.scale,
  };
  const wind = {
    windStrength: stripControls.windStrength,
    flutterAmplitude: stripControls.flutterAmplitude,
    flutterFrequency: stripControls.flutterFrequency,
    gravityScale: stripControls.gravityScale,
    clothSolidity: Math.max(0.0001, stripControls.constraintMix * 14.0),
    wheelSensitivity: stripControls.wheelSensitivity,
    dragSensitivity: stripControls.dragSensitivity,
    dragVelocityScale: stripControls.dragVelocityScale,
    scrollLerp: stripControls.scrollLerp,
    scrollDamping: stripControls.scrollDamping,
    scrollDraggingDamping: stripControls.scrollDraggingDamping,
    snapVelocityThreshold: stripControls.snapVelocityThreshold,
    snapLerp: stripControls.snapLerp,
    snapEpsilon: stripControls.snapEpsilon,
  };
  const arcConfig = {
    arcRadius: stripControls.curveRadius,
    arcSpan: stripControls.curveAmount,
    stripHeight: stripControls.stripHeight,
    stripYOffset: stripControls.stripYOffset,
  };
  const scrollRef = useRef({ target: 0, current: 0, velocity: 0 });
  const inputRef = useRef({ isDown: false, lastX: 0, startX: 0 });
  const currentTitleRef = useRef("");

  useEffect(() => {
    const element = gl.domElement;

    const onWheel = (e) => {
      e.preventDefault();
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      scrollRef.current.target += delta * wind.wheelSensitivity;
      scrollRef.current.velocity += delta * wind.wheelSensitivity * 0.24;
    };

    const onPointerDown = (e) => {
      inputRef.current.isDown = true;
      inputRef.current.lastX = e.clientX;
      inputRef.current.startX = e.clientX;
      inputRef.current.dragDist = 0;
    };

    const onPointerMove = (e) => {
      if (!inputRef.current.isDown) return;
      const dx = e.clientX - inputRef.current.lastX;
      inputRef.current.dragDist = (inputRef.current.dragDist || 0) + Math.abs(dx);
      inputRef.current.lastX = e.clientX;
      scrollRef.current.target -= dx * wind.dragSensitivity;
      scrollRef.current.velocity = -dx * wind.dragVelocityScale;
    };

    const onPointerUp = () => {
      inputRef.current.isDown = false;
    };

    element.addEventListener("wheel", onWheel, { passive: false });
    element.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      element.removeEventListener("wheel", onWheel);
      element.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [gl, wind.dragSensitivity, wind.dragVelocityScale, wind.wheelSensitivity]);

  const [textures, setTextures] = useState(null);

  const fallbackTextures = useMemo(
    () =>
      workItems.slice(0, NUM_UNIQUE).map(() =>
        createColorFallbackTexture({
          wrapS: THREE.MirroredRepeatWrapping,
          wrapT: THREE.MirroredRepeatWrapping,
        }),
      ),
    [],
  );

  useEffect(() => {
    const images = workItems.slice(0, NUM_UNIQUE).map((item) => item.image);
    const cached = getPreloadedTextures(images);
    if (cached) {
      setTextures(cached);
      return;
    }
    loadTextureAssets(images, {
      onErrorTexture: () => createColorFallbackTexture(),
    })
      .then(setTextures)
      .catch(() => {});
  }, []);

  const geometry = useMemo(
    () =>
      buildArcGeometry(
        COLS,
        ROWS,
        arcConfig.arcRadius,
        arcConfig.arcSpan,
        arcConfig.stripHeight,
        arcConfig.stripYOffset,
      ),
    [arcConfig.arcRadius, arcConfig.arcSpan, arcConfig.stripHeight, arcConfig.stripYOffset],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);

  const stripConfig = useMemo(
    () => ({
      itemsOnStrip: visibleItems,
      numUnique: NUM_UNIQUE,
      gapSize,
      arcSpan: arcConfig.arcSpan,
      stripHeight: arcConfig.stripHeight,
    }),
    [arcConfig.arcSpan, arcConfig.stripHeight, gapSize, visibleItems],
  );

  const [tslMaterial, setTslMaterial] = useState(null);
  const activeTextures = textures || fallbackTextures;

  useEffect(() => {
    let cancelled = false;
    if (!activeTextures) return;

    const createClothSystem = pickGpuBranch(gl, {
      webgpu: () => createWebGPUClothSystem,
      webgl: () => createWebGLClothSystem,
    });

    Promise.resolve(createClothSystem(gl, activeTextures, stripConfig))
      .then((system) => {
        if (cancelled) return;
        setTslMaterial(system.material);
        systemRef.current = system;
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      const sys = systemRef.current;
      if (sys) sys.material.dispose();
      systemRef.current = null;
    };
  }, [gl, activeTextures, stripConfig]);

  useFrame((state) => {
    const sys = systemRef.current;
    if (!sys) return;

    const sc = useWorkSceneControlsStore.getState().controls.strip;
    const time = state.clock.getElapsedTime();
    const u = sys.uniforms;
    const s = scrollRef.current;
    const isDragging = inputRef.current.isDown;

    s.current += (s.target - s.current) * wind.scrollLerp;
    s.velocity *= isDragging ? wind.scrollDraggingDamping : wind.scrollDamping;
    if (!isDragging && Math.abs(s.velocity) < wind.snapVelocityThreshold) {
      const snapTarget = Math.round(s.target);
      if (Math.abs(snapTarget - s.target) > wind.snapEpsilon) {
        s.target += (snapTarget - s.target) * wind.snapLerp;
      } else {
        s.target = snapTarget;
      }
    }
    u.uTime.value = time;
    u.uScrollOffset.value = s.current;
    u.uOpacity.value = 1;

    if ("uGravityScale" in u) {
      u.uGravityScale.value = sc.gravityScale ?? 2;
      u.uClothSolidity.value = Math.max(0.0001, (sc.constraintMix ?? 0.4) * 14.0);
      u.uRoughness.value = sc.roughness ?? 0.72;
      u.uSheenColor.value.setRGB(sc.sheenR ?? 0.92, sc.sheenG ?? 0.88, sc.sheenB ?? 0.82);
      u.uSubsurfaceStr.value = sc.subsurfaceStr ?? 1;
    }

    u.uWindStrength.value = sc.windStrength ?? 1.1;
    u.uWaveAmplitude.value = sc.flutterAmplitude ?? 0.08;
    u.uWaveFrequency.value = sc.flutterFrequency ?? 20;

    const vi = Math.max(1, sc.visibleItems ?? DEFAULT_VISIBLE_ITEMS);
    const gs = sc.gapSize ?? DEFAULT_GAP_SIZE;
    const centerIdx = getActiveStripItemIndex(s.current, vi, gs, NUM_UNIQUE);
    const newTitle = workItems[centerIdx]?.title || "";
    if (newTitle !== currentTitleRef.current) {
      currentTitleRef.current = newTitle;
      const titleEl = document.querySelector("[data-work-strip-title]");
      if (titleEl) titleEl.textContent = newTitle;
    }
  });

  if (!activeTextures || !tslMaterial) return null;

  const handleStripClick = (e) => {
    if (inputRef.current.dragDist > 8) return;
    if (!e.uv) return;
    e.stopPropagation();

    const resolvedSlot = resolveVisibleSlotAtUv(
      e.uv.x,
      scrollRef.current.current,
      visibleItems,
      gapSize,
      NUM_UNIQUE,
    );
    if (!resolvedSlot) return;

    const href = workItems[resolvedSlot.itemIndex]?.href;
    if (!href) return;
    navigateTo(href);
  };

  return (
    <group position={[strip.x, strip.y, strip.z]} scale={strip.scale}>
      <mesh
        geometry={geometry}
        material={tslMaterial}
        frustumCulled={false}
        onClick={handleStripClick}
      />
    </group>
  );
}
