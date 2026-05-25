// @ts-nocheck
import { getProject } from "@theatre/core";
import cameraState from "./cameraState.json";
import { DEFAULT_CAMERA_BASE_POSE } from "./cameraBasePose";

const PROJECT_ID = "Duforn";
const SHEET_ID = "RoomCamera";
const CAMERA_OBJECT_ID = "CameraRig";

let projectPromise = null;
let studioInitPromise = null;

function resolveStudioModule(mod) {
  // Vite/CJS interop can nest the default export: mod.default.default
  const candidate = mod?.default?.default ?? mod?.default ?? mod;
  if (candidate && typeof candidate.initialize === "function") {
    return candidate;
  }
  return null;
}

function initTheatreStudio() {
  if (!import.meta.env.DEV) return Promise.resolve();
  if (studioInitPromise) return studioInitPromise;

  studioInitPromise = import("@theatre/studio")
    .then((mod) => {
      const studio = resolveStudioModule(mod);
      if (!studio) {
        console.warn("[theatre] Could not resolve @theatre/studio default export");
        return;
      }
      studio.initialize();
      studio.ui.hide();
    })
    .catch((error) => {
      console.warn("[theatre] Studio init failed", error);
    });

  return studioInitPromise;
}

export function getDufornTheatreProject() {
  if (!projectPromise) {
    projectPromise = initTheatreStudio().then(() => {
      const project = getProject(PROJECT_ID, { state: cameraState });
      return project.ready.then(() => project);
    });
  }
  return projectPromise;
}

export async function getRoomCameraSheet() {
  const project = await getDufornTheatreProject();
  return project.sheet(SHEET_ID);
}

export async function getRoomCameraObject() {
  const sheet = await getRoomCameraSheet();
  return sheet.object(CAMERA_OBJECT_ID, { ...DEFAULT_CAMERA_BASE_POSE });
}

export const ROOM_CAMERA_DEFAULTS = DEFAULT_CAMERA_BASE_POSE;
