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
}

// Mock Renderer
export class WebGLRenderer {
  constructor(options = {}) {
    this.domElement = document.createElement('canvas');
    this.shadowMap = { enabled: false };
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
  WebGLRenderer,
  BufferGeometry,
  PlaneGeometry,
  ShaderMaterial,
  MeshBasicMaterial,
  Texture,
  CanvasTexture,
  Mesh,
  Vector3,
  Clock,
};
