import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { createColorFallbackTexture, loadTextureAsset } from "../lib/assets";
import { getPreloadedTextures } from "../lib/work-preload";
import { workItems } from "../content/work-items";
import { navigateTo, isNavigableHref } from "../lib/nav";
import { useWorkSceneControlsStore, WORK_STRIP_BASE_TRANSFORM } from "../store/workScene";
import { useWorkProjectTransitionStore } from "../store/workProjectTransition";
import {
  DEFAULT_GAP_SIZE,
  DEFAULT_VISIBLE_ITEMS,
  getStripMeshDensity,
  MOBILE_STRIP_MQ,
  NUM_UNIQUE_FALLBACK as NUM_UNIQUE,
} from "./config";
import { getActiveStripItemIndex, getScrollToCenterSlot, resolveVisibleSlotAtUv } from "./math";
import { SCENE_SUN_DIR } from "../scenes/lighting/sun";
import { cameraRigControlsRef } from "../scenes/cam/pose";

const GRAB_SCALE = 0.96;
const GRAB_SCALE_LERP = 0.14;
const HOVER_SCALE = 1.04;
const HOVER_SCALE_DURATION = 0.5;
const DRAG_THRESHOLD_PX = 8;

function easeOutCubic(t: number) {
  const x = Math.min(Math.max(t, 0), 1);
  return 1 - (1 - x) ** 3;
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    setMatches(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

function loadTextureAssets(urls: string[], options = {}) {
  return Promise.all(urls.map((url) => loadTextureAsset(url, options)));
}

/** Width/height of a loaded texture image; 1 for placeholders. */
function textureAspect(texture: THREE.Texture): number {
  const img = texture.image as { width?: number; height?: number } | undefined;
  const w = img?.width ?? 1;
  const h = img?.height ?? 1;
  return w / Math.max(h, 1);
}

/** World-space content width of one strip slot (arc length minus gaps). */
function slotWorldWidth(arcRadius: number, arcSpan: number, itemsOnStrip: number, gapSize: number) {
  return (arcSpan * arcRadius) / Math.max(itemsOnStrip, 1) * Math.max(1 - gapSize, 1e-4);
}

// ponytail: self-check — taller strip must shrink slot aspect (cover crops more vertically).
if (import.meta.env.DEV) {
  const short = slotWorldWidth(4.2, 2, 7, 0.04) / 1.7;
  const tall = slotWorldWidth(4.2, 2, 7, 0.04) / 1.9;
  console.assert(tall < short && tall > 0, "strip height increases → slot aspect decreases");
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

function buildStripDisplacementVertexShader(normalDu: string, normalDv: string, withNormals: boolean) {
  const normalPass = withNormals
    ? `
        const float DU = ${normalDu};
        const float DV = ${normalDv};
        vec3 pu = displace(uv + vec2(DU, 0.0), arcBase(uv + vec2(DU, 0.0)));
        vec3 pv = displace(uv + vec2(0.0, DV), arcBase(uv + vec2(0.0, DV)));
        vNormal = normalMatrix * normalize(cross(pu - p, pv - p));
      `
    : "";

  const varyings = withNormals
    ? `
      varying vec2 vUv;
      varying float vLooseness;
      varying vec3 vNormal;
    `
    : "";

  const preamble = withNormals
    ? `
        vUv = uv;
        vLooseness = smoothstep(0.0, 0.25, uv.y);
      `
    : "";

  return `
    uniform float uTime;
    uniform float uWaveAmplitude;
    uniform float uWaveFrequency;
    uniform float uWindStrength;
    uniform float uGravityScale;
    uniform float uArcRadius;
    uniform float uArcSpan;
    uniform float uStripHeight;
    uniform float uStripYOffset;
    ${varyings}

    vec3 arcBase(vec2 quv) {
      float angle = (quv.x - 0.5) * uArcSpan;
      return vec3(
        sin(angle) * uArcRadius,
        uStripYOffset + (quv.y - 0.5) * uStripHeight,
        (cos(angle) - 1.0) * uArcRadius
      );
    }

    vec3 displace(vec2 quv, vec3 base) {
      float looseness = smoothstep(0.0, 0.25, quv.y);
      float wind = uWindStrength * 0.01;
      float wave1 = sin(quv.x * uWaveFrequency - uTime * (2.0 + wind)) * looseness;
      float wave2 = sin((quv.x + quv.y) * (uWaveFrequency * 0.7) - uTime * 1.8) * looseness * 0.5;
      float flutter = sin(quv.x * (uWaveFrequency * 2.5) - uTime * 4.0) * looseness * looseness * 0.18;
      vec3 p = base;
      p.y -= quv.y * quv.y * (uGravityScale * 0.08) * looseness;
      p.z += (wave1 + wave2) * uWaveAmplitude + flutter * uWaveAmplitude;
      p.x += sin(uTime * 0.18) * looseness * 0.04;
      return p;
    }

    void main() {
      ${preamble}
      vec3 p = displace(uv, position);
      ${normalPass}
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }
  `;
}

// Finite-difference step in UV for the displaced-surface normal — one grid cell.
function createWebGLStripMaterial(
  textures: THREE.Texture[],
  stripConfig: Record<string, number>,
  meshDensity: { cols: number; rows: number },
) {
  const normalDu = (1 / (meshDensity.cols - 1)).toFixed(6);
  const normalDv = (1 / (meshDensity.rows - 1)).toFixed(6);
  const uniforms = {
    uScrollOffset: { value: 0 },
    uGapSize: { value: stripConfig.gapSize },
    uItemsOnStrip: { value: stripConfig.itemsOnStrip },
    uNumUnique: { value: stripConfig.numUnique },
    uOpacity: { value: 1.0 },
    uDissolve: { value: 0.0 },
    uTime: { value: 0 },
    uWindStrength: { value: 0.8 },
    uWaveAmplitude: { value: 0.05 },
    uWaveFrequency: { value: 16.0 },
    uGravityScale: { value: 1.2 },
    // Arc rest-pose params — let the vertex shader recompute neighbor positions
    // from uv so it can finite-difference an accurate displaced-surface normal.
    uArcRadius: { value: stripConfig.arcRadius },
    uArcSpan: { value: stripConfig.arcSpan },
    uStripHeight: { value: stripConfig.stripHeight },
    uStripYOffset: { value: stripConfig.stripYOffset },
    uLightDir: { value: SCENE_SUN_DIR.clone() },
    uExposure: { value: 0 },
    uLevelsInLow: { value: 0 },
    uLevelsInHigh: { value: 1 },
    uLevelsGamma: { value: 1 },
    uLevelsOutLow: { value: 0 },
    uLevelsOutHigh: { value: 1 },
    uBrightness: { value: 1 },
    uContrast: { value: 1 },
    uSaturation: { value: 1 },
    uShadeMin: { value: 0.88 },
    uShadeMax: { value: 1.12 },
    uBaseLight: { value: 0.75 },
    uLoosenessLight: { value: 0.2 },
    uCenterLight: { value: 0.08 },
    uRimStrength: { value: 0.05 },
    uEdgeFade: { value: 0.06 },
    uHoverSlot: { value: -1 },
    uHoverScale: { value: 1 },
    uHoverSlotPrev: { value: -1 },
    uHoverScalePrev: { value: 1 },
    // Slot aspect (world width / height) so UVs cover without stretching when height changes.
    uSlotAspect: {
      value:
        slotWorldWidth(
          stripConfig.arcRadius,
          stripConfig.arcSpan,
          stripConfig.itemsOnStrip,
          stripConfig.gapSize,
        ) / Math.max(stripConfig.stripHeight, 1e-4),
    },
    uTexAspect: { value: textures.map(textureAspect) },
    uTex0: { value: textures[0] },
    uTex1: { value: textures[1] },
    uTex2: { value: textures[2] },
    uTex3: { value: textures[3] },
    uTex4: { value: textures[4] },
    uTex5: { value: textures[5] },
    uShowBackFace: { value: 0 },
  };

  const material = new THREE.ShaderMaterial({
    transparent: true,
    // Double-sided so a panel curving away from the camera shows its reverse
    // (mirrored, lit via the back-face normal flip below) instead of being culled.
    side: THREE.DoubleSide,
    depthWrite: false,
    uniforms,
    vertexShader: buildStripDisplacementVertexShader(normalDu, normalDv, true),
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
      uniform float uDissolve;
      uniform vec3 uLightDir;
      uniform float uExposure;
      uniform float uLevelsInLow;
      uniform float uLevelsInHigh;
      uniform float uLevelsGamma;
      uniform float uLevelsOutLow;
      uniform float uLevelsOutHigh;
      uniform float uBrightness;
      uniform float uContrast;
      uniform float uSaturation;
      uniform float uShadeMin;
      uniform float uShadeMax;
      uniform float uBaseLight;
      uniform float uLoosenessLight;
      uniform float uCenterLight;
      uniform float uRimStrength;
      uniform float uEdgeFade;
      uniform float uHoverSlot;
      uniform float uHoverScale;
      uniform float uHoverSlotPrev;
      uniform float uHoverScalePrev;
      uniform float uSlotAspect;
      uniform float uTexAspect[6];
      uniform float uShowBackFace;
      varying vec2 vUv;
      varying float vLooseness;
      varying vec3 vNormal;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

      float dissolveNoise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      // Photoshop-style levels: input black/white remap -> gamma -> output range.
      vec3 applyLevels(vec3 c) {
        c = clamp((c - uLevelsInLow) / max(uLevelsInHigh - uLevelsInLow, 1e-4), 0.0, 1.0);
        c = pow(c, vec3(1.0 / max(uLevelsGamma, 1e-4)));
        return mix(vec3(uLevelsOutLow), vec3(uLevelsOutHigh), c);
      }

      vec3 sampleStripTexture(int index, vec2 coord) {
        if (index == 0) return texture2D(uTex0, coord).rgb;
        if (index == 1) return texture2D(uTex1, coord).rgb;
        if (index == 2) return texture2D(uTex2, coord).rgb;
        if (index == 3) return texture2D(uTex3, coord).rgb;
        if (index == 4) return texture2D(uTex4, coord).rgb;
        return texture2D(uTex5, coord).rgb;
      }

      float stripTexAspect(int index) {
        if (index == 0) return uTexAspect[0];
        if (index == 1) return uTexAspect[1];
        if (index == 2) return uTexAspect[2];
        if (index == 3) return uTexAspect[3];
        if (index == 4) return uTexAspect[4];
        return uTexAspect[5];
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
        float cellScale = 1.0;
        if (uHoverSlot >= 0.0 && itemFloor == uHoverSlot) cellScale = uHoverScale;
        else if (uHoverSlotPrev >= 0.0 && itemFloor == uHoverSlotPrev) cellScale = uHoverScalePrev;
        texU = (texU - 0.5) / cellScale + 0.5;
        float texV = (vUv.y - 0.5) / cellScale + 0.5;

        // Cover: scale UVs so the image fills the slot at its native aspect (crop overflow).
        int wrappedIndex = int(mod(itemFloor + uNumUnique, uNumUnique));
        float texAspect = stripTexAspect(wrappedIndex);
        float slotAspect = max(uSlotAspect, 1e-4);
        if (texAspect > slotAspect) {
          float s = slotAspect / texAspect;
          texU = (texU - 0.5) * s + 0.5;
        } else {
          float s = texAspect / slotAspect;
          texV = (texV - 0.5) * s + 0.5;
        }
        vec2 texCoord = clamp(vec2(texU, texV), vec2(0.001), vec2(0.999));
        vec3 color = sampleStripTexture(wrappedIndex, texCoord);
        color *= exp2(uExposure);
        color = applyLevels(color);
        float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
        color = mix(vec3(luma), color, uSaturation);
        color = (color - 0.5) * uContrast + 0.5;
        color *= uBrightness;

        float center = 1.0 - abs(vUv.x - 0.5) * 2.0;
        // Wave-driven shading: the displaced normal makes light travel along crests.
        // Flip the normal on back faces so a revealed reverse side lights up instead of going black.
        vec3 faceNormal = gl_FrontFacing ? normalize(vNormal) : -normalize(vNormal);
        float ndl = dot(faceNormal, normalize(uLightDir)) * 0.5 + 0.5;
        float shade = mix(uShadeMin, uShadeMax, ndl);
        float light = (uBaseLight + vLooseness * uLoosenessLight + center * uCenterLight) * shade;
        float rim = pow(center, 2.0) * uRimStrength;
        float edgeFade = smoothstep(0.0, uEdgeFade, vUv.x) * smoothstep(0.0, uEdgeFade, 1.0 - vUv.x);
        float dissolve = smoothstep(uDissolve - 0.08, uDissolve + 0.02, dissolveNoise(vUv * 12.0));
        if (dissolve < 0.5) discard;
        if (uShowBackFace > 0.5 && gl_FrontFacing) discard;
        gl_FragColor = vec4(color * light + rim, edgeFade * uOpacity * dissolve);
      }
    `,
  });

  material.customDepthMaterial = new THREE.MeshDepthMaterial({
    side: THREE.DoubleSide,
    depthPacking: THREE.RGBADepthPacking,
  });
  material.shadowSide = THREE.DoubleSide;

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
  const transitionActive = useWorkProjectTransitionStore((state) => state.active);
  const transitionDirection = useWorkProjectTransitionStore((state) => state.direction);
  const transitionStripOpacity = useWorkProjectTransitionStore((state) => state.stripOpacity);
  const transitionStripDissolve = useWorkProjectTransitionStore((state) => state.stripDissolve);
  const isMobileStrip = useMediaQuery(MOBILE_STRIP_MQ);
  const meshDensity = useMemo(() => getStripMeshDensity(), []);
  // Panel count across the arc — fewer panels ⇒ each one is physically wider.
  const visibleItems = Math.max(2, Math.round(stripControls.visibleItems ?? DEFAULT_VISIBLE_ITEMS));
  const gapSize = stripControls.gapSize ?? DEFAULT_GAP_SIZE;
  const scrollConfig = {
    wheelSensitivity: stripControls.wheelSensitivity,
    dragSensitivity: stripControls.dragSensitivity * (isMobileStrip ? 1.5 : 1),
    dragVelocityScale: stripControls.dragVelocityScale,
    scrollLerp: isMobileStrip ? 0.15 : stripControls.scrollLerp,
    scrollDamping: stripControls.scrollDamping,
    scrollDraggingDamping: stripControls.scrollDraggingDamping,
    snapVelocityThreshold: stripControls.snapVelocityThreshold * (isMobileStrip ? 1.35 : 1),
    snapLerp: stripControls.snapLerp * (isMobileStrip ? 0.55 : 1),
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
  const hoverSlotRef = useRef(-1);
  // Two independent scale channels so moving A→B eases B up while A eases back down.
  const hoverAnimRef = useRef({
    curr: { slot: -1, value: 1, from: 1, to: 1, startTime: 0 },
    prev: { slot: -1, value: 1, from: 1, to: 1, startTime: 0 },
  });
  // ponytail: seed with the actually-centered item (not workItems[0]) so the opening
  // frame matches WorkPage's title and dispatches no redundant event.
  const currentTitleRef = useRef(
    workItems[getActiveStripItemIndex(0, visibleItems, gapSize, NUM_UNIQUE)]?.title ?? "",
  );
  const grabScaleRef = useRef(1);

  const updateStripCursor = () => {
    const canvas = gl.domElement as HTMLElement;
    if (
      !onWorkRef.current ||
      document.body.classList.contains("menu-open") ||
      transitionActive
    ) {
      canvas.style.cursor = "";
      return;
    }
    if (
      inputRef.current.isDown &&
      inputRef.current.startedOnStrip &&
      inputRef.current.dragDist > DRAG_THRESHOLD_PX
    ) {
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
    const canInteract = () =>
      onWorkRef.current &&
      !cameraRigControlsRef.current.orbitControlEnabled &&
      useWorkSceneControlsStore.getState().controls.strip.scrollEnabled !== false &&
      !document.body.classList.contains("menu-open") &&
      !useWorkProjectTransitionStore.getState().active;
    const onWheel = (e: WheelEvent) => {
      if (!canInteract()) return;
      e.preventDefault();
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      scrollRef.current.target += delta * scrollConfig.wheelSensitivity;
      scrollRef.current.velocity += delta * scrollConfig.wheelSensitivity * 0.24;
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!canInteract()) return;
      const target = e.target;
      if (target instanceof Element && target.closest("[data-no-strip-drag]")) {
        return;
      }
      beginStripDrag(e.clientX, e.pointerId);
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
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("pointerdown", onPointerDown);
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
    scrollConfig.scrollLerp,
  ]);

  useEffect(() => {
    if (activeRoom === "work") return;
    inputRef.current.isDown = false;
    inputRef.current.startedOnStrip = false;
    hoverStripRef.current = false;
    hoverSlotRef.current = -1;
    hoverAnimRef.current = {
      curr: { slot: -1, value: 1, from: 1, to: 1, startTime: 0 },
      prev: { slot: -1, value: 1, from: 1, to: 1, startTime: 0 },
    };
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
        meshDensity.cols,
        meshDensity.rows,
        arcConfig.arcRadius,
        arcConfig.arcSpan,
        arcConfig.stripHeight,
        arcConfig.stripYOffset,
      ),
    [
      meshDensity.cols,
      meshDensity.rows,
      arcConfig.arcRadius,
      arcConfig.arcSpan,
      arcConfig.stripHeight,
      arcConfig.stripYOffset,
    ],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);

  const stripConfig = useMemo(
    () => ({
      itemsOnStrip: visibleItems,
      numUnique: NUM_UNIQUE,
      gapSize,
      arcRadius: arcConfig.arcRadius,
      arcSpan: arcConfig.arcSpan,
      stripHeight: arcConfig.stripHeight,
      stripYOffset: arcConfig.stripYOffset,
    }),
    [
      arcConfig.arcRadius,
      arcConfig.arcSpan,
      arcConfig.stripHeight,
      arcConfig.stripYOffset,
      gapSize,
      visibleItems,
    ],
  );

  const [stripMaterial, setStripMaterial] = useState<THREE.Material | null>(null);
  const activeTextures = textures || fallbackTextures;

  useEffect(() => {
    if (!activeTextures) return;
    const system = createWebGLStripMaterial(activeTextures, stripConfig, meshDensity);
    setStripMaterial(system.material);
    systemRef.current = system;

    return () => {
      system.material.dispose();
      systemRef.current = null;
    };
  }, [activeTextures, stripConfig, meshDensity]);

  useFrame((state) => {
    const sys = systemRef.current;
    if (!sys) return;

    const sc = useWorkSceneControlsStore.getState().controls.strip;
    const group = groupRef.current;
    const s = scrollRef.current;
    const isDraggingStrip = inputRef.current.isDown && inputRef.current.startedOnStrip;
    const isGrabScaling =
      isDraggingStrip && inputRef.current.dragDist > DRAG_THRESHOLD_PX;
    const grabTarget = isGrabScaling ? GRAB_SCALE : 1;
    grabScaleRef.current += (grabTarget - grabScaleRef.current) * GRAB_SCALE_LERP;

    const targetSlot =
      hoverSlotRef.current >= 0 && !isDraggingStrip ? hoverSlotRef.current : -1;
    const anim = hoverAnimRef.current;
    const now = state.clock.getElapsedTime();
    const stepChannel = (ch: (typeof anim)["curr"]) => {
      const t = Math.min((now - ch.startTime) / HOVER_SCALE_DURATION, 1);
      ch.value = ch.from + (ch.to - ch.from) * easeOutCubic(t);
    };
    if (targetSlot !== anim.curr.slot) {
      // Hand the outgoing slot to the prev channel so it keeps easing back to 1
      // from wherever it currently is, while curr eases the new slot up.
      anim.prev = { ...anim.curr, from: anim.curr.value, to: 1, startTime: now };
      anim.curr =
        targetSlot >= 0
          ? { slot: targetSlot, value: 1, from: 1, to: HOVER_SCALE, startTime: now }
          : { slot: -1, value: 1, from: 1, to: 1, startTime: now };
    }
    stepChannel(anim.curr);
    stepChannel(anim.prev);
    sys.uniforms.uHoverSlot.value = anim.curr.slot;
    sys.uniforms.uHoverScale.value = anim.curr.value;
    sys.uniforms.uHoverSlotPrev.value = anim.prev.slot;
    sys.uniforms.uHoverScalePrev.value = anim.prev.value;

    const gs = sc.gapSize ?? DEFAULT_GAP_SIZE;
    const slotW = slotWorldWidth(sc.curveRadius, sc.curveAmount, visibleItems, gs);
    sys.uniforms.uSlotAspect.value = slotW / Math.max(sc.stripHeight, 1e-4);
    sys.uniforms.uStripHeight.value = sc.stripHeight;
    sys.uniforms.uArcRadius.value = sc.curveRadius;
    sys.uniforms.uArcSpan.value = sc.curveAmount;

    if (group) {
      const baseScale = (sc.scale ?? 1) * WORK_STRIP_BASE_TRANSFORM.scale;
      const grabScale = grabScaleRef.current;
      group.position.set(
        (sc.x ?? 0) + WORK_STRIP_BASE_TRANSFORM.x,
        (sc.y ?? 0) + WORK_STRIP_BASE_TRANSFORM.y,
        (sc.z ?? 0) + WORK_STRIP_BASE_TRANSFORM.z,
      );
      group.rotation.set(sc.rx ?? 0, sc.ry ?? 0, sc.rz ?? 0);
      group.scale.set(baseScale * grabScale, baseScale * grabScale, baseScale * grabScale);
    }

    if (sc.loopPreview) {
      s.target += sc.loopScrollSpeed ?? 0.02;
      s.current = s.target;
      s.velocity = 0;
    } else if (sc.scrollEnabled !== false) {
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
    } else {
      s.velocity = 0;
      s.target = s.current;
    }

    sys.uniforms.uScrollOffset.value = s.current;
    if (transitionActive && transitionDirection === "toProject") {
      sys.uniforms.uOpacity.value = transitionStripOpacity;
      sys.uniforms.uDissolve.value = 0;
    } else if (transitionActive && transitionDirection === "toWork") {
      sys.uniforms.uOpacity.value = sc.opacity ?? 1;
      sys.uniforms.uDissolve.value = transitionStripDissolve;
    } else {
      sys.uniforms.uOpacity.value = sc.opacity ?? 1;
      sys.uniforms.uDissolve.value = 0;
    }
    sys.uniforms.uExposure.value = sc.exposure ?? 0;
    sys.uniforms.uLevelsInLow.value = sc.levelsInLow ?? 0;
    sys.uniforms.uLevelsInHigh.value = sc.levelsInHigh ?? 1;
    sys.uniforms.uLevelsGamma.value = sc.levelsGamma ?? 1;
    sys.uniforms.uLevelsOutLow.value = sc.levelsOutLow ?? 0;
    sys.uniforms.uLevelsOutHigh.value = sc.levelsOutHigh ?? 1;
    sys.uniforms.uBrightness.value = sc.brightness ?? 1;
    sys.uniforms.uContrast.value = sc.contrast ?? 1;
    sys.uniforms.uSaturation.value = sc.saturation ?? 1;
    sys.uniforms.uShadeMin.value = sc.shadeMin ?? 0.88;
    sys.uniforms.uShadeMax.value = sc.shadeMax ?? 1.12;
    sys.uniforms.uBaseLight.value = sc.baseLight ?? 0.75;
    sys.uniforms.uLoosenessLight.value = sc.loosenessLight ?? 0.2;
    sys.uniforms.uCenterLight.value = sc.centerLight ?? 0.08;
    sys.uniforms.uRimStrength.value = sc.rimStrength ?? 0.05;
    sys.uniforms.uEdgeFade.value = sc.edgeFade ?? 0.06;

    if ("uTime" in sys.uniforms) {
      sys.uniforms.uTime.value = state.clock.getElapsedTime();
      const windOn = sc.windEnabled !== false;
      sys.uniforms.uWindStrength.value = windOn ? (sc.windStrength ?? 0.8) : 0;
      sys.uniforms.uWaveAmplitude.value = windOn ? (sc.flutterAmplitude ?? 0.05) : 0;
      sys.uniforms.uWaveFrequency.value = sc.flutterFrequency ?? 16;
      sys.uniforms.uGravityScale.value = sc.gravityScale ?? 1.2;
    }
    sys.uniforms.uShowBackFace.value = sc.showStripBack ? 1 : 0;

    const centerIdx = getActiveStripItemIndex(s.current, visibleItems, gs, NUM_UNIQUE);
    const newTitle = workItems[centerIdx]?.title || "";
    if (newTitle !== currentTitleRef.current) {
      currentTitleRef.current = newTitle;
      window.dispatchEvent(
        new CustomEvent("duforn:work-strip-title", { detail: { title: newTitle } }),
      );
    }
  });

  const shadowCatcher = useMemo(() => {
    const halfSpan = arcConfig.arcSpan * 0.5;
    const width = Math.sin(halfSpan) * arcConfig.arcRadius * 2.4;
    const depth = arcConfig.arcRadius * 0.95;
    const y = arcConfig.stripYOffset - arcConfig.stripHeight * 0.5 - 0.06;
    const z = -(1 - Math.cos(halfSpan)) * arcConfig.arcRadius * 0.35;
    return { width: Math.max(width, 2.5), depth: Math.max(depth, 1.2), y, z };
  }, [arcConfig.arcRadius, arcConfig.arcSpan, arcConfig.stripHeight, arcConfig.stripYOffset]);

  if (!activeTextures || !stripMaterial) return null;

  const handleStripPointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (
      !onWorkRef.current ||
      cameraRigControlsRef.current.orbitControlEnabled ||
      !stripControls.scrollEnabled ||
      transitionActive ||
      document.body.classList.contains("menu-open")
    )
      return;
    e.stopPropagation();
    beginStripDrag(e.clientX, e.pointerId);
  };

  const handleStripPointerOver = () => {
    if (!onWorkRef.current) return;
    hoverStripRef.current = true;
    updateStripCursor();
  };

  const handleStripPointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (
      !onWorkRef.current ||
      cameraRigControlsRef.current.orbitControlEnabled ||
      transitionActive ||
      document.body.classList.contains("menu-open")
    )
      return;
    if (inputRef.current.isDown && inputRef.current.startedOnStrip) {
      hoverSlotRef.current = -1;
      return;
    }
    if (!e.uv) {
      hoverSlotRef.current = -1;
      return;
    }
    const resolvedSlot = resolveVisibleSlotAtUv(
      e.uv.x,
      scrollRef.current.current,
      visibleItems,
      gapSize,
      NUM_UNIQUE,
    );
    hoverSlotRef.current = resolvedSlot?.slotIndex ?? -1;
  };

  const handleStripPointerOut = () => {
    hoverStripRef.current = false;
    hoverSlotRef.current = -1;
    updateStripCursor();
  };

  const handleStripClick = (e: any) => {
    if (!onWorkRef.current || cameraRigControlsRef.current.orbitControlEnabled || transitionActive)
      return;
    if (inputRef.current.dragDist > DRAG_THRESHOLD_PX || !e.uv) return;
    e.stopPropagation();
    const resolvedSlot = resolveVisibleSlotAtUv(
      e.uv.x,
      scrollRef.current.current,
      visibleItems,
      gapSize,
      NUM_UNIQUE,
    );
    if (!resolvedSlot) return;
    const centerIdx = getActiveStripItemIndex(
      scrollRef.current.current,
      visibleItems,
      gapSize,
      NUM_UNIQUE,
    );
    if (resolvedSlot.itemIndex === centerIdx) {
      const href = workItems[resolvedSlot.itemIndex]?.href;
      if (isNavigableHref(href)) navigateTo(href);
      return;
    }
    if (!stripControls.scrollEnabled) return;
    // off-center → glide it to center; useFrame's dispatch updates the title.
    scrollRef.current.target = getScrollToCenterSlot(resolvedSlot.slotIndex, visibleItems);
    scrollRef.current.velocity = 0;
  };

  return (
    <group ref={groupRef}>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, shadowCatcher.y, shadowCatcher.z]}
        receiveShadow
        renderOrder={-2}
        raycast={() => null}
      >
        <planeGeometry args={[shadowCatcher.width, shadowCatcher.depth]} />
        <shadowMaterial transparent opacity={0.38} color="#14100c" />
      </mesh>
      <mesh
        geometry={geometry}
        material={stripMaterial}
        castShadow
        frustumCulled={false}
        onPointerDown={handleStripPointerDown}
        onPointerOver={handleStripPointerOver}
        onPointerMove={handleStripPointerMove}
        onPointerOut={handleStripPointerOut}
        onClick={handleStripClick}
      />
    </group>
  );
}
