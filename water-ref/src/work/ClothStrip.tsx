// @ts-nocheck
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";

import { createColorFallbackTexture, loadTextureAssets } from "../../scripts/runtime/assets";
import { getPreloadedTextures } from "../../scripts/work-preload";
import { workItems } from "../../data/work-items";
import { navigateTo } from "../lib/nav";
import { pickGpuBranch } from "../lib/render";
import { useWebglStore } from "../store/webgl";
import { useWorkSceneControlsStore } from "../store/workScene";
import {
  COLS,
  DEFAULT_GAP_SIZE,
  DEFAULT_VISIBLE_ITEMS,
  NUM_UNIQUE_FALLBACK as NUM_UNIQUE,
  ROWS,
} from "./config";
import { getActiveStripItemIndex, resolveVisibleSlotAtUv } from "./math";

const GRAB_SCALE = 0.96;
const GRAB_SCALE_LERP = 0.14;
const VELOCITY_SCALE_THRESHOLD = 0.02;

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

async function createWebGPUStripMaterial(textures, stripConfig) {
  const { MeshBasicNodeMaterial } = await import("three/webgpu");
  const tsl = await import("three/tsl");
  const {
    Fn,
    float,
    vec2,
    vec4,
    int,
    uniform,
    uniformTexture,
    uv,
    texture,
    mix,
    step,
    clamp,
    smoothstep,
    floor,
    fract,
    mod,
  } = tsl;

  const uniforms = {
    uScrollOffset: uniform(0),
    uItemsOnStrip: uniform(stripConfig.itemsOnStrip),
    uNumUnique: uniform(stripConfig.numUnique),
    uGapSize: uniform(stripConfig.gapSize),
    uOpacity: uniform(1.0),
    uTex0: uniformTexture(textures[0]),
    uTex1: uniformTexture(textures[1]),
    uTex2: uniformTexture(textures[2]),
    uTex3: uniformTexture(textures[3]),
    uTex4: uniformTexture(textures[4]),
    uTex5: uniformTexture(textures[5]),
  };

  const fragmentFn = Fn(() => {
    const uvCoord = uv();
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
    const edgeFade = smoothstep(float(0), float(0.06), uvCoord.x).mul(
      smoothstep(float(0), float(0.06), float(1).sub(uvCoord.x)),
    );
    return vec4(col, edgeFade.mul(uniforms.uOpacity));
  });

  const mat = new MeshBasicNodeMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: true,
    side: THREE.DoubleSide,
  });
  mat.fragmentNode = fragmentFn();

  return { material: mat, uniforms };
}

