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
var camera = new THREE.PerspectiveCamera( 15, innerWidth/innerHeight );
camera.position.z = 0.41;
// camera.position.y = 0.5;


const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#logo-model'),
  alpha: true,antialias: true,
});
renderer.toneMapping = THREE.ACESFilmicToneMapping;
// renderer.toneMappingExposure = 0.9;

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

gltfLoader.load('./logonew.glb', function(glb){
  const logo = glb.scene;
  scene.add(logo); 
});

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.enableZoom = false;

//Directional Light


function animate() {
  controls.update();
  resizeCanvasToDisplaySize();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);