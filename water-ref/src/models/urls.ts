// @ts-nocheck
/** Canonical URLs for GLBs — must match `useGLTF` and `useGLTF.preload` exactly.
 *  The website model ships meshopt-compressed with WebP textures (built from the
 *  raw `public/duforn_website.glb` source via `npm run model:update`).
 *  project-bg is uncompressed; monitor uses its meshopt-compressed variant.
 */
export const GLTF_URL_PROJECT_BG = "/models/project-bg.glb";
export const GLTF_URL_MONITOR = "/monitor.compressed.glb";
export const GLTF_URL_WEBSITE = "/duforn_website.compressed.glb";
