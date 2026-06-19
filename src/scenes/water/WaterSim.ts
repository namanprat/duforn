import * as THREE from "three";

const SIZE = 256;
const SPEED = 1.05;

const VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const DROP = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uCenter;
uniform float uRadius;
uniform float uStrength;

void main() {
  vec4 info = texture2D(uTex, vUv);
  float d = max(0.0, 1.0 - length(uCenter - vUv) / uRadius);
  d = 0.5 - cos(d * 3.14159265) * 0.5;
  info.r += d * uStrength;
  gl_FragColor = info;
}
`;

const UPDATE = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uDelta;

void main() {
  vec4 info = texture2D(uTex, vUv);
  float avg = (
    texture2D(uTex, vUv - vec2(uDelta.x, 0.0)).r +
    texture2D(uTex, vUv - vec2(0.0, uDelta.y)).r +
    texture2D(uTex, vUv + vec2(uDelta.x, 0.0)).r +
    texture2D(uTex, vUv + vec2(0.0, uDelta.y)).r
  ) * 0.25;
  info.g += (avg - info.r) * 2.0;
  info.g *= 0.995;
  info.r += info.g;
  gl_FragColor = info;
}
`;

const NORMAL = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uDelta;

void main() {
  vec4 info = texture2D(uTex, vUv);
  float hL = texture2D(uTex, vUv - vec2(uDelta.x, 0.0)).r;
  float hR = texture2D(uTex, vUv + vec2(uDelta.x, 0.0)).r;
  float hD = texture2D(uTex, vUv - vec2(0.0, uDelta.y)).r;
  float hU = texture2D(uTex, vUv + vec2(0.0, uDelta.y)).r;
  vec3 dx = vec3(uDelta.x, hR - info.r, 0.0);
  vec3 dy = vec3(0.0, hU - info.r, uDelta.y);
  info.ba = normalize(cross(dy, dx)).xz;
  gl_FragColor = info;
}
`;

function makeTarget(w: number, h: number) {
  return new THREE.WebGLRenderTarget(w, h, {
    type: THREE.HalfFloatType,
    format: THREE.RGBAFormat,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    wrapS: THREE.ClampToEdgeWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
    depthBuffer: false,
  });
}

function makePass(frag: string, uniforms: Record<string, THREE.IUniform>) {
  return new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERT,
      fragmentShader: frag,
      depthTest: false,
      depthWrite: false,
    }),
  );
}

export class WaterSim {
  private camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private rtA: THREE.WebGLRenderTarget;
  private rtB: THREE.WebGLRenderTarget;
  private current: THREE.WebGLRenderTarget;
  private drop: THREE.Mesh;
  private update: THREE.Mesh;
  private normal: THREE.Mesh;
  readonly width: number;
  readonly height: number;

  constructor(
    private renderer: THREE.WebGLRenderer,
    width = SIZE,
    height = SIZE,
  ) {
    this.width = width;
    this.height = height;
    this.rtA = makeTarget(width, height);
    this.rtB = makeTarget(width, height);
    this.current = this.rtA;

    const delta = new THREE.Vector2(SPEED / width, SPEED / height);

    this.drop = makePass(DROP, {
      uTex: { value: null },
      uCenter: { value: new THREE.Vector2() },
      uRadius: { value: 0.04 },
      uStrength: { value: 0.02 },
    });

    this.update = makePass(UPDATE, {
      uTex: { value: null },
      uDelta: { value: delta },
    });

    this.normal = makePass(NORMAL, {
      uTex: { value: null },
      uDelta: { value: delta },
    });
  }

  get texture() {
    return this.current.texture;
  }

  addDrop(u: number, v: number, radius = 0.04, strength = 0.02) {
    const mat = this.drop.material as THREE.ShaderMaterial;
    mat.uniforms.uCenter.value.set(u, v);
    mat.uniforms.uRadius.value = radius;
    mat.uniforms.uStrength.value = strength;
    this.render(this.drop);
  }

  step() {
    this.render(this.update);
  }

  updateNormals() {
    this.render(this.normal);
  }

  private render(mesh: THREE.Mesh) {
    const mat = mesh.material as THREE.ShaderMaterial;
    mat.uniforms.uTex.value = this.current.texture;

    const next = this.current === this.rtA ? this.rtB : this.rtA;
    const prev = this.renderer.getRenderTarget();
    this.renderer.setRenderTarget(next);
    this.renderer.render(mesh, this.camera);
    this.renderer.setRenderTarget(prev);
    this.current = next;
  }

  dispose() {
    this.rtA.dispose();
    this.rtB.dispose();
    this.drop.geometry.dispose();
    this.update.geometry.dispose();
    this.normal.geometry.dispose();
    (this.drop.material as THREE.Material).dispose();
    (this.update.material as THREE.Material).dispose();
    (this.normal.material as THREE.Material).dispose();
  }
}
