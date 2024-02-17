import "./index.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
console.log( TextGeometry );
console.log( GLTFLoader );

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#logo'),
  alpha: true,
});
const  camera = new THREE.PerspectiveCamera(70, 2, 1, 1000);
camera.position.z = 400;
const scene = new THREE.Scene();
const geometry = new THREE.BoxGeometry(200, 200, 200);
const material = new THREE.MeshStandardMaterial({ color: 0xff6347 });

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);
const pointLight = new THREE.PointLight(0xff6347);
pointLight.position.set(90, 10, 5);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);
function resizeCanvasToDisplaySize() {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (canvas.width !== width ||canvas.height !== height) {
    // you must pass false here or three.js sadly fights the browser
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    // set render target sizes here
  }
}
function animate(time) {
  time *= 0.001;
  mesh.rotation.x = time * 0.5;
  mesh.rotation.y = time * 0.5;
  
  resizeCanvasToDisplaySize();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);