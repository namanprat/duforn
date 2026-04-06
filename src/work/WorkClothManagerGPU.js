// WorkClothManagerGPU — single-body XPBD cloth manager for the work strip.
//
// Adapted from a generic ClothBodyManagerGPU. Specialized for one cloth body
// with pinned anchors along a curved arc. Drops inter-body collision (single
// body), drops wander/attractor logic, drops ground collision by default,
// keeps a sphere collider for hover interaction.
//
// Material is MeshPhysicalNodeMaterial with:
//   - positionNode reading from the GPU positions buffer
//   - normalNode reading from the GPU normals buffer (view-space transformed)
//   - colorNode + opacityNode implementing the slot-based work item display
//     (texture array sampling, gap discard via opacity, edge fade)
//
// All compute passes run on the GPU via TSL kernels and are dispatched
// through renderer.computeAsync(batch).

import * as THREE from "three/webgpu";
import {
  Fn,
  If,
  Loop,
  cameraViewMatrix,
  clamp,
  cos,
  cross,
  dot,
  float,
  floor,
  instancedArray,
  instanceIndex,
  int,
  length,
  mix,
  normalize,
  positionLocal,
  sin,
  smoothstep,
  step,
  texture as tslTexture,
  uniform,
  uv,
  vec2,
  vec3,
  vec4,
  uint,
} from "three/tsl";

const MAX_STRETCH = 8;
const MAX_BEND = 8;
const MAX_TRI_ADJ = 8;

// ─── CPU helpers (constraint topology + initial state) ─────────────────────

function findTriNeighbors(triIds) {
  const edges = [];
  const numTris = triIds.length / 3;

  for (let i = 0; i < numTris; i++) {
    for (let j = 0; j < 3; j++) {
      const id0 = triIds[3 * i + j];
      const id1 = triIds[3 * i + ((j + 1) % 3)];
      edges.push({
        id0: Math.min(id0, id1),
        id1: Math.max(id0, id1),
        edgeNr: 3 * i + j,
      });
    }
  }

  edges.sort((a, b) => (a.id0 !== b.id0 ? a.id0 - b.id0 : a.id1 - b.id1));

  const neighbors = new Int32Array(3 * numTris);
  neighbors.fill(-1);

  let nr = 0;
  while (nr < edges.length) {
    const e0 = edges[nr];
    nr++;
    if (nr < edges.length) {
      const e1 = edges[nr];
      if (e0.id0 === e1.id0 && e0.id1 === e1.id1) {
        neighbors[e0.edgeNr] = e1.edgeNr;
        neighbors[e1.edgeNr] = e0.edgeNr;
        nr++;
      }
    }
  }

  return neighbors;
}

