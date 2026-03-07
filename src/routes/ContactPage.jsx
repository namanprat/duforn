import { useEffect } from 'react';
import { animateStaggerEnter } from '../../scripts/text-reveal.js';

export default function ContactPage() {
  useEffect(() => {
    const elements = document.querySelectorAll('.contact-in');
    const tween = animateStaggerEnter(elements);
    return () => tween?.kill();
  }, []);

  return (
    <main id="main" data-page-container="true" data-page-namespace="contact">
      <section className="hero u-background-transparent">
        <div className="u-container contact-contain u-alignment-center">
          <div className="u-flex-vertical-nowrap">
            <h2 className="contact-header reveal-title">Say Hi!</h2>
            <a href="mailto:naman@duforn.com" className="u-text-style-h2 u-text-style-font-primary contact-in">
              naman@duforn.com
            </a>
          </div>
          <div className="middle u-flex-horizontal-nowrap u-alignment-center u-gap-2">
            <a href="https://www.instagram.com/namanprat_" target="_blank" rel="noopener noreferrer" className="u-text-style-h2 u-text-style-font-primary contact-in">
              Instagram
            </a>
            <p className="u-text-style-h2 u-text-style-font-primary contact-in">/</p>
            <a href="https://www.are.na/naman-pratulya/channels" target="_blank" rel="noopener noreferrer" className="u-text-style-h2 u-text-style-font-primary contact-in">
              are.na
            </a>
            <p className="u-text-style-h2 u-text-style-font-primary contact-in">/</p>
            <a href="https://www.linkedin.com/in/namanprat/" target="_blank" rel="noopener noreferrer" className="u-text-style-h2 u-text-style-font-primary contact-in">
              LinkedIn
            </a>
          </div>
          <a href="https://cal.com/namanprat/discovery-call" className="u-text-style-h2 u-text-style-font-primary contact-in">
            schedule a discovery call
          </a>
        </div>
      </section>
    </main>
  );
}
