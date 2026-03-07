import { useEffect } from 'react';
import gsap from 'gsap';

export default function ContactPage() {
  useEffect(() => {
    // Custom entrance animation to avoid SplitText conflicts with link-hover
    const elements = document.querySelectorAll('.contact-in');

    // Set initial state
    gsap.set(elements, { y: 60, opacity: 0 });

    // Animate after a small delay to match reveal-title timing
    gsap.to(elements, {
      y: 0,
      opacity: 1,
      duration: 0.6,
      stagger: 0.05,
      ease: "power2.out",
      delay: 0.1
    });
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
