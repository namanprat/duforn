import ArchiveViewSwitcher from "../components/archive/ArchiveViewSwitcher";
import ArchiveReturnPreload from "./ArchiveReturnPreload";

export default function ArchivePage() {
  return (
    <main id="main" data-page-namespace="archive" aria-label="Archive">
      <ArchiveReturnPreload />
      <ArchiveViewSwitcher />
    </main>
  );
}