function buildClothData(position, indexArr) {
  const numVerts = position.length / 3;
  const numTris = indexArr.length / 3;

  const pos = new Float32Array(position);

  // Inverse masses from triangle areas
  const invMass = new Float32Array(numVerts);
  for (let i = 0; i < numTris; i++) {
    const a = indexArr[i * 3];
    const b = indexArr[i * 3 + 1];
    const c = indexArr[i * 3 + 2];
    const e0x = pos[b * 3] - pos[a * 3];
    const e0y = pos[b * 3 + 1] - pos[a * 3 + 1];
    const e0z = pos[b * 3 + 2] - pos[a * 3 + 2];
    const e1x = pos[c * 3] - pos[a * 3];
    const e1y = pos[c * 3 + 1] - pos[a * 3 + 1];
    const e1z = pos[c * 3 + 2] - pos[a * 3 + 2];
    const cx = e0y * e1z - e0z * e1y;
    const cy = e0z * e1x - e0x * e1z;
    const cz = e0x * e1y - e0y * e1x;
    const area = 0.5 * Math.sqrt(cx * cx + cy * cy + cz * cz);
    const w = area > 0 ? 1 / (area * 3) : 0;
    invMass[a] += w;
    invMass[b] += w;
    invMass[c] += w;
  }

  const neighbors = findTriNeighbors(indexArr);
  const stretchEdges = [];
  const bendPairSet = new Set();
  const bendPairs = [];

  for (let i = 0; i < numTris; i++) {
    for (let j = 0; j < 3; j++) {
      const id0 = indexArr[3 * i + j];
      const id1 = indexArr[3 * i + ((j + 1) % 3)];
      const n = neighbors[3 * i + j];

      if (n < 0 || id0 < id1) {
        stretchEdges.push([id0, id1]);
      }

      if (n >= 0) {
        const ni = Math.floor(n / 3);
        const nj = n % 3;
        const id2 = indexArr[3 * i + ((j + 2) % 3)];
        const id3 = indexArr[3 * ni + ((nj + 2) % 3)];
        const key = Math.min(id2, id3) * numVerts + Math.max(id2, id3);
        if (!bendPairSet.has(key)) {
          bendPairSet.add(key);
          bendPairs.push([id2, id3]);
        }
      }
    }
  }

  const stretchData = new Float32Array(numVerts * MAX_STRETCH * 2);
  const stretchCounts = new Float32Array(numVerts);

  for (const [a, b] of stretchEdges) {
    const dx = pos[a * 3] - pos[b * 3];
    const dy = pos[a * 3 + 1] - pos[b * 3 + 1];
    const dz = pos[a * 3 + 2] - pos[b * 3 + 2];
    const restLen = Math.sqrt(dx * dx + dy * dy + dz * dz);

    let c = stretchCounts[a];
    if (c < MAX_STRETCH) {
      stretchData[(a * MAX_STRETCH + c) * 2] = b;
      stretchData[(a * MAX_STRETCH + c) * 2 + 1] = restLen;
      stretchCounts[a]++;
    }
    c = stretchCounts[b];
    if (c < MAX_STRETCH) {
      stretchData[(b * MAX_STRETCH + c) * 2] = a;
      stretchData[(b * MAX_STRETCH + c) * 2 + 1] = restLen;
      stretchCounts[b]++;
    }
  }

  const bendData = new Float32Array(numVerts * MAX_BEND * 2);
  const bendCounts = new Float32Array(numVerts);

  for (const [id2, id3] of bendPairs) {
    const dx = pos[id2 * 3] - pos[id3 * 3];
    const dy = pos[id2 * 3 + 1] - pos[id3 * 3 + 1];
    const dz = pos[id2 * 3 + 2] - pos[id3 * 3 + 2];
    const restLen = Math.sqrt(dx * dx + dy * dy + dz * dz);

    let c = bendCounts[id2];
    if (c < MAX_BEND) {
      bendData[(id2 * MAX_BEND + c) * 2] = id3;
      bendData[(id2 * MAX_BEND + c) * 2 + 1] = restLen;
      bendCounts[id2]++;
    }
    c = bendCounts[id3];
    if (c < MAX_BEND) {
      bendData[(id3 * MAX_BEND + c) * 2] = id2;
      bendData[(id3 * MAX_BEND + c) * 2 + 1] = restLen;
      bendCounts[id3]++;
    }
  }

  const triAdjData = new Float32Array(numVerts * MAX_TRI_ADJ * 4);
  const triAdjCounts = new Float32Array(numVerts);

  for (let i = 0; i < numTris; i++) {
    const a = indexArr[i * 3];
    const b = indexArr[i * 3 + 1];
    const c = indexArr[i * 3 + 2];
    const verts = [
      [a, b, c],
      [b, c, a],
      [c, a, b],
    ];
    for (const [v, next, prev] of verts) {
      const cnt = triAdjCounts[v];
      if (cnt < MAX_TRI_ADJ) {
        const base = (v * MAX_TRI_ADJ + cnt) * 4;
        triAdjData[base] = next;
        triAdjData[base + 1] = prev;
        triAdjData[base + 2] = 0;
        triAdjData[base + 3] = 0;
        triAdjCounts[v]++;
      }
    }
  }

  const triIndicesData = new Float32Array(numTris * 4);
  for (let i = 0; i < numTris; i++) {
    triIndicesData[i * 4] = indexArr[i * 3];
    triIndicesData[i * 4 + 1] = indexArr[i * 3 + 1];
    triIndicesData[i * 4 + 2] = indexArr[i * 3 + 2];
  }

  // Rest volume via divergence theorem (around origin since cushion is centered)
  let restVolume = 0;
  for (let i = 0; i < numTris; i++) {
    const a = indexArr[i * 3];
    const b = indexArr[i * 3 + 1];
    const c = indexArr[i * 3 + 2];
    const p0x = pos[a * 3];
    const p0y = pos[a * 3 + 1];
    const p0z = pos[a * 3 + 2];
    const p1x = pos[b * 3];
    const p1y = pos[b * 3 + 1];
    const p1z = pos[b * 3 + 2];
    const p2x = pos[c * 3];
    const p2y = pos[c * 3 + 1];
    const p2z = pos[c * 3 + 2];
    restVolume +=
      p0x * (p1y * p2z - p1z * p2y) + p0y * (p1z * p2x - p1x * p2z) + p0z * (p1x * p2y - p1y * p2x);
  }
  restVolume /= 6;

  return {
    numVerts,
    numTris,
    pos,
    invMass,
    stretchData,
    stretchCounts,
    bendData,
    bendCounts,
    triAdjData,
    triAdjCounts,
    triIndicesData,
    restVolume,
  };
}

