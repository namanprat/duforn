import * as THREE from 'three';

/**
 * Archive Tube - Cylindrical carousel of images
 * Ported from brev/js/ImageTube.js
 */

const imageUrls = [
  "/archive/1.png", "/archive/2.jpg", "/archive/3.jpg",
  "/archive/4.jpg", "/archive/5.jpg", "/archive/6.png",
  "/archive/7.png", "/archive/8.png", "/archive/9.png",
  "/archive/10.png", "/archive/11.png", "/archive/12.png",
  "/archive/13.png", "/archive/14.png", "/archive/15.png"
];

const fileToName = {
  "/archive/1.png": "Project 1", "/archive/2.jpg": "Project 2",
  "/archive/3.jpg": "Project 3", "/archive/4.jpg": "Project 4",
  "/archive/5.jpg": "Project 5", "/archive/6.png": "Project 6",
  "/archive/7.png": "Project 7", "/archive/8.png": "Project 8",
  "/archive/9.png": "Project 9", "/archive/10.png": "Project 10",
  "/archive/11.png": "Project 11", "/archive/12.png": "Project 12",
  "/archive/13.png": "Project 13", "/archive/14.png": "Project 14",
  "/archive/15.png": "Project 15"
};

export async function createArchiveTube(scene) {
  const tubeState = {
    rows: 5,
    cols: 12,
    ySpacing: 2.7,
    radius: 4,
    tileW: 0.72,
    tileH: 1.1,

    scrollCurrent: 0,
    angle: 0,
    rotationSpeedScale: 1,

    raycaster: new THREE.Raycaster(),
    mouse: new THREE.Vector2(),
    intersected: null,

    group: new THREE.Group(),
    rowGroups: [],
    rowSpeeds: [],
    textures: [],
    loopHeight: 0,
  };

  // Pre-compute row speeds
  for (let r = 0; r < tubeState.rows; r++) {
    tubeState.rowSpeeds.push(1.0);
  }

  // Load textures
  const loader = new THREE.TextureLoader();
  tubeState.textures = await Promise.all(
    imageUrls.map(url =>
      new Promise(resolve => {
        loader.load(url, resolve, undefined, () => {
          const canvas = document.createElement('canvas');
          canvas.width = 512;
          canvas.height = 512;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#333';
          ctx.fillRect(0, 0, 512, 512);
          ctx.fillStyle = '#666';
          ctx.font = '24px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(fileToName[url] || url, 256, 256);
          resolve(new THREE.CanvasTexture(canvas));
        });
      })
    )
  );

  const aspects = tubeState.textures.map(tex => {
    if (tex.image) {
      return tex.image.width / tex.image.height;
    }
    return 1;
  });

  const projectNames = imageUrls.map(url => fileToName[url] || url);

  // Build geometry
  const repeatCount = 3;
  const totalRows = tubeState.rows * repeatCount;
  tubeState.loopHeight = tubeState.rows * tubeState.ySpacing;

  for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
    const rowGroup = new THREE.Group();
    const y = (rowIndex - (totalRows - 1) / 2) * tubeState.ySpacing;
    rowGroup.position.y = y;

    tubeState.group.add(rowGroup);
    tubeState.rowGroups[rowIndex] = rowGroup;

    const baseRow = rowIndex % tubeState.rows;
    const rowOffset = baseRow % 2 === 0 ? 0 : 0.5;

    for (let col = 0; col < tubeState.cols; col++) {
      const theta = ((col + rowOffset) / tubeState.cols) * Math.PI * 2;
      const x = Math.cos(theta) * tubeState.radius;
      const z = Math.sin(theta) * tubeState.radius;
      const ry = -(theta - Math.PI / 2);

      const texIndex = (baseRow * tubeState.cols + col) % imageUrls.length;
      const aspect = aspects[texIndex];
      const planeGeometry = new THREE.PlaneGeometry(tubeState.tileH * aspect, tubeState.tileH);

      const material = new THREE.MeshBasicMaterial({
        map: tubeState.textures[texIndex],
        side: THREE.DoubleSide,
        toneMapped: false,
      });

      const mesh = new THREE.Mesh(planeGeometry, material);
      mesh.position.set(x, 0, z);
      mesh.rotation.y = ry;

      mesh.userData = {
        projectName: projectNames[texIndex],
      };

      rowGroup.add(mesh);
    }
  }

  scene.add(tubeState.group);
  return tubeState;
}

