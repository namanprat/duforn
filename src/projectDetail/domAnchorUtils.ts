import * as THREE from "three";

export function screenToWorld(
  rect: DOMRect,
  viewportWidth: number,
  viewportHeight: number,
): { x: number; y: number; width: number; height: number; visible: boolean } {
  const visible = rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < viewportHeight;
  return {
    x: rect.left + rect.width / 2 - viewportWidth / 2,
    y: viewportHeight / 2 - (rect.top + rect.height / 2),
    width: rect.width,
    height: rect.height,
    visible,
  };
}

export function updateClipPlanes(
  planes: THREE.Plane[],
  rect: DOMRect,
  viewportWidth: number,
  viewportHeight: number,
) {
  const left = rect.left - viewportWidth / 2;
  const right = rect.right - viewportWidth / 2;
  const top = viewportHeight / 2 - rect.top;
  const bottom = viewportHeight / 2 - rect.bottom;

  planes[0].constant = -left;
  planes[1].constant = right;
  planes[2].constant = top;
  planes[3].constant = -bottom;
}

export function createClipPlanes() {
  return [
    new THREE.Plane(new THREE.Vector3(1, 0, 0), 0),
    new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0),
    new THREE.Plane(new THREE.Vector3(0, -1, 0), 0),
    new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
  ];
}

export function applyClipping(
  clipPlanes: THREE.Plane[],
  materials: Array<THREE.Material | null | undefined>,
) {
  materials.forEach((material) => {
    if (!material) return;
    material.clippingPlanes = clipPlanes;
    material.clipIntersection = false;
  });
}

/** CSS object-fit: cover for a plane filling boxW x boxH. */
export function coverPlaneScale(imgW: number, imgH: number, boxW: number, boxH: number) {
  const imgAspect = imgW / imgH;
  const boxAspect = boxW / boxH;
  if (imgAspect > boxAspect) {
    return { x: boxH * imgAspect, y: boxH };
  }
  return { x: boxW, y: boxW / imgAspect };
}
