import { useEffect } from "react";
import { getArchiveReturnRoom } from "../store/archiveReturn";
import { scheduleArchiveReturnPreload } from "../lib/roomReturnPreload";

/** Idle-preload the room the user came from while they browse archive. */
export default function ArchiveReturnPreload() {
  useEffect(() => {
    scheduleArchiveReturnPreload(getArchiveReturnRoom());
  }, []);

  return null;
}
