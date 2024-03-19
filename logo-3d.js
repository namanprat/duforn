import "./index.css";
import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";

const dLoader = new DRACOLoader();
const gltfLoader = new GLTFLoader();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 200;

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#logo-model'),
  alpha: true,antialiasing: true,
});

//RESIZE
function resizeCanvasToDisplaySize() {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (canvas.width !== width ||canvas.height !== height) {
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
}


dLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
dLoader.setDecoderConfig({type:'js'});
gltfLoader.setDRACOLoader(dLoader);



gltfLoader.load('./gun.glb', function(glb){
  const logo = glb.scene;
  scene.add(logo);
});
const controls = new OrbitControls(camera, renderer.domElement);


//Directional Light
const dirLight = new THREE.DirectionalLight(0xffffff, 10);
dirLight.position.set(0,-3, 7);
scene.add(dirLight);

//Hemi Light
const upColour = 0xa020f0;
const downColour = 0x4040ff;
const hemiLight = new THREE.HemisphereLight(upColour, downColour, 3);
scene.add(hemiLight);

function animate() {
controls.update();

  resizeCanvasToDisplaySize();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);