function createWebGLStripMaterial(textures, stripConfig) {
  const uniforms = {
    uScrollOffset: { value: 0 },
    uGapSize: { value: stripConfig.gapSize },
    uItemsOnStrip: { value: stripConfig.itemsOnStrip },
    uNumUnique: { value: stripConfig.numUnique },
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
    side: THREE.DoubleSide,
    depthWrite: false,
    uniforms,
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
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
      uniform float uOpacity;
      varying vec2 vUv;

      vec3 sampleStripTexture(int index, vec2 coord) {
        if (index == 0) return texture2D(uTex0, coord).rgb;
        if (index == 1) return texture2D(uTex1, coord).rgb;
        if (index == 2) return texture2D(uTex2, coord).rgb;
        if (index == 3) return texture2D(uTex3, coord).rgb;
        if (index == 4) return texture2D(uTex4, coord).rgb;
        return texture2D(uTex5, coord).rgb;
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
        float edgeFade = smoothstep(0.0, 0.06, vUv.x) * smoothstep(0.0, 0.06, 1.0 - vUv.x);
        gl_FragColor = vec4(color, edgeFade * uOpacity);
      }
    `,
  });

  return { material, uniforms };
}

export function WorkClothStripScene() {
  const { gl } = useThree();
  const activePage = useWebglStore((s) => s.activePage);
  const onWorkPage = activePage === "work";
  const systemRef = useRef(null);
  const groupRef = useRef<THREE.Group>(null);
  const stripControls = useWorkSceneControlsStore((state) => state.controls.strip);
  const visibleItems = Math.max(1, stripControls.visibleItems ?? DEFAULT_VISIBLE_ITEMS);
  const gapSize = stripControls.gapSize ?? DEFAULT_GAP_SIZE;
  const scrollConfig = {
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
  const grabScaleRef = useRef(1);

  useEffect(() => {
    const element = gl.domElement;

    const onWheel = (e) => {
      e.preventDefault();
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      scrollRef.current.target += delta * scrollConfig.wheelSensitivity;
      scrollRef.current.velocity += delta * scrollConfig.wheelSensitivity * 0.24;
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
      scrollRef.current.target -= dx * scrollConfig.dragSensitivity;
      scrollRef.current.velocity = -dx * scrollConfig.dragVelocityScale;
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
  }, [
    gl,
    scrollConfig.dragSensitivity,
    scrollConfig.dragVelocityScale,
    scrollConfig.wheelSensitivity,
  ]);

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

  const [stripMaterial, setStripMaterial] = useState(null);
  const activeTextures = textures || fallbackTextures;

  useEffect(() => {
    let cancelled = false;
    if (!activeTextures) return;

    const createStripMaterial = pickGpuBranch(gl, {
      webgpu: () => createWebGPUStripMaterial,
      webgl: () => createWebGLStripMaterial,
    });

    Promise.resolve(createStripMaterial(activeTextures, stripConfig))
      .then((system) => {
        if (cancelled) return;
        setStripMaterial(system.material);
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

  useFrame(() => {
    const sys = systemRef.current;
    if (!sys) return;

    const sc = useWorkSceneControlsStore.getState().controls.strip;
    const group = groupRef.current;
    const s = scrollRef.current;
    const isDragging = inputRef.current.isDown;
    const isScrolling = Math.abs(s.velocity) > VELOCITY_SCALE_THRESHOLD;
    const grabTarget = isDragging || isScrolling ? GRAB_SCALE : 1;
    grabScaleRef.current += (grabTarget - grabScaleRef.current) * GRAB_SCALE_LERP;

    if (group) {
      const baseScale = sc.scale ?? 1;
      const grabScale = grabScaleRef.current;
      group.position.set(sc.x ?? 0, sc.y ?? 0, sc.z ?? 0);
      group.rotation.set(sc.rx ?? 0, sc.ry ?? 0, sc.rz ?? 0);
      group.scale.set(baseScale * grabScale, baseScale * grabScale, baseScale * grabScale);
    }

    s.current += (s.target - s.current) * scrollConfig.scrollLerp;
    s.velocity *= isDragging ? scrollConfig.scrollDraggingDamping : scrollConfig.scrollDamping;
    if (!isDragging && Math.abs(s.velocity) < scrollConfig.snapVelocityThreshold) {
      const snapTarget = Math.round(s.target);
      if (Math.abs(snapTarget - s.target) > scrollConfig.snapEpsilon) {
        s.target += (snapTarget - s.target) * scrollConfig.snapLerp;
      } else {
        s.target = snapTarget;
      }
    }

    sys.uniforms.uScrollOffset.value = s.current;
    sys.uniforms.uOpacity.value = onWorkPage ? 1 : 0;

    const vi = Math.max(1, sc.visibleItems ?? DEFAULT_VISIBLE_ITEMS);
    const gs = sc.gapSize ?? DEFAULT_GAP_SIZE;
    const centerIdx = getActiveStripItemIndex(s.current, vi, gs, NUM_UNIQUE);
    const newTitle = workItems[centerIdx]?.title || "";
    if (newTitle !== currentTitleRef.current) {
      currentTitleRef.current = newTitle;
      window.dispatchEvent(
        new CustomEvent("duforn:work-strip-title", { detail: { title: newTitle } }),
      );
    }
  });

  if (!onWorkPage || !activeTextures || !stripMaterial) return null;

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
    <group ref={groupRef}>
      <mesh
        geometry={geometry}
        material={stripMaterial}
        frustumCulled={false}
        onClick={handleStripClick}
      />
    </group>
  );
}
