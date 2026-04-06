import * as THREE from "three";

/**
 * Builds a curved cloth strip rest shape inspired by a cylindrical gallery:
 * the strip wraps around a moderate cylinder and the lower half hangs with a
 * slight side-to-side sway so the mesh reads like fabric rather than a rigid arc.
 *
 * @param {number} cols  - vertex columns
 * @param {number} rows  - vertex rows
 * @param {number} curveRadius
 * @param {number} curveAmount - total angle in radians across the strip width
 * @param {number} height    - strip height in world units
 * @param {number} yOffset   - vertical centre offset
 * @param {number} bottomSway
 * @param {number} depthOffset
 * @returns {THREE.BufferGeometry}
 */
export function buildCurvedStripGeometry(
  cols,
  rows,
  curveRadius,
  curveAmount,
  height,
  yOffset,
  bottomSway = 0,
  depthOffset = 0,
) {
  const count = cols * rows;
  const positions = new Float32Array(count * 3);
  const uvs = new Float32Array(count * 2);
  const indices = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const u = c / (cols - 1);
      const v = r / (rows - 1);
      const i = r * cols + c;
      const angle = (u - 0.5) * curveAmount;
      const looseness = THREE.MathUtils.smoothstep(v, 0.08, 0.96);
      const sideSway = Math.sin((u - 0.5) * Math.PI * 2.0) * bottomSway * looseness;
      const verticalDrop = looseness * looseness * 0.18;

      positions[i * 3] = Math.sin(angle) * curveRadius + sideSway;
      positions[i * 3 + 1] = yOffset + (v - 0.5) * height - verticalDrop;
      positions[i * 3 + 2] = (Math.cos(angle) - 1) * curveRadius + depthOffset - looseness * 0.05;
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
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}

/**
 * Returns the same curved strip rest positions used by the visual geometry.
 */
export function buildCurvedStripRestPositions(
  cols,
  rows,
  curveRadius,
  curveAmount,
  height,
  yOffset,
  bottomSway = 0,
  depthOffset = 0,
) {
  const count = cols * rows;
  const positions = new Float32Array(count * 3);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const u = c / (cols - 1);
      const v = r / (rows - 1);
      const i = r * cols + c;
      const angle = (u - 0.5) * curveAmount;
      const looseness = THREE.MathUtils.smoothstep(v, 0.08, 0.96);
      const sideSway = Math.sin((u - 0.5) * Math.PI * 2.0) * bottomSway * looseness;
      const verticalDrop = looseness * looseness * 0.18;

      positions[i * 3] = Math.sin(angle) * curveRadius + sideSway;
      positions[i * 3 + 1] = yOffset + (v - 0.5) * height - verticalDrop;
      positions[i * 3 + 2] = (Math.cos(angle) - 1) * curveRadius + depthOffset - looseness * 0.05;
    }
  }
  return positions;
}
