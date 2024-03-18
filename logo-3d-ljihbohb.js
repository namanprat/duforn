import "./index.css";
import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";

import { MeshTransmissionMaterial } from '@pmndrs/vanilla/materials/MeshTransmissionMaterial';
console.log(MeshTransmissionMaterial);

THREE.ColorManagement.legacyMode = false;

const dLoader = new DRACOLoader();
const loader = new GLTFLoader();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

//RESIZE
function resizeCanvasToDisplaySize() {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (canvas.width !== width ||canvas.height !== height) {
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
}

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#logo-model'),
  alpha: true,antialiasing: true,
});


dLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
// dLoader.setDecoderConfig({type:'js'});
loader.setDRACOLoader(dLoader);



loader.load('./logo.glb', function(glb){
  const logo = glb.scene;
  scene.add(logo);
});
camera.position.z = 3;

// const controls = new OrbitControls(camera, renderer.domElement);


const light = new THREE.DirectionalLight(0xffffff, 4);
light.position.set(0, 3, 2);
scene.add(light);


function animate() {
  // controls.update();

  resizeCanvasToDisplaySize();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

// let oldx = 0;
// let oldy = 0;
// window.onmousemove = function(ev){
//   let changex = ev.x -oldx;
//   let changey = ev.y - oldy;
//   camera.position.x += changex * 0.001;
//   camera.position.y += changey * 0.001;

//   oldx = ev.x;
//   oldy = ev.y;
// }