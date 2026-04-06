import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";

import {
  configureTexture,
  createColorFallbackTexture,
  loadTextureAssets,
} from "../../scripts/runtime/assets.js";
import { setRevealTitleText } from "../../scripts/text-reveal.js";
import { workItems } from "../../data/work-items.js";
import { navigateTo } from "../lib/navigationBridge.js";
import { isWebGPURenderer } from "../components/webgl/createWebGPURenderer.js";
import { logWebGPUOnce } from "../lib/webgpu/debugWebGPU.js";
import { useWorkSceneControlsStore } from "../store/workSceneControls.js";
import { buildCurvedStripGeometry } from "./workClothGeometry.js";
import {
  COLS,
  DEFAULT_GAP_SIZE,
  DEFAULT_VISIBLE_ITEMS,
  DRAG_CLICK_THRESHOLD_PX,
  ROWS,
} from "./workStripConfig.js";
import {
  applyDragDeltaToScroll,
  applyWheelToScroll,
  createScrollState,
  stepScrollState,
} from "./workStripMotion.js";
import { getActiveStripItemIndex, resolveVisibleSlotAtUv } from "./workStripMath.js";

const FALLBACK_COLOR = [222, 216, 208, 255];

async function createWebGPUStripMaterial(textures, stripConfig) {
  logWebGPUOnce("work-strip-webgpu", "WorkStrip", "Using procedural WebGPU fabric strip");

  const { MeshBasicNodeMaterial } = await import("three/webgpu");
  const tsl = await import("three/tsl");
  const {
    abs,
    cameraPosition,
    clamp,
    cross,
    dFdx,
    dFdy,
    Discard,
    dot,
    float,
    floor,
    Fn,
    If,
    int,
    length,
    max,
    mix,
    mod,
    modelWorldMatrix,
    normalize,
    positionLocal,
    pow,
    sin,
    smoothstep,
    step,
    texture,
    uniform,
    uniformTexture,
    uv,
    varying,
    vec2,
    vec3,
    vec4,
  } = tsl;

  const uniforms = {
    uTime: uniform(0),
    uScrollOffset: uniform(0),
    uScrollVelocity: uniform(0),
    uVisibleItems: uniform(stripConfig.visibleItems),
    uGapSize: uniform(stripConfig.gapSize),
    uNumUnique: uniform(textures.length),
    uWaveAmplitude: uniform(stripConfig.waveAmplitude),
    uWaveFrequency: uniform(stripConfig.waveFrequency),
    uWindStrength: uniform(stripConfig.windStrength),
    uHoverStrength: uniform(0),
    uHoverUv: uniform(new THREE.Vector2(0.5, 0.5)),
    uRoughness: uniform(stripConfig.roughness),
    uSheenColor: uniform(
      new THREE.Color(stripConfig.sheenR, stripConfig.sheenG, stripConfig.sheenB),
    ),
    uSubsurfaceColor: uniform(new THREE.Color(0.96, 0.9, 0.84)),
    uSubsurfaceStr: uniform(stripConfig.subsurfaceStr),
    uTex0: uniformTexture(textures[0]),
    uTex1: uniformTexture(textures[1]),
    uTex2: uniformTexture(textures[2]),
    uTex3: uniformTexture(textures[3]),
    uTex4: uniformTexture(textures[4]),
    uTex5: uniformTexture(textures[5]),
  };

  const vWorldPos = varying(vec3(0), "vWorldPos");
  const vLooseness = varying(float(0), "vLooseness");

  const positionNode = Fn(() => {
    const baseUv = uv();
    const pos = positionLocal.toVar();
    const looseness = smoothstep(float(0.04), float(0.92), baseUv.y);
    const centeredX = baseUv.x.sub(float(0.5));
    const mainWave = sin(
      uniforms.uTime
        .mul(float(1.2))
        .sub(baseUv.x.mul(uniforms.uWaveFrequency.mul(float(1.4))))
        .add(baseUv.y.mul(float(2.8))),
    );
    const flutter = sin(
      uniforms.uTime
        .mul(float(3.2))
        .add(baseUv.x.mul(uniforms.uWaveFrequency.mul(float(3.0))))
        .sub(baseUv.y.mul(float(5.4))),
    );
    const dragBend = clamp(uniforms.uScrollVelocity.mul(float(12)), float(-1.4), float(1.4));
    const hoverDelta = baseUv.sub(uniforms.uHoverUv);
    const hoverDist = length(hoverDelta.mul(vec2(1.35, 0.9)));
    const hoverPull = smoothstep(float(0.26), float(0.04), hoverDist).mul(uniforms.uHoverStrength);
    const edgeSoftness = float(1)
      .sub(abs(centeredX).mul(float(2)))
      .clamp(0, 1);

    pos.z.addAssign(mainWave.mul(uniforms.uWaveAmplitude).mul(looseness).mul(float(0.34)));
    pos.z.addAssign(
      flutter.mul(uniforms.uWaveAmplitude).mul(looseness).mul(looseness).mul(float(0.18)),
    );
    pos.z.addAssign(hoverPull.mul(float(0.2)));
    pos.z.addAssign(dragBend.mul(looseness).mul(float(0.085)));
    pos.x.addAssign(
      dragBend
        .mul(looseness)
        .mul(float(0.05))
        .mul(baseUv.y.sub(float(0.3))),
    );
    pos.x.addAssign(flutter.mul(looseness).mul(float(0.04)).mul(edgeSoftness));
    pos.y.subAssign(looseness.mul(looseness).mul(float(0.08)));

    vLooseness.assign(looseness);
    vWorldPos.assign(modelWorldMatrix.mul(vec4(pos, 1)).xyz);

    return pos;
  });

  const fragmentNode = Fn(() => {
    const baseUv = uv();
    const slotPitch = float(1).add(uniforms.uGapSize);
    const trackCoord = baseUv.x
      .mul(uniforms.uVisibleItems.mul(slotPitch))
      .add(uniforms.uScrollOffset);
    const slotIndex = floor(trackCoord.div(slotPitch)).toVar();
    const localCoord = trackCoord.sub(slotIndex.mul(slotPitch)).toVar();

    If(localCoord.lessThan(float(0.001)).or(localCoord.greaterThan(float(0.999))), () => {
      Discard();
    });

    const texCoord = clamp(vec2(localCoord, baseUv.y), vec2(0.001), vec2(0.999));
    const wrappedIdx = mod(slotIndex, uniforms.uNumUnique).toVar();
    wrappedIdx.assign(
      mix(wrappedIdx, wrappedIdx.add(uniforms.uNumUnique), step(wrappedIdx, float(-0.001))),
    );

    const color = texture(uniforms.uTex0, texCoord).rgb.toVar();
    const itemIndex = int(wrappedIdx);
    color.assign(mix(color, texture(uniforms.uTex1, texCoord).rgb, float(itemIndex.equal(int(1)))));
    color.assign(mix(color, texture(uniforms.uTex2, texCoord).rgb, float(itemIndex.equal(int(2)))));
    color.assign(mix(color, texture(uniforms.uTex3, texCoord).rgb, float(itemIndex.equal(int(3)))));
    color.assign(mix(color, texture(uniforms.uTex4, texCoord).rgb, float(itemIndex.equal(int(4)))));
    color.assign(mix(color, texture(uniforms.uTex5, texCoord).rgb, float(itemIndex.equal(int(5)))));

    const luma = dot(color, vec3(0.299, 0.587, 0.114));
    color.assign(mix(vec3(luma), color, float(1.12)));

    const dpdxVal = dFdx(vWorldPos);
    const dpdyVal = dFdy(vWorldPos);
    const normal = normalize(cross(dpdxVal, dpdyVal));
    const viewDir = normalize(cameraPosition.sub(vWorldPos));
    const lightDir = normalize(vec3(0.18, 0.72, 0.96));
    const halfVec = normalize(viewDir.add(lightDir));
    const NdotV = max(float(0.001), dot(normal, viewDir));
    const NdotL = max(float(0.001), dot(normal, lightDir));
    const NdotH = max(float(0.001), dot(normal, halfVec));
    const roughness = clamp(uniforms.uRoughness, float(0.08), float(1));
    const roughnessSq = roughness.mul(roughness);
    const denom = max(
      float(Math.PI).mul(
        pow(
          NdotH.mul(NdotH)
            .mul(roughnessSq.sub(float(1)))
            .add(float(1)),
          float(2),
        ),
      ),
      float(0.0001),
    );
    const specular = uniforms.uSheenColor.mul(roughnessSq.div(denom)).mul(NdotL).mul(float(0.085));
    const wrapLight = NdotL.mul(float(0.52)).add(float(0.48));
    const rim = pow(float(1).sub(NdotV), float(2.6)).mul(float(0.16));
    const backlight = max(float(0), dot(normal.negate(), lightDir));
    const subsurface = uniforms.uSubsurfaceColor
      .mul(pow(backlight, float(3)))
      .mul(uniforms.uSubsurfaceStr)
      .mul(vLooseness.mul(float(0.65)).add(float(0.35)));
    const weave = sin(texCoord.x.mul(float(150)))
      .mul(sin(texCoord.y.mul(float(120))))
      .mul(float(0.018));
    const edgeFade = smoothstep(float(0), float(0.03), baseUv.y).mul(
      smoothstep(float(0), float(0.03), float(1).sub(baseUv.y)),
    );

    return vec4(
      color
        .mul(float(0.58).add(wrapLight.mul(float(0.45))))
        .add(specular)
        .add(vec3(rim))
        .add(subsurface)
        .add(vec3(weave)),
      edgeFade,
    );
  });

  const material = new MeshBasicNodeMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: true,
    side: THREE.DoubleSide,
  });

  material.positionNode = positionNode();
  material.fragmentNode = fragmentNode();

  return { material, uniforms };
}

