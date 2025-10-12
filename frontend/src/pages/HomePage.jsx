import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./HomePage.css";

const HomePage = () => {
  const navigate = useNavigate();

  // Smooth scroll to section
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Navbar height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Add visible class for CSS animations
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll(".animate-on-scroll");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="homepage">
      {/* HERO SECTION */}
      <section id="home" className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-text animate-on-scroll" id="hero-text">
            <span className="hero-badge">
              <i className="fas fa-home"></i>
              Student Housing Platform
            </span>
            <h1 className="hero-title">
              Find Your Perfect
              <span className="gradient-text"> Student Accommodation</span>
            </h1>
            <p className="hero-subtitle">
              SmartHunt connects students with verified apartments near their
              university. Search by campus, compare options, and secure your
              ideal home in minutes.
            </p>
            <div className="hero-buttons">
              <button
                onClick={() => navigate("/properties")}
                className="btn-hero-primary"
              >
                <i className="fas fa-search"></i>
                Browse Properties
              </button>
              <button
                onClick={() => scrollToSection("features")}
                className="btn-hero-secondary"
              >
                <i className="fas fa-play-circle"></i>
                How It Works
              </button>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <i className="fas fa-building"></i>
                <div>
                  <h3>500+</h3>
                  <p>Properties Listed</p>
                </div>
              </div>
              <div className="stat-item">
                <i className="fas fa-users"></i>
                <div>
                  <h3>2,000+</h3>
                  <p>Happy Students</p>
                </div>
              </div>
              <div className="stat-item">
                <i className="fas fa-university"></i>
                <div>
                  <h3>50+</h3>
                  <p>Universities Covered</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="scroll-indicator" onClick={() => scrollToSection("features")}>
          <i className="fas fa-chevron-down"></i>
        </div>
      </section>

      {/* FEATURES / HOW IT WORKS SECTION */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="section-header animate-on-scroll" id="features-header">
            <span className="section-badge">How It Works</span>
            <h2 className="section-title">Find Your Home in 3 Easy Steps</h2>
            <p className="section-subtitle">
              Our streamlined process makes finding student accommodation simple
              and stress-free
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card animate-on-scroll" id="feature-1">
              <div className="feature-icon">
                <i className="fas fa-search-location"></i>
              </div>
              <div className="feature-number">01</div>
              <h3>Search by University</h3>
              <p>
                Enter your university name and instantly view all verified
                apartments within walking distance or with easy transport access.
              </p>
              <ul className="feature-list">
                <li><i className="fas fa-check"></i> Filter by price range</li>
                <li><i className="fas fa-check"></i> View distance to campus</li>
                <li><i className="fas fa-check"></i> Check amenities</li>
              </ul>
            </div>

            <div className="feature-card animate-on-scroll" id="feature-2">
              <div className="feature-icon">
                <i className="fas fa-heart"></i>
              </div>
              <div className="feature-number">02</div>
              <h3>Compare & Save Favorites</h3>
              <p>
                Browse detailed listings with photos, reviews, and virtual tours.
                Save your favorites and compare them side-by-side.
              </p>
              <ul className="feature-list">
                <li><i className="fas fa-check"></i> High-quality photos</li>
                <li><i className="fas fa-check"></i> Student reviews</li>
                <li><i className="fas fa-check"></i> 360° virtual tours</li>
              </ul>
            </div>

            <div className="feature-card animate-on-scroll" id="feature-3">
              <div className="feature-icon">
                <i className="fas fa-handshake"></i>
              </div>
              <div className="feature-number">03</div>
              <h3>Connect & Move In</h3>
              <p>
                Message landlords directly, schedule viewings, and complete your
                booking securely through our platform.
              </p>
              <ul className="feature-list">
                <li><i className="fas fa-check"></i> Direct messaging</li>
                <li><i className="fas fa-check"></i> Secure payments</li>
                <li><i className="fas fa-check"></i> Digital contracts</li>
              </ul>
            </div>
          </div>

          {/* Additional Features */}
          <div className="additional-features">
            <h3 className="af-title animate-on-scroll" id="af-title">
              Why Students Choose SmartHunt
            </h3>
            <div className="af-grid">
              <div className="af-item animate-on-scroll" id="af-1">
                <i className="fas fa-shield-check"></i>
                <h4>Verified Properties</h4>
                <p>Every listing is verified for authenticity and safety</p>
              </div>
              <div className="af-item animate-on-scroll" id="af-2">
                <i className="fas fa-dollar-sign"></i>
                <h4>No Hidden Fees</h4>
                <p>Transparent pricing with no surprise charges</p>
              </div>
              <div className="af-item animate-on-scroll" id="af-3">
                <i className="fas fa-headset"></i>
                <h4>24/7 Support</h4>
                <p>Our team is always here to help you</p>
              </div>
              <div className="af-item animate-on-scroll" id="af-4">
                <i className="fas fa-mobile-alt"></i>
                <h4>Mobile Friendly</h4>
                <p>Search and book on any device, anywhere</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="about-section">
        <div className="container">
          <div className="about-content">
            <div className="about-image animate-on-scroll" id="about-image">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80"
                alt="Students collaborating"
              />
              <div className="about-image-overlay">
                <div className="about-stat">
                  <i className="fas fa-star"></i>
                  <div>
                    <h4>4.8/5</h4>
                    <p>Average Rating</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="about-text animate-on-scroll" id="about-text">
              <span className="section-badge">About SmartHunt</span>
              <h2 className="section-title">Your Trusted Student Housing Partner</h2>
              <p className="about-description">
                SmartHunt was founded by former students who experienced firsthand
                the challenges of finding quality accommodation near campus. We
                created a platform that puts students first, making the search
                process transparent, efficient, and stress-free.
              </p>
              <p className="about-description">
                Today, we're proud to serve thousands of students across multiple
                universities, connecting them with landlords who understand student
                needs and budgets. Our commitment is to make every student's
                housing journey as smooth as possible.
              </p>

              <div className="about-values">
                <div className="value-item">
                  <i className="fas fa-check-circle"></i>
                  <div>
                    <h4>Student-First Approach</h4>
                    <p>Every decision we make prioritizes student welfare</p>
                  </div>
                </div>
                <div className="value-item">
                  <i className="fas fa-check-circle"></i>
                  <div>
                    <h4>Trust & Transparency</h4>
                    <p>Honest listings with verified information</p>
                  </div>
                </div>
                <div className="value-item">
                  <i className="fas fa-check-circle"></i>
                  <div>
                    <h4>Community Building</h4>
                    <p>Connecting students with safe, welcoming communities</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate("/about")}
                className="btn-learn-more"
              >
                Learn More About Us
                <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="contact-section">
        <div className="container">
          <div className="section-header animate-on-scroll" id="contact-header">
            <span className="section-badge">Get In Touch</span>
            <h2 className="section-title">We're Here to Help</h2>
            <p className="section-subtitle">
              Have questions? Our team is ready to assist you
            </p>
          </div>

          <div className="contact-content">
            <div className="contact-info animate-on-scroll" id="contact-info">
              <div className="contact-card">
                <i className="fas fa-envelope"></i>
                <h4>Email Us</h4>
                <p>support@smarthunt.com</p>
                <a href="mailto:support@smarthunt.com" className="contact-link">
                  Send Email <i className="fas fa-arrow-right"></i>
                </a>
              </div>

              <div className="contact-card">
                <i className="fas fa-phone"></i>
                <h4>Call Us</h4>
                <p>+254 700 123 456</p>
                <a href="tel:+254700123456" className="contact-link">
                  Call Now <i className="fas fa-arrow-right"></i>
                </a>
              </div>

              <div className="contact-card">
                <i className="fas fa-map-marker-alt"></i>
                <h4>Visit Us</h4>
                <p>Meru, Kenya</p>
                <a href="#" className="contact-link">
                  Get Directions <i className="fas fa-arrow-right"></i>
                </a>
              </div>

              <div className="contact-social">
                <h4>Follow Us</h4>
                <div className="social-links">
                  <a href="#" aria-label="Facebook"><i className="fab fa-facebook"></i></a>
                  <a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
                  <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
                  <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin"></i></a>
                </div>
              </div>
            </div>

            <div className="contact-form-wrapper animate-on-scroll" id="contact-form">
              <form className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">
                      <i className="fas fa-user"></i>
                      Your Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">
                      <i className="fas fa-envelope"></i>
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="john@university.edu"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="subject">
                    <i className="fas fa-tag"></i>
                    Subject
                  </label>
                  <input
                    id="subject"
                    type="text"
                    placeholder="How can we help?"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">
                    <i className="fas fa-comment-alt"></i>
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows="5"
                    placeholder="Tell us more..."
                    required
                  ></textarea>
                </div>

                <button type="submit" className="btn-submit-contact">
                  <i className="fas fa-paper-plane"></i>
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>SmartHunt</h3>
              <p>Making student housing search simple and reliable.</p>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <a onClick={() => scrollToSection("home")}>Home</a>
              <a onClick={() => scrollToSection("features")}>Features</a>
              <a onClick={() => scrollToSection("about")}>About</a>
              <a onClick={() => scrollToSection("contact")}>Contact</a>
            </div>
            <div className="footer-section">
              <h4>For Students</h4>
              <Link to="/properties">Browse Properties</Link>
              <Link to="/signup">Create Account</Link>
              <Link to="/signin">Sign In</Link>
            </div>
            <div className="footer-section">
              <h4>For Landlords</h4>
              <Link to="/signup">List Property</Link>
              <Link to="/signin">Landlord Login</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 SmartHunt. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;