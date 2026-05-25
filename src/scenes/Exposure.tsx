// @ts-nocheck
import { useEffect } from "react";
import { useThree } from "@react-three/fiber";

export default function Exposure({ exposure = 1 }) {
  const { gl } = useThree();

  useEffect(() => {
    gl.toneMappingExposure = exposure;
  }, [gl, exposure]);

  return null;
}