function createWebGLStripMaterial(textures, stripConfig) {
  logWebGPUOnce("work-strip-webgl", "WorkStrip", "Using procedural WebGL fabric strip");

  const uniforms = {
    uTime: { value: 0 },
    uScrollOffset: { value: 0 },
    uScrollVelocity: { value: 0 },
    uVisibleItems: { value: stripConfig.visibleItems },
    uGapSize: { value: stripConfig.gapSize },
    uNumUnique: { value: textures.length },
    uWaveAmplitude: { value: stripConfig.waveAmplitude },
    uWaveFrequency: { value: stripConfig.waveFrequency },
    uWindStrength: { value: stripConfig.windStrength },
    uHoverStrength: { value: 0 },
    uHoverUv: { value: new THREE.Vector2(0.5, 0.5) },
    uRoughness: { value: stripConfig.roughness },
    uSheenColor: {
      value: new THREE.Color(stripConfig.sheenR, stripConfig.sheenG, stripConfig.sheenB),
    },
    uSubsurfaceColor: { value: new THREE.Color(0.96, 0.9, 0.84) },
    uSubsurfaceStr: { value: stripConfig.subsurfaceStr },
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
      uniform float uScrollVelocity;
      uniform float uWaveAmplitude;
      uniform float uWaveFrequency;
      uniform float uHoverStrength;
      uniform vec2 uHoverUv;
      varying vec2 vUv;
      varying float vLooseness;
      varying vec3 vWorldPos;

      void main() {
        vUv = uv;
        float looseness = smoothstep(0.04, 0.92, uv.y);
        vLooseness = looseness;
        vec3 pos = position;
        float mainWave = sin(uTime * 1.2 - uv.x * uWaveFrequency * 1.4 + uv.y * 2.8);
        float flutter = sin(uTime * 3.2 + uv.x * uWaveFrequency * 3.0 - uv.y * 5.4);
        float dragBend = clamp(uScrollVelocity * 12.0, -1.4, 1.4);
        float hoverDist = length((uv - uHoverUv) * vec2(1.35, 0.9));
        float hoverPull = smoothstep(0.26, 0.04, hoverDist) * uHoverStrength;
        float edgeSoftness = clamp(1.0 - abs(uv.x - 0.5) * 2.0, 0.0, 1.0);

        pos.z += mainWave * uWaveAmplitude * looseness * 0.34;
        pos.z += flutter * uWaveAmplitude * looseness * looseness * 0.18;
        pos.z += hoverPull * 0.2;
        pos.z += dragBend * looseness * 0.085;
        pos.x += dragBend * looseness * 0.05 * (uv.y - 0.3);
        pos.x += flutter * looseness * 0.04 * edgeSoftness;
        pos.y -= looseness * looseness * 0.08;

        vec4 world = modelMatrix * vec4(pos, 1.0);
        vWorldPos = world.xyz;
        gl_Position = projectionMatrix * viewMatrix * world;
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
      uniform float uVisibleItems;
      uniform float uGapSize;
      uniform float uNumUnique;
      uniform float uRoughness;
      uniform vec3 uSheenColor;
      uniform vec3 uSubsurfaceColor;
      uniform float uSubsurfaceStr;
      varying vec2 vUv;
      varying float vLooseness;
      varying vec3 vWorldPos;

      vec3 sampleTex(int idx, vec2 coord) {
        if (idx == 0) return texture2D(uTex0, coord).rgb;
        if (idx == 1) return texture2D(uTex1, coord).rgb;
        if (idx == 2) return texture2D(uTex2, coord).rgb;
        if (idx == 3) return texture2D(uTex3, coord).rgb;
        if (idx == 4) return texture2D(uTex4, coord).rgb;
        return texture2D(uTex5, coord).rgb;
      }

      void main() {
        float slotPitch = 1.0 + uGapSize;
        float trackCoord = vUv.x * uVisibleItems * slotPitch + uScrollOffset;
        float slotIndex = floor(trackCoord / slotPitch);
        float localCoord = trackCoord - slotIndex * slotPitch;
        if (localCoord <= 0.001 || localCoord >= 0.999) discard;

        int wrapped = int(mod(slotIndex + uNumUnique * 100.0, uNumUnique));
        vec2 texCoord = clamp(vec2(localCoord, vUv.y), vec2(0.001), vec2(0.999));
        vec3 color = sampleTex(wrapped, texCoord);
        float luma = dot(color, vec3(0.299, 0.587, 0.114));
        color = mix(vec3(luma), color, 1.12);

        vec3 dpdxVal = dFdx(vWorldPos);
        vec3 dpdyVal = dFdy(vWorldPos);
        vec3 normal = normalize(cross(dpdxVal, dpdyVal));
        vec3 viewDir = normalize(cameraPosition - vWorldPos);
        vec3 lightDir = normalize(vec3(0.18, 0.72, 0.96));
        vec3 halfVec = normalize(viewDir + lightDir);
        float NdotV = max(0.001, dot(normal, viewDir));
        float NdotL = max(0.001, dot(normal, lightDir));
        float NdotH = max(0.001, dot(normal, halfVec));
        float roughnessSq = max(0.08, uRoughness);
        roughnessSq *= roughnessSq;
        float denom = max(3.14159265 * pow(NdotH * NdotH * (roughnessSq - 1.0) + 1.0, 2.0), 0.0001);
        vec3 specular = uSheenColor * (roughnessSq / denom) * NdotL * 0.085;
        float wrapLight = NdotL * 0.52 + 0.48;
        float rim = pow(1.0 - NdotV, 2.6) * 0.16;
        float backlight = max(0.0, dot(-normal, lightDir));
        vec3 subsurface = uSubsurfaceColor * pow(backlight, 3.0) * uSubsurfaceStr * (vLooseness * 0.65 + 0.35);
        float weave = sin(texCoord.x * 150.0) * sin(texCoord.y * 120.0) * 0.018;
        float edgeFade = smoothstep(0.0, 0.03, vUv.y) * smoothstep(0.0, 0.03, 1.0 - vUv.y);

        gl_FragColor = vec4(color * (0.58 + wrapLight * 0.45) + specular + vec3(rim) + subsurface + vec3(weave), edgeFade);
      }
    `,
  });

  return { material, uniforms };
}

export function WorkStrip() {
  const meshRef = useRef(null);
  const systemRef = useRef(null);
  const scrollRef = useRef(createScrollState());
  const inputRef = useRef({ isDown: false, lastX: 0, dragDist: 0 });
  const hoverRef = useRef({
    active: false,
    targetStrength: 0,
    currentStrength: 0,
    targetUv: new THREE.Vector2(0.5, 0.5),
    currentUv: new THREE.Vector2(0.5, 0.5),
  });
  const currentTitleRef = useRef("");
  const currentHrefRef = useRef("");
  const { gl } = useThree();
  const controls = useWorkSceneControlsStore((state) => state.controls);
  const stripCtrl = controls.strip;
  const itemCount = Math.max(workItems.length, 1);
  const visibleItems = stripCtrl.visibleItems ?? DEFAULT_VISIBLE_ITEMS;
  const gapSize = stripCtrl.gapSize ?? DEFAULT_GAP_SIZE;

  const stripConfig = useMemo(
    () => ({
      visibleItems,
      gapSize,
      curveRadius: stripCtrl.curveRadius,
      curveAmount: stripCtrl.curveAmount,
      stripHeight: stripCtrl.stripHeight,
      stripYOffset: stripCtrl.stripYOffset,
      bottomSway: stripCtrl.bottomSway,
      depthOffset: stripCtrl.depthOffset,
      roughness: stripCtrl.roughness,
      sheenR: stripCtrl.sheenR,
      sheenG: stripCtrl.sheenG,
      sheenB: stripCtrl.sheenB,
      subsurfaceStr: stripCtrl.subsurfaceStr,
      waveAmplitude: stripCtrl.waveAmplitude,
      waveFrequency: stripCtrl.waveFrequency,
      windStrength: stripCtrl.windStrength,
      hoverStrength: stripCtrl.hoverStrength,
      wheelSensitivity: stripCtrl.wheelSensitivity,
      dragSensitivity: stripCtrl.dragSensitivity,
      dragVelocityScale: stripCtrl.dragVelocityScale,
      scrollLerp: stripCtrl.scrollLerp,
      scrollDamping: stripCtrl.scrollDamping,
      scrollDraggingDamping: stripCtrl.scrollDraggingDamping,
      snapVelocityThreshold: stripCtrl.snapVelocityThreshold,
      snapLerp: stripCtrl.snapLerp,
      snapEpsilon: stripCtrl.snapEpsilon,
    }),
    [
      gapSize,
      stripCtrl.bottomSway,
      stripCtrl.curveAmount,
      stripCtrl.curveRadius,
      stripCtrl.depthOffset,
      stripCtrl.dragSensitivity,
      stripCtrl.dragVelocityScale,
      stripCtrl.hoverStrength,
      stripCtrl.roughness,
      stripCtrl.sheenB,
      stripCtrl.sheenG,
      stripCtrl.sheenR,
      stripCtrl.snapEpsilon,
      stripCtrl.snapLerp,
      stripCtrl.snapVelocityThreshold,
      stripCtrl.scrollDamping,
      stripCtrl.scrollDraggingDamping,
      stripCtrl.scrollLerp,
      stripCtrl.stripHeight,
      stripCtrl.stripYOffset,
      stripCtrl.subsurfaceStr,
      stripCtrl.waveAmplitude,
      stripCtrl.waveFrequency,
      stripCtrl.wheelSensitivity,
      stripCtrl.windStrength,
      visibleItems,
    ],
  );

  const geometry = useMemo(
    () =>
      buildCurvedStripGeometry(
        COLS,
        ROWS,
        stripConfig.curveRadius,
        stripConfig.curveAmount,
        stripConfig.stripHeight,
        stripConfig.stripYOffset,
        stripConfig.bottomSway,
        stripCtrl.depthOffset,
      ),
    [
      stripConfig.bottomSway,
      stripConfig.curveAmount,
      stripConfig.curveRadius,
      stripConfig.stripHeight,
      stripConfig.stripYOffset,
      stripCtrl.depthOffset,
    ],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);

  const [ready, setReady] = useState(false);
  const fallbackTextures = useMemo(
    () =>
      workItems.map(() =>
        createColorFallbackTexture({
          rgba: FALLBACK_COLOR,
          wrapS: THREE.ClampToEdgeWrapping,
          wrapT: THREE.ClampToEdgeWrapping,
        }),
      ),
    [],
  );

  useEffect(() => {
    let cancelled = false;

    fallbackTextures.forEach((texture) => {
      configureTexture(texture, {
        renderer: gl,
        wrapS: THREE.ClampToEdgeWrapping,
        wrapT: THREE.ClampToEdgeWrapping,
      });
    });

    const build = isWebGPURenderer(gl)
      ? createWebGPUStripMaterial(fallbackTextures, stripConfig)
      : Promise.resolve(createWebGLStripMaterial(fallbackTextures, stripConfig));

    build
      .then((system) => {
        if (cancelled) {
          system.material.dispose();
          return;
        }

        systemRef.current = system;
        setReady(true);
      })
      .catch((error) => {
        console.error("[WorkStrip] material build failed", error);
      });

    return () => {
      cancelled = true;
      setReady(false);
      const system = systemRef.current;
      if (system) system.material.dispose();
      systemRef.current = null;
    };
  }, [fallbackTextures, gl, stripConfig]);

  useEffect(() => {
    if (!ready) return undefined;

    let cancelled = false;
    const images = workItems.map((item) => item.image);

    loadTextureAssets(images, {
      renderer: gl,
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      onErrorTexture: () =>
        createColorFallbackTexture({
          rgba: FALLBACK_COLOR,
          wrapS: THREE.ClampToEdgeWrapping,
          wrapT: THREE.ClampToEdgeWrapping,
        }),
    })
      .then((textures) => {
        if (cancelled) return;

        textures.forEach((texture) => {
          configureTexture(texture, {
            renderer: gl,
            wrapS: THREE.ClampToEdgeWrapping,
            wrapT: THREE.ClampToEdgeWrapping,
          });
        });

        const system = systemRef.current;
        if (!system) return;
        const uniforms = system.uniforms;
        uniforms.uTex0.value = textures[0];
        uniforms.uTex1.value = textures[1];
        uniforms.uTex2.value = textures[2];
        uniforms.uTex3.value = textures[3];
        uniforms.uTex4.value = textures[4];
        uniforms.uTex5.value = textures[5];
        system.material.needsUpdate = true;
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [gl, ready]);

  useEffect(() => {
    const element = gl.domElement;

    const onWheel = (event) => {
      event.preventDefault();
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      applyWheelToScroll(scrollRef.current, delta, stripConfig.wheelSensitivity);
    };

    const onPointerDown = (event) => {
      if (event.button !== 0) return;
      inputRef.current.isDown = true;
      inputRef.current.lastX = event.clientX;
      inputRef.current.dragDist = 0;
      hoverRef.current.active = false;
      hoverRef.current.targetStrength = 0;
    };

    const onPointerMove = (event) => {
      if (!inputRef.current.isDown) return;
      const deltaX = event.clientX - inputRef.current.lastX;
      inputRef.current.dragDist += Math.abs(deltaX);
      inputRef.current.lastX = event.clientX;
      applyDragDeltaToScroll(
        scrollRef.current,
        deltaX,
        stripConfig.dragSensitivity,
        stripConfig.dragVelocityScale,
      );
    };

    const onPointerUp = () => {
      inputRef.current.isDown = false;
    };

    element.addEventListener("wheel", onWheel, { passive: false });
    element.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    return () => {
      element.removeEventListener("wheel", onWheel);
      element.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [gl, stripConfig]);

  useFrame(() => {
    const system = systemRef.current;
    if (!system) return;

    const scroll = scrollRef.current;
    const hover = hoverRef.current;
    const uniforms = system.uniforms;

    stepScrollState(scroll, {
      isDragging: inputRef.current.isDown,
      visibleItems,
      gapSize,
      lerp: stripConfig.scrollLerp,
      damping: stripConfig.scrollDamping,
      draggingDamping: stripConfig.scrollDraggingDamping,
      snapVelocityThreshold: stripConfig.snapVelocityThreshold,
      snapLerp: stripConfig.snapLerp,
      snapEpsilon: stripConfig.snapEpsilon,
    });

    hover.currentStrength +=
      (hover.targetStrength - hover.currentStrength) * (hover.active ? 0.16 : 0.08);
    hover.currentUv.lerp(hover.targetUv, hover.active ? 0.22 : 0.08);

    uniforms.uTime.value = performance.now() * 0.001;
    uniforms.uScrollOffset.value = scroll.current;
    uniforms.uScrollVelocity.value = scroll.velocity;
    uniforms.uVisibleItems.value = visibleItems;
    uniforms.uGapSize.value = gapSize;
    uniforms.uNumUnique.value = itemCount;
    uniforms.uWaveAmplitude.value = stripCtrl.waveAmplitude;
    uniforms.uWaveFrequency.value = stripCtrl.waveFrequency;
    uniforms.uWindStrength.value = stripCtrl.windStrength;
    uniforms.uHoverStrength.value = hover.currentStrength;
    uniforms.uHoverUv.value.copy(hover.currentUv);
    if ("uRoughness" in uniforms) uniforms.uRoughness.value = stripCtrl.roughness;
    if ("uSubsurfaceStr" in uniforms) uniforms.uSubsurfaceStr.value = stripCtrl.subsurfaceStr;
    if ("uSheenColor" in uniforms)
      uniforms.uSheenColor.value.setRGB(stripCtrl.sheenR, stripCtrl.sheenG, stripCtrl.sheenB);

    const activeIndex = getActiveStripItemIndex(scroll.current, visibleItems, gapSize, itemCount);
    const activeItem = workItems[activeIndex];
    const nextTitle = activeItem?.title ?? "";
    const nextHref = activeItem?.href ?? "";

    if (nextTitle !== currentTitleRef.current || nextHref !== currentHrefRef.current) {
      currentTitleRef.current = nextTitle;
      currentHrefRef.current = nextHref;
      const titleElement = document.querySelector(".slide-title");
      if (titleElement) {
        setRevealTitleText(titleElement, nextTitle);
        titleElement.dataset.href = nextHref;
        titleElement.classList.toggle("work-slide-title--inactive", !nextHref);
      }
    }
  });

  const updateHover = (event) => {
    if (!event?.uv || inputRef.current.isDown) return;
    hoverRef.current.active = true;
    hoverRef.current.targetStrength = stripCtrl.hoverStrength;
    hoverRef.current.targetUv.set(event.uv.x, event.uv.y);
  };

  const handlePointerLeave = () => {
    hoverRef.current.active = false;
    hoverRef.current.targetStrength = 0;
  };

  const handleStripClick = (event) => {
    if (inputRef.current.dragDist > DRAG_CLICK_THRESHOLD_PX || !event.uv) return;

    const hit = resolveVisibleSlotAtUv(
      event.uv.x,
      scrollRef.current.current,
      visibleItems,
      gapSize,
      itemCount,
    );
    if (!hit) return;

    const href = workItems[hit.itemIndex]?.href;
    if (href) {
      event.stopPropagation();
      navigateTo(href);
    }
  };

  if (!ready || !systemRef.current) return null;

  return (
    <group position={[stripCtrl.x, stripCtrl.y, stripCtrl.z]} scale={stripCtrl.scale}>
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={systemRef.current.material}
        frustumCulled={false}
        onClick={handleStripClick}
        onPointerEnter={updateHover}
        onPointerMove={updateHover}
        onPointerLeave={handlePointerLeave}
      />
    </group>
  );
}
