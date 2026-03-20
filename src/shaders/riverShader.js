// Where the River Goes shader by @P_Malin

export const vertexShader = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const fragmentShader = /* glsl */ `
varying vec2 vUv;

void main() {
  vec3 top = vec3(0.88, 0.9, 0.92);
  vec3 bottom = vec3(0.45, 0.54, 0.62);
  vec3 color = mix(bottom, top, smoothstep(0.0, 1.0, vUv.y));
  gl_FragColor = vec4(color, 1.0);
}
`;
