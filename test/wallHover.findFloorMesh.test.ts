import { describe, expect, it } from "vite-plus/test";
import * as THREE from "three";
import {
  findFloorMesh,
  findFloorMeshes,
  ROOM_1_FLOORING_NAME,
} from "../src/scenes/wallHover/findFloorMesh";

describe("findFloorMesh", () => {
  it("finds mesh named Room 1 : Flooring", () => {
    const root = new THREE.Group();
    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshBasicMaterial({ name: "Concrete" }),
    );
    floor.name = ROOM_1_FLOORING_NAME;
    root.add(floor);

    expect(findFloorMesh(root)).toBe(floor);
    expect(floor.userData.isFloor).toBe(true);
    expect(findFloorMeshes(root)).toEqual([floor]);
  });

  it("finds mesh under Room 1 : Flooring parent", () => {
    const root = new THREE.Group();
    const group = new THREE.Group();
    group.name = ROOM_1_FLOORING_NAME;
    const child = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial());
    group.add(child);
    root.add(group);

    expect(findFloorMesh(root)).toBe(child);
    expect(child.userData.isFloor).toBe(true);
  });

  it("ignores other floors and walls", () => {
    const root = new THREE.Group();
    const other = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial());
    other.name = "Room 3 : Floor";
    root.add(other);

    const wall = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial());
    wall.name = "Room 1 : Walls";
    root.add(wall);

    expect(findFloorMesh(root)).toBeNull();
    expect(findFloorMeshes(root)).toEqual([]);
  });

  it("returns null when root is null", () => {
    expect(findFloorMesh(null)).toBeNull();
    expect(findFloorMeshes(null)).toEqual([]);
  });
});
