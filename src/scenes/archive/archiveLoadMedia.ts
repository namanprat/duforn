import * as THREE from "three";

export function configureArchiveTexture(texture: THREE.Texture) {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
}

export type ArchiveMediaSource = {
  url: string;
  texture: THREE.Texture;
  isVideo: boolean;
  width: number;
  height: number;
};

export function loadArchiveMediaSource(url: string): Promise<ArchiveMediaSource> {
  if (/\.webm$/i.test(url)) {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.crossOrigin = "anonymous";
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.preload = "auto";
      video.src = url;

      const onReady = () => {
        video.removeEventListener("loadeddata", onReady);
        void video.play();
        const texture = new THREE.VideoTexture(video);
        configureArchiveTexture(texture);
        resolve({
          url,
          texture,
          isVideo: true,
          width: video.videoWidth || 1,
          height: video.videoHeight || 1,
        });
      };

      video.addEventListener("loadeddata", onReady);
      video.addEventListener("error", () => reject(new Error(`archive video failed: ${url}`)));
    });
  }

  return new THREE.TextureLoader().loadAsync(url).then((texture) => {
    configureArchiveTexture(texture);
    const img = texture.image as { width: number; height: number };
    return {
      url,
      texture,
      isVideo: false,
      width: img?.width || 1,
      height: img?.height || 1,
    };
  });
}

export function disposeArchiveMediaSource(source: ArchiveMediaSource) {
  const image = source.texture.image as HTMLVideoElement | undefined;
  if (image instanceof HTMLVideoElement) {
    image.pause();
    image.removeAttribute("src");
    image.load();
  }
  source.texture.dispose();
}
