import * as THREE from 'three';

export function createArchiveGrid(scene, sharedState) {
  const gridState = {
    mesh: null,
    material: null,
    uniforms: {
      uGridScale: { value: 26.0 },
      uLineWidth: { value: 0.5 },
      uEdgeWidth: { value: 0.14 },
      uEdgeAmp: { value: 1.3 },
      uCenterRadius: { value: 0.22 },
      uCenterAmp: { value: 0.85 },
      uCenter: { value: new THREE.Vector2(0.5, 0.5) },
      uTime: { value: 0.0 },
      uScrollSpeed: { value: 0.012 },
      uResolution: { value: new THREE.Vector2(1, 1) },
    },
  };

  const material = new THREE.ShaderMaterial({
    uniforms: gridState.uniforms,
    vertexShader: `
      varying vec2 vUv;

      uniform float uEdgeWidth;
      uniform float uEdgeAmp;
      uniform float uCenterRadius;
      uniform float uCenterAmp;
      uniform vec2 uCenter;

      void main() {
        vUv = uv;

        vec3 p = position;

        float dEdge = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
        float edgeMask = 1.0 - smoothstep(0.0, uEdgeWidth, dEdge);

        float dCenter = distance(vUv, uCenter);
        float centerMask = 1.0 - smoothstep(0.0, uCenterRadius, dCenter);

        float zOffset = edgeMask * uEdgeAmp + centerMask * uCenterAmp;
        p.z += zOffset;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;

      uniform float uGridScale;
      uniform float uLineWidth;
      uniform float uTime;
      uniform float uScrollSpeed;
      uniform vec2 uResolution;

      float gridLine(float coord, float width) {
        float fw = fwidth(coord);
        float p = abs(fract(coord - 0.5) - 0.5);
        return 1.0 - smoothstep(width * fw, (width + 1.0) * fw, p);
      }

      void main() {
        vec2 uv = (vUv + vec2(uTime * uScrollSpeed, 0.0)) * uGridScale;
        float gx = gridLine(uv.x, uLineWidth);
        float gy = gridLine(uv.y, uLineWidth);
        float g = max(gx, gy);

        vec3 base = vec3(0.);
        vec3 line = vec3(0.09);
        vec3 col = mix(base, line, g);
        gl_FragColor = vec4(col, 1.);
      }
    `,
    side: THREE.DoubleSide,
  });

  const geometry = new THREE.PlaneGeometry(18, 18, 512, 512);
  gridState.mesh = new THREE.Mesh(geometry, material);
  gridState.mesh.position.set(0, 0, -5.0);

  scene.add(gridState.mesh);
  gridState.material = material;
  gridState.sharedState = sharedState;

  return gridState;
}

export function updateArchiveGrid(gridState, time) {
  if (!gridState || !gridState.material) return;

  gridState.material.uniforms.uTime.value = time;

  if (gridState.sharedState && gridState.sharedState.targetCenterUv) {
    gridState.material.uniforms.uCenter.value.lerp(gridState.sharedState.targetCenterUv, 0.08);
  }
}

export function destroyArchiveGrid(gridState) {
  if (!gridState) return;

  if (gridState.mesh) {
    if (gridState.mesh.geometry) gridState.mesh.geometry.dispose();
    if (gridState.material) gridState.material.dispose();
    if (gridState.mesh.parent) {
      gridState.mesh.parent.remove(gridState.mesh);
    }
  }

  gridState.mesh = null;
  gridState.material = null;
}
