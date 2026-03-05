import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { BallCollider, Physics, RigidBody, useRapier } from '@react-three/rapier';
import { workItems } from '../../data/work-items.js';
import { getWorkStripBridge } from './workStripBridge.js';
import { getHaptics } from '../../scripts/link-hover.js';

const STRIP_CONFIG = {
  arcRadius: 14,
  arcSpan: 3.5,
  stripHeight: 5.5,
  stripYOffset: -1.2,
  itemsOnStrip: 11,
  gapSize: 0.03,
  numUnique: 6,
};

const CLOTH_CONFIG = {
  desktopCols: 60,
  desktopRows: 26,
  mobileCols: 34,
  mobileRows: 18,
  massTop: 0.045,
  massBottom: 0.09,
  linearDamping: 2.2,
  angularDamping: 4.8,
  stiffnessStructural: 260,
  stiffnessShear: 145,
  stiffnessBend: 95,
  dampingStructural: 16,
  dampingShear: 10,
  dampingBend: 8,
  windBase: 0.085,
  aeroDrag: 0.12,
  flutterScale: 0.2,
  interactionSphereRadius: 0.38,
  interactionFalloffRadius: 1.15,
  interactionHoverImpulse: 1.0,
  interactionDragImpulse: 2.8,
  interactionMaxImpulse: 4.4,
  interactionLerp: 0.16,
  interactionOffscreen: [9999, 9999, 9999],
  clickDragThreshold: 5,
};

const STRIP_FRAGMENT_SHADER = /* glsl */ `
  uniform sampler2D uTex0;
  uniform sampler2D uTex1;
  uniform sampler2D uTex2;
  uniform sampler2D uTex3;
  uniform sampler2D uTex4;
  uniform sampler2D uTex5;
  uniform float uScrollOffset;
  uniform float uItemsOnStrip;
  uniform float uNumUnique;
  uniform float uGapSize;
  uniform float uTime;
  uniform float uNonSelectedFade;
  uniform float uFocusSlot;
  uniform float uIsolateSlot;
  uniform float uTransitionOpacity;
  uniform float uRevealProgress;
  uniform float uRevealSoftness;
  uniform float uArcSpan;
  uniform float uAxisVertical;

  varying vec2 vUv;

  float hash(vec2 p) {
    p = fract(p * vec2(443.897, 441.423));
    p += dot(p, p + 19.19);
    return fract(p.x * p.y);
  }

  void main() {
    float axisCoord = mix(vUv.x, 1.0 - vUv.y, clamp(uAxisVertical, 0.0, 1.0));
    float totalU = axisCoord * uItemsOnStrip + uScrollOffset;
    float itemFract = fract(totalU);
    float itemIndex = floor(totalU);

    float wrappedIndex = mod(itemIndex, uNumUnique);
    if (wrappedIndex < 0.0) wrappedIndex += uNumUnique;

    float halfGap = uGapSize * 0.5;
    if (itemFract < halfGap || itemFract > 1.0 - halfGap) discard;

    float texU = (itemFract - halfGap) / (1.0 - uGapSize);
    vec2 texCoordHorizontal = vec2(texU, vUv.y);
    vec2 texCoordVertical = vec2(vUv.x, texU);
    vec2 texCoord = clamp(mix(texCoordHorizontal, texCoordVertical, clamp(uAxisVertical, 0.0, 1.0)), vec2(0.001), vec2(0.999));

    vec3 col;
    int idx = int(wrappedIndex);
    if (idx == 0) col = texture2D(uTex0, texCoord).rgb;
    else if (idx == 1) col = texture2D(uTex1, texCoord).rgb;
    else if (idx == 2) col = texture2D(uTex2, texCoord).rgb;
    else if (idx == 3) col = texture2D(uTex3, texCoord).rgb;
    else if (idx == 4) col = texture2D(uTex4, texCoord).rgb;
    else col = texture2D(uTex5, texCoord).rgb;

    float grain = (hash(vUv * 1000.0 + uTime * 100.0) - 0.5) * 0.05;
    col += grain;

    float slotFloor = floor(totalU);
    float isSelectedSlot = 1.0 - step(0.5, abs(slotFloor - uFocusSlot));
    if (uIsolateSlot > 0.5 && isSelectedSlot < 0.5) discard;

    float alpha = 1.0;
    if (uFocusSlot > -0.5) {
      alpha -= (1.0 - isSelectedSlot) * clamp(uNonSelectedFade, 0.0, 1.0);
    }

    float progress = clamp(uRevealProgress, 0.0, 1.0);
    float angle = (axisCoord - 0.5) * uArcSpan;
    float startAngle = uArcSpan * 0.52;
    float endAngle = -uArcSpan * 0.52;
    float revealHead = mix(startAngle, endAngle, progress);
    float revealSoft = max(0.0001, uRevealSoftness * uArcSpan);
    float revealMask = smoothstep(revealHead, revealHead + revealSoft, angle);
    if (revealMask <= 0.001) discard;

    gl_FragColor = vec4(col, alpha * uTransitionOpacity * revealMask);
  }
`;

const STRIP_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

