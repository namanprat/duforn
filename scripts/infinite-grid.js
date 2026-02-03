import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = `
  uniform vec2 uResolution;
  uniform vec3 uLineColor;
  uniform float uLineWidth;
  uniform float uLineSpacing;
  uniform float uLineFeather;

  varying vec2 vUv;

  void main() {
    vec2 scaledUv = vUv * uResolution;
    
    // Calculate distance to nearest vertical and horizontal lines
    float dx = mod(scaledUv.x, uLineSpacing);
    float dy = mod(scaledUv.y, uLineSpacing);

    // Use smoothstep for anti-aliased lines
    float lineX = smoothstep(uLineWidth - uLineFeather, uLineWidth + uLineFeather, dx);
    lineX *= (1.0 - smoothstep(uLineSpacing - uLineWidth - uLineFeather, uLineSpacing - uLineWidth + uLineFeather, dx));
    
    float lineY = smoothstep(uLineWidth - uLineFeather, uLineWidth + uLineFeather, dy);
    lineY *= (1.0 - smoothstep(uLineSpacing - uLineWidth - uLineFeather, uLineSpacing - uLineWidth + uLineFeather, dy));

    float grid = max(lineX, lineY);

    gl_FragColor = vec4(uLineColor, grid);
  }
`;

let renderer, scene, camera, material, mesh;
let container;
let animationId;

function getCssVariable(varName, defaultValue) {
    const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    if (value) {
        if (varName.includes('color')) {
            return new THREE.Color(value);
        }
        return parseFloat(value);
    }
    return defaultValue;
}

function initGrid() {
    container = document.getElementById('infinite-grid-canvas');
    if (!container) {
        console.error('Infinite grid container not found.');
        return;
    }

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
            uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
            uLineColor: { value: getCssVariable('--grid-line-color', new THREE.Color(0xcccccc)) },
            uLineWidth: { value: getCssVariable('--grid-line-width', 0.5) },
            uLineSpacing: { value: getCssVariable('--grid-line-spacing', 50.0) },
            uLineFeather: { value: getCssVariable('--grid-line-feather', 0.5) },
        },
        transparent: true,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    window.addEventListener('resize', onResize);
    animate();
}

function onResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    material.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
}

function animate() {
    animationId = requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

export function destroyGrid() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    window.removeEventListener('resize', onResize);
    if (renderer && renderer.domElement) {
        container.removeChild(renderer.domElement);
    }
    // Dispose Three.js objects
    if(material) material.dispose();
    if(mesh && mesh.geometry) mesh.geometry.dispose();
    if(renderer) renderer.dispose();
}

export function initInfiniteGrid() {
    // Delay init slightly to ensure CSS variables are loaded
    setTimeout(initGrid, 100);
}
