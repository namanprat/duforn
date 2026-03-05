export default function HomePage() {
  return (
    <main id="main" data-page-container="true" data-page-namespace="home">
      <section className="hero u-background-transparent">
        <div className="hero-contain u-alignment-center u-height-full">
          <div className="u-flex-vertical-nowrap u-justify-content-between u-container-main">
            <div className="hero-logo-top">
              <div className="home-hero-brand-clip">
                <h1 className="reveal-title home-hero-brand u-text-style-display" data-split-type="chars">duforn</h1>
              </div>
            </div>
            <div className="hero-bottom-contain u-flex-vertical-nowrap u-gap-3 u-alignment-center">
              <h2 className="reveal-body u-text-style-h2 u-width-full">
                duforn is a Digital Designer based in Mumbai, India and is currently open to new freelance opportunities.
              </h2>
              <p className="reveal-body u-mobile-hidden">
                duforn, an Art Direction and UX Design expert, is committed to crafting exceptional digital products that foster growth and engagement through meticulous design and strategic innovation.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