function forceGuiTextToParagraphs(gui) {
  const root = gui?.domElement;
  if (!root) return;
  const apply = () => {
    const targets = root.querySelectorAll('.title, .name');
    targets.forEach((node) => {
      const text = (node.textContent || '').trim();
      if (!text) return;
      const onlyPChild =
        node.childElementCount === 1 &&
        node.firstElementChild &&
        node.firstElementChild.tagName === 'P';
      if (onlyPChild) {
        node.firstElementChild.textContent = text;
        return;
      }
      node.textContent = '';
      const p = document.createElement('p');
      p.textContent = text;
      p.style.margin = '0';
      p.style.fontSize = '12px';
      p.style.lineHeight = '1.2';
      p.style.fontWeight = '500';
      node.appendChild(p);
    });
  };
  apply();
  requestAnimationFrame(apply);
}

function getGridIndex(col, row, cols) {
  return row * cols + col;
}

function isPinnedSideAnchor(row, col, rows, cols) {
  if (col !== 0 && col !== cols - 1) return false;
  if (row === 0 || row === rows - 1) return true;
  return row % 4 === 0;
}

function getBasePoint(u, v) {
  const angle = (u - 0.5) * STRIP_CONFIG.arcSpan;
  return {
    curve: [
      Math.sin(angle) * STRIP_CONFIG.arcRadius,
      (v - 0.5) * STRIP_CONFIG.stripHeight + STRIP_CONFIG.stripYOffset,
      (Math.cos(angle) - 1) * STRIP_CONFIG.arcRadius,
    ],
    flat: [
      angle * STRIP_CONFIG.arcRadius,
      (v - 0.5) * STRIP_CONFIG.stripHeight + STRIP_CONFIG.stripYOffset,
      0,
    ],
  };
}

function buildGrid(cols, rows) {
  const nodeCount = cols * rows;
  const positions = new Float32Array(nodeCount * 3);
  const flatPositions = new Float32Array(nodeCount * 3);
  const uvs = new Float32Array(nodeCount * 2);

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const u = col / (cols - 1);
      const v = row / (rows - 1);
      const index = getGridIndex(col, row, cols);
      const base = getBasePoint(u, v);
      positions[index * 3 + 0] = base.curve[0];
      positions[index * 3 + 1] = base.curve[1];
      positions[index * 3 + 2] = base.curve[2];
      flatPositions[index * 3 + 0] = base.flat[0];
      flatPositions[index * 3 + 1] = base.flat[1];
      flatPositions[index * 3 + 2] = base.flat[2];
      uvs[index * 2 + 0] = u;
      uvs[index * 2 + 1] = v;
    }
  }

  const indices = [];
  for (let row = 0; row < rows - 1; row += 1) {
    for (let col = 0; col < cols - 1; col += 1) {
      const a = getGridIndex(col, row, cols);
      const b = getGridIndex(col + 1, row, cols);
      const c = getGridIndex(col, row + 1, cols);
      const d = getGridIndex(col + 1, row + 1, cols);
      indices.push(a, b, c, b, d, c);
    }
  }

  return { positions, flatPositions, uvs, indices };
}

function createPlaceholderTexture() {
  const data = new Uint8Array([220, 218, 210, 255]);
  const texture = new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function loadTextures(uniqueImages) {
  return Promise.all(uniqueImages.map((src) => new Promise((resolve) => {
    const loader = new THREE.TextureLoader();
    loader.load(
      src,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = true;
        resolve(texture);
      },
      undefined,
      () => resolve(createPlaceholderTexture())
    );
  })));
}

