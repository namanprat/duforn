import * as THREE from './node_modules/three/build/three.module.js';
//import * as THREE from 'https://unpkg.com/three@v0.161.0/build/three.module.js';
//import { FontLoader } from 'https://unpkg.com/three@v0.161.0/examples/jsm/loaders/FontLoader.js';
//import { TextGeometry } from 'https://unpkg.com/three@v0.161.0/examples/jsm/geometries/TextGeometry';

import { FontLoader } from './node_modules/three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from './node_modules/three/examples/jsm/geometries/TextGeometry.js';

// Set up scene
const scene = new THREE.Scene();

// Set up camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Set up renderer with alpha (for transparent background)
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Load font
const loader = new THREE.FontLoader();
loader.load('./public/cooper-hewitt.json', function (font) {

  // Create text geometry
  const textGeometry = new THREE.TextGeometry('Hello', {
    font: font,
    size: 0.5,
    height: 0.1,
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.02,
    bevelOffset: 0,
    bevelSegments: 5
  });

  // Create material with transparent background
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 1 });

  // Create text mesh
  const textMesh = new THREE.Mesh(textGeometry, material);

  // Add text mesh to the scene
  scene.add(textMesh);

});

// Render loop
const animate = function () {
  requestAnimationFrame(animate);

  // Rotate text
  if (textMesh) {
    textMesh.rotation.x += 0.01;
    textMesh.rotation.y += 0.01;
  }

  // Render the scene
  renderer.render(scene, camera);
};

animate();

// Handle window resize
window.addEventListener('resize', function () {
  const newWidth = window.innerWidth;
  const newHeight = window.innerHeight;

  camera.aspect = newWidth / newHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(newWidth, newHeight);
});
