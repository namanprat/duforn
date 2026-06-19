import { Suspense, useState } from "react";
import { OrthographicCamera } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import ProjectBg from "./ProjectBg";
import ProjectBackground from "./ProjectBackground";

function ProjectDetailCamera() {
  const { size } = useThree();

  return (
    <OrthographicCamera
      makeDefault
      left={-size.width / 2}
      right={size.width / 2}
      top={size.height / 2}
      bottom={-size.height / 2}
      near={1}
      far={1000}
      position={[0, 0, 10]}
      zoom={1}
    />
  );
}

export default function ProjectDetailScene() {
  const [bgReady, setBgReady] = useState(false);

  return (
    <>
      <ProjectDetailCamera />
      {!bgReady ? <ProjectBackground /> : null}
      <Suspense fallback={null}>
        <ProjectBg onReady={setBgReady} />
      </Suspense>
    </>
  );
}
