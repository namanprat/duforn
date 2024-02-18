import "./index.css";
import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
console.log( GLTFLoader );


//RENDERER
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


//CAMERA
const  camera = new THREE.PerspectiveCamera(70, 2, 1, 1000);
camera.position.z = 400;
const scene = new THREE.Scene();


//OBJECT
const loader = new GLTFLoader();
loader.load('./logo.glb', function(glb){
  console.log(glb);
  const logo = glb.scene;
  logo.scale.set(10, 10, 10);
  scene.add(logo);
}, function(xhr){
  console.log((xhr.loaded / xhr.total * 100) + '% loaded');
}, function(error){
  console.log('error');
});

const geometry = new THREE.BoxGeometry(300, 300, 200);
const material = new THREE.MeshPhysicalMaterial({  
  roughness: 0.7,   
  transmission: 1,  
  thickness: 1
});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);


//LIGHT
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(2, 2, 5);
scene.add(light);


//RENDERER
renderer.shadowMap.enabled = true;
renderer.gammaOutput = true;

//ANIMATE
function animate(time) {
  time *= 0.001;
  mesh.rotation.x = time * 0.5;
  mesh.rotation.y = time * 0.5;
  
  resizeCanvasToDisplaySize();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);