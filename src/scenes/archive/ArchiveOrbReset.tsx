import { useEffect } from "react";
import { resetArchiveToOrbView } from "../../store/archiveView";

/** Orb is default archive view on every mount. */
export default function ArchiveOrbReset() {
  useEffect(() => {
    resetArchiveToOrbView();
  }, []);
  return null;
}
