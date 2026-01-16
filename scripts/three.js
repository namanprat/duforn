import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let renderer = null;
let composer = null;
let camera = null;
let scene = null;
let resizeHandler = null;
let mouseHandler = null;
let rafId = null;
let containerEl = null;
let isRunning = false;
let dissolvePass = null;
let heroScrollTrigger = null;

const DissolveShader = {
  uniforms: {
    tDiffuse: { value: null },
    uProgress: { value: 0 },
    uColor: { value: new THREE.Color(0x000000) },
    uSpread: { value: 0.2 },
    uAberration: { value: 1.0 },
    uResolution: { value: new THREE.Vector2() }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uProgress;
    uniform vec2 uResolution;
    uniform vec3 uColor;
    uniform float uSpread;
    uniform float uAberration;
    varying vec2 vUv;
    
    // Simple noise
    float Hash(vec2 p) {
      vec3 p2 = vec3(p.xy, 1.0);
      return fract(sin(dot(p2, vec3(37.1, 61.7, 12.4))) * 3758.5453123);
    }
    
    float noise(in vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f *= f * (3.0 - 2.0 * f);
      return mix(
        mix(Hash(i + vec2(0.0, 0.0)), Hash(i + vec2(1.0, 0.0)), f.x),
        mix(Hash(i + vec2(0.0, 1.0)), Hash(i + vec2(1.0, 1.0)), f.x),
        f.y
      );
    }
    
    float fbm(vec2 p) {
      // Simplified FBM with fewer octaves for better performance
      float v = noise(p) * 0.5 + noise(p * 2.0) * 0.25;
      return v;
    }

    void main() {
      vec2 uv = vUv;
      float aspect = uResolution.x / uResolution.y;
      vec2 centeredUv = (uv - 0.5) * vec2(aspect, 1.0);
      
      float noiseValue = fbm(centeredUv * 10.0);
      
      float dissolveBase  = (uv.y - uProgress * 1.2) + noiseValue * uSpread;
      
      float smoothFactor = 0.01;
      
      // Calculate independent dissolve states for RGB channels
      // "Glassy" look: offset dissolve timing for each channel
      float maskAb = uAberration * 0.01;
      
      float dR = dissolveBase + maskAb;
      float dG = dissolveBase;
      float dB = dissolveBase - maskAb;
      
      float aR = 1.0 - smoothstep(-smoothFactor, smoothFactor, dR);
      float aG = 1.0 - smoothstep(-smoothFactor, smoothFactor, dG);
      float aB = 1.0 - smoothstep(-smoothFactor, smoothFactor, dB);
      
      // Chromatic aberration on the TEXTURE (refraction effect)
      // Only distort near the edge
      float edgeZone = 1.0 - smoothstep(0.0, 0.2, abs(dissolveBase));
      float texAb = uAberration * 0.02 * edgeZone;
      
      vec4 texR = texture2D(tDiffuse, vUv - vec2(texAb, 0.0));
      vec4 texG = texture2D(tDiffuse, vUv);
      vec4 texB = texture2D(tDiffuse, vUv + vec2(texAb, 0.0));
      
      float r = mix(texR.r, uColor.r, aR);
      float g = mix(texG.g, uColor.g, aG);
      float b = mix(texB.b, uColor.b, aB);
      
      gl_FragColor = vec4(r, g, b, 1.0);
    }
  `
};

export function webgl() {
  if (isRunning) return;
  isRunning = true;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);

  renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' });
  renderer.setSize(window.innerWidth, window.innerHeight);
  // Cap pixel ratio at 1.5 to reduce GPU work on high-DPI screens
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  // Disable shadow maps since they're not used
  renderer.shadowMap.enabled = false;

  containerEl = document.querySelector('#background');
  if (!containerEl) {
    containerEl = document.createElement('div');
    containerEl.id = 'background';
    // place near top of body to sit behind main content
    const firstChild = document.body.firstChild;
    document.body.insertBefore(containerEl, firstChild);
  }
  containerEl.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  const loader = new GLTFLoader();
  const modelUrl = '/home/scene.glb';
  loader.load(
    modelUrl,
    (glb) => {
      scene.add(glb.scene);
    },
    undefined,
    (err) => console.error('GLTF load error:', err)
  );

  let resizeTimeout = null;
  resizeHandler = () => {
    // Debounce resize to avoid excessive recalculations
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (!camera || !renderer || !composer) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      composer.setSize(width, height);
      if (dissolvePass) {
        dissolvePass.uniforms.uResolution.value.set(width, height);
      }
    }, 100);
  };
  window.addEventListener('resize', resizeHandler);

  composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  dissolvePass = new ShaderPass(DissolveShader);
  dissolvePass.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
  composer.addPass(dissolvePass);

  const outputPass = new OutputPass();
  composer.addPass(outputPass);
  
  // Setup ScrollTrigger
  const hero = document.querySelector('.hero');
  if (hero) {
    heroScrollTrigger = ScrollTrigger.create({
      trigger: hero,
      start: "top top",
      end: "bottom top", 
      scrub: true,
      onUpdate: (self) => {
        if (dissolvePass) {
          dissolvePass.uniforms.uProgress.value = self.progress;
        }
      }
    });
  }

  let mousePos = { x: 0, y: 0 };
  let cameraTarget = { angle: Math.PI / 2, y: 0 };
  let cameraCurrent = { angle: Math.PI / 2, y: 0 };
  const BASE_CAMERA_RADIUS = Math.sqrt(50) / 2.5;
  let lastMouseTime = 0;

  mouseHandler = (event) => {
    // Throttle mouse updates to ~30fps for smoother performance
    const now = performance.now();
    if (now - lastMouseTime < 33) return;
    lastMouseTime = now;

    mousePos.x = (event.clientX / window.innerWidth) * 2 - 1;
    mousePos.y = -(event.clientY / window.innerHeight) * 2 + 1;
    cameraTarget.angle = Math.PI / 2 - mousePos.x * 0.1;
    cameraTarget.y = mousePos.y * 0.4;
  };
  document.addEventListener('mousemove', mouseHandler, { passive: true });

  const render = () => {
    cameraCurrent.angle += (cameraTarget.angle - cameraCurrent.angle) * 0.025;
    cameraCurrent.y += (cameraTarget.y - cameraCurrent.y) * 0.025;

    const scrollY = window.scrollY;
    const zoomSpeed = 0.001;
    const currentRadius = Math.max(0.5, BASE_CAMERA_RADIUS - (scrollY * zoomSpeed));

    camera.position.x = Math.cos(cameraCurrent.angle) * currentRadius;
    camera.position.z = Math.sin(cameraCurrent.angle) * currentRadius;
    camera.position.y += (cameraCurrent.y + 1 - camera.position.y);

    camera.lookAt(0, 0, 0);
    composer.render();
    rafId = requestAnimationFrame(render);
  };

  render();

  return { scene, camera, renderer };
}

export function destroyWebgl() {
  if (!isRunning) return;
  isRunning = false;

  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler);
    resizeHandler = null;
  }
  if (mouseHandler) {
    document.removeEventListener('mousemove', mouseHandler);
    mouseHandler = null;
  }

  if (heroScrollTrigger) {
    heroScrollTrigger.kill();
    heroScrollTrigger = null;
  }
  
  if (dissolvePass) {
      if (dissolvePass.material) dissolvePass.material.dispose();
      dissolvePass = null;
  }

  if (composer) {
    composer.dispose();
    composer = null;
  }
  if (renderer) {
    renderer.dispose();
    if (renderer.domElement && renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
    renderer = null;
  }
  scene = null;
  camera = null;
  containerEl = null;
}

export default webgl;