export function updateArchiveTube(tubeState, dt, sharedState) {
  if (!tubeState) return;

  // Scroll Logic
  tubeState.scrollCurrent += (sharedState.tubeScrollTarget - tubeState.scrollCurrent) * 0.12;

  if (tubeState.scrollCurrent > tubeState.loopHeight / 2) {
    tubeState.scrollCurrent -= tubeState.loopHeight;
    sharedState.tubeScrollTarget -= tubeState.loopHeight;
  } else if (tubeState.scrollCurrent < -tubeState.loopHeight / 2) {
    tubeState.scrollCurrent += tubeState.loopHeight;
    sharedState.tubeScrollTarget += tubeState.loopHeight;
  }

  tubeState.group.position.y = -tubeState.scrollCurrent;

  // Rotation Logic
  const damping = 0.92;
  sharedState.tubeSpinVelocity *= Math.pow(damping, dt * 60);
  sharedState.tubeSpinVelocity = Math.max(-2.0, Math.min(2.0, sharedState.tubeSpinVelocity));

  tubeState.rotationSpeedScale += (sharedState.rotationSpeedScaleTarget - tubeState.rotationSpeedScale) * sharedState.rotationSpeedScaleLerp;
  const scaledDt = dt * tubeState.rotationSpeedScale;

  const baseSpeed = sharedState.tubeNaturalDir * sharedState.baseSpeed;
  tubeState.angle += (baseSpeed + sharedState.tubeSpinVelocity) * scaledDt;

  sharedState.tubeAngle = tubeState.angle;

  // Apply Rotation to Rows
  const totalRows = tubeState.rowGroups.length;
  for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
    const rowObj = tubeState.rowGroups[rowIndex];
    if (!rowObj) continue;
    const baseRow = rowIndex % tubeState.rows;
    rowObj.rotation.y = tubeState.angle * tubeState.rowSpeeds[baseRow];
  }
}

export function checkArchiveTubeIntersections(tubeState, camera, sharedState) {
  if (!tubeState) return;

  tubeState.raycaster.setFromCamera(tubeState.mouse, camera);

  const meshes = [];
  tubeState.group.traverse(child => {
    if (child.isMesh) meshes.push(child);
  });

  const intersects = tubeState.raycaster.intersectObjects(meshes);

  if (intersects.length > 0) {
    const object = intersects[0].object;
    if (tubeState.intersected !== object) {
      tubeState.intersected = object;
      sharedState.hoveredProject = object.userData.projectName;

      if (sharedState.hoverSlowdownEnabled) {
        sharedState.rotationSpeedScaleTarget = sharedState.hoverSlowdownScale;
      }
    }
  } else {
    if (tubeState.intersected) {
      tubeState.intersected = null;
      sharedState.hoveredProject = null;
      sharedState.rotationSpeedScaleTarget = 1;
    }
  }
}

export function updateArchiveTubeMouseMove(tubeState, event) {
  if (!tubeState) return;
  tubeState.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  tubeState.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

export function destroyArchiveTube(tubeState) {
  if (!tubeState) return;

  tubeState.group.traverse(child => {
    if (child.isMesh) {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    }
  });

  tubeState.textures.forEach(tex => tex.dispose());

  if (tubeState.group.parent) {
    tubeState.group.parent.remove(tubeState.group);
  }

  tubeState.rowGroups = [];
  tubeState.textures = [];
  tubeState.intersected = null;
}
