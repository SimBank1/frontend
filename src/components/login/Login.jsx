"use client";

import { useState } from "react";
import {
  Eye,
  EyeOff,
  X,
  CheckCircle,
  AlertCircle,
  Shield,
  Users,
  Lock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import "./Login.css";

export default function Login({
  onLogin,
  logoSrc = "/logo-rm.png?height=40&width=120",
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [popup, setPopup] = useState({
    message: "",
    type: "success",
    show: false,
  });

  const navigate = useNavigate();
  const [cookies, setCookie] = useCookies(["sessionCokie"]);

  const [fieldErrors, setFieldErrors] = useState({
    username: false,
    password: false,
  });

  const [shakeFields, setShakeFields] = useState({
    username: false,
    password: false,
  });

  const [shakeField, setShakeField] = useState("");
  const [successPopup, setSuccessPopup] = useState({
    show: false,
    message: "",
    canDismiss: false,
  });

  const showPopup = (message, type) => {
    setPopup({ message, type, show: true });

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setPopup((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  const hidePopup = () => {
    setPopup((prev) => ({ ...prev, show: false }));
  };

  const triggerShake = (field) => {
    setShakeFields((prev) => ({ ...prev, [field]: true }));
    setTimeout(() => {
      setShakeFields((prev) => ({ ...prev, [field]: false }));
    }, 600);
  };

  const validateForm = () => {
    const isUsernameEmpty = username.trim() === "";
    const isPasswordEmpty = password.trim() === "";

    setFieldErrors({
      username: isUsernameEmpty,
      password: isPasswordEmpty,
    });

    if (isUsernameEmpty) {
      triggerShake("username");
    }
    if (isPasswordEmpty) {
      triggerShake("password");
    }

    return !isUsernameEmpty && !isPasswordEmpty;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));

    if (username === "admin" && password === "admin") {
      setCookie("sessionCokie", "admin", { path: "/" });
      setSuccessPopup({
        show: true,
        message: "✅ Welcome Admin! Redirecting to dashboard...",
        canDismiss: false,
      });

      // Auto redirect after 3 seconds if not dismissed
      setTimeout(() => {
        if (onLogin) onLogin({ username, password, userType: "admin" });
        navigate("/dashboard");
      }, 1000);
    } else if (username === "employee" && password === "employee") {
      setCookie("sessionCokie", "employee", { path: "/" });
      setSuccessPopup({
        show: true,
        message: "✅ Welcome Employee! Redirecting to your workspace...",
        canDismiss: false,
      });
      // Auto redirect after 3 seconds if not dismissed
      setTimeout(() => {
        if (onLogin) onLogin({ username, password, userType: "employee" });
        navigate("/dashboard");
      }, 1000);
    } else {
      setPassword("");
      // Determine which field to shake based on the error
      if (username !== "admin" && username !== "employee") {
        setShakeField("username");
      } else {
        setShakeField("password");
      }

      // Clear shake after animation
      setTimeout(() => {
        setShakeField("");
      }, 600);
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  const handleMouseDown = () => {
    setShowPassword(true);
  };

  const handleMouseUp = () => {
    setShowPassword(false);
  };

  const handleMouseLeave = () => {
    setShowPassword(false);
  };

  const handleSuccessPopupDismiss = () => {
    if (successPopup.canDismiss) {
      setSuccessPopup({ show: false, message: "", canDismiss: false });
      if (onLogin) {
        if (username === "admin") {
          onLogin({ username, password, userType: "admin" });
        } else {
          onLogin({ username, password, userType: "employee" });
        }
      }
      navigate("/dashboard");
    }
  };

  return (
    <div className="login-container">
      {/* Background */}
      <div className="login-background" />
      <div className="login-overlay" />

      {/* Animated background elements */}
      <div className="animated-bg">
        <div className="bg-element bg-element-1"></div>
        <div className="bg-element bg-element-2"></div>
        <div className="bg-element bg-element-3"></div>
      </div>

      {/* Content */}
      <div className={`login-content ${popup.show ? "blurred" : ""}`}>
        {/* Navigation */}
        <nav className="login-nav">
          <div className="nav-container">
            <div className="nav-content">
              <div className="nav-logo">
                <div className="nav-logo-icon">
                  <Shield size={24} color="white" />
                </div>
                <div className="nav-title">
                  <h1>SimBank</h1>
                </div>
              </div>
              <div className="nav-info">
                <div className="nav-secure">
                  <Lock size={14} />
                  <span>Secure Access</span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="main-content">
          {/* Left Side - Info */}
          <div className="info-section">
            <div className="info-header">
              <div className="info-title-section">
                <div className="info-icon">
                  <Users size={32} color="white" />
                </div>
                <div className="info-title">
                  <h1>Staff Portal</h1>
                  <p>SimBank Internal Access</p>
                </div>
              </div>

              <p className="info-description">
                Secure access for administrators and employees. Manage
                operations, oversee accounts, and maintain the highest standards
                of banking excellence.
              </p>
            </div>

            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-header">
                  <Shield size={20} color="white" />
                  <h4 className="feature-title">Admin Dashboard</h4>
                </div>
                <p className="feature-description">
                  Full system control and oversight capabilities
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-header">
                  <Users size={20} color="white" />
                  <h4 className="feature-title">Employee Workspace</h4>
                </div>
                <p className="feature-description">
                  Customer service and account management tools
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-header">
                  <Lock size={20} color="white" />
                  <h4 className="feature-title">Secure Environment</h4>
                </div>
                <p className="feature-description">
                  End-to-end encryption and audit logging
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-header">
                  <CheckCircle size={20} color="white" />
                  <h4 className="feature-title">Compliance Ready</h4>
                </div>
                <p className="feature-description">
                  EU banking regulations and GDPR compliant
                </p>
              </div>
            </div>

            <div className="security-notice">
              <p className="security-text">
                <Lock size={14} />
                This is a restricted access portal. All activities are monitored
                and logged.
              </p>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="login-form-section">
            <div className="login-form">
              {/* Decorative glow */}
              <div className="form-glow-1"></div>
              <div className="form-glow-2"></div>

              <div className="form-content">
                <div className="form-header">
                  <div className="form-icon">
                    <div className="form-icon-bg">
                      <Shield size={24} color="white" />
                    </div>
                  </div>
                  <h2 className="form-title">Staff Login</h2>
                  <p className="form-subtitle">
                    Enter your credentials to continue
                  </p>
                </div>

                <div className="form-fields">
                  <div className="field-group">
                    <label className="field-label">Username</label>
                    <input
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        if (fieldErrors.username) {
                          setFieldErrors((prev) => ({
                            ...prev,
                            username: false,
                          }));
                        }
                      }}
                      onKeyDown={handleKeyPress}
                      className={`field-input ${
                        fieldErrors.username ? "error" : ""
                      } ${shakeField === "username" ? "shake" : ""}`}
                    />
                    {fieldErrors.username && (
                      <p className="field-error">
                        <AlertCircle size={12} />
                        Username is required
                      </p>
                    )}
                  </div>

                  <div className="field-group">
                    <label className="field-label">Password</label>
                    <div className="password-field">
                      <input
                        type={showPassword ? "text" : "password"}
                        name={
                          import.meta.env.DEV ? "dev_login_fake" : "password"
                        }
                        autoComplete="off"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (fieldErrors.password) {
                            setFieldErrors((prev) => ({
                              ...prev,
                              password: false,
                            }));
                          }
                        }}
                        onKeyDown={handleKeyPress}
                        className={`field-input ${
                          fieldErrors.password ? "error" : ""
                        } ${shakeField === "password" ? "shake" : ""}`}
                      />

                      <button
                        type="button"
                        className="password-toggle"
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseLeave}
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    {fieldErrors.password && (
                      <p className="field-error">
                        <AlertCircle size={12} />
                        Password is required
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handleLogin}
                    disabled={isLoading}
                    className="login-button"
                  >
                    {isLoading ? (
                      <>
                        <div className="loading-spinner" />
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <>
                        <Shield size={18} />
                        <span>Access Portal</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="form-footer">
                  <p className="footer-text">
                    Authorized personnel only. All access is monitored and
                    logged.
                  </p>
                  <p className="footer-copyright">
                    © {new Date().getFullYear()} SimBank EU. All rights
                    reserved.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popup Modal */}
      {popup.show && (
        <div className="popup-overlay" onClick={hidePopup}>
          <div className="popup-glow-container">
            {/* Outer glow */}
            <div className={`popup-outer-glow ${popup.type}`} />

            {/* Inner glow */}
            <div className={`popup-inner-glow ${popup.type}`} />

            {/* Main popup */}
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>
              <button onClick={hidePopup} className="popup-close">
                <X size={18} />
              </button>

              <div className="popup-header">
                <div className={`popup-icon ${popup.type}`}>
                  {popup.type === "success" ? (
                    <CheckCircle size={20} color="white" />
                  ) : (
                    <AlertCircle size={20} color="white" />
                  )}
                </div>
                <h3 className="popup-title">
                  {popup.type === "success"
                    ? "Success"
                    : "Authentication Error"}
                </h3>
              </div>

              <p className="popup-message">{popup.message}</p>

              <button onClick={hidePopup} className="popup-button">
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Popup Modal */}
      {successPopup.show && (
        <div className="popup-overlay" onClick={handleSuccessPopupDismiss}>
          <div className="popup-glow-container">
            <div className="popup-outer-glow success" />
            <div className="popup-inner-glow success" />
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>
              {successPopup.canDismiss && (
                <button
                  onClick={handleSuccessPopupDismiss}
                  className="popup-close"
                >
                  <X size={18} />
                </button>
              )}
              <div className="popup-header">
                <div className="popup-icon success">
                  <CheckCircle size={20} color="white" />
                </div>
                <h3 className="popup-title">Success</h3>
              </div>
              <p className="popup-message">{successPopup.message}</p>
              {successPopup.canDismiss && (
                <button
                  onClick={handleSuccessPopupDismiss}
                  className="popup-button"
                >
                  Continue
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
