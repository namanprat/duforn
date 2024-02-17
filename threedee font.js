import "./index.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
// import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
console.log( TextGeometry );
console.log( GLTFLoader );



//RENDERER
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#logo'),
  alpha: true,antialiasing: true,
});

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


//TEXT LOADER
const loader = new THREE.FontLoader();

loader.load('./public/cooper-hewitt.json', function(font){
  const geometry = new TextGeometry('Hello World', {
    font: font,
    size: 100,
    height: 50,
})
const textMesh = new THREE.Mesh(geometry, [
  new THREE.MeshBasicMaterial({ color: 0x00ff00 }),
  new THREE.MeshBasicMaterial({ color: 0x0000ff })
])
});

const  camera = new THREE.PerspectiveCamera(70, 2, 1, 1000);
camera.position.z = 400;
const scene = new THREE.Scene();




const light = new THREE.DirectionalLight(0xfff0dd, 1);
light.position.set(0, 5, 10);
scene.add(light);




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