import * as THREE from 'three';
//import * as THREE from './node_modules/three/build/three.module.js';
import {GLTFLoader} from './node_modules/three/examples/jsm/loaders/GLTFLoader.js';
console.log(THREE);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(90, 10, 5);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(45);
camera.position.setX(0);

renderer.render(scene, camera);

//view
const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
const material = new THREE.MeshStandardMaterial({ color: 0xff6347 });
const torus = new THREE.Mesh(geometry, material);
scene.add(torus);

function animate(){
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
};
animate()


// responsive
window.onresize = function(){
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
};

let oldx = 0
let oldy = 0
window.onmousemove = function(e){
  let changex = e.clientX - oldx;
  let changey = e.clientY - oldy;
  camera.position.x += changex/100;
  camera.position.y += changey/100;

  oldx = e.clientX;
  oldy = e.clientY;

}
