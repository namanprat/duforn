import { Suspense } from "react";
import ArchiveCameras from "./archive/ArchiveCameras";
import ArchiveGridScene from "./archive/ArchiveGridScene";
import ArchivePosterField from "./archive/ArchivePosterField";
import ArchiveSceneClear from "./archive/ArchiveSceneClear";

/** Single archive scene — orb unwraps into infinite grid via rigState.morph. */
export default function ArchiveScene() {
  return (
    <>
      <ArchiveSceneClear />
      <ArchiveCameras />
      <ArchiveGridScene />
      <Suspense fallback={null}>
        <ArchivePosterField />
      </Suspense>
    </>
  );
}
