import { vi } from 'vitest';

// Track created resources for disposal verification
export const createdResources = {
  geometries: new Set(),
  materials: new Set(),
  textures: new Set(),
  renderers: new Set(),
  scenes: new Set(),
};

// Base class with disposal tracking
class DisposableResource {
  constructor(type) {
    this._disposed = false;
    this._type = type;
    createdResources[type]?.add(this);
  }

  dispose() {
    this._disposed = true;
    createdResources[this._type]?.delete(this);
  }

  isDisposed() {
    return this._disposed;
  }
}

// Mock Scene
export class Scene {
  constructor() {
    this.children = [];
    this.position = { x: 0, y: 0, z: 0, set: vi.fn(), sub: vi.fn() };
    createdResources.scenes.add(this);
  }

  add(...objects) {
    this.children.push(...objects);
  }

  remove(...objects) {
    objects.forEach(obj => {
      const index = this.children.indexOf(obj);
      if (index > -1) this.children.splice(index, 1);
    });
  }

  traverse(callback) {
    this.children.forEach((child) => callback(child));
  }
}

// Mock Camera
export class PerspectiveCamera {
  constructor(fov = 75, aspect = 1, near = 0.1, far = 1000) {
    this.fov = fov;
    this.aspect = aspect;
    this.near = near;
    this.far = far;
    this.position = { x: 0, y: 0, z: 5, set: vi.fn() };
    this.rotation = { x: 0, y: 0, z: 0, set: vi.fn() };
  }

  updateProjectionMatrix() {}

  lookAt() {}
}

export class Color {
  constructor(hex = 0xffffff) {
    this.set(hex);
  }

  set(hex) {
    this.hex = hex;
    return this;
  }

  clone() {
    return new Color(this.hex);
  }
}

export class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }
}

// Mock Renderer
export class WebGLRenderer {
  constructor(options = {}) {
    this.domElement = document.createElement('canvas');
    this.shadowMap = { enabled: false, type: null };
    this.info = {
      memory: { geometries: 0, textures: 0 },
      render: { calls: 0, triangles: 0 }
    };
    createdResources.renderers.add(this);
  }

  setSize(width, height) {
    this.domElement.width = width;
    this.domElement.height = height;
  }

  setPixelRatio(ratio) {
    this._pixelRatio = ratio;
  }

  render(scene, camera) {}

  dispose() {
    createdResources.renderers.delete(this);
  }
}

// Mock Geometry
export class BufferGeometry extends DisposableResource {
  constructor() {
    super('geometries');
    this.attributes = {};
  }

  setAttribute(name, attribute) {
    this.attributes[name] = attribute;
  }
}

export class PlaneGeometry extends BufferGeometry {
  constructor(width = 1, height = 1) {
    super();
    this.parameters = { width, height };
  }
}

// Mock Material
export class ShaderMaterial extends DisposableResource {
  constructor(options = {}) {
    super('materials');
    this.uniforms = options.uniforms || {};
    this.vertexShader = options.vertexShader || '';
    this.fragmentShader = options.fragmentShader || '';
    this.transparent = options.transparent || false;
  }
}

export class MeshBasicMaterial extends DisposableResource {
  constructor(options = {}) {
    super('materials');
    this.color = options.color || 0xffffff;
    this.transparent = options.transparent || false;
  }
}

export class MeshStandardMaterial extends MeshBasicMaterial {
  constructor(options = {}) {
    super(options);
    this.isMeshStandardMaterial = true;
    this.roughness = options.roughness ?? 1;
    this.metalness = options.metalness ?? 0;
    this.envMapIntensity = options.envMapIntensity ?? 1;
    this.normalMap = options.normalMap || null;
    this.roughnessMap = options.roughnessMap || null;
    this.metalnessMap = options.metalnessMap || null;
    this.aoMap = options.aoMap || null;
    this.map = options.map || null;
    this.emissiveMap = options.emissiveMap || null;
  }
}

export class MeshPhysicalMaterial extends MeshStandardMaterial {
  constructor(options = {}) {
    super(options);
    this.isMeshPhysicalMaterial = true;
  }
}

