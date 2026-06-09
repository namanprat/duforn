// @ts-nocheck
/** Dev helpers shared between WallHoverEffect and WallHoverGui. */
export const wallHoverDebug = {
  getFloorMeshes: () => /** @type {import("three").Mesh[]} */ ([]),
  getRoot: () => /** @type {import("three").Object3D | null} */ (null),
};

export function logFloorMeshes() {
  const floors = wallHoverDebug.getFloorMeshes();
  console.info(
    "[Floor Hover] meshes",
    floors.length,
    floors.map((m) => ({ name: m.name, parent: m.parent?.name })),
  );
}
