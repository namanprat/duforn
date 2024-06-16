import "./index.css";
import * as THREE from "three";
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const dLoader = new DRACOLoader();
const gltfLoader = new GLTFLoader();
const scene = new THREE.Scene();
const hdriLoader = new RGBELoader();
hdriLoader.load( './env.hdr', function (texture) {
texture.mapping = THREE.EquirectangularReflectionMapping;
scene.environment = texture;
});

//Camera
var camera = new THREE.PerspectiveCamera( 15,  window.innerWidth / window.innerHeight, 0.1, 100 );
camera.position.z = 0.135;
// camera.position.y = 0.5;


const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#logo-model'),
  alpha: true,antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;

//RESIZE
const resize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  console.log(camera.aspect);

  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

dLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
dLoader.setDecoderConfig({type:'js'});
gltfLoader.setDRACOLoader(dLoader);

const group = new THREE.Group();
scene.add(group);

gltfLoader.load('./newlogo.glb', function(glb){
  group.add(glb.scene); 
});

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.enableZoom = false;
controls.autoRotate = true;
controls.autoRotateSpeed = 1;
controls.update();

const render = () => {
  controls.update();
  group.rotation.set(0, window.scrollY * 0.001, 0);

  requestAnimationFrame(render);
  renderer.render(scene, camera);
}

render();
window.addEventListener('resize', resize);