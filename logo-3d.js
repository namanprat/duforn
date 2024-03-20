import "./index.css";
import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";

const dLoader = new DRACOLoader();
const gltfLoader = new GLTFLoader();
const scene = new THREE.Scene();
const intersectionPoint = new THREE.Vector3();
const planeNormal = new THREE. Vector3();
const plane = new THREE.Plane();
const mousePosition = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
window. addEventListener ('mousemove', function(e) {
	mousePosition.x = (e.clientX / this.window.innerWidth) * 2 -1;
mousePosition.y = - (e.clientY / this.window.innerHeight) * 2 + 1;
planeNormal.copy(camera.position).normalize();
plane.setFromNormalAndCoplanarPoint(planeNormal, scene.position);
raycaster.setFromCamera(mousePosition, camera);
raycaster.ray.intersectPlane(plane, intersectionPoint);
target.position.set(intersectionPoint.x, intersectionPoint.y, 2);
});

//Camera
var camera = new THREE.PerspectiveCamera( 30, innerWidth/innerHeight );
camera.position.z = 1;

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



gltfLoader.load('./logo.glb', function(glb){
  const logo = glb.scene;
  scene.add(logo);
  pivot = logo.getObjectByName('pivot_3');
});

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.enableZoom = false;


//Directional Light
const dirLight = new THREE.DirectionalLight(0xffffff, 10);
dirLight.position.set(0,-3, 7);
scene.add(dirLight);

//Hemi Light
const hemiLight = new THREE.HemisphereLight(0xa020f0, 0x4040ff, 3);
scene.add(hemiLight);


var smoothReset = false;

controls.addEventListener( 'start', onStart );
controls.addEventListener( 'end', onEnd );

// starting new drag with OrbitCintrols -- recover the min.max values
function onStart( event )
{
		controls.minAzimuthAngle = -Infinity;
		controls.maxAzimuthAngle = Infinity;
		controls.minPolarAngle = 0;
		controls.maxPolarAngle = Math.PI;
		smoothReset = false;
}

// enging drag with OrbitControls -- activate smooth reset
function onEnd( event )
{
		smoothReset = true;
}

// function to smooth reset the OrbitControl camera's angles
function doSmoothReset( )
{
		// get current angles
		var alpha = controls.getAzimuthalAngle( ),
				beta = controls.getPolarAngle( )-Math.PI/2;
	
		// if they are close to the reset values, just set these values
		if( Math.abs(alpha) < 0.001 ) alpha = 0;
		if( Math.abs(beta) < 0.001 ) beta = 0;

		// smooth change using manual lerp
		controls.minAzimuthAngle = 0.95*alpha;
		controls.maxAzimuthAngle = controls.minAzimuthAngle;

		controls.minPolarAngle = Math.PI/2 + 0.95*beta;
		controls.maxPolarAngle = controls.minPolarAngle;

		// if the reset values are reached, exit smooth reset
		if( alpha == 0 && beta == 0) onStart( )
}

function animate() {

controls.update();
if( smoothReset ) doSmoothReset();
  resizeCanvasToDisplaySize();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);