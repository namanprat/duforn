import { OrbitControls, Center, Environment, Float, Lightformer, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { wrapEffect } from "@react-three/postprocessing";
import * as THREE from "three";
import ScenePostFX from "../scenes/ScenePostFX";
import { DitheringEffect } from "./aboutDitherEffect";

const HELMET_URL = "/jousting_helmet-transformed.glb";
const BG = "#000000";

// ponytail: wrapEffect once; tune gridSize/pixelSizeRatio/grayscaleOnly here
const Dither = wrapEffect(DitheringEffect, {
  gridSize: 4,
  pixelSizeRatio: 1,
  grayscaleOnly: true,
});

useGLTF.preload(HELMET_URL);

const boxGeometry = new THREE.BoxGeometry();
const whiteMaterial = new THREE.MeshStandardMaterial({ color: new THREE.Color(1, 1, 1) });

function Room({ highlight }: { highlight: string }) {
  return (
    <group position={[0, -0.5, 0]}>
      <spotLight castShadow position={[-15, 20, 15]} angle={0.2} penumbra={1} intensity={2} decay={0} />
      <spotLight castShadow position={[15, 20, 15]} angle={0.2} penumbra={1} intensity={2} decay={0} />
      <spotLight castShadow position={[15, 20, -15]} angle={0.2} penumbra={1} intensity={2} decay={0} />
      <spotLight castShadow position={[-15, 20, -15]} angle={0.2} penumbra={1} intensity={2} decay={0} />
      <pointLight castShadow color="white" intensity={100} distance={28} decay={2} position={[0.5, 14.0, 0.5]} />
      <mesh geometry={boxGeometry} castShadow receiveShadow position={[0.0, 13.2, 0.0]} scale={[31.5, 28.5, 31.5]}>
        <meshStandardMaterial color="gray" side={THREE.BackSide} />
      </mesh>
      <mesh geometry={boxGeometry} material={whiteMaterial} castShadow receiveShadow position={[-10.906, -1.0, 1.846]} rotation={[0, -0.195, 0]} scale={[2.328, 7.905, 4.651]} />
      <mesh geometry={boxGeometry} material={whiteMaterial} castShadow receiveShadow position={[-5.607, -0.754, -0.758]} rotation={[0, 0.994, 0]} scale={[1.97, 1.534, 3.955]} />
      <mesh geometry={boxGeometry} material={whiteMaterial} castShadow receiveShadow position={[6.167, -0.16, 7.803]} rotation={[0, 0.561, 0]} scale={[3.927, 6.285, 3.687]} />
      <mesh geometry={boxGeometry} material={whiteMaterial} castShadow receiveShadow position={[-2.017, 0.018, 6.124]} rotation={[0, 0.333, 0]} scale={[2.002, 4.566, 2.064]} />
      <mesh geometry={boxGeometry} material={whiteMaterial} castShadow receiveShadow position={[2.291, -0.756, -2.621]} rotation={[0, -0.286, 0]} scale={[1.546, 1.552, 1.496]} />
      <mesh geometry={boxGeometry} material={whiteMaterial} castShadow receiveShadow position={[-2.193, -0.369, -5.547]} rotation={[0, 0.516, 0]} scale={[3.875, 3.487, 2.986]} />
      <Lightformer form="ring" position={[2, 3, -2]} scale={10} color={highlight} intensity={15} />
      <Lightformer form="box" intensity={80} position={[-14.0, 10.0, 8.0]} scale={[0.1, 2.5, 2.5]} target={false} />
      <Lightformer form="box" intensity={80} position={[-14.0, 14.0, -4.0]} scale={[0.1, 2.5, 2.5]} target={false} light={{ intensity: 100, distance: 28, decay: 2 }} />
      <Lightformer form="box" intensity={23} position={[14.0, 12.0, 0.0]} scale={[0.1, 5.0, 5.0]} target={false} light={{ intensity: 100, distance: 28, decay: 2 }} />
      <Lightformer form="box" intensity={16} position={[0.0, 9.0, 14.0]} scale={[5.0, 5.0, 0.1]} target={false} light={{ intensity: 100, distance: 28, decay: 2 }} />
      <Lightformer form="box" intensity={80} position={[7.0, 8.0, -14.0]} scale={[2.5, 2.5, 0.1]} target={false} light={{ intensity: 100, distance: 28, decay: 2 }} />
      <Lightformer form="box" intensity={80} position={[-7.0, 16.0, -14.0]} scale={[2.5, 2.5, 0.1]} target={false} light={{ intensity: 100, distance: 28, decay: 2 }} />
      <Lightformer form="box" intensity={1} position={[0.0, 20.0, 0.0]} scale={[0.1, 0.1, 0.1]} target={false} light={{ intensity: 100, distance: 28, decay: 2 }} />
      <Lightformer form="box" intensity={20} position={[0.0, 15, 0.0]} scale={[10, 1, 10]} target={false} light={{ intensity: 100, distance: 28, decay: 2 }} />
    </group>
  );
}

function Helmet() {
  const { nodes, materials } = useGLTF(HELMET_URL) as {
    nodes: Record<string, THREE.Mesh>;
    materials: Record<string, THREE.MeshStandardMaterial>;
  };

  return (
    <mesh
      castShadow
      geometry={nodes.Object_2.geometry}
      material={materials.model_Material_u1_v1}
      material-roughness={0.15}
      position={[-2.016, -0.06, 1.381]}
      rotation={[-1.601, 0.068, 2.296]}
      scale={0.038}
    />
  );
}

function AboutDitherScene() {
  return (
    <>
      <group position={[0, -0.5, 0]}>
        <Float floatIntensity={2} rotationIntensity={1} speed={2}>
          <Center scale={3} position={[0, 0.8, 0]} rotation={[0, -Math.PI / 3.5, -0.4]}>
            <Helmet />
          </Center>
        </Float>
      </group>
      <OrbitControls enableDamping />
      <Environment resolution={1024} background={false} environmentIntensity={1.5}>
        <Room highlight="#066aff" />
      </Environment>
      <ScenePostFX>
        <Dither />
      </ScenePostFX>
    </>
  );
}

export default function AboutDitherCanvas() {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ position: [0, -1, 4], fov: 65 }}
      gl={{ alpha: false }}
      onCreated={({ gl }) => {
        gl.setClearColor(new THREE.Color(BG));
        // ponytail: ScenePostFX owns tonemapping — same as main SceneCanvas
        gl.toneMapping = THREE.NoToneMapping;
      }}
      onWheel={(event) => event.stopPropagation()}
    >
      <AboutDitherScene />
    </Canvas>
  );
}
