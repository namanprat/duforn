import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";

import { createColorFallbackTexture, loadTextureAssets } from "../../scripts/runtime/assets.js";
import { setRevealTitleText } from "../../scripts/text-reveal.js";
import { getPreloadedTextures } from "../../scripts/work-preload.js";
import { workItems } from "../../data/work-items.js";
import { navigateTo } from "../lib/navigationBridge.js";
import { isWebGPURenderer } from "../components/webgl/createWebGPURenderer.js";
import { logWebGPUOnce } from "../lib/webgpu/debugWebGPU.js";

/* ─────────────────────────────────────────────
   Config
   ───────────────────────────────────────────── */

const NUM_UNIQUE = 6;
const ITEMS_ON_STRIP = 11;
const GAP_SIZE = 0.03;

const COLS = 96;
const ROWS = 48;

/* ─────────────────────────────────────────────
   Arc geometry builder
   ───────────────────────────────────────────── */

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

/* ─────────────────────────────────────────────
   TSL Cloth System — Procedural Wind + Filament BRDF
   ───────────────────────────────────────────── */

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
    min,
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
    length,
    mod,
    dFdx,
    dFdy,
    texture,
    mx_noise_float,
  } = tsl;
  const tslCameraPosition = tsl.cameraPosition;

  const PI = Math.PI;

  // ── Uniforms ───────────────────────────────────────────────
  const uniforms = {
    uTime: uniform(0),
    uScrollOffset: uniform(0),
    uItemsOnStrip: uniform(stripConfig.itemsOnStrip),
    uNumUnique: uniform(stripConfig.numUnique),
    uGapSize: uniform(stripConfig.gapSize),
    uHoverUv: uniform(new THREE.Vector2(0.5, 0.5)),
    uHoverStrength: uniform(0),
    uHoverVelocity: uniform(new THREE.Vector2(0, 0)),
    uHoverRadius: uniform(0.28),

    // Wind & physics
    uWindStrength: uniform(12.0),
    uGravityScale: uniform(2.0),
    uWaveFrequency: uniform(8.0),
    uWaveAmplitude: uniform(0.16),
    uClothSolidity: uniform(15.0),

    // Cloth BRDF
    uRoughness: uniform(0.7),
    uSheenColor: uniform(new THREE.Color(0.93, 0.92, 0.9)),
    uSubsurfaceColor: uniform(new THREE.Color(0.97, 0.9, 0.82)),
    uSubsurfaceStr: uniform(0.35),

    // Light
    uLightDir: uniform(new THREE.Vector3(0.25, 0.75, 0.9)),

    // Textures
    uTex0: uniformTexture(textures[0]),
    uTex1: uniformTexture(textures[1]),
    uTex2: uniformTexture(textures[2]),
    uTex3: uniformTexture(textures[3]),
    uTex4: uniformTexture(textures[4]),
    uTex5: uniformTexture(textures[5]),
  };

  // ── Varyings ───────────────────────────────────────────────
  const vWorldPos = varying(vec3(0), "vWorldPos");
  const vLooseness = varying(float(0), "vLooseness");

  // ── Vertex Shader — Procedural Wind Displacement ───────────
  //
  // Adapted from Shadertoy mdBSWK windPos():
  // - Wind force distributes via noise across the surface
  // - Gravity vector field with root constraints (top pinned)
  // - Sin wave displacement on cloth surface
  // - Time speed driven by F = m*a
  //
  const vertexFn = Fn(() => {
    const pos = positionLocal.toVar();
    const uvCoord = uv();
    const time = uniforms.uTime;

    // uv.y = 0 at top (pinned), 1 at bottom (free)
    const v = uvCoord.y;
    const u = uvCoord.x;

    // Looseness: how free this vertex is from the pin edge
    const looseness = smoothstep(float(0), float(0.25), v);
    vLooseness.assign(looseness);

    // --- Wind physics (from Shadertoy) ---
    // F = m * a => time speed = |windForce| / mass
    const area = float(stripConfig.arcSpan * stripConfig.stripHeight);
    const mass = uniforms.uClothSolidity.mul(area).mul(0.02);
    const windSpeed = uniforms.uWindStrength.div(max(mass, float(0.01)));
    const t = time.mul(windSpeed);

    // Noise-distributed wind variation
    const windNoise = mx_noise_float(vec3(u.mul(2.0), v.mul(2.0), time.mul(0.1)))
      .mul(0.5)
      .add(0.5);

    const hoverDelta = uvCoord.sub(uniforms.uHoverUv);
    const hoverDistance = length(vec2(hoverDelta.x.mul(1.35), hoverDelta.y.mul(0.9)));
    const hoverCore = float(1).sub(
      smoothstep(uniforms.uHoverRadius.mul(0.22), uniforms.uHoverRadius, hoverDistance),
    );
    const hoverAnchorMask = smoothstep(float(0.18), float(0.92), v);
    const hoverPresence = hoverCore.mul(uniforms.uHoverStrength).mul(hoverAnchorMask);
    const hoverVelocityLength = min(length(uniforms.uHoverVelocity), float(1.0));
    const hoverLead = hoverDelta.x
      .mul(uniforms.uHoverVelocity.x)
      .add(hoverDelta.y.mul(uniforms.uHoverVelocity.y));
    const directionalBias = clamp(float(0.7).sub(hoverLead.mul(3.4)), float(0.3), float(1.0));
    const hoverGust = hoverPresence.mul(
      mix(float(1.15), directionalBias.add(0.12), hoverVelocityLength),
    );

    // Gravity sag: increases toward bottom and toward free edge
    const gravitySag = v.mul(v).mul(uniforms.uGravityScale).mul(0.08).mul(looseness);

    // Wind push: forward displacement increasing with looseness
    const windPush = looseness
      .mul(looseness)
      .mul(uniforms.uWaveAmplitude)
      .mul(0.5)
      .mul(windNoise.mul(0.4).add(0.6));

    // Sin waves on cloth surface (from Shadertoy)
    // Multiple frequencies for organic motion
    const freq = uniforms.uWaveFrequency;
    const wave1 = sin(u.mul(freq).sub(t.mul(3.0))).mul(looseness);
    const wave2 = sin(v.mul(freq.mul(0.7)).sub(t.mul(2.0)))
      .mul(looseness)
      .mul(0.5);
    const wave3 = sin(u.mul(freq.mul(2.0)).add(v.mul(freq)).sub(t.mul(4.0)))
      .mul(looseness)
      .mul(0.25);
    const waveDisp = wave1.add(wave2).add(wave3).mul(uniforms.uWaveAmplitude);

    // Cross-wave flutter (higher frequency, smaller amplitude)
    const flutter = sin(u.mul(freq.mul(3.0)).sub(t.mul(5.0)))
      .mul(cos(v.mul(freq.mul(2.0)).add(t.mul(1.5))))
      .mul(looseness)
      .mul(looseness)
      .mul(uniforms.uWaveAmplitude)
      .mul(0.15);

    const hoverLift = hoverGust
      .mul(uniforms.uWaveAmplitude)
      .mul(windNoise.mul(0.25).add(0.75))
      .mul(0.48);
    const hoverRipple = sin(hoverDistance.mul(24.0).sub(t.mul(6.2)))
      .mul(
        cos(
          u
            .mul(freq.mul(0.68))
            .add(v.mul(freq.mul(0.44)))
            .sub(t.mul(1.45)),
        ),
      )
      .mul(hoverGust)
      .mul(uniforms.uWaveAmplitude)
      .mul(0.184);
    const hoverMicroRipple = sin(hoverDistance.mul(38.0).sub(t.mul(8.2)))
      .mul(hoverGust)
      .mul(uniforms.uWaveAmplitude)
      .mul(0.069);
    const hoverSway = uniforms.uHoverVelocity.x.mul(hoverGust).mul(looseness).mul(0.075);

    // Apply displacements
    pos.y.subAssign(gravitySag);
    pos.z.addAssign(waveDisp.add(flutter));
    pos.z.addAssign(windPush);
    pos.z.addAssign(hoverLift.add(hoverRipple).add(hoverMicroRipple));

    // Lateral sway from wind
    const lateralSway = sin(time.mul(0.18)).mul(looseness).mul(0.04);
    pos.x.addAssign(lateralSway.add(hoverSway));

    vWorldPos.assign(modelWorldMatrix.mul(vec4(pos, 1)).xyz);
    return pos;
  });

  // ── Fragment Shader — Filament Cloth BRDF ──────────────────
  //
  // Ported from Shadertoy mdBSWK ClothLighting() + Filament docs:
  // - Ashikhmin NDF for cloth specular
  // - Ashikhmin visibility term
  // - Fresnel Schlick with roughness
  // - Wrapped diffuse with subsurface scattering
  //
  const fragmentFn = Fn(() => {
    const uvCoord = uv();
    const worldPos = vWorldPos;
    const looseness = vLooseness;

    // Normal from screen-space derivatives (fold detail)
    const dpdxVal = dFdx(worldPos);
    const dpdyVal = dFdy(worldPos);
    const foldNormal = normalize(cross(dpdxVal, dpdyVal));
    const geomNormal = normalLocal;
    const normal = normalize(mix(geomNormal, foldNormal, float(0.55)));

    // ── Scrolling UV texture sampling ──
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

    // Sample textures (6 unique)
    const col = texture(uniforms.uTex0, texCoord).rgb.toVar();
    const idx = int(wrappedIndex);
    col.assign(mix(col, texture(uniforms.uTex1, texCoord).rgb, float(idx.equal(int(1)))));
    col.assign(mix(col, texture(uniforms.uTex2, texCoord).rgb, float(idx.equal(int(2)))));
    col.assign(mix(col, texture(uniforms.uTex3, texCoord).rgb, float(idx.equal(int(3)))));
    col.assign(mix(col, texture(uniforms.uTex4, texCoord).rgb, float(idx.equal(int(4)))));
    col.assign(mix(col, texture(uniforms.uTex5, texCoord).rgb, float(idx.equal(int(5)))));

    // ── Filament Cloth BRDF ──

    const viewDir = normalize(tslCameraPosition.sub(worldPos));
    const lightDir = normalize(uniforms.uLightDir);
    const halfVec = normalize(viewDir.add(lightDir));

    const NdotV = max(float(0.001), dot(normal, viewDir));
    const NdotL = max(float(0.0), dot(normal, lightDir));
    const NdotH = max(float(0.001), dot(normal, halfVec));

    // Ashikhmin NDF (from Shadertoy / Filament)
    // D = (sin4h + 4 * exp(-cos2h / (sin2h * r²))) / (π * (1 + 4r²) * sin4h)
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

    // Ashikhmin visibility: V = 1 / (4 * (NdotL + NdotV - NdotL * NdotV))
    const ashikhminV = float(1).div(
      max(float(4).mul(NdotL.add(NdotV).sub(NdotL.mul(NdotV))), float(0.001)),
    );

    // Cloth specular
    const specular = uniforms.uSheenColor.mul(ashikhminD).mul(ashikhminV).mul(NdotL);

    // Wrap lighting — half-Lambert (preserves texture colors)
    const wrap = NdotL.mul(0.5).add(0.5);
    const primaryLight = float(0.55).add(wrap.mul(0.45));

    // Fill light
    const fillDir = normalize(vec3(-0.6, -0.2, 0.5));
    const fillNdotL = max(float(0), dot(normal, fillDir));
    const fillContrib = fillNdotL.mul(0.5).add(0.5).mul(0.08);

    // Rim light
    const rimDir = normalize(vec3(-0.2, 0.1, float(-1.0)));
    const rimNdotL = max(float(0), dot(normal, rimDir));
    const rimContrib = rimNdotL.mul(0.5).add(0.5);
    const rimFinal = rimContrib.mul(rimContrib).mul(0.07);

    // Diffuse: texture * wrap lighting
    const diffuse = col.mul(primaryLight.add(fillContrib).add(rimFinal));

    // Cloth specular sheen (subtle Fresnel edge highlight)
    const sheen = pow(float(1).sub(NdotV), float(2.6));
    const sheenContrib = uniforms.uSheenColor.mul(sheen).mul(0.15);

    // Back-lighting SSS (warm translucency from behind)
    const backlight = max(float(0), dot(normal.negate(), lightDir));
    const sssScatter = backlight.mul(backlight).mul(backlight);
    const subsurface = uniforms.uSubsurfaceColor
      .mul(sssScatter)
      .mul(uniforms.uSubsurfaceStr)
      .mul(looseness.mul(0.6).add(0.4));

    // Combine: diffuse + Ashikhmin specular + sheen + SSS
    const finalColor = diffuse.add(specular.mul(0.3)).add(sheenContrib).add(subsurface).toVar();

    // ── Fold-based ambient occlusion ──
    const foldDeviation = float(1).sub(
      max(float(0), dot(normalize(foldNormal), normalize(geomNormal))),
    );
    const aoFactor = smoothstep(float(-0.15), float(0.3), dot(foldNormal, vec3(0, 1, 0)));
    finalColor.mulAssign(float(0.85).add(aoFactor.mul(0.1)).sub(foldDeviation.mul(0.06)));

    // ── Grain — breaks banding ──
    const grainSeed = fract(uvCoord.mul(800).add(uniforms.uTime.mul(12)));
    const grain = fract(sin(dot(grainSeed, vec2(12.9898, 78.233))).mul(43758.5453))
      .sub(0.5)
      .mul(0.022);
    finalColor.addAssign(grain);

    // ── Edge fade ──
    const edgeFade = smoothstep(float(0), float(0.06), uvCoord.x).mul(
      smoothstep(float(0), float(0.06), float(1).sub(uvCoord.x)),
    );

    return vec4(finalColor, edgeFade);
  });

  // ── Build material ─────────────────────────────────────────
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
        float looseness = smoothstep(0.0, 0.25, uv.y);
        vLooseness = looseness;

        vec3 pos = position;
        float wind = uWindStrength * 0.01;
        float wave1 = sin(uv.x * uWaveFrequency - uTime * (2.0 + wind)) * looseness;
        float wave2 = sin((uv.x + uv.y) * (uWaveFrequency * 0.7) - uTime * 1.8) * looseness * 0.5;
        float flutter = sin(uv.x * (uWaveFrequency * 2.5) - uTime * 4.0) * looseness * looseness * 0.18;

        pos.y -= uv.y * uv.y * 0.16;
        pos.z += (wave1 + wave2) * uWaveAmplitude + flutter;
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

        float light = 0.75 + vLooseness * 0.2 + (1.0 - abs(vUv.x - 0.5) * 2.0) * 0.08;
        float rim = pow(1.0 - abs(vUv.x - 0.5) * 2.0, 2.0) * 0.05;
        gl_FragColor = vec4(color * light + rim, 1.0);
      }
    `,
  });

  return { material, uniforms };
}

/* ─────────────────────────────────────────────
   Main scene component
   ───────────────────────────────────────────── */

export function WorkClothStripScene() {
  const { gl } = useThree();
  const meshRef = useRef();
  const systemRef = useRef(null);

  // ── Config ──
  const strip = { x: 0.0, y: -0.4, z: -4.6, scale: 0.55 };

  const cloth = { roughness: 0.7, sheenR: 0.93, sheenG: 0.92, sheenB: 0.9, subsurfaceStr: 0.35 };

  const wind = {
    windStrength: 5.5,
    waveAmplitude: 0.08,
    waveFrequency: 13.0,
    gravityScale: 2.0,
    clothSolidity: 14.0,
  };

  const arcConfig = { arcRadius: 14.0, arcSpan: 2.8, stripHeight: 5.5, stripYOffset: -1.2 };

  // ── Scroll state ──
  const scrollRef = useRef({ target: 0, current: 0, velocity: 0 });
  const inputRef = useRef({ isDown: false, lastX: 0, startX: 0 });
  const hoverRef = useRef({
    active: false,
    targetStrength: 0,
    currentStrength: 0,
    targetUv: new THREE.Vector2(0.5, 0.5),
    currentUv: new THREE.Vector2(0.5, 0.5),
    lastUv: new THREE.Vector2(0.5, 0.5),
    targetVelocity: new THREE.Vector2(0, 0),
    currentVelocity: new THREE.Vector2(0, 0),
    lastMoveTime: 0,
  });
  const currentTitleRef = useRef("");

  useEffect(() => {
    const onWheel = (e) => {
      e.preventDefault();
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      scrollRef.current.target += delta * 0.004;
      scrollRef.current.velocity += delta * 0.004 * 0.24;
    };

    const onPointerDown = (e) => {
      inputRef.current.isDown = true;
      inputRef.current.lastX = e.clientX;
      inputRef.current.startX = e.clientX;
      inputRef.current.dragDist = 0;
      hoverRef.current.active = false;
      hoverRef.current.targetStrength = 0;
      hoverRef.current.targetVelocity.set(0, 0);
    };

    const onPointerMove = (e) => {
      if (!inputRef.current.isDown) return;
      const dx = e.clientX - inputRef.current.lastX;
      inputRef.current.dragDist = (inputRef.current.dragDist || 0) + Math.abs(dx);
      inputRef.current.lastX = e.clientX;
      scrollRef.current.target -= dx * 0.008;
      scrollRef.current.velocity = -dx * 0.008;
    };

    const onPointerUp = () => {
      inputRef.current.isDown = false;
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, []);

  // ── Textures ──
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

  // ── Geometry (rebuilt when arc config changes) ──
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

  const stripConfig = useMemo(
    () => ({
      itemsOnStrip: ITEMS_ON_STRIP,
      numUnique: NUM_UNIQUE,
      gapSize: GAP_SIZE,
      arcSpan: arcConfig.arcSpan,
      stripHeight: arcConfig.stripHeight,
    }),
    [arcConfig.arcSpan, arcConfig.stripHeight],
  );

  // ── Create TSL material ──
  const [tslMaterial, setTslMaterial] = useState(null);
  const activeTextures = textures || fallbackTextures;

  useEffect(() => {
    let cancelled = false;
    if (!activeTextures) return;

    const createClothSystem = isWebGPURenderer(gl)
      ? createWebGPUClothSystem
      : createWebGLClothSystem;

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

  // ── Per-frame updates ──
  useFrame((state) => {
    const sys = systemRef.current;
    if (!sys) return;

    const time = state.clock.getElapsedTime();
    const u = sys.uniforms;
    const hover = hoverRef.current;

    // Smooth scroll
    const s = scrollRef.current;
    s.current += (s.target - s.current) * 0.08;
    s.velocity *= 0.97;

    // Smooth hover gust
    hover.currentStrength +=
      (hover.targetStrength - hover.currentStrength) * (hover.active ? 0.135 : 0.07);
    hover.currentUv.lerp(hover.targetUv, hover.active ? 0.18 : 0.07);
    hover.currentVelocity.lerp(hover.targetVelocity, hover.active ? 0.16 : 0.08);
    hover.targetVelocity.multiplyScalar(hover.active ? 0.88 : 0.74);
    if (!hover.active && hover.currentStrength < 0.001) {
      hover.currentStrength = 0;
      hover.currentVelocity.set(0, 0);
      hover.targetVelocity.set(0, 0);
    }

    // Update uniforms
    u.uTime.value = time;
    u.uScrollOffset.value = s.current;
    if ("uHoverUv" in u) {
      u.uHoverUv.value.copy(hover.currentUv);
      u.uHoverStrength.value = hover.currentStrength;
      u.uHoverVelocity.value.copy(hover.currentVelocity);
      u.uGravityScale.value = wind.gravityScale;
      u.uClothSolidity.value = wind.clothSolidity;
      u.uRoughness.value = cloth.roughness;
      u.uSheenColor.value.setRGB(cloth.sheenR, cloth.sheenG, cloth.sheenB);
      u.uSubsurfaceStr.value = cloth.subsurfaceStr;
    }

    u.uWindStrength.value = wind.windStrength;
    u.uWaveAmplitude.value = wind.waveAmplitude;
    u.uWaveFrequency.value = wind.waveFrequency;

    // Update title based on center item
    const centerU = 0.5 * ITEMS_ON_STRIP + s.current;
    const centerIdx = ((Math.floor(centerU) % NUM_UNIQUE) + NUM_UNIQUE) % NUM_UNIQUE;
    const newTitle = workItems[centerIdx]?.title || "";
    if (newTitle !== currentTitleRef.current) {
      currentTitleRef.current = newTitle;
      const titleEl = document.querySelector(".slide-title");
      if (titleEl) setRevealTitleText(titleEl, newTitle);
    }
  });

  if (!activeTextures || !tslMaterial) return null;

  const updateHoverFromUv = (uv) => {
    if (!uv || inputRef.current.isDown) return;

    const hover = hoverRef.current;
    const now = typeof performance !== "undefined" ? performance.now() : Date.now();
    const dt = hover.lastMoveTime ? Math.max((now - hover.lastMoveTime) / 1000, 1 / 240) : 1 / 60;
    const dx = uv.x - hover.lastUv.x;
    const dy = uv.y - hover.lastUv.y;

    hover.active = true;
    hover.targetStrength = 1.25;
    hover.targetUv.set(uv.x, uv.y);

    const velocityScale = 2.8;
    hover.targetVelocity.set(
      THREE.MathUtils.clamp(dx / dt / velocityScale, -1, 1),
      THREE.MathUtils.clamp(dy / dt / velocityScale, -1, 1),
    );
    hover.lastUv.copy(hover.targetUv);
    hover.lastMoveTime = now;
  };

  const handlePointerEnter = (e) => {
    if (!e.uv || inputRef.current.isDown) return;
    updateHoverFromUv(e.uv);
  };

  const handlePointerMove = (e) => {
    if (!e.uv || inputRef.current.isDown) return;
    updateHoverFromUv(e.uv);
  };

  const handlePointerLeave = () => {
    const hover = hoverRef.current;
    hover.active = false;
    hover.targetStrength = 0;
    hover.lastMoveTime = 0;
  };

  const handleStripClick = (e) => {
    // Ignore drags (>8px movement)
    if (inputRef.current.dragDist > 8) return;
    if (!e.uv) return;
    e.stopPropagation();

    const totalU = e.uv.x * ITEMS_ON_STRIP + scrollRef.current.current;
    const itemFract = totalU - Math.floor(totalU);
    const halfGap = GAP_SIZE * 0.5;
    // Click landed in a gap between items
    if (itemFract < halfGap || itemFract > 1 - halfGap) return;

    navigateTo("/film");
  };

  return (
    <group position={[strip.x, strip.y, strip.z]} scale={strip.scale}>
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={tslMaterial}
        frustumCulled={false}
        onClick={handleStripClick}
        onPointerEnter={handlePointerEnter}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      />
    </group>
  );
}
