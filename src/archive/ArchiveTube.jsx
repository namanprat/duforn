import React, { useRef, useEffect, useCallback } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { archiveItems } from "../../data/archive-items.js";
import { createLabelFallbackTexture, loadTextureAsset } from "../../scripts/runtime/assets.js";

const ROWS = 5;
const COLS = 12;
const Y_SPACING = 2.7;
const RADIUS = 4;
const TILE_H = 1.1;
const REPEAT_COUNT = 3;

export default function ArchiveTube({ controllerState, setTubeMeshes }) {
  const groupRef = useRef();
  const meshesRef = useRef([]);
  const texturesRef = useRef([]);
  const aspectsRef = useRef([]);
  const loadedRef = useRef(false);
  const loopHeight = ROWS * Y_SPACING;
  const totalRows = ROWS * REPEAT_COUNT;
  const rowSpeedsRef = useRef(Array.from({ length: ROWS }, () => 1.0));

  useEffect(() => {
    let cancelled = false;

    Promise.all(
      archiveItems.map((item) =>
        loadTextureAsset(item.image, {
          onErrorTexture: () => createLabelFallbackTexture(item.title),
        }),
      ),
    ).then((textures) => {
      if (cancelled) {
        textures.forEach((t) => t.dispose());
        return;
      }
      texturesRef.current = textures;
      aspectsRef.current = textures.map((tex) => {
        if (tex.image) return tex.image.width / tex.image.height;
        return 1;
      });
      loadedRef.current = true;
      buildTube();
    });

    return () => {
      cancelled = true;
      texturesRef.current.forEach((t) => t.dispose());
      texturesRef.current = [];
    };
  }, []);

  const buildTube = useCallback(() => {
    if (!groupRef.current || !loadedRef.current) return;
    const textures = texturesRef.current;
    const aspects = aspectsRef.current;
    const projectNames = archiveItems.map((item) => item.title);

    // Clear existing
    while (groupRef.current.children.length > 0) {
      const child = groupRef.current.children[0];
      child.traverse((c) => {
        if (c.isMesh) {
          c.geometry?.dispose();
          if (Array.isArray(c.material)) c.material.forEach((m) => m.dispose());
          else c.material?.dispose();
        }
      });
      groupRef.current.remove(child);
    }
    meshesRef.current = [];

    for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
      const rowGroup = new THREE.Group();
      const y = (rowIndex - (totalRows - 1) / 2) * Y_SPACING;
      rowGroup.position.y = y;
      groupRef.current.add(rowGroup);

      const baseRow = rowIndex % ROWS;
      const rowOffset = baseRow % 2 === 0 ? 0 : 0.5;

      for (let col = 0; col < COLS; col++) {
        const theta = ((col + rowOffset) / COLS) * Math.PI * 2;
        const x = Math.cos(theta) * RADIUS;
        const z = Math.sin(theta) * RADIUS;
        const ry = -(theta - Math.PI / 2);

        const texIndex = (baseRow * COLS + col) % archiveItems.length;
        const aspect = aspects[texIndex];
        const planeGeometry = new THREE.PlaneGeometry(TILE_H * aspect, TILE_H);

        const material = new THREE.MeshBasicMaterial({
          map: textures[texIndex],
          side: THREE.DoubleSide,
          toneMapped: false,
        });

        const mesh = new THREE.Mesh(planeGeometry, material);
        mesh.position.set(x, 0, z);
        mesh.rotation.y = ry;
        mesh.userData = { projectName: projectNames[texIndex] };
        rowGroup.add(mesh);
        meshesRef.current.push(mesh);
      }
    }

    setTubeMeshes(meshesRef.current);
  }, [totalRows, setTubeMeshes]);

  useFrame(() => {
    if (!groupRef.current || !loadedRef.current) return;
    const s = controllerState.current;

    // Looping scroll
    if (s.tubeScrollCurrent > loopHeight / 2) {
      s.tubeScrollCurrent -= loopHeight;
      s.tubeScrollTarget -= loopHeight;
    } else if (s.tubeScrollCurrent < -loopHeight / 2) {
      s.tubeScrollCurrent += loopHeight;
      s.tubeScrollTarget += loopHeight;
    }

    groupRef.current.position.y = -s.tubeScrollCurrent;

    // Rotate row groups
    const children = groupRef.current.children;
    for (let i = 0; i < children.length; i++) {
      const baseRow = i % ROWS;
      children[i].rotation.y = s.tubeAngle * rowSpeedsRef.current[baseRow];
    }
  });

  return <group ref={groupRef} />;
}
