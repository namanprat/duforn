export default function ArchivePage() {
  return (
    <main id="main" data-page-container="true" data-page-namespace="archive" aria-label="Archive">
      <div className="archive-page">
        <header className="archive-page__header u-container-main">
          <p className="archive-page__eyebrow u-text-style-small u-text-style-font-secondary">
            Index
          </p>
          <h1 className="archive-page__title u-text-style-h2">Archive</h1>
          <p className="archive-page__note u-text-style-small u-text-style-font-secondary">
            Static index page. The site canvas uses the same scene as home on this route.
          </p>
        </header>
      </div>
    </main>
  );
}
