import { describe, expect, it } from "vite-plus/test";
import * as THREE from "three";
import { findWaterMesh } from "../src/scenes/water/findWaterMesh";
import { boxToPlanarBounds } from "../src/scenes/water/waterPlanarMapping";

describe("findWaterMesh", () => {
  it("finds mesh by material name Water", () => {
    const root = new THREE.Group();
    const water = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshBasicMaterial({ name: "Water" }),
    );
    water.name = "defaultMaterial";
    root.add(water);
    expect(findWaterMesh(root)).toBe(water);
  });

  it("finds mesh under Water group", () => {
    const root = new THREE.Group();
    const group = new THREE.Group();
    group.name = "Water";
    const child = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial());
    group.add(child);
    root.add(group);
    expect(findWaterMesh(root)).toBe(child);
  });

  it("returns null when no water mesh", () => {
    const root = new THREE.Group();
    const rock = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshBasicMaterial({ name: "Rock" }),
    );
    root.add(rock);
    expect(findWaterMesh(root)).toBeNull();
  });
});

describe("waterPlanarMapping", () => {
  it("maps world box to planar bounds", () => {
    const box = new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(2, 0, 4));
    const bounds = boxToPlanarBounds(box);
    expect(bounds.width).toBe(2);
    expect(bounds.depth).toBe(4);
  });
});
