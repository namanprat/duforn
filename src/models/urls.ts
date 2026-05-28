// @ts-nocheck
/** Canonical URLs for GLBs — must match `useGLTF` and `useGLTF.preload` exactly.
 *  Compressed variants emitted by `npm run compress-assets`. Scene + project-bg
 *  are left uncompressed (they're already small and tripped meshopt encoder).
 */
export const GLTF_URL_SCENE = "/models/scene.glb";
export const GLTF_URL_PROJECT_BG = "/models/project-bg.glb";
export const GLTF_URL_MONITOR = "/monitor.compressed.glb";
export const GLTF_URL_WEBSITE = "/duforn_website.compressed.glb";
