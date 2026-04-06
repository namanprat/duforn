// workClothCushion — rectangular cushion geometry adapter.
//
// Adapts the square Cushion class to non-square dimensions while preserving
// the same vertex layout (top face → bottom face → side strips with outward
// winding fix). UVs span [0,1] across X (long axis = scroll axis) and
// [0,1] across Z (short axis = vertical / hang direction).
//
// Vertex indexing inside each face:
//   vi = row * (subdivX + 1) + col
//   row in [0..subdivZ], col in [0..subdivX]
// Top face occupies indices [0, vertsPerFace), bottom face occupies
// [vertsPerFace, 2*vertsPerFace).
//
// The "back row" of the top face (row = subdivZ → z = +halfZ) is what the
// strip pins to the curved arc. Indices: subdivZ * (subdivX + 1) + col.

export function buildWorkClothCushion({ sizeX, sizeZ, subdivX, subdivZ, thicknessGap }) {
  const nx = subdivX;
  const nz = subdivZ;
  const halfX = sizeX / 2;
  const halfZ = sizeZ / 2;
  const gap = thicknessGap;

  const vertsPerFace = (nx + 1) * (nz + 1);
  const totalVerts = vertsPerFace * 2;

  const position = new Float32Array(totalVerts * 3);
  const uvData = new Float32Array(totalVerts * 2);

  // Top face (y = +gap/2)
  for (let row = 0; row <= nz; row++) {
    for (let col = 0; col <= nx; col++) {
      const vi = row * (nx + 1) + col;
      const i = vi * 3;
      position[i] = -halfX + (col / nx) * sizeX;
      position[i + 1] = gap / 2;
      position[i + 2] = -halfZ + (row / nz) * sizeZ;

      uvData[vi * 2] = col / nx;
      uvData[vi * 2 + 1] = row / nz;
    }
  }

  // Bottom face (y = -gap/2). UVs slightly contracted so side strips get
  // non-degenerate UVs (matches original Cushion's eps trick).
  const epsX = gap / Math.max(sizeX, 1e-6);
  const epsZ = gap / Math.max(sizeZ, 1e-6);
  for (let row = 0; row <= nz; row++) {
    for (let col = 0; col <= nx; col++) {
      const vi = vertsPerFace + row * (nx + 1) + col;
      const i = vi * 3;
      position[i] = -halfX + (col / nx) * sizeX;
      position[i + 1] = -gap / 2;
      position[i + 2] = -halfZ + (row / nz) * sizeZ;

      uvData[vi * 2] = (col / nx) * (1 - 2 * epsX) + epsX;
      uvData[vi * 2 + 1] = (row / nz) * (1 - 2 * epsZ) + epsZ;
    }
  }

  const faces = [];

  // Top face triangles
  for (let row = 0; row < nz; row++) {
    for (let col = 0; col < nx; col++) {
      const tl = row * (nx + 1) + col;
      const tr = tl + 1;
      const bl = (row + 1) * (nx + 1) + col;
      const br = bl + 1;
      faces.push([tl, tr, br]);
      faces.push([tl, br, bl]);
    }
  }

  // Bottom face triangles
  for (let row = 0; row < nz; row++) {
    for (let col = 0; col < nx; col++) {
      const tl = vertsPerFace + row * (nx + 1) + col;
      const tr = tl + 1;
      const bl = vertsPerFace + (row + 1) * (nx + 1) + col;
      const br = bl + 1;
      faces.push([tl, tr, br]);
      faces.push([tl, br, bl]);
    }
  }

  // Front side strip (row=0, z=-halfZ)
  for (let col = 0; col < nx; col++) {
    const t0 = col;
    const t1 = col + 1;
    const b0 = vertsPerFace + col;
    const b1 = vertsPerFace + col + 1;
    faces.push([t0, t1, b1]);
    faces.push([t0, b1, b0]);
  }

  // Back side strip (row=nz, z=+halfZ)
  for (let col = 0; col < nx; col++) {
    const t0 = nz * (nx + 1) + col;
    const t1 = t0 + 1;
    const b0 = vertsPerFace + nz * (nx + 1) + col;
    const b1 = b0 + 1;
    faces.push([t0, t1, b1]);
    faces.push([t0, b1, b0]);
  }

  // Left side strip (col=0, x=-halfX)
  for (let row = 0; row < nz; row++) {
    const t0 = row * (nx + 1);
    const t1 = (row + 1) * (nx + 1);
    const b0 = vertsPerFace + row * (nx + 1);
    const b1 = vertsPerFace + (row + 1) * (nx + 1);
    faces.push([t0, t1, b1]);
    faces.push([t0, b1, b0]);
  }

  // Right side strip (col=nx, x=+halfX)
  for (let row = 0; row < nz; row++) {
    const t0 = row * (nx + 1) + nx;
    const t1 = (row + 1) * (nx + 1) + nx;
    const b0 = vertsPerFace + row * (nx + 1) + nx;
    const b1 = vertsPerFace + (row + 1) * (nx + 1) + nx;
    faces.push([t0, t1, b1]);
    faces.push([t0, b1, b0]);
  }

  // Fix winding so all face normals point outward (centroid · normal > 0
  // since the cushion is centered on origin).
  const index = [];
  for (const [a, b, c] of faces) {
    const abx = position[b * 3] - position[a * 3];
    const aby = position[b * 3 + 1] - position[a * 3 + 1];
    const abz = position[b * 3 + 2] - position[a * 3 + 2];
    const acx = position[c * 3] - position[a * 3];
    const acy = position[c * 3 + 1] - position[a * 3 + 1];
    const acz = position[c * 3 + 2] - position[a * 3 + 2];
    const nx2 = aby * acz - abz * acy;
    const ny2 = abz * acx - abx * acz;
    const nz2 = abx * acy - aby * acx;
    const cx = (position[a * 3] + position[b * 3] + position[c * 3]) / 3;
    const cy = (position[a * 3 + 1] + position[b * 3 + 1] + position[c * 3 + 1]) / 3;
    const cz = (position[a * 3 + 2] + position[b * 3 + 2] + position[c * 3 + 2]) / 3;
    const dot = nx2 * cx + ny2 * cy + nz2 * cz;
    if (dot > 0) index.push(a, b, c);
    else index.push(a, c, b);
  }

  // Compute back-row top-face indices for arc pinning convenience.
  const backRowIndices = new Array(nx + 1);
  for (let col = 0; col <= nx; col++) {
    backRowIndices[col] = nz * (nx + 1) + col;
  }

  return {
    position,
    index,
    uv: uvData,
    vertsPerFace,
    totalVerts,
    backRowIndices,
    subdivX: nx,
    subdivZ: nz,
  };
}
