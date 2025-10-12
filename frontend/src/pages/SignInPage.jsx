import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../api/axios";
import "./SignInPage.css";

const SignInPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axiosInstance.post("/accounts/login/", formData);
      console.log("LOGIN RESPONSE:", res.data);

      const { access, refresh, user } = res.data;

      // Save tokens and role in localStorage
      localStorage.setItem("token", access);
      localStorage.setItem("refresh", refresh);
      localStorage.setItem("role", user.role);

      // Remember Me functionality
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", formData.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      // Trigger Navbar update
      window.dispatchEvent(new Event("storage"));

      // Redirect based on role
      if (user.role === "landlord") {
        navigate("/landlord-dashboard");
      } else if (user.role === "student") {
        navigate("/student-dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("LOGIN ERROR:", err);

      if (err.response && err.response.data) {
        const serverError = err.response.data;
        let errorMsg = "";

        if (typeof serverError === "string") {
          errorMsg = serverError;
        } else if (Array.isArray(serverError.detail)) {
          errorMsg = serverError.detail.join(", ");
        } else if (serverError.detail) {
          errorMsg = serverError.detail;
        } else {
          errorMsg = Object.entries(serverError)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
            .join(", ");
        }

        setError(errorMsg);
      } else {
        setError("Invalid email or password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setResetMessage("");
    setError("");

    if (!resetEmail) {
      setError("Please enter your email address");
      return;
    }

    try {
      // Make API call to your password reset endpoint
      await axiosInstance.post("/accounts/password-reset/", { email: resetEmail });
      setResetMessage("Password reset link has been sent to your email!");
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetEmail("");
        setResetMessage("");
      }, 3000);
      // eslint-disable-next-line
    } catch (err) {
      setError("Failed to send reset email. Please try again.");
    }
  };

  // Load remembered email on mount
  React.useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setFormData({ ...formData, email: rememberedEmail });
      setRememberMe(true);
    }
  }, [formData]);

  return (
    <div className="auth-container">
      {/* Left Side - Image & Branding */}
      <div className="auth-image-section">
        <div className="auth-overlay">
          <div className="auth-branding">
            <i className="fas fa-graduation-cap"></i>
            <h1>Welcome Back to SmartHunt</h1>
            <p>Your trusted platform for student accommodation</p>
            <div className="auth-features">
              <div className="feature-item">
                <i className="fas fa-search-location"></i>
                <span>Search thousands of listings</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-heart"></i>
                <span>Save your favorite properties</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-comments"></i>
                <span>Direct messaging with landlords</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="auth-form-section">
        <div className="auth-form-container">
          {!showForgotPassword ? (
            <>
              <div className="auth-header">
                <i className="fas fa-sign-in-alt"></i>
                <h2>Sign In to Your Account</h2>
                <p>Continue your housing search journey</p>
              </div>

              {error && (
                <div className="alert alert-error">
                  <i className="fas fa-exclamation-circle"></i>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label htmlFor="email">
                    <i className="fas fa-envelope"></i>
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="your.email@university.edu"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">
                    <i className="fas fa-lock"></i>
                    Password
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle password visibility"
                    >
                      <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                    </button>
                  </div>
                </div>

                <div className="form-options">
                  <label className="remember-me">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    className="forgot-password-link"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Forgot Password?
                  </button>
                </div>

                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Signing In...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-sign-in-alt"></i>
                      Sign In
                    </>
                  )}
                </button>
              </form>

              <div className="auth-footer">
                <p>Don't have an account?</p>
                <Link to="/signup" className="auth-switch-link">
                  <i className="fas fa-user-plus"></i>
                  Create Account
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="auth-header">
                <i className="fas fa-key"></i>
                <h2>Reset Your Password</h2>
                <p>Enter your email to receive a reset link</p>
              </div>

              {error && (
                <div className="alert alert-error">
                  <i className="fas fa-exclamation-circle"></i>
                  <span>{error}</span>
                </div>
              )}

              {resetMessage && (
                <div className="alert alert-success">
                  <i className="fas fa-check-circle"></i>
                  <span>{resetMessage}</span>
                </div>
              )}

              <form onSubmit={handleForgotPassword} className="auth-form">
                <div className="form-group">
                  <label htmlFor="reset-email">
                    <i className="fas fa-envelope"></i>
                    Email Address
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    placeholder="your.email@university.edu"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>

                <button type="submit" className="btn-submit">
                  <i className="fas fa-paper-plane"></i>
                  Send Reset Link
                </button>

                <button
                  type="button"
                  className="btn-back"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setError("");
                    setResetMessage("");
                  }}
                >
                  <i className="fas fa-arrow-left"></i>
                  Back to Sign In
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignInPage;