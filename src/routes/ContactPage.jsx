import React from "react";

export default function ContactPage() {
  return (
    <main id="main" data-page-container="true" data-page-namespace="contact">
      <section className="contact_section u-background-transparent">
        {/* Credits Grid */}
        <div className="contact_credits u-container-main">
          {/* Left Column: Contact Details */}
          <div className="contact_col">
            <div className="contact_row reveal-body">
              <span className="contact_label">Email</span>
              <a href="mailto:naman@duforn.com" className="contact_value">
                naman@duforn.com
              </a>
            </div>
            <div className="contact_row reveal-body">
              <span className="contact_label">Instagram</span>
              <a
                href="https://www.instagram.com/namanprat_"
                target="_blank"
                rel="noopener noreferrer"
                className="contact_value"
              >
                @namanprat_
              </a>
            </div>
            <div className="contact_row reveal-body">
              <span className="contact_label">Are.na</span>
              <a
                href="https://www.are.na/naman-pratulya/channels"
                target="_blank"
                rel="noopener noreferrer"
                className="contact_value"
              >
                naman pratulya
              </a>
            </div>
            <div className="contact_row reveal-body">
              <span className="contact_label">LinkedIn</span>
              <a
                href="https://www.linkedin.com/in/namanprat/"
                target="_blank"
                rel="noopener noreferrer"
                className="contact_value"
              >
                naman pratulya
              </a>
            </div>
            <div className="contact_row reveal-body">
              <span className="contact_label">Schedule</span>
              <a
                href="https://cal.com/namanprat/discovery-call"
                target="_blank"
                rel="noopener noreferrer"
                className="contact_value"
              >
                discovery call
              </a>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="contact_col">
            <form className="contact_form" onSubmit={(e) => e.preventDefault()}>
              <div className="contact_field reveal-body">
                <label htmlFor="contact-name" className="contact_label">
                  Name
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  className="contact_input"
                />
              </div>
              <div className="contact_field reveal-body">
                <label htmlFor="contact-email" className="contact_label">
                  Email
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="contact_input"
                />
              </div>
              <div className="contact_field reveal-body">
                <label htmlFor="contact-message" className="contact_label">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows="4"
                  required
                  className="contact_input contact_textarea"
                />
              </div>
              <div className="contact_field reveal-body">
                <span className="contact_label" aria-hidden="true" />
                <button type="submit" className="contact_button">
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer — matches position of <p> in home hero bottom */}
        <div className="contact_footer reveal-body">
          <p className="contact_footer_text">© 2026 Duforn. All rights reserved.</p>
        </div>
      </section>
    </main>
  );
}