export class ShadowMaterial extends MeshBasicMaterial {}

// Mock Texture
export class Texture extends DisposableResource {
  constructor(image) {
    super('textures');
    this.image = image;
    this.needsUpdate = false;
  }
}

export class CanvasTexture extends Texture {
  constructor(canvas) {
    super(canvas);
  }
}

// Mock Mesh
export class Mesh {
  constructor(geometry, material) {
    this.geometry = geometry;
    this.material = material;
    this.position = { x: 0, y: 0, z: 0, set: vi.fn() };
    this.rotation = { x: 0, y: 0, z: 0, set: vi.fn() };
    this.scale = { x: 1, y: 1, z: 1, set: vi.fn() };
    this.castShadow = false;
    this.receiveShadow = false;
  }
}

export class AmbientLight {
  constructor(color = 0xffffff, intensity = 1) {
    this.color = new Color(color);
    this.intensity = intensity;
  }
}

export class DirectionalLight extends AmbientLight {
  constructor(color = 0xffffff, intensity = 1) {
    super(color, intensity);
    this.position = { x: 0, y: 0, z: 0, set: vi.fn() };
    this.castShadow = false;
    this.shadow = {
      mapSize: { set: vi.fn() },
      camera: {},
    };
  }
}

// Mock Vector3
export class Vector3 {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  set(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  copy(v) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  }
}

export class Box3 {
  constructor() {
    this.min = { x: -1, y: -1, z: -1 };
    this.max = { x: 1, y: 1, z: 1 };
  }

  setFromObject() {
    return this;
  }

  getCenter(target) {
    if (target && typeof target.set === 'function') {
      target.set(0, 0, 0);
    }
    return target;
  }
}

export class PMREMGenerator {
  constructor(renderer) {
    this.renderer = renderer;
  }

  compileEquirectangularShader() {}

  fromEquirectangular() {
    return {
      texture: new Texture(),
      dispose: vi.fn(),
    };
  }

  dispose() {}
}

// Mock Clock
export class Clock {
  constructor() {
    this._startTime = Date.now();
  }

  getElapsedTime() {
    return (Date.now() - this._startTime) / 1000;
  }

  getDelta() {
    return 0.016; // ~60fps
  }
}

// Mock GLTF Loader
export class GLTFLoader {
  load(url, onLoad, onProgress, onError) {
    setTimeout(() => {
      onLoad({
        scene: new Scene(),
        scenes: [new Scene()],
        cameras: [],
        asset: {}
      });
    }, 10);
  }

  loadAsync(url) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          scene: new Scene(),
          scenes: [new Scene()],
          cameras: [],
          asset: {}
        });
      }, 10);
    });
  }
}

export const ACESFilmicToneMapping = 1;
export const SRGBColorSpace = 'srgb';
export const BasicShadowMap = 0;
export const PCFSoftShadowMap = 1;

// Helper to check for resource leaks
export function getResourceLeaks() {
  return {
    geometries: createdResources.geometries.size,
    materials: createdResources.materials.size,
    textures: createdResources.textures.size,
    renderers: createdResources.renderers.size,
    scenes: createdResources.scenes.size,
  };
}

// Helper to reset resource tracking
export function resetResourceTracking() {
  createdResources.geometries.clear();
  createdResources.materials.clear();
  createdResources.textures.clear();
  createdResources.renderers.clear();
  createdResources.scenes.clear();
}

export default {
  Scene,
  PerspectiveCamera,
  Color,
  Vector2,
  WebGLRenderer,
  BufferGeometry,
  PlaneGeometry,
  ShaderMaterial,
  MeshBasicMaterial,
  MeshStandardMaterial,
  MeshPhysicalMaterial,
  ShadowMaterial,
  Texture,
  CanvasTexture,
  Mesh,
  AmbientLight,
  DirectionalLight,
  Vector3,
  Box3,
  PMREMGenerator,
  Clock,
  ACESFilmicToneMapping,
  SRGBColorSpace,
  BasicShadowMap,
  PCFSoftShadowMap,
};
