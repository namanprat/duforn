import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { createColorFallbackTexture, loadTextureAsset } from "../lib/assets";
import { getPreloadedTextures } from "../lib/work-preload";
import { workItems } from "../content/work-items";
import { navigateTo } from "../lib/nav";
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

function loadTextureAssets(urls: string[], options = {}) {
  return Promise.all(urls.map((url) => loadTextureAsset(url, options)));
}

function buildArcGeometry(
  cols: number,
  rows: number,
  arcRadius: number,
  arcSpan: number,
  height: number,
  yOffset: number,
) {
  const count = cols * rows;
  const positions = new Float32Array(count * 3);
  const uvs = new Float32Array(count * 2);
  const indices: number[] = [];

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

function createWebGLStripMaterial(textures: THREE.Texture[], stripConfig: Record<string, number>) {
  const uniforms = {
    uScrollOffset: { value: 0 },
    uGapSize: { value: stripConfig.gapSize },
    uItemsOnStrip: { value: stripConfig.itemsOnStrip },
    uNumUnique: { value: stripConfig.numUnique },
    uOpacity: { value: 1.0 },
    uTime: { value: 0 },
    uWindStrength: { value: 0.8 },
    uWaveAmplitude: { value: 0.05 },
    uWaveFrequency: { value: 16.0 },
    uGravityScale: { value: 1.2 },
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
      uniform float uTime;
      uniform float uWaveAmplitude;
      uniform float uWaveFrequency;
      uniform float uWindStrength;
      uniform float uGravityScale;

      varying vec2 vUv;
      varying float vLooseness;

      void main() {
        vUv = uv;
        float looseness = smoothstep(0.0, 0.25, uv.y);
        vLooseness = looseness;

        vec3 pos = position;
        float wind = uWindStrength * 0.01;
        float wave1 = sin(uv.x * uWaveFrequency - uTime * (2.0 + wind)) * looseness;
        float wave2 = sin((uv.x + uv.y) * (uWaveFrequency * 0.7) - uTime * 1.8) * looseness * 0.5;
        float flutter = sin(uv.x * (uWaveFrequency * 2.5) - uTime * 4.0) * looseness * looseness * 0.18;

        pos.y -= uv.y * uv.y * (uGravityScale * 0.08) * looseness;
        pos.z += (wave1 + wave2) * uWaveAmplitude + flutter * uWaveAmplitude;
        pos.x += sin(uTime * 0.18) * looseness * 0.04;

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

        float center = 1.0 - abs(vUv.x - 0.5) * 2.0;
        float light = 0.75 + vLooseness * 0.2 + center * 0.08;
        float rim = pow(center, 2.0) * 0.05;
        float edgeFade = smoothstep(0.0, 0.06, vUv.x) * smoothstep(0.0, 0.06, 1.0 - vUv.x);
        gl_FragColor = vec4(color * light + rim, edgeFade * uOpacity);
      }
    `,
  });

  return { material, uniforms };
}

export function WorkClothStripScene({ activeRoom }: { activeRoom?: string }) {
  const { gl } = useThree();
  const systemRef = useRef<{ material: THREE.Material; uniforms: any } | null>(null);
  const groupRef = useRef<THREE.Group>(null);
  // The strip stays in the scene on every room, but only responds to input on
  // the work page. Tracked in a ref so the window listeners read it live without
  // re-subscribing on every route change.
  const onWorkRef = useRef(false);
  onWorkRef.current = activeRoom === "work";
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
  const inputRef = useRef({
    isDown: false,
    startedOnStrip: false,
    lastX: 0,
    startX: 0,
    dragDist: 0,
  });
  const hoverStripRef = useRef(false);
  const currentTitleRef = useRef("");
  const grabScaleRef = useRef(1);

  const updateStripCursor = () => {
    const canvas = gl.domElement as HTMLElement;
    if (!onWorkRef.current || document.body.classList.contains("menu-open")) {
      canvas.style.cursor = "";
      return;
    }
    if (inputRef.current.isDown && inputRef.current.startedOnStrip) {
      canvas.style.cursor = "grabbing";
    } else if (hoverStripRef.current) {
      canvas.style.cursor = "pointer";
    } else {
      canvas.style.cursor = "";
    }
  };

  const endStripDrag = () => {
    inputRef.current.isDown = false;
    inputRef.current.startedOnStrip = false;
    updateStripCursor();
  };

  const beginStripDrag = (clientX: number, pointerId: number) => {
    inputRef.current.isDown = true;
    inputRef.current.startedOnStrip = true;
    inputRef.current.lastX = clientX;
    inputRef.current.startX = clientX;
    inputRef.current.dragDist = 0;
    gl.domElement.setPointerCapture(pointerId);
    updateStripCursor();
  };

  useEffect(() => {
    // Listen on window rather than the canvas: the strip sits behind the page
    // wrappers (`.site_wrap` / `.site_content`, z-index 1) which would otherwise
    // swallow wheel/drag before they reached the canvas. Skip while the menu/about
    // overlay is open so its own scroll keeps working.
    const canInteract = () => onWorkRef.current && !document.body.classList.contains("menu-open");
    const onWheel = (e: WheelEvent) => {
      if (!canInteract()) return;
      e.preventDefault();
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      scrollRef.current.target += delta * scrollConfig.wheelSensitivity;
      scrollRef.current.velocity += delta * scrollConfig.wheelSensitivity * 0.24;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!inputRef.current.isDown || !inputRef.current.startedOnStrip) return;
      const dx = e.clientX - inputRef.current.lastX;
      inputRef.current.dragDist += Math.abs(dx);
      inputRef.current.lastX = e.clientX;
      scrollRef.current.target -= dx * scrollConfig.dragSensitivity;
      scrollRef.current.velocity = -dx * scrollConfig.dragVelocityScale;
    };
    const onPointerUp = (e: PointerEvent) => {
      if (!inputRef.current.startedOnStrip) return;
      if (gl.domElement.hasPointerCapture(e.pointerId)) {
        gl.domElement.releasePointerCapture(e.pointerId);
      }
      endStripDrag();
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      gl.domElement.style.cursor = "";
    };
  }, [
    gl,
    scrollConfig.dragSensitivity,
    scrollConfig.dragVelocityScale,
    scrollConfig.wheelSensitivity,
  ]);

  useEffect(() => {
    if (activeRoom === "work") return;
    inputRef.current.isDown = false;
    inputRef.current.startedOnStrip = false;
    hoverStripRef.current = false;
    gl.domElement.style.cursor = "";
  }, [activeRoom, gl]);

  const [textures, setTextures] = useState<THREE.Texture[] | null>(null);
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
    loadTextureAssets(images, { onErrorTexture: () => createColorFallbackTexture() })
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

  const [stripMaterial, setStripMaterial] = useState<THREE.Material | null>(null);
  const activeTextures = textures || fallbackTextures;

  useEffect(() => {
    if (!activeTextures) return;
    const system = createWebGLStripMaterial(activeTextures, stripConfig);
    setStripMaterial(system.material);
    systemRef.current = system;

    return () => {
      system.material.dispose();
      systemRef.current = null;
    };
  }, [activeTextures, stripConfig]);

  useFrame((state) => {
    const sys = systemRef.current;
    if (!sys) return;

    const sc = useWorkSceneControlsStore.getState().controls.strip;
    const group = groupRef.current;
    const s = scrollRef.current;
    const isDraggingStrip = inputRef.current.isDown && inputRef.current.startedOnStrip;
    const grabTarget = isDraggingStrip ? GRAB_SCALE : 1;
    grabScaleRef.current += (grabTarget - grabScaleRef.current) * GRAB_SCALE_LERP;

    if (group) {
      const baseScale = sc.scale ?? 1;
      const grabScale = grabScaleRef.current;
      group.position.set(sc.x ?? 0, sc.y ?? 0, sc.z ?? 0);
      group.rotation.set(sc.rx ?? 0, sc.ry ?? 0, sc.rz ?? 0);
      group.scale.set(baseScale * grabScale, baseScale * grabScale, baseScale * grabScale);
    }

    s.current += (s.target - s.current) * scrollConfig.scrollLerp;
    s.velocity *= isDraggingStrip
      ? scrollConfig.scrollDraggingDamping
      : scrollConfig.scrollDamping;
    if (!isDraggingStrip && Math.abs(s.velocity) < scrollConfig.snapVelocityThreshold) {
      const snapTarget = Math.round(s.target);
      if (Math.abs(snapTarget - s.target) > scrollConfig.snapEpsilon) {
        s.target += (snapTarget - s.target) * scrollConfig.snapLerp;
      } else {
        s.target = snapTarget;
      }
    }

    sys.uniforms.uScrollOffset.value = s.current;
    sys.uniforms.uOpacity.value = 1;

    if ("uTime" in sys.uniforms) {
      sys.uniforms.uTime.value = state.clock.getElapsedTime();
      sys.uniforms.uWindStrength.value = sc.windStrength ?? 0.8;
      sys.uniforms.uWaveAmplitude.value = sc.flutterAmplitude ?? 0.05;
      sys.uniforms.uWaveFrequency.value = sc.flutterFrequency ?? 16;
      sys.uniforms.uGravityScale.value = sc.gravityScale ?? 1.2;
    }

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

  if (!activeTextures || !stripMaterial) return null;

  const handleStripPointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (!onWorkRef.current || document.body.classList.contains("menu-open")) return;
    e.stopPropagation();
    beginStripDrag(e.clientX, e.pointerId);
  };

  const handleStripPointerOver = () => {
    if (!onWorkRef.current) return;
    hoverStripRef.current = true;
    updateStripCursor();
  };

  const handleStripPointerOut = () => {
    hoverStripRef.current = false;
    updateStripCursor();
  };

  const handleStripClick = (e: any) => {
    if (!onWorkRef.current) return;
    if (inputRef.current.dragDist > 8 || !e.uv) return;
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
        onPointerDown={handleStripPointerDown}
        onPointerOver={handleStripPointerOver}
        onPointerOut={handleStripPointerOut}
        onClick={handleStripClick}
      />
    </group>
  );
}
