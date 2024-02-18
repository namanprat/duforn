import "./index.css";
import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

console.log( GLTFLoader );


//RENDERER
const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#logo'),
  alpha: true,antialiasing: true,
});


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


//OBJECT
const loader = new GLTFLoader();
loader.load('./logo.glb', function(glb){
  console.log(glb);
  const logo = glb.scene;
  logo.scale.set(15, 15, 15);
  scene.add(logo);
});

//CAMERA
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const controls = new OrbitControls(camera, renderer.domElement );
controls.update();


//LIGHT
const light = new THREE.DirectionalLight(0xffffff, 3);
light.position.set(3, 3, 9);
scene.add(light);


//ANIMATE
function animate() {

  resizeCanvasToDisplaySize();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);