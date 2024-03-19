import "./index.css";
import * as THREE from "three";
import { MeshTransmissionMaterial } from '@pmndrs/vanilla/materials/MeshTransmissionMaterial';
// console.log(MeshTransmissionMaterial);


const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#logo-model'),
  alpha: true,
  antialiasing: true,

});
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.z = 500;
const scene = new THREE.Scene();
const geometry = new THREE.BoxGeometry(200, 200, 200);
const material = new THREE.MeshPhysicalMaterial();
// glassMaterial.color = new THREE.Color(0xffff00);
material.clearcoat = 0.8;
material.ior = 1.15;
material.specularIntensity = 0.6;
material.roughness = 0.0;
material.thickness = 0.5;
material.transmission = 1.0;
material.sheen = 0.0;


const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);


const light = new THREE.DirectionalLight(0xffffff, 3);
light.position.set(0, 3, 2);
scene.add(light);

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
function animate(time) {
  time *= 0.001;
  mesh.rotation.x = time * 0.2;
  mesh.rotation.y = time * 0.2;
  
  resizeCanvasToDisplaySize();
  
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);