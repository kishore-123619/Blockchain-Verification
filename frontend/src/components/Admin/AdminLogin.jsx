import React, { useState } from "react";
import {
  ChevronLeft,
  Shield,
  Mail,
  Lock,
  ArrowRight,
  Key,
  User,
} from "lucide-react";

import { authAPI } from "../../services/api";
import "./AdminLogin.css";

export const AdminLogin = ({
  setView,
  handleAdminLogin,
  loading,
  loginError,
}) => {
  // ======================
  // STATES
  // ======================

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [resetCompleted, setResetCompleted] = useState(false);

  const [resetLoading, setResetLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ======================
  // HANDLERS
  // ======================

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      await handleAdminLogin(email, password);
    } catch (error) {
      // handleAdminLogin already sets the UI-visible login error message.
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!resetEmail) {
      setError("Please enter your email");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setResetLoading(true);
      setError("");
      setMessage("");
      setResetCompleted(false);

      const response = await authAPI.forgotPassword({ email: resetEmail });

      setOtpSent(true);
      setMessage(response.data.message || "OTP sent to your email");
    } catch (err) {
      setOtpSent(false);
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!otp || !newPassword || !confirmPassword) {
      setError("Fill all fields");
      return;
    }

    if (otp.length !== 6) {
      setError("OTP must be 6 digits");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setResetLoading(true);
      setError("");
      setMessage("");

      const response = await authAPI.resetPassword({
        email: resetEmail,
        otp,
        newPassword,
      });

      setMessage(response.data.message || "Password reset successful!");
      setResetCompleted(true);

      setOtpSent(false);
      setResetEmail("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP or email");
    } finally {
      setResetLoading(false);
    }
  };

  // ======================
  // FORGOT PASSWORD VIEW
  // ======================

  if (forgotPasswordMode) {
    return (
      <div className="admin-login-section">
        <div className="admin-login-container">
          <div className="admin-login-card">
            <button
              onClick={() => setForgotPasswordMode(false)}
              className="admin-login-back-btn"
            >
              <ChevronLeft className="w-5 h-5" /> Back
            </button>

            <h2 className="admin-login-title">Reset Password</h2>

            {!otpSent && !resetCompleted ? (
              <form
                onSubmit={handleForgotPassword}
                className="admin-login-form"
              >
                <div className="admin-login-input-group">
                  <label>Email</label>

                  <div className="admin-login-input-wrapper">
                    <Mail className="admin-login-icon" />

                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="admin-login-input"
                      required
                    />
                  </div>
                </div>

                <p className="admin-login-note">
                  Enter the admin email first. If it is registered, an OTP will
                  be sent to that email.
                </p>

                {error && (
                  <p className="admin-login-alert admin-login-alert-error">
                    {error}
                  </p>
                )}
                {message && (
                  <p className="admin-login-alert admin-login-alert-success">
                    {message}
                  </p>
                )}

                <button
                  className="admin-login-submit-btn"
                  disabled={resetLoading}
                >
                  {resetLoading ? "Sending..." : "Confirm Email & Send OTP"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="admin-login-form">
                <div className="admin-login-input-group">
                  <label>OTP</label>

                  <div className="admin-login-input-wrapper">
                    <Key className="admin-login-icon" />

                    <input
                      type="text"
                      maxLength="6"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="admin-login-input"
                      required
                    />
                  </div>
                </div>

                <div className="admin-login-input-group">
                  <label>New Password</label>

                  <div className="admin-login-input-wrapper">
                    <Lock className="admin-login-icon" />

                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="admin-login-input"
                      required
                    />
                  </div>
                </div>

                <div className="admin-login-input-group">
                  <label>Confirm Password</label>

                  <div className="admin-login-input-wrapper">
                    <Lock className="admin-login-icon" />

                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="admin-login-input"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <p className="admin-login-alert admin-login-alert-error">
                    {error}
                  </p>
                )}
                {message && (
                  <p className="admin-login-alert admin-login-alert-success">
                    {message}
                  </p>
                )}

                <button
                  className="admin-login-submit-btn"
                  disabled={resetLoading || resetCompleted}
                >
                  {resetLoading ? "Resetting..." : "Reset Password"}
                </button>

                {resetCompleted && (
                  <button
                    type="button"
                    className="admin-login-submit-btn admin-login-complete-btn"
                    onClick={() => {
                      setForgotPasswordMode(false);
                      setError("");
                      setMessage("");
                      setResetCompleted(false);
                    }}
                  >
                    Back to Login
                  </button>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ======================
  // LOGIN VIEW
  // ======================

  return (
    <div className="admin-login-section">
      <div className="admin-login-container">
        <div className="admin-login-card">
          <button
            onClick={() => setView("portal")}
            className="admin-login-back-btn"
          >
            <ChevronLeft className="w-5 h-5" /> Back
          </button>

          <h2 className="admin-login-title">Admin Login</h2>

          <form onSubmit={handleSubmit} className="admin-login-form">
            <div className="admin-login-input-group">
              <label>Email</label>

              <div className="admin-login-input-wrapper">
                <Mail className="admin-login-icon" />

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="admin-login-input"
                />
              </div>
            </div>

            <div className="admin-login-input-group">
              <label>Password</label>

              <div className="admin-login-input-wrapper">
                <Lock className="admin-login-icon" />

                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="admin-login-input"
                />
              </div>
            </div>

            <div className="admin-login-extra-row">
              <label className="admin-login-remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>

              <button
                onClick={() => {
                  setMessage("");
                  setError("");
                  setForgotPasswordMode(true);
                }}
                className="admin-login-link admin-login-forgot-link"
                type="button"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="admin-login-submit-btn"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
              <ArrowRight className="w-5 h-5" />
            </button>

            {(error || loginError) && (
              <div className="admin-login-alert admin-login-alert-error">
                {error || loginError}
              </div>
            )}
            {message && !forgotPasswordMode && (
              <div className="admin-login-alert admin-login-alert-success">
                {message}
              </div>
            )}
          </form>

          <div className="admin-login-social-divider">
            <span>or continue with</span>
          </div>

          <button
            type="button"
            className="admin-login-google-btn"
            onClick={() => {
              window.location.href = "/api/auth/google";
            }}
          >
            <span className="google-icon">G</span>
            Continue with Google
          </button>

          <div className="admin-login-actions">
            <button
              onClick={() => setView("admin-register")}
              className="admin-login-link"
              type="button"
            >
              Create an admin account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