function WorkClothStripScene({ onStatus }) {
  const bridge = useMemo(() => getWorkStripBridge(), []);
  const { size, camera } = useThree();
  const { world, rapier } = useRapier();
  const isMobile = size.width <= 1024;
  const cols = isMobile ? CLOTH_CONFIG.mobileCols : CLOTH_CONFIG.desktopCols;
  const rows = isMobile ? CLOTH_CONFIG.mobileRows : CLOTH_CONFIG.desktopRows;

  const groupRef = useRef();
  const meshRef = useRef();
  const materialRef = useRef();
  const bodyRefs = useRef([]);
  const jointsRef = useRef([]);
  const interactionBodyRef = useRef(null);
  const interactionTargetRef = useRef(new THREE.Vector3(...CLOTH_CONFIG.interactionOffscreen));
  const interactionPosRef = useRef(new THREE.Vector3(...CLOTH_CONFIG.interactionOffscreen));
  const pointerStateRef = useRef({
    mode: 'idle',
    isDown: false,
    moved: false,
    startX: 0,
    startY: 0,
    ndcX: 0,
    ndcY: 0,
  });
  const tempRaycasterRef = useRef(new THREE.Raycaster());
  const tempPlaneRef = useRef(new THREE.Plane());
  const tempNormalRef = useRef(new THREE.Vector3());
  const tempCenterRef = useRef(new THREE.Vector3());
  const tempVecRef = useRef(new THREE.Vector3());
  const tempDirRef = useRef(new THREE.Vector3());
  const worldPointScratchRef = useRef(new THREE.Vector3());
  const localPointScratchRef = useRef(new THREE.Vector3());
  const liveLocalPositionsRef = useRef(new Float32Array(cols * rows * 3));
  const lockedLocalPositionsRef = useRef(null);
  const wasDeterministicRef = useRef(false);
  const guiRef = useRef(null);
  const tweakRef = useRef({
    windBase: CLOTH_CONFIG.windBase,
    windMultiplier: 1.0,
    hoverWindBoost: 0.02,
    dragWindBoost: 0.05,
    aeroDrag: CLOTH_CONFIG.aeroDrag,
    flutterScale: CLOTH_CONFIG.flutterScale,
    hoverRadius: CLOTH_CONFIG.interactionFalloffRadius,
    hoverImpulse: CLOTH_CONFIG.interactionHoverImpulse,
    dragImpulse: CLOTH_CONFIG.interactionDragImpulse,
    maxImpulse: CLOTH_CONFIG.interactionMaxImpulse,
    lerp: CLOTH_CONFIG.interactionLerp,
  });
  const rapierLoggedRef = useRef(false);
  const lastBridgeState = useRef({
    scrollTarget: 0,
    scrollCurrent: 0,
    revealProgress: 1,
    transition: {
      flatten: 0,
      selectedIndex: -1,
      nonSelectedFade: 0,
      focusSlot: -1,
      isolateSlot: 0,
      transitionOpacity: 1,
      transitionMode: 'idle',
      physicsBlend: 1,
      interactionEnabled: true,
    },
    groupTransform: {
      position: [0, 0, -1.5],
      scale: [0.35, 0.35, 0.35],
      rotationZ: 0,
    },
    visible: true,
    windStrength: CLOTH_CONFIG.windBase,
    stripMetrics: {
      itemsOnStrip: STRIP_CONFIG.itemsOnStrip,
      numUnique: STRIP_CONFIG.numUnique,
      gapSize: STRIP_CONFIG.gapSize,
      axis: 'horizontal',
    },
    cameraPose: null,
  });

  const geometryData = useMemo(() => buildGrid(cols, rows), [cols, rows]);

  useEffect(() => {
    onStatus?.('Rapier: initializing cloth strip...');
  }, [onStatus]);

  function getInteractionEnabled() {
    const state = lastBridgeState.current;
    return (
      state.visible &&
      state.transition.interactionEnabled !== false &&
      state.transition.transitionOpacity > 0.99 &&
      state.transition.flatten < 0.08
    );
  }

  function getLocalPointForUv(u, v, flattenOverride = lastBridgeState.current.transition.flatten) {
    const clampedU = THREE.MathUtils.clamp(u, 0, 1);
    const clampedV = THREE.MathUtils.clamp(v, 0, 1);
    const colF = clampedU * (cols - 1);
    const rowF = clampedV * (rows - 1);
    const c0 = Math.floor(colF);
    const c1 = Math.min(cols - 1, c0 + 1);
    const r0 = Math.floor(rowF);
    const r1 = Math.min(rows - 1, r0 + 1);
    const tx = colF - c0;
    const ty = rowF - r0;

    const live = lockedLocalPositionsRef.current || liveLocalPositionsRef.current;
    const flat = geometryData.flatPositions;
    const blend = THREE.MathUtils.clamp(flattenOverride, 0, 1);
    const scratch = localPointScratchRef.current;

    const sample = (col, row) => {
      const idx = getGridIndex(col, row, cols) * 3;
      return {
        x: THREE.MathUtils.lerp(live[idx + 0], flat[idx + 0], blend),
        y: THREE.MathUtils.lerp(live[idx + 1], flat[idx + 1], blend),
        z: THREE.MathUtils.lerp(live[idx + 2], flat[idx + 2], blend),
      };
    };

    const p00 = sample(c0, r0);
    const p10 = sample(c1, r0);
    const p01 = sample(c0, r1);
    const p11 = sample(c1, r1);

    const x0 = THREE.MathUtils.lerp(p00.x, p10.x, tx);
    const y0 = THREE.MathUtils.lerp(p00.y, p10.y, tx);
    const z0 = THREE.MathUtils.lerp(p00.z, p10.z, tx);
    const x1 = THREE.MathUtils.lerp(p01.x, p11.x, tx);
    const y1 = THREE.MathUtils.lerp(p01.y, p11.y, tx);
    const z1 = THREE.MathUtils.lerp(p01.z, p11.z, tx);

    scratch.set(
      THREE.MathUtils.lerp(x0, x1, ty),
      THREE.MathUtils.lerp(y0, y1, ty),
      THREE.MathUtils.lerp(z0, z1, ty)
    );
    return scratch;
  }

  function getWorldPointForUv(u, v, flattenOverride = lastBridgeState.current.transition.flatten) {
    const local = getLocalPointForUv(u, v, flattenOverride);
    const worldPoint = worldPointScratchRef.current.copy(local);
    if (groupRef.current) {
      groupRef.current.updateMatrixWorld(true);
      worldPoint.applyMatrix4(groupRef.current.matrixWorld);
    }
    return worldPoint;
  }

  function updatePointerTargetFromNdc(ndcX, ndcY) {
    const raycaster = tempRaycasterRef.current;
    const plane = tempPlaneRef.current;
    const normal = tempNormalRef.current;
    const center = tempCenterRef.current;
    const hit = tempVecRef.current;

    if (groupRef.current) {
      center.copy(groupRef.current.position);
      groupRef.current.localToWorld(center);
    } else {
      center.set(0, 0, -1.5);
    }

    camera.getWorldDirection(normal).normalize();
    plane.setFromNormalAndCoplanarPoint(normal, center);
    raycaster.setFromCamera({ x: ndcX, y: ndcY }, camera);
    if (raycaster.ray.intersectPlane(plane, hit)) {
      interactionTargetRef.current.copy(hit);
    }
  }

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(geometryData.positions.slice(), 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(geometryData.uvs, 2));
    geo.setIndex(geometryData.indices);
    geo.computeVertexNormals();
    return geo;
  }, [geometryData]);

  const uniqueImages = useMemo(() => {
    const items = [...new Set(workItems.map((item) => item.image))];
    while (items.length < 6) {
      items.push(items[0] || '/archive/1.webp');
    }
    return items.slice(0, 6);
  }, []);

  const texturesRef = useRef(Array.from({ length: 6 }, () => createPlaceholderTexture()));

  useEffect(() => {
    let mounted = true;
    loadTextures(uniqueImages).then((loaded) => {
      if (!mounted) {
        loaded.forEach((tex) => tex.dispose?.());
        return;
      }
      texturesRef.current.forEach((tex) => tex.dispose?.());
      texturesRef.current = loaded;
      if (materialRef.current?.uniforms) {
        materialRef.current.uniforms.uTex0.value = loaded[0];
        materialRef.current.uniforms.uTex1.value = loaded[1];
        materialRef.current.uniforms.uTex2.value = loaded[2];
        materialRef.current.uniforms.uTex3.value = loaded[3];
        materialRef.current.uniforms.uTex4.value = loaded[4];
        materialRef.current.uniforms.uTex5.value = loaded[5];
      }
    });
    return () => {
      mounted = false;
    };
  }, [uniqueImages]);

  const uniforms = useMemo(() => ({
    uTex0: { value: texturesRef.current[0] },
    uTex1: { value: texturesRef.current[1] },
    uTex2: { value: texturesRef.current[2] },
    uTex3: { value: texturesRef.current[3] },
    uTex4: { value: texturesRef.current[4] },
    uTex5: { value: texturesRef.current[5] },
    uScrollOffset: { value: 0 },
    uItemsOnStrip: { value: STRIP_CONFIG.itemsOnStrip },
    uNumUnique: { value: STRIP_CONFIG.numUnique },
    uGapSize: { value: STRIP_CONFIG.gapSize },
    uTime: { value: 0 },
    uNonSelectedFade: { value: 0 },
    uFocusSlot: { value: -1 },
    uIsolateSlot: { value: 0 },
    uTransitionOpacity: { value: 1 },
    uRevealProgress: { value: 1 },
    uRevealSoftness: { value: 0.06 },
    uArcSpan: { value: STRIP_CONFIG.arcSpan },
    uAxisVertical: { value: 0 },
  }), []);

  useEffect(() => {
    bodyRefs.current = new Array(cols * rows).fill(null);
    liveLocalPositionsRef.current = geometryData.positions.slice();
    lockedLocalPositionsRef.current = null;
    wasDeterministicRef.current = false;
  }, [cols, rows, geometryData.positions]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    let cancelled = false;
    import('lil-gui').then(({ default: GUI }) => {
      if (cancelled) return;
      const gui = new GUI({ title: 'Work Cloth Rapier', width: 320 });
      gui.domElement.style.zIndex = '2147483647';
      guiRef.current = gui;

      const settings = tweakRef.current;
      gui.add(settings, 'windBase', 0, 0.5, 0.005).name('Wind Base');
      gui.add(settings, 'windMultiplier', 0, 3, 0.01).name('Wind Mult');
      gui.add(settings, 'hoverWindBoost', 0, 0.1, 0.001).name('Hover Wind');
      gui.add(settings, 'dragWindBoost', 0, 0.2, 0.001).name('Drag Wind');
      gui.add(settings, 'aeroDrag', 0, 0.4, 0.005).name('Aero Drag');
      gui.add(settings, 'flutterScale', 0, 0.6, 0.01).name('Flutter');
      gui.add(settings, 'hoverRadius', 0.2, 2.5, 0.01).name('Hover Radius');
      gui.add(settings, 'hoverImpulse', 0, 4, 0.01).name('Hover Impulse');
      gui.add(settings, 'dragImpulse', 0, 8, 0.01).name('Drag Impulse');
      gui.add(settings, 'maxImpulse', 0.2, 12, 0.05).name('Max Impulse');
      gui.add(settings, 'lerp', 0.02, 0.6, 0.01).name('Sphere Lerp');
      forceGuiTextToParagraphs(gui);
    });
    return () => {
      cancelled = true;
      if (guiRef.current) {
        guiRef.current.destroy();
      }
      guiRef.current = null;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let raf = null;

    const ensureJoints = () => {
      if (cancelled) return;
      const ready = bodyRefs.current.length === cols * rows && bodyRefs.current.every(Boolean);
      if (!ready) {
        raf = requestAnimationFrame(ensureJoints);
        return;
      }

      const joints = [];
      const makeSpring = (aCol, aRow, bCol, bRow, stiffness, damping) => {
        const aIdx = getGridIndex(aCol, aRow, cols);
        const bIdx = getGridIndex(bCol, bRow, cols);
        const bodyA = bodyRefs.current[aIdx];
        const bodyB = bodyRefs.current[bIdx];
        if (!bodyA || !bodyB) return;

        const ax = geometryData.positions[aIdx * 3 + 0];
        const ay = geometryData.positions[aIdx * 3 + 1];
        const az = geometryData.positions[aIdx * 3 + 2];
        const bx = geometryData.positions[bIdx * 3 + 0];
        const by = geometryData.positions[bIdx * 3 + 1];
        const bz = geometryData.positions[bIdx * 3 + 2];
        const rest = Math.hypot(ax - bx, ay - by, az - bz);

        const params = rapier.JointData.spring(rest, stiffness, damping, { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 });
        const joint = world.createImpulseJoint(params, bodyA, bodyB, true);
        joints.push(joint);
      };

      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          if (col < cols - 1) makeSpring(col, row, col + 1, row, CLOTH_CONFIG.stiffnessStructural, CLOTH_CONFIG.dampingStructural);
          if (row < rows - 1) makeSpring(col, row, col, row + 1, CLOTH_CONFIG.stiffnessStructural, CLOTH_CONFIG.dampingStructural);

          if (col < cols - 1 && row < rows - 1) {
            makeSpring(col, row, col + 1, row + 1, CLOTH_CONFIG.stiffnessShear, CLOTH_CONFIG.dampingShear);
          }
          if (col > 0 && row < rows - 1) {
            makeSpring(col, row, col - 1, row + 1, CLOTH_CONFIG.stiffnessShear, CLOTH_CONFIG.dampingShear);
          }

          if (col < cols - 2) makeSpring(col, row, col + 2, row, CLOTH_CONFIG.stiffnessBend, CLOTH_CONFIG.dampingBend);
          if (row < rows - 2) makeSpring(col, row, col, row + 2, CLOTH_CONFIG.stiffnessBend, CLOTH_CONFIG.dampingBend);
        }
      }

      jointsRef.current = joints;
      if (!rapierLoggedRef.current) {
        const totalBodies = bodyRefs.current.filter(Boolean).length;
        const pinnedBodies = nodes.filter((n) => n.isPinned).length;
        const debugMsg = `[work-strip] Rapier cloth active: ${totalBodies} bodies, ${joints.length} joints (${cols}x${rows})`;
        console.warn(
          `[work-strip] Rapier cloth active: ${totalBodies} bodies, ${joints.length} joints (${cols}x${rows}), pinned=${pinnedBodies}`
        );
        onStatus?.(debugMsg);
        rapierLoggedRef.current = true;
      }
    };

    ensureJoints();

    return () => {
      cancelled = true;
      if (raf !== null) cancelAnimationFrame(raf);
      jointsRef.current.forEach((joint) => {
        try {
          world.removeImpulseJoint(joint, true);
        } catch (_) {
          // no-op
        }
      });
      jointsRef.current = [];
    };
  }, [cols, rows, geometryData.positions, onStatus, rapier, world]);

  useEffect(() => {
    const api = {
      setScrollTarget(value) {
        lastBridgeState.current.scrollTarget = value;
      },
      setScrollCurrent(value) {
        lastBridgeState.current.scrollCurrent = value;
      },
      setRevealProgress(value) {
        lastBridgeState.current.revealProgress = value;
      },
      setTransitionState(value) {
        lastBridgeState.current.transition = {
          ...lastBridgeState.current.transition,
          ...value,
        };
      },
      setGroupTransform(value) {
        lastBridgeState.current.groupTransform = {
          ...lastBridgeState.current.groupTransform,
          ...value,
        };
      },
      setVisible(value) {
        lastBridgeState.current.visible = Boolean(value);
      },
      setWindStrength(value) {
        lastBridgeState.current.windStrength = value;
      },
      setStripMetrics(value) {
        lastBridgeState.current.stripMetrics = {
          ...lastBridgeState.current.stripMetrics,
          ...value,
        };
      },
      setCameraPose(value) {
        lastBridgeState.current.cameraPose = value;
      },
      getSlotWorldPoint(u, v, flatten = lastBridgeState.current.transition.flatten) {
        return getWorldPointForUv(u, v, flatten).clone();
      },
      getSlotScreenRect(slotIndex, flatten = lastBridgeState.current.transition.flatten) {
        const metrics = lastBridgeState.current.stripMetrics;
        const scrollCurrent = lastBridgeState.current.scrollCurrent;
        const gapInset = (metrics.gapSize * 0.5) / metrics.itemsOnStrip;
        const isVertical = metrics.axis === 'vertical';
        const start = (slotIndex - scrollCurrent) / metrics.itemsOnStrip + gapInset;
        const end = (slotIndex + 1 - scrollCurrent) / metrics.itemsOnStrip - gapInset;

        const corners = isVertical
          ? [
            getWorldPointForUv(0, 1 - start, flatten).clone(),
            getWorldPointForUv(1, 1 - start, flatten).clone(),
            getWorldPointForUv(0, 1 - end, flatten).clone(),
            getWorldPointForUv(1, 1 - end, flatten).clone(),
          ]
          : [
            getWorldPointForUv(start, 0, flatten).clone(),
            getWorldPointForUv(end, 0, flatten).clone(),
            getWorldPointForUv(start, 1, flatten).clone(),
            getWorldPointForUv(end, 1, flatten).clone(),
          ];

        const projected = corners.map((point) => {
          const p = point.clone().project(camera);
          return {
            x: (p.x * 0.5 + 0.5) * window.innerWidth,
            y: (-p.y * 0.5 + 0.5) * window.innerHeight,
          };
        });

        const xs = projected.map((p) => p.x);
        const ys = projected.map((p) => p.y);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);
        if (!Number.isFinite(minX + maxX + minY + maxY)) return null;

        return {
          x: minX,
          y: minY,
          width: Math.max(1, maxX - minX),
          height: Math.max(1, maxY - minY),
        };
      },
      dispose() { },
    };

    bridge.register(api);
    return () => {
      bridge.unregister(api);
    };
  }, [bridge, camera]);

  useFrame((_, delta) => {
    const state = lastBridgeState.current;
    const transitionProgress = THREE.MathUtils.clamp(state.transition.flatten, 0, 1);
    const isUnwrapTransition = state.transition.transitionMode === 'unwrap';
    const deterministicPhase = isUnwrapTransition && transitionProgress >= 0.6;
    const physicsBlend = isUnwrapTransition
      ? (transitionProgress < 0.6 ? 1 : THREE.MathUtils.clamp(1 - (transitionProgress - 0.6) / 0.4, 0, 1))
      : 1;

    if (groupRef.current) {
      const [px, py, pz] = state.groupTransform.position;
      const [sx, sy, sz] = state.groupTransform.scale;
      const axisRotation = state.stripMetrics.axis === 'vertical' ? Math.PI * 0.5 : 0;
      groupRef.current.position.set(px, py, pz);
      groupRef.current.scale.set(sx, sy, sz);
      groupRef.current.rotation.set(0, 0, state.groupTransform.rotationZ + axisRotation);
      groupRef.current.visible = state.visible;
    }

    if (state.cameraPose) {
      camera.position.set(...state.cameraPose.position);
      camera.rotation.set(...state.cameraPose.rotation);
      camera.fov = state.cameraPose.fov;
      camera.updateProjectionMatrix();
    }

    if (deterministicPhase && !wasDeterministicRef.current) {
      lockedLocalPositionsRef.current = liveLocalPositionsRef.current.slice();
      wasDeterministicRef.current = true;
    } else if (!deterministicPhase && wasDeterministicRef.current) {
      lockedLocalPositionsRef.current = null;
      wasDeterministicRef.current = false;
    }

    const interactionEnabled = getInteractionEnabled();
    if (!interactionEnabled) {
      pointerStateRef.current.mode = 'idle';
      interactionTargetRef.current.set(...CLOTH_CONFIG.interactionOffscreen);
    }

    if (pointerStateRef.current.mode !== 'idle' && interactionEnabled) {
      updatePointerTargetFromNdc(pointerStateRef.current.ndcX, pointerStateRef.current.ndcY);
    } else {
      interactionTargetRef.current.set(...CLOTH_CONFIG.interactionOffscreen);
    }

    const settings = tweakRef.current;
    interactionPosRef.current.lerp(
      interactionTargetRef.current,
      Math.min(1, settings.lerp * 60 * delta)
    );
    if (interactionBodyRef.current) {
      interactionBodyRef.current.setNextKinematicTranslation({
        x: interactionPosRef.current.x,
        y: interactionPosRef.current.y,
        z: interactionPosRef.current.z,
      });
    }

    if (materialRef.current?.uniforms) {
      const u = materialRef.current.uniforms;
      u.uScrollOffset.value = state.scrollCurrent;
      u.uTime.value += delta;
      u.uNonSelectedFade.value = state.transition.nonSelectedFade;
      u.uFocusSlot.value = state.transition.focusSlot;
      u.uIsolateSlot.value = state.transition.isolateSlot;
      u.uTransitionOpacity.value = state.transition.transitionOpacity;
      u.uRevealProgress.value = state.revealProgress;
      u.uItemsOnStrip.value = state.stripMetrics.itemsOnStrip;
      u.uNumUnique.value = state.stripMetrics.numUnique;
      u.uGapSize.value = state.stripMetrics.gapSize;
      u.uAxisVertical.value = state.stripMetrics.axis === 'vertical' ? 1 : 0;
    }

    const t = performance.now() * 0.001;
    const windStrength = Math.max(0, (state.windStrength || settings.windBase) * settings.windMultiplier) * physicsBlend;
    const interactionStrength = pointerStateRef.current.mode === 'drag'
      ? settings.dragImpulse
      : settings.hoverImpulse;
    const centerWindStrength = pointerStateRef.current.mode === 'drag'
      ? settings.dragWindBoost
      : pointerStateRef.current.mode === 'hover'
        ? settings.hoverWindBoost
        : 0;
    const interactionCenter = interactionPosRef.current;
    const interactionRadius = settings.hoverRadius;
    const transitionVelocityDamp = isUnwrapTransition ? THREE.MathUtils.lerp(0.06, 0.34, transitionProgress) : 0;

    for (let row = 1; row < rows; row += 1) {
      const looseFactor = row / (rows - 1);
      for (let col = 0; col < cols; col += 1) {
        const idx = getGridIndex(col, row, cols);
        const body = bodyRefs.current[idx];
        if (!body) continue;
        if (deterministicPhase) {
          const locked = lockedLocalPositionsRef.current;
          if (locked) {
            body.setTranslation({
              x: locked[idx * 3 + 0],
              y: locked[idx * 3 + 1],
              z: locked[idx * 3 + 2],
            }, true);
            body.setLinvel({ x: 0, y: 0, z: 0 }, true);
            body.setAngvel({ x: 0, y: 0, z: 0 }, true);
          }
          continue;
        }
        const tr = body.translation();
        const lv = body.linvel ? body.linvel() : { x: 0, y: 0, z: 0 };

        const gust = 0.55 + Math.sin(t * 0.55 + row * 0.16) * 0.45;
        const flutter = (Math.sin(t * 1.6 + col * 0.23 + row * 0.17) + Math.cos(t * 2.05 + col * 0.11)) * settings.flutterScale;
        const windTargetX = (windStrength * 0.22 + flutter * 0.08) * looseFactor;
        const windTargetY = (flutter * 0.03) * looseFactor;
        const windTargetZ = (windStrength * (0.8 + gust * 0.7) + flutter * 0.1) * looseFactor;
        const centerWindX = -tr.x * centerWindStrength;
        const centerWindY = -(tr.y - STRIP_CONFIG.stripYOffset) * centerWindStrength * 0.35;
        const centerWindZ = -tr.z * centerWindStrength;
        const aeroX = (windTargetX - lv.x) * settings.aeroDrag;
        const aeroY = (windTargetY - lv.y) * settings.aeroDrag;
        const aeroZ = (windTargetZ - lv.z) * settings.aeroDrag;
        const dampX = -lv.x * transitionVelocityDamp;
        const dampY = -lv.y * transitionVelocityDamp;
        const dampZ = -lv.z * transitionVelocityDamp;
        let ix = 0;
        let iy = 0;
        let iz = 0;

        if (interactionEnabled && pointerStateRef.current.mode !== 'idle') {
          const dx = tr.x - interactionCenter.x;
          const dy = tr.y - interactionCenter.y;
          const dz = tr.z - interactionCenter.z;
          const dist = Math.hypot(dx, dy, dz);
          if (dist > 0.0001 && dist < interactionRadius) {
            const falloff = 1 - dist / interactionRadius;
            const impulseMag = Math.min(
              settings.maxImpulse,
              interactionStrength * falloff * falloff
            );
            const inv = 1 / dist;
            ix = dx * inv * impulseMag;
            iy = dy * inv * impulseMag;
            iz = dz * inv * impulseMag;
          }
        }

        body.applyImpulse({
          x: (aeroX * delta + centerWindX * delta + dampX * delta + ix * delta) * physicsBlend,
          y: (aeroY * delta + centerWindY * delta + dampY * delta + iy * delta) * physicsBlend,
          z: (aeroZ * delta + centerWindZ * delta + dampZ * delta + iz * delta) * physicsBlend,
        }, true);
      }
    }

    const positionAttr = geometry.getAttribute('position');
    const liveLocalPositions = liveLocalPositionsRef.current;
    const lockedLocalPositions = lockedLocalPositionsRef.current;

    for (let idx = 0; idx < cols * rows; idx += 1) {
      const body = bodyRefs.current[idx];
      if (!body) continue;
      const tr = body.translation();
      const liveX = lockedLocalPositions ? lockedLocalPositions[idx * 3 + 0] : tr.x;
      const liveY = lockedLocalPositions ? lockedLocalPositions[idx * 3 + 1] : tr.y;
      const liveZ = lockedLocalPositions ? lockedLocalPositions[idx * 3 + 2] : tr.z;
      liveLocalPositions[idx * 3 + 0] = liveX;
      liveLocalPositions[idx * 3 + 1] = liveY;
      liveLocalPositions[idx * 3 + 2] = liveZ;
      const flatX = geometryData.flatPositions[idx * 3 + 0];
      const flatY = geometryData.flatPositions[idx * 3 + 1];
      const flatZ = geometryData.flatPositions[idx * 3 + 2];

      positionAttr.array[idx * 3 + 0] = THREE.MathUtils.lerp(liveX, flatX, transitionProgress);
      positionAttr.array[idx * 3 + 1] = THREE.MathUtils.lerp(liveY, flatY, transitionProgress);
      positionAttr.array[idx * 3 + 2] = THREE.MathUtils.lerp(liveZ, flatZ, transitionProgress);
    }

    positionAttr.needsUpdate = true;
    geometry.computeVertexNormals();
  });

  const nodes = useMemo(() => {
    const generated = [];
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const idx = getGridIndex(col, row, cols);
        const pin = isPinnedSideAnchor(row, col, rows, cols);
        const mass = THREE.MathUtils.lerp(CLOTH_CONFIG.massTop, CLOTH_CONFIG.massBottom, row / Math.max(1, rows - 1));
        generated.push({
          idx,
          row,
          col,
          isPinned: pin,
          mass,
          position: [
            geometryData.positions[idx * 3 + 0],
            geometryData.positions[idx * 3 + 1],
            geometryData.positions[idx * 3 + 2],
          ],
        });
      }
    }
    return generated;
  }, [cols, rows, geometryData.positions]);

  return (
    <>
      {nodes.map((node) => {
        return (
          <RigidBody
            key={node.idx}
            type={node.isPinned ? 'fixed' : 'dynamic'}
            colliders={false}
            position={node.position}
            canSleep={false}
            mass={node.mass}
            linearDamping={CLOTH_CONFIG.linearDamping}
            angularDamping={CLOTH_CONFIG.angularDamping}
            ref={(body) => {
              bodyRefs.current[node.idx] = body;
            }}
          >
            <BallCollider args={[0.035]} />
          </RigidBody>
        );
      })}

      <RigidBody
        type="kinematicPosition"
        colliders={false}
        canSleep={false}
        position={CLOTH_CONFIG.interactionOffscreen}
        ref={interactionBodyRef}
      >
        <BallCollider args={[CLOTH_CONFIG.interactionSphereRadius]} sensor={false} />
      </RigidBody>

      <group ref={groupRef}>
        <mesh
          ref={meshRef}
          geometry={geometry}
          frustumCulled={false}
          onPointerDown={(event) => {
            if (!getInteractionEnabled()) return;
            pointerStateRef.current.isDown = true;
            pointerStateRef.current.moved = false;
            pointerStateRef.current.startX = event.clientX;
            pointerStateRef.current.startY = event.clientY;
            pointerStateRef.current.ndcX = event.pointer.x;
            pointerStateRef.current.ndcY = event.pointer.y;
            pointerStateRef.current.mode = 'hover';
          }}
          onPointerMove={(event) => {
            if (!getInteractionEnabled()) return;
            pointerStateRef.current.ndcX = event.pointer.x;
            pointerStateRef.current.ndcY = event.pointer.y;
            if (pointerStateRef.current.isDown) {
              const dx = event.clientX - pointerStateRef.current.startX;
              const dy = event.clientY - pointerStateRef.current.startY;
              const moved = Math.hypot(dx, dy) > CLOTH_CONFIG.clickDragThreshold;
              pointerStateRef.current.moved = pointerStateRef.current.moved || moved;
              pointerStateRef.current.mode = pointerStateRef.current.moved ? 'drag' : 'hover';
            } else {
              pointerStateRef.current.mode = 'hover';
            }
          }}
          onPointerEnter={(event) => {
            if (!getInteractionEnabled()) return;
            pointerStateRef.current.ndcX = event.pointer.x;
            pointerStateRef.current.ndcY = event.pointer.y;
            if (!pointerStateRef.current.isDown) {
              pointerStateRef.current.mode = 'hover';
            }
            // Light haptic pulse on hover
            getHaptics().trigger([
              { duration: 10 },
            ], { intensity: 1 });
          }}
          onPointerLeave={() => {
            pointerStateRef.current.mode = 'idle';
            pointerStateRef.current.isDown = false;
            pointerStateRef.current.moved = false;
            interactionTargetRef.current.set(...CLOTH_CONFIG.interactionOffscreen);
          }}
          onPointerUp={(event) => {
            const wasDrag = pointerStateRef.current.moved;
            pointerStateRef.current.isDown = false;
            pointerStateRef.current.mode = 'hover';
            pointerStateRef.current.moved = false;
            if (wasDrag) return;
            if (!event.uv) return;
            const metrics = lastBridgeState.current.stripMetrics;
            const axisCoord = metrics.axis === 'vertical' ? (1 - event.uv.y) : event.uv.x;
            const totalU = axisCoord * metrics.itemsOnStrip + lastBridgeState.current.scrollCurrent;
            const itemIdx = ((Math.floor(totalU) % metrics.numUnique) + metrics.numUnique) % metrics.numUnique;
            const slotIndex = Math.floor(totalU);
            const item = workItems[itemIdx];
            if (!item) return;

            bridge.emitItemClick({
              item,
              selectedIndex: itemIdx,
              slotIndex,
              clickNdc: { x: event.pointer.x, y: event.pointer.y },
            });

            // Stronger nudge haptic on click
            getHaptics().trigger([
              { duration: 80, intensity: 0.8 },
              { delay: 80, duration: 50, intensity: 0.3 },
            ]);
          }}
        >
          <shaderMaterial
            ref={materialRef}
            uniforms={uniforms}
            vertexShader={STRIP_VERTEX_SHADER}
            fragmentShader={STRIP_FRAGMENT_SHADER}
            transparent
            side={THREE.FrontSide}
            depthWrite
          />
        </mesh>
      </group>
    </>
  );
}

export function WorkClothStripHost() {
  const [statusText, setStatusText] = useState('Rapier: loading...');

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'auto',
      }}
    >
      <div
        style={{
          position: 'fixed',
          top: 12,
          left: 12,
          zIndex: 2147483647,
          background: 'rgba(0,0,0,0.8)',
          color: '#9df7b6',
          fontFamily: 'monospace',
          fontSize: 12,
          lineHeight: 1.2,
          padding: '8px 10px',
          borderRadius: 6,
          pointerEvents: 'none',
          maxWidth: 'min(92vw, 640px)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {statusText}
      </div>
      <Canvas
        gl={{ alpha: true, antialias: true }}
        camera={{ fov: 50, near: 0.1, far: 200, position: [0, 1, 4] }}
        style={{ background: 'transparent' }}
      >
        <Physics gravity={[0, -7.8, 0]} timeStep={1 / 60} interpolate={false}>
          <WorkClothStripScene onStatus={setStatusText} />
        </Physics>
      </Canvas>
    </div>
  );
}

export default WorkClothStripHost;
