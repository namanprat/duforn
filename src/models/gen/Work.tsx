// @ts-nocheck
/*
 Regenerate: npx gltfjsx@latest public/models/work.glb -o src/models/gen/Work.tsx
*/
import React from "react";
import { useGLTF } from "@react-three/drei";
import { gltfLoaderOptions } from "../loader";
import { GLTF_URL_WORK } from "../urls";

/* eslint-disable react/no-unknown-property */
export default function WorkModel(props) {
  const { nodes, materials } = useGLTF(GLTF_URL_WORK, gltfLoaderOptions);
  return (
    <group {...props} dispose={null}>
      <mesh
        geometry={nodes.Cylinder__0.geometry}
        material={materials.Cylinder__0}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[13.275, 13.275, 5.019]}
      />
      <mesh
        geometry={nodes.Cylinder014_Material001_0.geometry}
        material={materials["Material.001"]}
        position={[0, 4.442, 0]}
        rotation={[Math.PI / 2, 0, -Math.PI]}
        scale={[-21.405, 21.405, 0.414]}
      />
    </group>
  );
}
