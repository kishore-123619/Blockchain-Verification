import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, Loader, ArrowRight } from "lucide-react";
import { authAPI } from "../../services/api";
import "./StudentLogin.css";

export const EmailVerification = ({ token, setView }) => {
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      try {
        const response = await authAPI.verifyEmail(token);
        setStatus("success");
        setMessage(response.data.message || "Email verified successfully!");
      } catch (err) {
        setStatus("error");
        setMessage(err.response?.data?.message || "Verification failed. The token may be invalid or expired.");
      }
    };

    if (token) verify();
  }, [token]);

  return (
    <div className="admin-login-section">
      <div className="admin-login-container">
        <div className="admin-login-card" style={{ textAlign: 'center' }}>
          {status === "verifying" && (
            <div className="flex flex-col items-center gap-4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <Loader className="admin-login-icon animate-spin" style={{ width: '3rem', height: '3rem', color: '#3b82f6' }} />
              <h2 className="admin-login-title" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Verifying your email...</h2>
              <p className="admin-login-note">Please wait while we confirm your account.</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center gap-4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <CheckCircle className="w-12 h-12 text-emerald-500" style={{ width: '3rem', height: '3rem', color: '#10b981' }} />
              <h2 className="admin-login-title" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Account Verified!</h2>
              <p className="admin-login-note">{message}</p>
              <button 
                onClick={() => setView("student")}
                className="admin-login-submit-btn"
                style={{ marginTop: '1.5rem' }}
              >
                Continue to Login <ArrowRight size={20} />
              </button>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <XCircle className="w-12 h-12 text-rose-500" style={{ width: '3rem', height: '3rem', color: '#ef4444' }} />
              <h2 className="admin-login-title" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Verification Failed</h2>
              <p className="admin-login-note">{message}</p>
              <button 
                onClick={() => setView("portal")}
                className="admin-login-link"
                style={{ marginTop: '1.5rem' }}
              >
                Back to Portal
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
