import React, { useState } from "react";
import { ChevronLeft, Mail, Lock, ArrowRight, Key } from "lucide-react";

import { authAPI } from "../../services/api";
import "./StudentLogin.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export const StudentLogin = ({
  email,
  setEmail,
  password,
  setPassword,
  handleStudentLogin,
  loading,
  setView,
  loginError,
}) => {
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [twoFactorToken, setTwoFactorToken] = useState("");
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

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedIdentifier = email?.trim();
    if (!trimmedIdentifier || !password) {
      setError("Please enter your email/roll number and password.");
      return;
    }

    if (trimmedIdentifier.includes("@") && !validateEmail(trimmedIdentifier)) {
      setError("Please enter a valid email address.");
      return;
    }

    const result = await handleStudentLogin({
      identifier: trimmedIdentifier,
      password,
      twoFactorToken: twoFactorRequired ? twoFactorToken : undefined,
    });

    if (result && result.twoFactorRequired) {
      setTwoFactorRequired(true);
      setError("");
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
                  Enter your email first. If it is registered, an OTP will be
                  sent to that email.
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
                  disabled={resetLoading}
                >
                  {resetLoading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

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

          <h2 className="admin-login-title">Student Login</h2>

          {twoFactorRequired ? (
            <form onSubmit={handleSubmit} className="admin-login-form">
              <div className="admin-login-input-group">
                <label>Two-Factor Authentication</label>
                <p className="admin-login-note">
                  Please enter the 6-digit code from your authenticator app.
                </p>

                <div className="admin-login-input-wrapper">
                  <Lock className="admin-login-icon" />
                  <input
                    type="text"
                    maxLength="6"
                    placeholder="000000"
                    value={twoFactorToken}
                    onChange={(e) => setTwoFactorToken(e.target.value)}
                    className="admin-login-input"
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                className="admin-login-submit-btn"
                disabled={loading || twoFactorToken.length !== 6}
              >
                {loading ? "Verifying..." : "Verify & Login"}
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                type="button"
                className="admin-login-link mt-4"
                onClick={() => setTwoFactorRequired(false)}
              >
                Back to regular login
              </button>

              {(error || loginError) && (
                <div className="admin-login-alert admin-login-alert-error">
                  {error || loginError}
                </div>
              )}
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="admin-login-form">
              <div className="admin-login-input-group">
                <label>Email or Roll Number</label>

                <div className="admin-login-input-wrapper">
                  <Mail className="admin-login-icon" />

                  <input
                    type="text"
                    placeholder="Enter your email or roll number"
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
          )}

          <div className="admin-login-social-divider">
            <span>or continue with</span>
          </div>

          <button
            type="button"
            className="admin-login-google-btn"
            onClick={() => {
              window.location.href = `${API_BASE_URL}/auth/google`;
            }}
          >
            <span className="google-icon">G</span>
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
};