// ─── WorkClothManagerGPU class ────────────────────────────────────────────

export class WorkClothManagerGPU {
  numSubsteps = 15;
  gravity = -9;
  stretchingCompliance = 0.0;
  bendingCompliance = 0.5;
  pressure = 6;
  pressureRampTime = 0.4;
  pressureStiffness = 0.5;
  damping = 0.02;
  timescale = 1;

  // Sphere collider used for hover push
  sphereColliderEnabled = false;
  sphereColliderPosition = [0, 0, 0];
  sphereColliderRadius = 0.4;
  sphereColliderStrength = 60;

  #renderer;
  #numVerts;
  #numTris;
  #numPins;

  #simTime = 0;
  #substepAccumulator = 0;

  #data;
  #pinIndicesArr; // Int32Array of vertex indices that are pinned

  // Uniforms
  #dtU;
  #gravityU;
  #dampingU;
  #pressureU;
  #pressureStiffnessU;
  #restVolumeU;
  #stretchAlphaU;
  #bendAlphaU;
  #sphereColliderPositionU;
  #sphereColliderRadiusU;
  #sphereColliderStrengthU;
  #sphereColliderEnabledU;
  #simTimeU;

  // Material/display uniforms
  #scrollOffsetU;
  #visibleItemsU;
  #gapSizeU;
  #numUniqueU;
  #timeU;

  // GPU buffers
  #buffers;
  #pinTargetsArr; // Float32Array length numPins*3 (CPU side)

  // Compute passes
  #passComputeVolume;
  #passApplyPins;
  #passPreSolve;
  #passSolveConstraints;
  #passComputeNormals;
  #passReset;

  // Display
  #mesh;
  #material;
  #textures;

