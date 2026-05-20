import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  CheckCircle, 
  XCircle, 
  Eye, 
  ShieldCheck, 
  UserCheck, 
  Clock, 
  Mail, 
  BookOpen, 
  Hash,
  ArrowLeft
} from "lucide-react";
import { adminAPI } from "../../services/api";
import "./ApproveAdmins.css";

export const ApproveAdmins = ({ setView }) => {
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const baseUrl =
    import.meta.env.VITE_API_BASE_URL?.replace(/\/api$/, "") ||
    "http://localhost:5000";

  useEffect(() => {
    loadPendingAdmins();
  }, []);

  const loadPendingAdmins = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getPendingAdmins();
      setPendingAdmins(response.data);
    } catch (error) {
      console.error("Error loading pending admins:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (adminId) => {
    if (!confirm("Are you sure you want to approve this admin?")) return;

    try {
      setActionLoading(adminId);
      await adminAPI.approveAdmin(adminId);
      loadPendingAdmins(); // Refresh the list
    } catch (error) {
      console.error("Error approving admin:", error);
      alert("Failed to approve admin");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (adminId) => {
    if (!confirm("Are you sure you want to reject this admin request?")) return;

    try {
      setActionLoading(adminId);
      await adminAPI.rejectAdmin(adminId);
      loadPendingAdmins(); // Refresh the list
    } catch (error) {
      console.error("Error rejecting admin:", error);
      alert("Failed to reject admin request");
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewProof = (proofPath) => {
    if (proofPath) {
      const normalizedPath = proofPath.replace(/\\/g, "/");
      const url = proofPath.startsWith("http")
        ? proofPath
        : `${baseUrl}/${normalizedPath}`;
      window.open(url, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="approve-admins-section">
        <div className="loading-box">
          <div className="spinner"></div>
          <p>Scanning for pending admin requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="approve-admins-section">
      {/* SaaS Style Hero */}
      <div className="approve-admins-hero">
        <motion.div 
          className="approve-admins-hero-content"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="back-link-container">
            <button onClick={() => setView("admin")} className="approve-admins-back-btn">
              <ChevronLeft size={18} />
              Back to Dashboard
            </button>
          </div>
          
          <div className="hero-badge">
            <ShieldCheck size={14} />
            <span>Security Insight</span>
          </div>
          
          <h2 className="hero-title">
            Admin <span className="text-gradient">Access</span> Requests
          </h2>
          <p className="hero-subtitle">
            Review and manage administrative permissions. Ensure system 
            integrity by verifying credentials before granting access.
          </p>
        </motion.div>
      </div>

      <div className="approve-admins-container">
        {/* Minimal Info Bar */}
        <motion.div 
          className="info-bar"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="info-text">
            <span>Pending Review</span>
            <span className="count-badge">{pendingAdmins.length}</span>
          </div>
          <div className="security-note hidden md:block">
            Verified Environment Active
          </div>
        </motion.div>

        {/* Content */}
        <div className="requests-list">
          <AnimatePresence mode="popLayout">
            {pendingAdmins.length === 0 ? (
              <motion.div 
                className="empty-state"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="empty-icon-box">
                  <UserCheck size={40} />
                </div>
                <h3>All caught up!</h3>
                <p>No new administrative requests are pending review. You're all clear.</p>
              </motion.div>
            ) : (
              <div className="requests-grid">
                {pendingAdmins.map((admin, index) => (
                  <motion.div
                    key={admin._id}
                    className="request-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="request-header">
                      <div className="user-main-info">
                        <div className="user-avatar-placeholder">
                          {admin.name?.[0]?.toUpperCase() || "A"}
                        </div>
                        <div className="user-name-box">
                          <h3>{admin.name}</h3>
                          <span className="user-role-badge">New Request</span>
                        </div>
                      </div>
                      <div className="request-date">
                        {new Date(admin.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="request-details-grid">
                      <div className="detail-item">
                        <label>Email Address</label>
                        <p>{admin.email}</p>
                      </div>
                      <div className="detail-item">
                        <label>Department</label>
                        <p>{admin.department}</p>
                      </div>
                      <div className="detail-item">
                        <label>Employee ID</label>
                        <p>{admin.rollNumber}</p>
                      </div>
                    </div>

                    <div className="request-actions">
                      {admin.verificationProof && (
                        <button
                          onClick={() => handleViewProof(admin.verificationProof)}
                          className="action-btn proof-btn"
                        >
                          <Eye size={18} />
                          View Documents
                        </button>
                      )}

                      <div className="primary-actions">
                        <button
                          onClick={() => handleReject(admin._id)}
                          disabled={actionLoading === admin._id}
                          className="action-btn reject-btn"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleApprove(admin._id)}
                          disabled={actionLoading === admin._id}
                          className="action-btn approve-btn"
                        >
                          {actionLoading === admin._id ? "Processing..." : "Approve Access"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
