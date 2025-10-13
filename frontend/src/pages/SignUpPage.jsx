import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../api/axios";
import "./SignUpPage.css";

const SignUpPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    role: "student",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Real-time validation
  const validateField = (name, value) => {
    let error = "";
    
    switch (name) {
      case "first_name":
      case "last_name":
        if (value.length < 2) {
          error = "Must be at least 2 characters";
        } else if (!/^[a-zA-Z\s]+$/.test(value)) {
          error = "Only letters allowed";
        }
        break;
      
      case "username":
        if (value.length < 3) {
          error = "Must be at least 3 characters";
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          error = "Only letters, numbers, and underscore";
        }
        break;
      
      case "email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Invalid email format";
        }
        break;
      
      case "password":
        if (value.length < 8) {
          error = "Must be at least 8 characters";
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          error = "Must include uppercase, lowercase, and number";
        }
        break;
      
      case "confirm_password":
        if (value !== formData.password) {
          error = "Passwords do not match";
        }
        break;
      
      default:
        break;
    }
    
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Validate on change if field was touched
    if (touchedFields[name]) {
      const error = validateField(name, value);
      setFieldErrors({ ...fieldErrors, [name]: error });
    }

    // Also validate confirm_password if password changes
    if (name === "password" && touchedFields.confirm_password) {
      const confirmError = formData.confirm_password !== value ? "Passwords do not match" : "";
      setFieldErrors({ ...fieldErrors, confirm_password: confirmError });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouchedFields({ ...touchedFields, [name]: true });
    
    const error = validateField(name, value);
    setFieldErrors({ ...fieldErrors, [name]: error });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    // Check if user agreed to terms
    if (!agreedToTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy");
      setLoading(false);
      return;
    }

    // Validate all fields
    const errors = {};
    Object.keys(formData).forEach(key => {
      if (key !== "confirm_password") { // Don't send confirm_password to backend
        const error = validateField(key, formData[key]);
        if (error) errors[key] = error;
      }
    });

    // Validate confirm_password
    if (formData.password !== formData.confirm_password) {
      errors.confirm_password = "Passwords do not match";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setTouchedFields(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
      setLoading(false);
      return;
    }

    try {
      // Remove confirm_password before sending to backend
      // eslint-disable-next-line 
      const { confirm_password, ...submitData } = formData;
      // eslint-disable-next-line 
      const res = await axiosInstance.post("/accounts/signup/", submitData);

      // Show success message
      setSuccessMessage("Account created successfully! Redirecting to login...");

      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate("/signin", { 
          state: { 
            message: "Registration successful! Please sign in with your credentials.",
            email: formData.email 
          } 
        });
      }, 2000);

    } catch (err) {
      if (err.response && err.response.data) {
        const serverError = err.response.data;
        let errorMsg = "";

        if (typeof serverError === "string") {
          errorMsg = serverError;
        } else if (serverError.detail) {
          errorMsg = serverError.detail;
        } else {
          errorMsg = Object.entries(serverError)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
            .join(", ");
        }
        setError(errorMsg);
      } else {
        setError("Signup failed. Please check your details and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getInputClass = (fieldName) => {
    if (!touchedFields[fieldName]) return "";
    return fieldErrors[fieldName] ? "error" : "valid";
  };

  return (
    <div className="auth-container">
      {/* Left Side - Image & Branding */}
      <div className="auth-image-section">
        <div className="auth-overlay">
          <div className="auth-branding">
            <i className="fas fa-home-lg-alt"></i>
            <h1>Welcome to SmartHunt</h1>
            <p>Find your perfect student accommodation near campus</p>
            <div className="auth-features">
              <div className="feature-item">
                <i className="fas fa-map-marker-alt"></i>
                <span>University-specific listings</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-shield-check"></i>
                <span>Verified properties only</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-users"></i>
                <span>Trusted by thousands of students</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="auth-form-section">
        <div className="auth-form-container">
          <div className="auth-header">
            <i className="fas fa-user-plus"></i>
            <h2>Create Your Account</h2>
            <p>Join the SmartHunt community today</p>
          </div>

          {error && (
            <div className="alert alert-error">
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="alert alert-success">
              <i className="fas fa-check-circle"></i>
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="first_name">
                  <i className="fas fa-user"></i>
                  First Name
                </label>
                <input
                  id="first_name"
                  type="text"
                  name="first_name"
                  placeholder="Enter your first name"
                  value={formData.first_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getInputClass("first_name")}
                  required
                />
                {touchedFields.first_name && fieldErrors.first_name && (
                  <span className="field-error">
                    <i className="fas fa-exclamation-circle"></i>
                    {fieldErrors.first_name}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="last_name">
                  <i className="fas fa-user"></i>
                  Last Name
                </label>
                <input
                  id="last_name"
                  type="text"
                  name="last_name"
                  placeholder="Enter your last name"
                  value={formData.last_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getInputClass("last_name")}
                  required
                />
                {touchedFields.last_name && fieldErrors.last_name && (
                  <span className="field-error">
                    <i className="fas fa-exclamation-circle"></i>
                    {fieldErrors.last_name}
                  </span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="username">
                <i className="fas fa-at"></i>
                Username
              </label>
              <input
                id="username"
                type="text"
                name="username"
                placeholder="Choose a unique username"
                value={formData.username}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClass("username")}
                required
              />
              {touchedFields.username && fieldErrors.username && (
                <span className="field-error">
                  <i className="fas fa-exclamation-circle"></i>
                  {fieldErrors.username}
                </span>
              )}
            </div>

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
                onBlur={handleBlur}
                className={getInputClass("email")}
                autoComplete="email"
                required
              />
              {touchedFields.email && fieldErrors.email && (
                <span className="field-error">
                  <i className="fas fa-exclamation-circle"></i>
                  {fieldErrors.email}
                </span>
              )}
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
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getInputClass("password")}
                  autoComplete="new-password"
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
              {touchedFields.password && fieldErrors.password && (
                <span className="field-error">
                  <i className="fas fa-exclamation-circle"></i>
                  {fieldErrors.password}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirm_password">
                <i className="fas fa-lock"></i>
                Confirm Password
              </label>
              <div className="password-input-wrapper">
                <input
                  id="confirm_password"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirm_password"
                  placeholder="Re-enter your password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getInputClass("confirm_password")}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label="Toggle confirm password visibility"
                >
                  <i className={`fas ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
              {touchedFields.confirm_password && fieldErrors.confirm_password && (
                <span className="field-error">
                  <i className="fas fa-exclamation-circle"></i>
                  {fieldErrors.confirm_password}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="role">
                <i className="fas fa-user-tag"></i>
                I am a
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="student">Student - Looking for accommodation</option>
                <option value="landlord">Landlord - Listing properties</option>
              </select>
            </div>

            <div className="form-group-checkbox">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  required
                />
                <span className="checkbox-text">
                  I agree to the{" "}
                  <Link to="/terms" target="_blank" className="terms-link">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" target="_blank" className="terms-link">
                    Privacy Policy
                  </Link>
                </span>
              </label>
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Creating Account...
                </>
              ) : (
                <>
                  <i className="fas fa-user-plus"></i>
                  Sign Up
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>Already have an account?</p>
            <Link to="/signin" className="auth-switch-link">
              <i className="fas fa-sign-in-alt"></i>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;