  constructor({
    cushion,
    offset = [0, 0, 0],
    pinIndices,
    pinTargets,
    textures,
    visibleItems,
    gapSize,
    renderer,
    params = {},
  }) {
    Object.assign(this, params);

    this.#renderer = renderer;
    this.#textures = textures;

    // Apply offset to cushion positions before building cloth data
    const offsetPos = new Float32Array(cushion.position.length);
    for (let i = 0; i < cushion.position.length; i += 3) {
      offsetPos[i] = cushion.position[i] + offset[0];
      offsetPos[i + 1] = cushion.position[i + 1] + offset[1];
      offsetPos[i + 2] = cushion.position[i + 2] + offset[2];
    }

    const data = buildClothData(offsetPos, cushion.index);
    this.#data = data;
    this.#numVerts = data.numVerts;
    this.#numTris = data.numTris;

    // Apply pins (zero out invMass for pinned vertices)
    this.#pinIndicesArr = new Int32Array(pinIndices);
    for (const idx of this.#pinIndicesArr) {
      data.invMass[idx] = 0;
    }
    // Snap pinned positions to their targets in initial state
    for (let i = 0; i < this.#pinIndicesArr.length; i++) {
      const vi = this.#pinIndicesArr[i];
      data.pos[vi * 3] = pinTargets[i][0];
      data.pos[vi * 3 + 1] = pinTargets[i][1];
      data.pos[vi * 3 + 2] = pinTargets[i][2];
    }
    this.#numPins = this.#pinIndicesArr.length;

    // Pin target buffer (Float32Array length numPins*3)
    this.#pinTargetsArr = new Float32Array(this.#numPins * 3);
    for (let i = 0; i < this.#numPins; i++) {
      this.#pinTargetsArr[i * 3] = pinTargets[i][0];
      this.#pinTargetsArr[i * 3 + 1] = pinTargets[i][1];
      this.#pinTargetsArr[i * 3 + 2] = pinTargets[i][2];
    }

    // Uniforms
    this.#dtU = uniform(1 / 60 / this.numSubsteps);
    this.#gravityU = uniform(this.gravity);
    this.#dampingU = uniform(this.damping);
    this.#pressureU = uniform(this.pressure);
    this.#pressureStiffnessU = uniform(this.pressureStiffness);
    this.#restVolumeU = uniform(data.restVolume);
    this.#stretchAlphaU = uniform(0.0);
    this.#bendAlphaU = uniform(0.0);
    this.#sphereColliderPositionU = uniform(new THREE.Vector3(...this.sphereColliderPosition));
    this.#sphereColliderRadiusU = uniform(this.sphereColliderRadius);
    this.#sphereColliderStrengthU = uniform(this.sphereColliderStrength);
    this.#sphereColliderEnabledU = uniform(this.sphereColliderEnabled ? 1 : 0);
    this.#simTimeU = uniform(0);

    this.#scrollOffsetU = uniform(0);
    this.#visibleItemsU = uniform(visibleItems);
    this.#gapSizeU = uniform(gapSize);
    this.#numUniqueU = uniform(textures.length);
    this.#timeU = uniform(0);

    this.#buffers = this.#createGPUBuffers(data);
    this.#createComputePasses();
    this.#createDisplayMesh(cushion.uv);
  }

  // ─── GPU buffer setup ────────────────────────────────────────────────────

  #createGPUBuffers(data) {
    return {
      positions: instancedArray(data.pos, "vec3"),
      prevPositions: instancedArray(new Float32Array(data.pos), "vec3"),
      invMasses: instancedArray(data.invMass, "float"),
      initialPositions: instancedArray(new Float32Array(data.pos), "vec3"),
      stretchNeighbors: instancedArray(data.stretchData, "vec2"),
      stretchCounts: instancedArray(data.stretchCounts, "float"),
      bendNeighbors: instancedArray(data.bendData, "vec2"),
      bendCounts: instancedArray(data.bendCounts, "float"),
      triAdj: instancedArray(data.triAdjData, "vec4"),
      triAdjCounts: instancedArray(data.triAdjCounts, "float"),
      triIndices: instancedArray(data.triIndicesData, "vec4"),
      volumeBuffer: instancedArray(1, "float"),
      normalsBuffer: instancedArray(this.#numVerts * 4, "vec4"),
      pinIndices: instancedArray(new Float32Array(this.#pinIndicesArr), "float"),
      pinTargets: instancedArray(this.#pinTargetsArr, "vec3"),
    };
  }

  // ─── Compute passes ──────────────────────────────────────────────────────

  #createComputePasses() {
    const {
      positions,
      prevPositions,
      invMasses,
      initialPositions,
      stretchNeighbors,
      stretchCounts,
      bendNeighbors,
      bendCounts,
      triAdj,
      triAdjCounts,
      triIndices,
      volumeBuffer,
      normalsBuffer,
      pinIndices,
      pinTargets,
    } = this.#buffers;

    const numVerts = this.#numVerts;
    const numTris = this.#numTris;
    const numPins = this.#numPins;

    const numVertsU = uint(numVerts);
    const numPinsU = uint(numPins);

    const dtU = this.#dtU;
    const gravityU = this.#gravityU;
    const dampingU = this.#dampingU;
    const pressureU = this.#pressureU;
    const pressureStiffnessU = this.#pressureStiffnessU;
    const restVolumeU = this.#restVolumeU;
    const stretchAlphaU = this.#stretchAlphaU;
    const bendAlphaU = this.#bendAlphaU;
    const sphereColliderPosU = this.#sphereColliderPositionU;
    const sphereColliderRadU = this.#sphereColliderRadiusU;
    const sphereColliderStrU = this.#sphereColliderStrengthU;
    const sphereColliderEnabledU = this.#sphereColliderEnabledU;

    // 1. Compute volume (single body — single thread)
    this.#passComputeVolume = Fn(() => {
      const vol = float(0).toVar();
      Loop(numTris, ({ i }) => {
        const tri = triIndices.element(i);
        const p0 = positions.element(uint(tri.x));
        const p1 = positions.element(uint(tri.y));
        const p2 = positions.element(uint(tri.z));
        vol.addAssign(dot(p0, cross(p1, p2)));
      });
      volumeBuffer.element(uint(0)).assign(vol.div(6));
    })().compute(1);

    // 2. Apply pins (snap pinned vertices to current targets)
    this.#passApplyPins = Fn(() => {
      const i = instanceIndex;
      If(i.lessThan(numPinsU), () => {
        const vi = uint(pinIndices.element(i));
        const target = pinTargets.element(i);
        positions.element(vi).assign(target);
        prevPositions.element(vi).assign(target);
      });
    })().compute(Math.max(numPins, 1));

    // 3. Pre-solve — pressure + gravity + sphere collider + integration
    this.#passPreSolve = Fn(() => {
      const i = instanceIndex;

      If(i.lessThan(numVertsU), () => {
        const invM = invMasses.element(i);

        If(invM.greaterThan(0), () => {
          const pos = positions.element(i);
          const prevPos = prevPositions.element(i);

          const vel = pos.sub(prevPos).div(dtU).toVar();

          // Pressure
          const vol = volumeBuffer.element(uint(0));
          const absVol = vol.abs().max(1e-10);
          const P = pressureU.add(pressureStiffnessU.mul(restVolumeU.div(absVol).sub(1)));

          const triCount = uint(triAdjCounts.element(i));
          const pressureForce = vec3(0, 0, 0).toVar();

          Loop(triCount, ({ i: j }) => {
            const tri = triAdj.element(i.mul(MAX_TRI_ADJ).add(j));
            const pNext = positions.element(uint(tri.x));
            const pPrev = positions.element(uint(tri.y));
            pressureForce.addAssign(cross(pNext, pPrev));
          });

          vel.addAssign(pressureForce.mul(P.div(6).mul(dtU).mul(invM)));

          // Gravity
          vel.y.addAssign(gravityU.mul(dtU));

          // Sphere collider repulsion (mouse hover)
          If(sphereColliderEnabledU.greaterThan(0), () => {
            const sDiff = pos.sub(sphereColliderPosU);
            const sDist = length(sDiff);
            If(sDist.lessThan(sphereColliderRadU).and(sDist.greaterThan(1e-6)), () => {
              const overlap = sphereColliderRadU.sub(sDist);
              const force = overlap.mul(sphereColliderStrU).mul(dtU);
              vel.addAssign(sDiff.div(sDist).mul(force));
            });
          });

          // Damping
          vel.mulAssign(float(1).sub(dampingU));

          // Save previous position
          prevPos.assign(pos);

          // Integrate
          pos.addAssign(vel.mul(dtU));
        });
      });
    })().compute(numVerts);

    // 4. Solve stretch + bend constraints (Jacobi)
    this.#passSolveConstraints = Fn(() => {
      const i = instanceIndex;

      If(i.lessThan(numVertsU), () => {
        const myInvM = invMasses.element(i);

        If(myInvM.greaterThan(0), () => {
          // Stretch phase
          const myPos = positions.element(i).toVar();
          const stretchCorr = vec3(0, 0, 0).toVar();
          const sCount = uint(stretchCounts.element(i));

          Loop(sCount, ({ i: j }) => {
            const neighbor = stretchNeighbors.element(i.mul(MAX_STRETCH).add(j));
            const otherId = uint(neighbor.x);
            const restLen = neighbor.y;
            const otherPos = positions.element(otherId);
            const otherInvM = invMasses.element(otherId);

            const diff = myPos.sub(otherPos).toVar();
            const len = length(diff);

            If(len.greaterThan(1e-6), () => {
              const grad = diff.div(len);
              const C = len.sub(restLen);
              const w = myInvM.add(otherInvM);
              const s = C.negate().div(w.add(stretchAlphaU));
              stretchCorr.addAssign(grad.mul(s.mul(myInvM)));
            });
          });

          If(sCount.greaterThan(uint(0)), () => {
            positions.element(i).assign(myPos.add(stretchCorr.div(float(sCount))));
          });

          // Bend phase
          const myPos2 = positions.element(i).toVar();
          const bendCorr = vec3(0, 0, 0).toVar();
          const bCount = uint(bendCounts.element(i));

          Loop(bCount, ({ i: j }) => {
            const neighbor = bendNeighbors.element(i.mul(MAX_BEND).add(j));
            const otherId = uint(neighbor.x);
            const restLen = neighbor.y;
            const otherPos = positions.element(otherId);
            const otherInvM = invMasses.element(otherId);

            const diff = myPos2.sub(otherPos).toVar();
            const len = length(diff);

            If(len.greaterThan(1e-6), () => {
              const grad = diff.div(len);
              const C = len.sub(restLen);
              const w = myInvM.add(otherInvM);
              const s = C.negate().div(w.add(bendAlphaU));
              bendCorr.addAssign(grad.mul(s.mul(myInvM)));
            });
          });

          If(bCount.greaterThan(uint(0)), () => {
            positions.element(i).assign(myPos2.add(bendCorr.div(float(bCount))));
          });
        });
      });
    })().compute(numVerts);

    // 5. Compute vertex normals
    this.#passComputeNormals = Fn(() => {
      const i = instanceIndex;

      If(i.lessThan(numVertsU), () => {
        const normal = vec3(0, 0, 0).toVar();
        const count = uint(triAdjCounts.element(i));

        Loop(count, ({ i: j }) => {
          const tri = triAdj.element(i.mul(MAX_TRI_ADJ).add(j));
          const pNext = positions.element(uint(tri.x));
          const pPrev = positions.element(uint(tri.y));
          const pSelf = positions.element(i);
          normal.addAssign(cross(pNext.sub(pSelf), pPrev.sub(pSelf)));
        });

        const len = length(normal);
        const isValid = step(float(1e-6), len);
        const safeNormal = mix(vec3(0, 1, 0), normal.div(len.max(float(1e-6))), isValid);
        normalsBuffer.element(i).assign(vec4(safeNormal, 0));
      });
    })().compute(numVerts);

    // 6. Reset
    this.#passReset = Fn(() => {
      If(instanceIndex.lessThan(numVertsU), () => {
        positions.element(instanceIndex).assign(initialPositions.element(instanceIndex));
        prevPositions.element(instanceIndex).assign(initialPositions.element(instanceIndex));
      });
    })().compute(numVerts);
  }

  // ─── Display mesh + material ─────────────────────────────────────────────

  #createDisplayMesh(uvData) {
    const { positions, normalsBuffer } = this.#buffers;
    const data = this.#data;

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(data.pos, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvData, 2));
    geometry.setIndex(Array.from(data.numTris ? new Uint32Array(this.#flattenIndex()) : []));
    geometry.computeVertexNormals();

    const material = new THREE.MeshPhysicalNodeMaterial({
      roughness: 0.62,
      metalness: 0,
      sheen: 1.0,
      sheenRoughness: 0.55,
      sheenColor: new THREE.Color(0.92, 0.88, 0.82),
      side: THREE.DoubleSide,
      transparent: true,
      alphaTest: 0.01,
      depthWrite: false,
    });

    // Position from sim buffer
    material.positionNode = Fn(() => {
      return positions
        .element(uint(positionLocal.x).mul(0).add(uint(0)))
        .add(0)
        .add(positions.element(uint(0)).mul(0));
    });
    // Reassign with the proper vertex-index based read.
    material.positionNode = positions.toAttribute();

    // Normals from sim buffer (transformed to view space later)
    material.normalNode = cameraViewMatrix.transformDirection(normalsBuffer.toAttribute().xyz);

    // Slot-based texture color
    const scrollU = this.#scrollOffsetU;
    const visibleItemsU = this.#visibleItemsU;
    const gapSizeU = this.#gapSizeU;
    const numUniqueU = this.#numUniqueU;
    const textures = this.#textures;

    material.colorNode = Fn(() => {
      const baseUv = uv();
      const slotPitch = float(1).add(gapSizeU);
      const trackCoord = baseUv.x.mul(visibleItemsU.mul(slotPitch)).add(scrollU);
      const slotIndex = floor(trackCoord.div(slotPitch)).toVar();
      const localCoord = trackCoord.sub(slotIndex.mul(slotPitch)).toVar();

      const texCoord = clamp(vec2(localCoord, baseUv.y), vec2(0.001), vec2(0.999));

      const wrappedIdx = slotIndex.mod(numUniqueU).toVar();
      wrappedIdx.assign(
        mix(wrappedIdx, wrappedIdx.add(numUniqueU), step(wrappedIdx, float(-0.001))),
      );
      const itemIndex = int(wrappedIdx);

      const color = tslTexture(textures[0], texCoord).rgb.toVar();
      for (let n = 1; n < textures.length; n++) {
        color.assign(
          mix(color, tslTexture(textures[n], texCoord).rgb, float(itemIndex.equal(int(n)))),
        );
      }
      return color;
    })();

    material.opacityNode = Fn(() => {
      const baseUv = uv();
      const slotPitch = float(1).add(gapSizeU);
      const trackCoord = baseUv.x.mul(visibleItemsU.mul(slotPitch)).add(scrollU);
      const slotIndex = floor(trackCoord.div(slotPitch));
      const localCoord = trackCoord.sub(slotIndex.mul(slotPitch));
      const inSlot = step(float(0.001), localCoord).mul(step(localCoord, float(0.999)));
      const edgeFade = smoothstep(float(0), float(0.04), baseUv.y).mul(
        smoothstep(float(0), float(0.04), float(1).sub(baseUv.y)),
      );
      return inSlot.mul(edgeFade);
    })();

    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    mesh.castShadow = false;
    mesh.receiveShadow = false;

    this.#mesh = mesh;
    this.#material = material;
  }

  #flattenIndex() {
    // The cushion already provides a JS array of indices. Stored on data.
    // Re-derive from triIndicesData (faster than capturing original).
    const out = new Array(this.#numTris * 3);
    const tri = this.#data.triIndicesData;
    for (let i = 0; i < this.#numTris; i++) {
      out[i * 3] = tri[i * 4];
      out[i * 3 + 1] = tri[i * 4 + 1];
      out[i * 3 + 2] = tri[i * 4 + 2];
    }
    return out;
  }

  // ─── Public API ──────────────────────────────────────────────────────────

  get mesh() {
    return this.#mesh;
  }

  get material() {
    return this.#material;
  }

  setScroll(value) {
    this.#scrollOffsetU.value = value;
  }

  setTime(value) {
    this.#timeU.value = value;
  }

  setSphereCollider({ enabled, position, radius, strength }) {
    if (typeof enabled === "boolean") {
      this.sphereColliderEnabled = enabled;
      this.#sphereColliderEnabledU.value = enabled ? 1 : 0;
    }
    if (position) {
      this.sphereColliderPosition = position;
      this.#sphereColliderPositionU.value.set(position[0], position[1], position[2]);
    }
    if (typeof radius === "number") {
      this.sphereColliderRadius = radius;
      this.#sphereColliderRadiusU.value = radius;
    }
    if (typeof strength === "number") {
      this.sphereColliderStrength = strength;
      this.#sphereColliderStrengthU.value = strength;
    }
  }

  setSimParams({
    gravity,
    pressure,
    pressureStiffness,
    bendingCompliance,
    stretchingCompliance,
    damping,
    numSubsteps,
  }) {
    if (typeof gravity === "number") this.gravity = gravity;
    if (typeof pressure === "number") this.pressure = pressure;
    if (typeof pressureStiffness === "number") this.pressureStiffness = pressureStiffness;
    if (typeof bendingCompliance === "number") this.bendingCompliance = bendingCompliance;
    if (typeof stretchingCompliance === "number") this.stretchingCompliance = stretchingCompliance;
    if (typeof damping === "number") this.damping = damping;
    if (typeof numSubsteps === "number") this.numSubsteps = Math.max(1, Math.round(numSubsteps));
  }

  async compute() {
    const sdt = 1 / 60 / this.numSubsteps;

    this.#substepAccumulator += this.numSubsteps * this.timescale;
    const stepsThisFrame = Math.floor(this.#substepAccumulator);
    this.#substepAccumulator -= stepsThisFrame;

    if (stepsThisFrame === 0) return;

    this.#simTime += stepsThisFrame * sdt;
    const pressureRamp = Math.min(1, this.#simTime / this.pressureRampTime);

    this.#dtU.value = sdt;
    this.#gravityU.value = this.gravity;
    this.#dampingU.value = this.damping;
    this.#pressureU.value = this.pressure * pressureRamp;
    this.#pressureStiffnessU.value = this.pressureStiffness;
    this.#stretchAlphaU.value = this.stretchingCompliance / sdt / sdt;
    this.#bendAlphaU.value = this.bendingCompliance / sdt / sdt;
    this.#simTimeU.value = this.#simTime;

    const batch = [];

    batch.push(this.#passComputeVolume);
    batch.push(this.#passApplyPins);

    for (let s = 0; s < stepsThisFrame; s++) {
      batch.push(this.#passApplyPins);
      batch.push(this.#passPreSolve);
      batch.push(this.#passSolveConstraints);
      batch.push(this.#passApplyPins);
    }

    batch.push(this.#passComputeNormals);

    await this.#renderer.computeAsync(batch);
  }

  async reset() {
    this.#simTime = 0;
    this.#substepAccumulator = 0;
    await this.#renderer.computeAsync(this.#passReset);
  }

  dispose() {
    if (this.#mesh) {
      if (this.#mesh.parent) this.#mesh.parent.remove(this.#mesh);
      this.#mesh.geometry.dispose();
    }
    if (this.#material) this.#material.dispose();
    this.#mesh = null;
    this.#material = null;
  }
}
