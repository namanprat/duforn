// Texture atlas builder for archive images
import * as THREE from "three";

// Create a texture atlas from loaded textures
export function createTextureAtlas(textures) {
  const atlasSize = Math.ceil(Math.sqrt(textures.length));
  const textureSize = 512;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = atlasSize * textureSize;
  const ctx = canvas.getContext("2d");

  // Fill with black background
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  textures.forEach((texture, index) => {
    const x = (index % atlasSize) * textureSize;
    const y = Math.floor(index / atlasSize) * textureSize;

    if (texture.image?.complete) {
      const img = texture.image;
      const aspect = img.width / img.height;
      let drawW = textureSize;
      let drawH = textureSize;
      let drawX = x;
      let drawY = y;

      if (aspect > 1) {
        // Wider image: cover by height, crop width
        drawW = textureSize * aspect;
        drawX = x - (drawW - textureSize) / 2;
      } else {
        // Taller image: cover by width, crop height
        drawH = textureSize / aspect;
        drawY = y - (drawH - textureSize) / 2;
      }

      ctx.drawImage(img, drawX, drawY, drawW, drawH);
    }
  });

  const atlasTexture = new THREE.CanvasTexture(canvas);
  atlasTexture.wrapS = THREE.ClampToEdgeWrapping;
  atlasTexture.wrapT = THREE.ClampToEdgeWrapping;
  atlasTexture.minFilter = THREE.LinearFilter;
  atlasTexture.magFilter = THREE.LinearFilter;
  atlasTexture.flipY = false;

  return atlasTexture;
}

// Load all project textures
export function loadTextures(projects) {
  const textureLoader = new THREE.TextureLoader();
  const imageTextures = [];
  const aspectRatios = [];
  let loadedCount = 0;

  return new Promise((resolve) => {
    if (projects.length === 0) {
      resolve({ imageTextures, aspectRatios });
      return;
    }

    projects.forEach((project, index) => {
      const texture = textureLoader.load(
        project.image,
        (tex) => {
          aspectRatios[index] = tex.image.width / tex.image.height;
          loadedCount++;
          if (loadedCount === projects.length) {
            resolve({ imageTextures, aspectRatios });
          }
        },
        undefined,
        () => {
          // Error loading - use default aspect ratio
          aspectRatios[index] = 1;
          loadedCount++;
          if (loadedCount === projects.length) {
            resolve({ imageTextures, aspectRatios });
          }
        }
      );

      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      imageTextures.push(texture);
    });
  });
}
