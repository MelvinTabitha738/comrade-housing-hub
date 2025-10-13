import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";
import Logo from "../assets/logo.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Check login state on mount + listen for storage changes
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const userRole = localStorage.getItem("role");
      if (token) {
        setIsLoggedIn(true);
        setRole(userRole);
      } else {
        setIsLoggedIn(false);
        setRole(null);
      }
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    setRole(null);
    navigate("/");
    window.dispatchEvent(new Event("storage"));
  };

  // Handle body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("mobile-menu-open");
    } else {
      document.body.classList.remove("mobile-menu-open");
    }
    return () => {
      document.body.classList.remove("mobile-menu-open");
    };
  }, [isOpen]);

  // Smooth scroll to section
  const scrollToSection = (sectionId) => {
    // If not on homepage, navigate there first
    if (location.pathname !== "/") {
      navigate("/");
      // Wait for navigation then scroll
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          const offset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }, 100);
    } else {
      // Already on homepage, just scroll
      const element = document.getElementById(sectionId);
      if (element) {
        const offset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    }
    // Close mobile menu if open
    setIsOpen(false);
  };

  // Handle navigation - scroll if on homepage, navigate if not
  const handleNavClick = (e, sectionId) => {
    e.preventDefault();
    scrollToSection(sectionId);
  };

  return (
    <>
      <nav className="navbar">
        {/* Logo */}
        <div className="Logo">
          <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <img src={Logo} alt="SmartHunt Logo" className="logo-image" />
          </Link>
        </div>

        {/* Desktop Links */}
        <ul className="nav-links">
          <li>
            <a href="#home" onClick={(e) => handleNavClick(e, "home")}>
              Home
            </a>
          </li>
          <li>
            <a href="#features" onClick={(e) => handleNavClick(e, "features")}>
              Features
            </a>
          </li>
          <li>
            <a href="#about" onClick={(e) => handleNavClick(e, "about")}>
              About
            </a>
          </li>
          <li>
            <a href="#contact" onClick={(e) => handleNavClick(e, "contact")}>
              Contact
            </a>
          </li>
          
        </ul>

        {/* Actions (Desktop) */}
        <div className="nav-actions">
          {!isLoggedIn ? (
            <>
              <Link to="/signin" className="btn-secondary">
                <i className="fas fa-sign-in-alt"></i> Sign In
              </Link>
              <Link to="/signup" className="btn-primary">
                <i className="fas fa-user-plus" /> Sign Up
              </Link>
            </>
          ) : (
            <>
              {role === "landlord" && (
                <Link to="/landlord-dashboard" className="btn-primary">
                  Dashboard
                </Link>
              )}
              {role === "student" && (
                <Link to="/student-dashboard" className="btn-primary">
                  Dashboard
                </Link>
              )}
              <button onClick={handleLogout} className="btn-secondary">
                Logout
              </button>
            </>
          )}
        </div>

        {/* Hamburger Menu */}
        <div className="hamburger" onClick={toggleMenu}>
          <div className={`bar ${isOpen ? "open" : ""}`}></div>
          <div className={`bar ${isOpen ? "open" : ""}`}></div>
          <div className={`bar ${isOpen ? "open" : ""}`}></div>
        </div>
      </nav>

      {/* Background Blur Overlay */}
      <div
        className={`mobile-menu-overlay ${isOpen ? "active" : ""}`}
        onClick={toggleMenu}
        style={{ pointerEvents: isOpen ? "auto" : "none" }}
      ></div>

      {/* Mobile Sidebar */}
      <div
        className={`mobile-menu ${isOpen ? "active" : ""}`}
        style={{ pointerEvents: isOpen ? "auto" : "none" }}
      >
        <div
          className="mobile-menu-close"
          onClick={(e) => {
            e.stopPropagation();
            toggleMenu();
          }}
        ></div>

        <ul>
          <li>
            <a href="#home" onClick={(e) => handleNavClick(e, "home")}>
              Home
            </a>
          </li>
          <li>
            <a href="#features" onClick={(e) => handleNavClick(e, "features")}>
              Features
            </a>
          </li>
          <li>
            <a href="#about" onClick={(e) => handleNavClick(e, "about")}>
              About
            </a>
          </li>
          <li>
            <a href="#contact" onClick={(e) => handleNavClick(e, "contact")}>
              Contact
            </a>
          </li>
          
        </ul>

        <div className="mobile-actions">
          {!isLoggedIn ? (
            <>
              <Link to="/signin" className="btn-secondary" onClick={toggleMenu}>
                Sign In
              </Link>
              <Link to="/signup" className="btn-primary" onClick={toggleMenu}>
                Sign Up
              </Link>
            </>
          ) : (
            <>
              {role === "landlord" && (
                <Link to="/landlord-dashboard" className="btn-primary" onClick={toggleMenu}>
                  Dashboard
                </Link>
              )}
              {role === "student" && (
                <Link to="/student-dashboard" className="btn-primary" onClick={toggleMenu}>
                  Dashboard
                </Link>
              )}
              <button onClick={handleLogout} className="btn-secondary">
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;