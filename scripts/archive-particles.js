import * as THREE from 'three';

const PV_CONFIG = {
    // These are scaled for local space of the logo model (which is scaled 70x in archive.js)
    // Experiment to get the ~2000px feel equivalent in local space.
    distortionRadius: 10.0,   // equivalent to the 2000px radius
    forceStrength: 0.1,    // tuned force
    maxDisplacement: 5.0,  // equivalent to 1000px displacement
    returnForce: 0.1,
};

export function createArchiveParticles(gltfScene) {
    const positions = [];

    // Extract geometry points from the gltf
    gltfScene.traverse((child) => {
        if (child.isMesh && child.geometry) {
            const posAttr = child.geometry.attributes.position;
            for (let i = 0; i < posAttr.count; i++) {
                // We do *not* apply the matrixWorld here to preserve local coordinates
                // so that the rotation updates apply accurately.
                positions.push(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
            }
        }
    });

    const count = positions.length / 3;
    const rawPos = new Float32Array(positions);

    // Find center of the geometry to zero it out, if needed
    const box = new THREE.Box3();
    for (let i = 0; i < count; i++) {
        box.expandByPoint(new THREE.Vector3(rawPos[i * 3], rawPos[i * 3 + 1], rawPos[i * 3 + 2]));
    }
    const center = box.getCenter(new THREE.Vector3());

    const posArray = new Float32Array(count * 3);
    const origArray = new Float32Array(count * 3);
    const vArray = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
        const x = rawPos[i * 3] - center.x;
        const y = rawPos[i * 3 + 1] - center.y;
        const z = rawPos[i * 3 + 2] - center.z;

        posArray[i * 3] = x;
        posArray[i * 3 + 1] = y;
        posArray[i * 3 + 2] = z;

        origArray[i * 3] = x;
        origArray[i * 3 + 1] = y;
        origArray[i * 3 + 2] = z;

        vArray[i * 3] = 0;
        vArray[i * 3 + 1] = 0;
        vArray[i * 3 + 2] = 0;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    // Colors - purely white/light gray based on the shader you provided
    const colors = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
        colors[i * 4] = 1.0;
        colors[i * 4 + 1] = 1.0;
        colors[i * 4 + 2] = 1.0;
        colors[i * 4 + 3] = 1.0;
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 4));

    const vs = `
    attribute vec4 color;
    varying vec4 v_color;
    void main() {
      v_color = color;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = 4.0 * (10.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

    const fs = `
    varying vec4 v_color;
    void main() {
      if (v_color.a < 0.01) discard;
      float dist = length(gl_PointCoord - vec2(0.5));
      float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
      if (alpha < 0.01) discard;
      gl_FragColor = vec4(v_color.rgb, v_color.a * alpha);
    }
  `;

    const material = new THREE.ShaderMaterial({
        vertexShader: vs,
        fragmentShader: fs,
        transparent: true,
        depthWrite: false,
        alphaTest: 0.01,
    });

    const points = new THREE.Points(geometry, material);

    return {
        points,
        posArray,
        origArray,
        vArray,
        count
    };
}

export function updateArchiveParticles(system, mouseWorldPos, config = PV_CONFIG) {
    if (!mouseWorldPos) return;

    const { posArray, origArray, vArray, count, points } = system;
    points.updateMatrixWorld();

    // Invert the points matrix to put the mouse position in local space!
    const invMat = new THREE.Matrix4().copy(points.matrixWorld).invert();
    const localMouse = new THREE.Vector3().copy(mouseWorldPos).applyMatrix4(invMat);

    const rad = config.distortionRadius ** 2;
    let needsUpdate = false;

    for (let i = 0; i < count; i++) {
        const oIdx = i * 3;
        const x = posArray[oIdx];
        const y = posArray[oIdx + 1];
        const z = posArray[oIdx + 2];

        const ox = origArray[oIdx];
        const oy = origArray[oIdx + 1];
        const oz = origArray[oIdx + 2];

        const dx = localMouse.x - x;
        const dy = localMouse.y - y;
        const dz = localMouse.z - z;
        const dis = dx * dx + dy * dy + dz * dz;

        if (dis < rad && dis > 0) {
            const f = -rad / dis; // Repulsive force
            const distOrig = Math.sqrt((x - ox) ** 2 + (y - oy) ** 2 + (z - oz) ** 2);
            const mult = Math.max(0.1, 1 - distOrig / (config.maxDisplacement * 2));

            // Normalize direction vector
            const dist = Math.sqrt(dis);
            const dirX = dx / dist;
            const dirY = dy / dist;
            const dirZ = dz / dist;

            vArray[oIdx] += f * dirX * config.forceStrength * mult;
            vArray[oIdx + 1] += f * dirY * config.forceStrength * mult;
            vArray[oIdx + 2] += f * dirZ * config.forceStrength * mult;
            needsUpdate = true;
        }

        if (Math.abs(vArray[oIdx]) > 0.001 || Math.abs(vArray[oIdx + 1]) > 0.001 || Math.abs(vArray[oIdx + 2]) > 0.001 || x !== ox || y !== oy || z !== oz) {
            vArray[oIdx] *= 0.82;
            vArray[oIdx + 1] *= 0.82;
            vArray[oIdx + 2] *= 0.82;

            const nx = x + vArray[oIdx] + (ox - x) * config.returnForce;
            const ny = y + vArray[oIdx + 1] + (oy - y) * config.returnForce;
            const nz = z + vArray[oIdx + 2] + (oz - z) * config.returnForce;

            const dox = nx - ox;
            const doy = ny - oy;
            const doz = nz - oz;
            const distOrig = Math.sqrt(dox * dox + doy * doy + doz * doz);

            if (distOrig > config.maxDisplacement) {
                const s = config.maxDisplacement / distOrig;
                const ds = s + (1 - s) * Math.exp(-(distOrig - config.maxDisplacement) * 0.02);
                posArray[oIdx] = ox + dox * ds;
                posArray[oIdx + 1] = oy + doy * ds;
                posArray[oIdx + 2] = oz + doz * ds;

                vArray[oIdx] *= 0.7;
                vArray[oIdx + 1] *= 0.7;
                vArray[oIdx + 2] *= 0.7;
            } else {
                posArray[oIdx] = nx;
                posArray[oIdx + 1] = ny;
                posArray[oIdx + 2] = nz;
            }
            needsUpdate = true;
        }
    }

    if (needsUpdate) {
        points.geometry.attributes.position.needsUpdate = true;
    }
}
