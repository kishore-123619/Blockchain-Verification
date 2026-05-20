import React, { useState } from "react";
import { ChevronLeft, Shield, Mail, Lock, Upload } from "lucide-react";
import { authAPI } from "../../services/api";
import "./AdminRegister.css";

export const AdminRegister = ({ setView }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationProof, setVerificationProof] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email.toLowerCase());
      formData.append("password", password);

      if (verificationProof) {
        formData.append("verificationProof", verificationProof);
      }

      const response = await authAPI.adminSignup(formData);
      setSuccess(
        response.data.message || "Admin account created successfully.",
      );
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setVerificationProof(null);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Registration failed.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-register-section">
      <div className="admin-register-container">
        <div className="admin-register-card">
          <button
            type="button"
            onClick={() => setView("admin-login")}
            className="admin-register-back-btn"
          >
            <ChevronLeft className="w-5 h-5" /> Back to Login
          </button>

          <div className="admin-register-card-badge">
            <Shield className="register-badge-icon" />
          </div>

          <h2 className="admin-register-title">Create Admin Account</h2>

          <form onSubmit={handleSubmit} className="admin-register-form">
            <div className="admin-register-input-group">
              <label>Name</label>
              <div className="admin-register-input-wrapper">
                <Shield className="admin-register-icon" />
                <input
                  type="text"
                  placeholder="Admin name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="admin-register-input"
                />
              </div>
            </div>

            <div className="admin-register-input-group">
              <label>Email</label>
              <div className="admin-register-input-wrapper">
                <Mail className="admin-register-icon" />
                <input
                  type="email"
                  placeholder="Admin email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="admin-register-input"
                />
              </div>
            </div>

            <div className="admin-register-input-group">
              <label>Password</label>
              <div className="admin-register-input-wrapper">
                <Lock className="admin-register-icon" />
                <input
                  type="password"
                  placeholder="Create password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="admin-register-input"
                />
              </div>
            </div>

            <div className="admin-register-input-group">
              <label>Confirm Password</label>
              <div className="admin-register-input-wrapper">
                <Lock className="admin-register-icon" />
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="admin-register-input"
                />
              </div>
            </div>

            <div className="admin-register-input-group">
              <label>Verification Proof (optional)</label>
              <label className="file-upload-label">
                <Upload className="admin-register-icon" />
                <span>
                  {verificationProof ? verificationProof.name : "Attach file"}
                </span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setVerificationProof(e.target.files[0])}
                  className="admin-register-file-input"
                />
              </label>
            </div>

            {error && (
              <div className="admin-register-alert admin-register-alert-error">
                {error}
              </div>
            )}
            {success && (
              <div className="admin-register-alert admin-register-alert-success">
                {success}
              </div>
            )}

            <button
              type="submit"
              className="admin-register-submit-btn"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="admin-register-actions">
            <button
              type="button"
              onClick={() => setView("admin-login")}
              className="admin-register-link"
            >
              Already have an account? Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
